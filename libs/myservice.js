/**
 * application: myutils 
 *
 * powered by Moreira in 2019-02-13
 */
'use strict';

console.log('loading...', __filename);

const symb = Symbol();
module.exports = class {
  
  constructor(options = {}) {
    this[symb] = { options };
  }

  do_() {
    
    return new Promise((accept, reject) => {
      this[`do_${this.method.toLowerCase()}`](accept, reject, this[symb].options);
    })
    .then((arg = {}) => {

      const { error, code } = arg;
      if (error) return { code, error };

      let { result } = arg;
      const { _key, _rev } = arg;
      if (_key && _rev) result = (obj => (obj[`${_key}/${_rev}`] = {}, obj))({});
      if (result) result = { result, 'code': code || 200 };
      else result = { 'code': 204 };

      result.headers = arg.headers;
      return result;
    })
    .catch(err => {
      
console.warn(33, __filename, 'code', err.code);
console.warn(34, __filename, 'message', err.message);
console.warn(35, __filename, 'error', err.error);
      
      return err;
    });
    
  }

  do_get(...args) {
    if (this.key) this.do_getByKey(...args);
    else this.do_getByQuery(...args);
  }
  
  do_getByKey(accept) {
    accept({});
  }

  do_getByQuery(accept) {
    accept({});
  }

  do_post(accept) {
    accept({});
  }

  do_put(accept) {
    accept({});
  }

  do_patch(accept) {
    accept({});
  }

  do_delete(accept) {
    accept({});
  }
  
  get requiredAuthorization() {}
  
  get authorization() {
    return this[symb].options.authorization;
  }
  
  get isAuthorized() {
    return !!this.authorization;
  }
  
  get originalUrl() {
    return this[symb].options.originalUrl;
  }
  
  get method() {
    return this[symb].options.method;
  }
  
  get key() {
    return this[symb].options.key;
  }
  
  get rev() {
    return this[symb].options.rev;
  }
  
  get query() {
    return this[symb].options.query;
  }
  
  get body() {
    return this[symb].options.body;
  }

};
