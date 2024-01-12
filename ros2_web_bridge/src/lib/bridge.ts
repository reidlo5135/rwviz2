'strict mode';

import debug from 'debug';
import { WebSocket } from 'ws';
import EventEmitter from 'events';
import { v4 as uuidv4 } from 'uuid';
import * as rclnodejs from 'rclnodejs';
import {ResourceProvider} from './resource_provider';

const STATUS_LEVELS : Array<string> = ['error', 'warning', 'info', 'none'];

class MessageParser {
    _buffer : string;

  constructor() {
    this._buffer = '';
  };

  process(message : string) : any {
    this._buffer += message;
    let msg : any = null;
    try {
      msg = JSON.parse(this._buffer);
      this._buffer = '';
    } catch (e : any) {
      if (e instanceof SyntaxError) {
        let openingBrackets = this._buffer.indexOf('{');
        let closingBrackets = this._buffer.indexOf('}');

        for (let start = 0; start <= openingBrackets; start++) {
          for (let end = 0; end <= closingBrackets; end++) {
            try {
              msg = JSON.parse(this._buffer.substring(start, end + 1));
              if (msg.op) {
                this._buffer = this._buffer.substr(end + 1, this._buffer.length);
                break;
              }
            }
            catch (e) {
              if (e instanceof SyntaxError) {
                continue;
              }
            };
          };
          if (msg) {
            break;
          };
        };
      };
    };
    return msg;
  };
};

export class Bridge extends EventEmitter {

    _ws : WebSocket;
    _parser : MessageParser;
    _bridgeId : any;
    _servicesResponse : Map<any, any>;
    _closed : boolean;
    _resourceProvider : ResourceProvider;
    _topicsPublished : Map<any, any>;
    _opMap : any;
    _statusLevel : any;


  constructor(node : rclnodejs.Node, ws : WebSocket, statusLevel : any) {
    super();
    this._ws = ws;
    this._parser = new MessageParser();
    this._bridgeId = this._generateRandomId();
    this._servicesResponse = new Map();
    this._closed = false;
    this._resourceProvider = new ResourceProvider(node, this._bridgeId);
    this._registerConnectionEvent(ws);
    this._rebuildOpMap();
    this._topicsPublished = new Map();
    this._setStatusLevel(statusLevel || 'error');
    debug(`Web bridge ${this._bridgeId} is created`);
  };

  _registerConnectionEvent(ws : WebSocket) : void {
    ws.on('message', (message : any) => {
      this._receiveMessage(message);
    });

    ws.on('close', () : void => {
      this.close();
      this.emit('close', this._bridgeId);
      debug(`Web bridge ${this._bridgeId} is closed`);
    });

    ws.on('error', (error : any) : void => {
      this.emit('error', error);
      debug(`Web socket of bridge ${this._bridgeId} error: ${error}`);
    });
  };

  close() : void {
    if (!this._closed) {
      this._resourceProvider.clean();
      this._servicesResponse.clear();
      this._topicsPublished.clear();
      this._closed = true;
    };
  };

  _generateRandomId() : string {
    return uuidv4();
  };

  _exractMessageType(type : any) : string {
    if (type.indexOf('/msg/') === -1) {
      const splitted = type.split('/');
      return splitted[0] + '/msg/' + splitted[1];
    };
    return type;
  };

  _exractServiceType(type : any) : string {
    if (type.indexOf('/srv/') === -1) {
      const splitted = type.split('/');
      return splitted[0] + '/srv/' + splitted[1];
    };
    return type;
  };

  _receiveMessage(message : any) : void {
    const command = this._parser.process(message);
    if (!command) return;

    debug(`JSON command received: ${JSON.stringify(command)}`);
    this.executeCommand(command);
  };

  get bridgeId() : any {
    return this._bridgeId;
  };

  get closed() : any {
    return this._closed;
  };

  _registerOpMap(opCode : any, callback : any) : void {
    this._opMap = this._opMap || {};

    if (this._opMap[opCode]) {
      debug(`Warning: existing callback of '${opCode}'' will be overwritten by new callback`);
    };
    this._opMap[opCode] = callback;
  };

