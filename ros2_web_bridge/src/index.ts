'strict mode';

import debug from 'debug';
import WebSocket from 'ws';
import { Bridge } from './lib/bridge';
import * as rclnodejs from 'rclnodejs';
import { log } from './infra/logging.infra';

let node : any;
let server : any;
let connectionAttempts : number = 0;
let bridgeMap : Map<any, any> = new Map();

function closeAllBridges() : void {
  bridgeMap.forEach((bridge : any, bridgeId : any) => {
    bridge.close();
  });
};

function shutDown() : void {
    if (!rclnodejs.isShutdown()) {
        rclnodejs.shutdown();
    };
};

function shutDownOnError(error : any) : void {
  if (server) {
    server.close();
  };
  if (!rclnodejs.isShutdown()) {
    rclnodejs.shutdown();
  };
  if (error) {
    throw error;
  };
};

export async function createServer(options : any) : Promise<void> {
  options = options || {};
  options.address = options.address || null;
  process.on('exit', () : void => {
    debug('Application will exit.');
    shutDown();
  });
  return rclnodejs.init()
    .then(() => {
      node = new rclnodejs.Node('ros2_web_bridge');
      if(node.spinning) {
        node.destroy();
      };
      debug('ROS2 node started');
      let timeout : any = options.delay_between_messages;
      if (timeout == undefined) {
        timeout = 0;
      };
      createConnection(options);
      node.spin();
    })
    .catch(error => shutDownOnError(error));
};

function createConnection(options : any) : void {
  if (options.address != null) {
    debug('Starting in client mode; connecting to ' + options.address);
    server = new WebSocket(options.address);
  } else {
    options.port = options.port || 9090;
    debug('Starting server on port ' + options.port);
    server = new WebSocket.Server({port: options.port});
  };

  const makeBridge = (ws : WebSocket) : void => {
    let bridge : any = new Bridge(node, ws, options.status_level);
    bridgeMap.set(bridge.bridgeId, bridge);

    bridge.on('error', (error : any) : void => {
      debug(`Bridge ${bridge.bridgeId} closing with error: ${error}`);
      bridge.close();
      bridgeMap.delete(bridge.bridgeId);
    });

    bridge.on('close', (bridgeId : any) : void => {
      bridgeMap.delete(bridgeId);
    });
  };

  server.on('open', () : void => {
    debug('Connected as client');
    connectionAttempts = 0;
  });
  
  if (options.address) {
    makeBridge(server);
  } else {
    server.on('connection', makeBridge);
  };

  server.on('error', (error : any) : void => {
    closeAllBridges();
    debug(`WebSocket error: ${error}`);
  });

  server.on('close', (event : any) : void => {
    debug(`Websocket closed: ${event}`);
    if (options.address) {
      closeAllBridges();
      connectionAttempts++;
      const delay : number = Math.pow(1.5, Math.min(10, Math.floor(Math.random() * connectionAttempts)));
      debug(`Reconnecting to ${options.address} in ${delay.toFixed(2)} seconds`);
      setTimeout(() => createConnection(options), delay*1000);
    };
  });

  log.info(`[ROS-Websocket] Bridge started on ${options.port}`);
  process.on('SIGINT', () => process.exit(1));
};