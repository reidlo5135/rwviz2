'strict mode';

import debug from "debug";

export class RefCountingHandle {
    _object : any;
    _count : any;
    _destroyHandle : any;

  constructor(object : any, destroyHandle : any) {
    if (object) {
      this._object = object;
      this._count = 1;
      this._destroyHandle = destroyHandle;
    };
  };

  get() : void {
    return this._object;
  };

  release() : void {
    if (this._count > 0) {
      if (--this._count === 0) {
        this._destroyHandle(this._object);
        this._object = undefined;
        debug('Handle is destroyed.');
      };
    };
  };

  retain() : void {
    this._count++;
  };

  destroy() : void {
    if (this._count > 0) {
      this._destroyHandle(this._object);
      this._count = 0;
      this._object = undefined;
      debug('Handle is destroyed.');
    };
  };

  get count() : any {
    return this._count;
  };
};