  _rebuildOpMap() : void {
    this._registerOpMap('set_level', (command : any) : void => {
      if (STATUS_LEVELS.indexOf(command.level) === -1) {
        throw new Error(`Invalid status level ${command.level}; must be one of ${STATUS_LEVELS}`);
      };
      this._setStatusLevel(command.level);
    });

    this._registerOpMap('advertise', (command : any) : void => {
      let topic = command.topic;
      if (this._topicsPublished.has(topic) && (this._topicsPublished.get(topic) !== command.type)) {
        throw new Error(`The topic ${topic} already exists with a different type ${this._topicsPublished.get(topic)}.`);
      };
      debug(`advertise a topic: ${topic}`);
      this._topicsPublished.set(topic, command.type);
      this._resourceProvider.createPublisher(this._exractMessageType(command.type), topic);
    });

    this._registerOpMap('unadvertise', (command : any) : void => {
      let topic : string = command.topic;
    
      if (!this._topicsPublished.has(topic)) {
        let error : any = new Error(`The topic ${topic} does not exist`);
        error.level = 'warning';
        throw error;
      };
      debug(`unadvertise a topic: ${topic}`);
      this._topicsPublished.delete(topic);
      this._resourceProvider.destroyPublisher(topic);
    });

    this._registerOpMap('publish', (command : any) : void => {
      debug(`Publish a topic named ${command.topic} with ${JSON.stringify(command.msg)}`);

      if (!this._topicsPublished.has(command.topic)) {
        let error : any = new Error(`The topic ${command.topic} does not exist`);
        error.level = 'error';
        throw error;
      };
      let publisher = this._resourceProvider.getPublisherByTopicName(command.topic);
      if (publisher) {
        publisher.publish(command.msg);
      };
    });

    this._registerOpMap('subscribe', (command : any) : void => {
      debug(`subscribe a topic named ${command.topic}`);

      this._resourceProvider.createSubscription(this._exractMessageType(command.type),
        command.topic,
        this._sendSubscriptionResponse.bind(this));
    });

    this._registerOpMap('unsubscribe', (command : any) : void => {
      let topic : string = command.topic;

      if (!this._resourceProvider.hasSubscription(topic)) {
        let error : any = new Error(`The topic ${topic} does not exist.`);
        error.level = 'warning';
        throw error;
      };
      debug(`unsubscribe a topic named ${topic}`);
      this._resourceProvider.destroySubscription(command.topic);
    });

    this._registerOpMap('call_service', (command : any) : void => {
      let serviceName = command.service;
      let client =
      this._resourceProvider.createClient(this._exractServiceType(command.type), serviceName);

      if (client) {
        client.sendRequest(command.args, (response : any) : void => {
          let serviceResponse =
            {op: 'service_response', service: command.service, values: response, id: command.id, result: true};

          this._ws.send(JSON.stringify(serviceResponse));
        });
      };
    });

    this._registerOpMap('advertise_service', (command : any) : void => {
      let serviceName : string = command.service;
      this._resourceProvider.createService(
        this._exractServiceType(command.type),
        serviceName,
        (request : any, response : any) => {
          let id = this._generateRandomId();
          let serviceRequest = {op: 'call_service', service: command.service, args: request, id: id};
          this._servicesResponse.set(id, response);
          this._ws.send(JSON.stringify(serviceRequest));
        });
    });

    this._registerOpMap('service_response', (command : any) : void => {
      let id : any = command.id;
      let response : any = this._servicesResponse.get(id);
      if (response) {
        response.send(command.values);
        this._servicesResponse.delete(id);
      };
    });

    this._registerOpMap('unadvertise_service', (command : any) : void => {
      let serviceName : string  = command.service;
      if (!this._resourceProvider.hasService(serviceName)) {
        let error : any = new Error(`The service ${serviceName} does not exist.`);
        error.level = 'warning';
        throw error;
      };
      debug(`unadvertise a service: ${serviceName}`);
      this._resourceProvider.destroyService(command.service);
    });
  };

  executeCommand(command : any) : void {
    try {
      const op : any = this._opMap[command.op];
      if (!op) {
        throw new Error(`Operation ${command.op} is not supported`);
      };
      op.apply(this, [command]);
      this._sendBackOperationStatus(command.id, 'none', 'OK');
    } catch (e : any) {
      e.id = command.id;
      e.op = command.op;
      this._sendBackErrorStatus(e);
    };
  };

  _sendSubscriptionResponse(topicName : string, message : any) : void {
    debug('Send message to subscription.');
    let response = {op: 'publish', topic: topicName, msg: message};
    this._ws.send(JSON.stringify(response));
  };

  _sendBackErrorStatus(error : any) : void {
    const msg : string = `${error.op}: ${error}`;
    return this._sendBackOperationStatus(error.id, error.level || 'error', msg);
  };

  _sendBackOperationStatus(id : any, level : any, msg : any) : void {
    let command : any = {
      op: 'status', 
      level: level || 'none',
      msg: msg || '',
      id: id,
    };
    if (this._statusLevel < STATUS_LEVELS.indexOf(level)) {
      debug('Suppressed: ' + JSON.stringify(command));
      return;
    };
    debug('Response: ' + JSON.stringify(command));
    this._ws.send(JSON.stringify(command));
  };

  _setStatusLevel(level : any) : void {
    this._statusLevel = STATUS_LEVELS.indexOf(level);
    debug(`Status level set to ${level} (${this._statusLevel})`);
  };

  get ws() : WebSocket {
    return this._ws;
  };
};