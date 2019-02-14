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
      { isArangoError, isJoi } = arg,
      resp = { 'token': arg.token || _token };
            
      isArangoError ? assign(resp, {
        'code': arg.response.body.code,
        'message': arg.response.body.errorMessage
      }) :
      
      isJoi ? assign(resp, {
        'code': 412,
        'message': arg.details.map(obj => obj.message)
      }) : 
      
      assign(resp, {
        'code': arg.code || 500,
        'message': arg.message
      });
      
      return resp;
    });
  }

  
};