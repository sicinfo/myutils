/**
 * powered by Moreira in 2019-01-30
 */
'use strict';

const log = (a, ...b) => console.log(a, __filename, ...b);
log('loading...');

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
    
    static create(arg) {
      return  MyAuth.sign(arg); 
    }
      
    static validate(authorization, requiredAuthorization)  {
      
log(31, authorization);
log(32, requiredAuthorization);
      
      return new Promise((accept, reject) => {
        
        const [type, value] = authorization.split(' ');
        
        if (!type || type !== BEARED) 
          requiredAuthorization ? reject({'code': 401, 'message': 'Unauthorized'}) : accept({});
        
        else verify(value, SECRET, {}, (err, token) => {
          
  log(43, token);  
  
          if (err) requiredAuthorization ? reject({'code': 401, 'message': err.message}) : accept({});
          else accept({ token });
  
        });
              
      });
      
    }
    
    static renew(token) {
      return MyAuth.sign(token);
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