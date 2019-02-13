 /**
  * powered by Moreira in 2019-02-13
  */
'use strict';

console.log('loading...', __filename);

const 
{ assign } = Object,
symb = Symbol(),

Service = module.exports = class {
  
  constructor(args) {
    this[symb] = assign({}, args);
  }
  
  do_(method, options) {

    const _token = options.token;

    return new Promise((res, rej) => {
      this[`do_${method.toLowerCase()}`](res, rej, options);
    })
    .then((arg = {}) => {
      
      const { error, code } = arg;
      if (error) return { token, 'code': code || 409, error };
            
      const { headers, token = _token, _key, _rev } = arg;
      let { data } = arg;
      if (_key && _rev) data = (obj => (obj[`${_key}/${_rev}`] = {}, obj))({});
        
      return assign(data ? { data, 'code': code || 200 } : { 'code': 204 }, { token, headers });
      
    })
    .catch((arg = {}) => {
      const { token = _token, code = 500, message } = arg;
      return { token, code, message };
    });
  }
  
  do_get(accept, reject, options) {
    if (options.key) this.do_getByKey(accept, reject, options);
    else this.do_getByQuery(accept, reject, options);
  }
  
  do_getByKey(accept, reject, { key }) {
    accept({});
  }
  
  do_getByQuery(accept, reject, { query }) {
    accept({});
  }
  
  do_post(accept, reject, { body }) {
    accept({});
  }

  do_put(accept, reject, { body }) {
    accept({});
  }

  do_patch(accept, reject, { key, rev, body}) {
    accept({});
  }
  
  do_delete(accept, reject, { key, rev, body }) {
    accept({});
  }

}