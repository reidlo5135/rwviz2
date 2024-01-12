'strict mode';

import debug from "debug";
import * as rclnodejs from 'rclnodejs';
import { RefCountingHandle } from "./ref_counting_handle";
import { SubscriptionManager } from "./subscription_manager";

export class ResourceProvider {
    _bridgeId : any;
    _node : rclnodejs.Node;
    _publishers : Map<any, any>;
    _clients : Map<any, any>;
    _services : Map<any, any>;
    _manager : SubscriptionManager;

  constructor(node : rclnodejs.Node, bridgeId : any) {
    this._manager = new SubscriptionManager(node);
    this._bridgeId = bridgeId;
    this._node = node;
    this._publishers = new Map();
    this._clients = new Map();
    this._services = new Map();
  };

  getPublisherByTopicName(topicName : string) : any {
    return this._publishers.get(topicName).get();
  };

  getSubscriptionByTopicName(topicName : string) : any {
    return this._manager.getSubscriptionByTopicName(topicName).get();
  };

  getClientByServiceName(serviceName : string) : any {
    return this._clients.get(serviceName).get();
  };

  getServiceByServiceName(serviceName : string) : any {
    return this._services.get(serviceName).get();
  };

  createPublisher(messageType : any, topicName : string) : any {
    let handle : any = this._publishers.get(topicName);
    if (!handle) {
      handle = new RefCountingHandle(this._node.createPublisher(messageType, topicName),
        this._node.destroyPublisher.bind(this._node));
      this._publishers.set(topicName, handle);
      debug(`Publisher has been created, and the topic name is ${topicName}.`);
    } else {
      handle.retain();
    };
    return handle.get();
  };

  createSubscription(messageType : any, topicName : string, callback : any) {
    return this._manager.createSubscription(messageType, topicName, this._bridgeId, callback);
  };

  createClient(serviceType : any, serviceName : string) : any {
    let handle : any = this._clients.get(serviceName);
    if (!handle) {
      handle = new RefCountingHandle(this._node.createClient(serviceType, serviceName, {enableTypedArray: false}),
        this._node.destroyClient.bind(this._node));
      this._clients.set(serviceName, handle);
      debug(`Client has been created, and the service name is ${serviceName}.`);
    } else {
      handle.retain();
    };
    return handle.get();
  };

  createService(serviceType : any, serviceName : string, callback : any) : any {
    let handle : any = this._services.get(serviceName);
    if (!handle) {
      handle = new RefCountingHandle(this._node.createService(serviceType, serviceName, {enableTypedArray: false},
        (request, response) => {
          callback(request, response);
        }), this._node.destroyService.bind(this._node));
      this._services.set(serviceName, handle);
      debug(`Service has been created, and the service name is ${serviceName}.`);
    } else {
      handle.retain();
    };
    return handle.get();
  };

  destroyPublisher(topicName : string) : void {
    if (this._publishers.has(topicName)) {
      let handle = this._publishers.get(topicName);
      handle.release();
      this._removeInvalidHandle(this._publishers, handle, topicName);
    };
  };

  destroySubscription(topicName : string) : void {
    this._manager.destroySubscription(topicName, this._bridgeId);
  };

  _destroySubscriptionForBridge() : void {
    this._manager.destroyForBridgeId(this._bridgeId);
  };

  destroyClient(serviceName : string) : void {
    if (this._clients.has(serviceName)) {
      let handle = this._clients.get(serviceName);
      handle.release();
      this._removeInvalidHandle(this._clients, handle, serviceName);
    };
  };

  destroyService(serviceName : string) : void {
    if (this._services.has(serviceName)) {
      let handle = this._services.get(serviceName);
      handle.release();
      this._removeInvalidHandle(this._services, handle, serviceName);
    };
  };

  hasService(serviceName : string) : any {
    return this._services.has(serviceName);
  };

  hasSubscription(topicName : string) : any {
    return this._manager.getSubscriptionByTopicName(topicName) !== undefined;
  };

  clean() : void {
    this._cleanHandleInMap(this._publishers);
    this._cleanHandleInMap(this._services);
    this._cleanHandleInMap(this._clients);
    this._destroySubscriptionForBridge();
  };

  _removeInvalidHandle(map : any, handle : any, name : any) : void{
    if (handle.count === 0) {
      map.delete(name);
    };
  };

  _cleanHandleInMap(map : any) : void {
    map.forEach((handle : any) => {
      handle.destroy();
    });
    map.clear();
  };
};