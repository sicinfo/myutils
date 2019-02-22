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

    /*    
        // .then((arg = {}) => {
        //   const { error, code } = arg;
        //   if (error) return { 'code': code || 409, error };
                
        //   let { data } = arg;
        //   const { _key, _rev } = arg;
        //   if (_key && _rev) data = (obj => (obj[`${_key}/${_rev}`] = {}, obj))({});
        //   if (data) data = { data, 'code': code || 200 };
        //   else data = { 'code': 204 };
                
        //   data.headers = arg.headers;
        //   return data;
        // })
        
        // .catch(({ code = 500, message}) => {
        //   return {code, message};
        // });
    */
  }
  
  // get options() {
  //   return this[symb].options;
  // }

  do_() {
    
    return new Promise((accept, reject) => {
      this[`do_${this.method.toLowerCase()}`](accept, reject, this[symb].options);
    })
    .then((arg = {}) => {

      const { error, code } = arg;
      if (error) return { code, error };

      let { data } = arg;
      const { _key, _rev } = arg;
      if (_key && _rev) data = (obj => (obj[`${_key}/${_rev}`] = {}, obj))({});
      if (data) data = { data, 'code': code || 200 };
      else data = { 'code': 204 };

      data.headers = arg.headers;
      return data;
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
  
};
