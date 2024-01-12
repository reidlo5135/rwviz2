'strict mode';

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

let secretFile : string = '';

function sha512(text : any) : string {
  const hash = crypto.createHash('sha512');
  hash.update(text);
  return hash.digest('hex');
};

function getSecret() : string {
  const file : string = path.resolve(__dirname, secretFile);
  // eslint-disable-next-line
  const content : string = fs.readFileSync(file).toString();
  return content;
};

function gt(l : any, s : any) : boolean {
  return (l.sec == s.sec && l.nanosec > s.nanosec) || l.sec > s.sec;
};

const NANOSEC_IN_A_SEC : number = 1000 * 1000 * 1000;

function diffTime(l : any, s : any) : number {
  let nanodiff = l.nanosec - s.nanosec;
  let secdiff = l.sec - s.sec;
  if (l.nanosec < s.nanosec) {
    nanodiff += NANOSEC_IN_A_SEC;
    secdiff += 1;
  };
  return secdiff + nanodiff / NANOSEC_IN_A_SEC;
};

function getJavaScriptTime() : any {
  const t : number = new Date().getTime();
  return {sec: Math.floor(t / 1000), nanosec: (t % 1000) * 1000 * 1000};
};

export function authenticate(msg : any) : boolean {
  if (Number.isNaN(msg.t.sec) || Number.isNaN(msg.t.nanosec) ||
      Number.isNaN(msg.end.sec) || Number.isNaN(msg.end.nanosec) ||
      msg.t.sec < 0 || msg.end.sec < 0 ||
      msg.t.nanosec >= NANOSEC_IN_A_SEC || msg.end.nanosec >= NANOSEC_IN_A_SEC ||
      msg.t.nanosec < 0 || msg.end.nanosec < 0) {
    return false;
  };

  // We don't get time from ROS system
  //  because it might not be a system-clock timestamp
  const t : number = getJavaScriptTime();
  let diff : any;
  if (gt(msg.t, t)) {
    diff = diffTime(msg.t, t);
  } else {
    diff = diffTime(t, msg.t);
  };

  if (diff < 5 && gt(msg.end, t)) {
    const text = getSecret() + msg.client + msg.dest + msg.rand + msg.t.sec + msg.level + msg.end.sec;
    const hash = sha512(text);
    return msg.mac === hash;
  };

  return false;
};

export function setSecretFile(file : any) : void {
  secretFile = file;
};