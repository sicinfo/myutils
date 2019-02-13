 /**
 * powered by Moreira in 2019-02-13
 */
'use strict';

console.log('loading...', __filename);

const 
{ assign } = Object,
Service = module.exports = class extends require('./myservice') {
  
  constructor(args) {
    super(args);
  }
  
  do_(method, options) {
    
    const _token = options.token;
    
    return new Promise((accept, reject) => {
      this[`do_${method.toLowerCase()}`](accept, reject, options);
    })
    .then((arg = {}) => {
      let { code, error, data, headers, token = _token, _key, _rev } = arg;
      
      if (_key && _rev) {
        data = (obj => (obj[`${_key}/${_rev}`] = {}, obj))({});
      }

      if (error) return { 
        token, 
        'code': code || 409, 
        error 
      };
      
      else if (data) return { 
        token, 
        'code': code || 200,  
        data, 
        headers
      };
      
      else return { 
        token, 
        'code': 204,
        headers
      };
      
    })
    .catch((arg = {}) => {
      
      const 
      resp = { 'token': arg.token || _token };
            
      assign(resp, {
        'code': arg.code || 500,
        'message': arg.message
      });
      
      return resp;
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
  
  do_post(accept, reject) {
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
  
  save(data, options) {
  }
  
  update(key, rev, data, options) {
  }
  
  remove(key, rev, options) {
  }

  get db() {
  }
  
  get collection() {
  }

  // list colections to create
  get collectionDefinitions() { return [] }
  
  //
  get requiredAuthorization() { return false }
    
  // implementar
  get schema() {}
  
  get collectionName() {}
  
  get databaseName() {
  }
  
  static _parseData(args) {
  }
  
};
