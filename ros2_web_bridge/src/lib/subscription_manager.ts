'use strict';

import debug from "debug";
import * as rclnodejs from 'rclnodejs';
import { RefCountingHandle } from "./ref_counting_handle";

class HandleWithCallbacks extends RefCountingHandle {
  _callbacks : Map<any, any>;

  constructor(object : any, destroyHandle : any) {
    super(object, destroyHandle);
    this._callbacks = new Map();
  };

  addCallback(id : any, callback : any) : void {
    this._callbacks.set(id, callback);
  };

  removeCallback(id : any) : void {
    this._callbacks.delete(id);
  };

  hasCallbackForId(id : any) : boolean {
    return this._callbacks.has(id);
  };

  get callbacks() : unknown[] {
    return Array.from(this._callbacks.values());
  };
};

export class SubscriptionManager {
  _subscriptions : Map<any, any>;
  _node : rclnodejs.Node;
  _instance : any | undefined;

  constructor(node : rclnodejs.Node) {
    this._subscriptions = new Map();
    this._node = node;
  };

  getSubscriptionByTopicName(topicName : string) : any {
    return this._subscriptions.get(topicName);
  };

  createSubscription(messageType : any, topicName : string, bridgeId : any, callback : any) : void {
    let handle = this._subscriptions.get(topicName);

    if (!handle) {
      let subscription = this._node.createSubscription(messageType, topicName, {enableTypedArray: false}, (message) => {
        this._subscriptions.get(topicName).callbacks.forEach((callback : any) => {
          callback(topicName, message);
        });
      });
      handle = new HandleWithCallbacks(subscription, this._node.destroySubscription.bind(this._node));
      handle.addCallback(bridgeId, callback);
      this._subscriptions.set(topicName, handle);
      debug(`Subscription has been created, and the topic name is ${topicName}.`);

      return handle.get();
    };

    handle.addCallback(bridgeId, callback);
    handle.retain();
    return handle.get();
  };

  destroySubscription(topicName : string, bridgeId : any) : void {
    if (this._subscriptions.has(topicName)) {
      let handle = this._subscriptions.get(topicName);
      if (handle.hasCallbackForId(bridgeId)) {
        handle.removeCallback(bridgeId);
        handle.release();
        if (handle.count === 0) {
          this._subscriptions.delete(topicName);
        };
      };
    };
  };

  destroyForBridgeId(bridgeId : any) : void {
    this._subscriptions.forEach(handle => {
      if (handle.hasCallbackForId(bridgeId)) {
        handle.removeCallback(bridgeId);
        handle.release();
        this._removeInvalidHandle();
      };
    });
  };

  _removeInvalidHandle() : void {
    this._subscriptions.forEach((handle, topicName, map) : void => {
      if (handle.count === 0) {
        map.delete(topicName);
      };
    });
  };
};