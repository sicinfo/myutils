/**
 * powered by Moreira in 2019-01-30
 */
'use strict';

const 
{ log, warn } = console;
log('loading...', __filename);

const
{ assign } = Object,
SECRET = process.env.username,
BEARED = 'Beared',
AUTHORIZATION = 'authorization',
EXPIRESIN = 60 * 60, // 1 hora
{ sign, verify } = require('jsonwebtoken'),

MyAuth = module.exports = class {
         
  static sign({user}, options = {}) {
    'expiresIn' in options || (options['expiresIn'] = EXPIRESIN);
    return [AUTHORIZATION, `${BEARED} ${sign({ user }, SECRET, options)}`];
  }
  
  static create(user, pass, resp = {}) {
    
    return new Promise((res, rej) => {
      
      if (pass !== resp.pass) rej({
        'code': 401,
        'error': {'message': 'unauthorized!'} 
      });
        
      else res({
        'data': { user, 'admin': resp.admin }, 
        'headers': MyAuth.sign({ user }) 
      });

    });
  }
    
  static check(authorization = '', requiredAuthorization)  {
    
    // log('check, authorization ', authorization);
    
    return new Promise((res, rej) => {
      
      const [type, value] = authorization.split(' ');
      
      if (!type || type !== BEARED) {
        
        if (requiredAuthorization) rej({
          'code': 401, 
          'message': 'unauthorized!' 
        });
        
        else res();
      }
      
      else verify(value, SECRET, {}, (err, token) => {
        
        // log(62, 'check, error / token ', err, token);
     
        if (!err) res(token);
        else if (!requiredAuthorization) res();
        else rej({
          'code': 401, 
          'message': err.message 
        });
       
      });
            
    });
    
  }
  
  static renew(args) {
    
    // log('renew, args', args);

    return new Promise((res, rej) => {
      
      let { code, token, headers } = args;
      delete args.token;
      
      if (token) {
        if (!headers) headers = [];
        headers.push(...MyAuth.sign(token));
        assign(args, { headers });

        // log('renew, token', token);
      }
            

      // log('renew, code', +code);
      if (+code < 400) res(args);
      else rej(args);

    });

  }

};



























      
        
    
    
    // && ) 
    
    
    
    
    // if (! res.locals._cache.requiredAuthorization) return next();
    
    // const { authorization } = req.headers;

    // log(30, authorization);
    


    // if (!authorization || !authorization.startsWith(`${BEARED} `)) {
    //   return res.status(401).send('unauthorized!');
    // }
    
    // verify(authorization.split(' ')[1], SECRET, {}, (err, token) => {
      
    //   if (err) return res.status(401).send(err.message);

    //   res.append(...MyAuth._sign({ 'user': token.user }));
    //   res.locals.user = token.user;
      
    //   next();
    // });
  // }
  
  // static create({body, users}) {

  //   if (body.pass !== users.pass) return rej({ 'code': 401, 'message': 'unauthorized' });
  //   const { admin } = users, { user } = body;

  //   res({
  //     '_headers': MyAuth._sign({ user }),
  //     'payload': { user, admin }
  //   });
        
  // }