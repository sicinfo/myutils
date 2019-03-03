/**
 * powered by Moreira 2018-12-31
 */
'use strict';

/* global fetch, localStorage, Headers, location, btoa */

define([], () => {

  const
    AUTHORIZATION = 'authorization',
    KEY_AUTHORIZATION = btoa(`${location.hostname}/${AUTHORIZATION}`),
    APPLICATIONJSON = 'application/json',
    ACCEPT = 'accept',
    CONTENTTYPE = 'content-type',
    URLPREFIX = 'WS',
  
    // anexa no header ao enviar para o server
    fromLocalstorageToRemote = ({ headers }) => {

// console.log(21, 'enviando', headers.has(AUTHORIZATION) && headers.get(AUTHORIZATION))      ;
      
      if (headers.has(AUTHORIZATION)) return;
      const value = localStorage.getItem(KEY_AUTHORIZATION);
      value && headers.set(AUTHORIZATION, value);

// console.log(22, 'enviando', KEY_AUTHORIZATION, headers.get(AUTHORIZATION))      ;

    },
    
    // registra no locaStorage aos receber do server
    fromRemoteToLocalstorage = ({ ok, headers }) => {
      
// console.log(31, 'recebendo', ok, headers.has(AUTHORIZATION) && headers.get(AUTHORIZATION));      

      if (ok && headers.has(AUTHORIZATION))
        localStorage.setItem(KEY_AUTHORIZATION, headers.get(AUTHORIZATION));
  
      else localStorage.removeItem(KEY_AUTHORIZATION);
  
    },
      
    _url = url => url.startsWith('/') ? url : `/${URLPREFIX}/${url}`,
    
    fetchJson = (url, opt = {}) => {

      // const headers = opt.headers || (opt.headers = new Headers());
      // headers.has(ACCEPT) || headers.append(ACCEPT, APPLICATIONJSON);
      // headers.has(CONTENTTYPE) || headers.append(CONTENTTYPE, APPLICATIONJSON);

      // return fetch(_url(url), opt).then(resp => resp.json());
    },
      
    fetchAuth = (url, opt = {}) => {
    
      const headers = opt.headers || (opt.headers = new Headers());
      headers.append(ACCEPT, APPLICATIONJSON);
      headers.append(CONTENTTYPE, APPLICATIONJSON);
    
      if ('POST' === opt.method && opt.body && 'string' !== typeof(opt.body)) {
        opt.body = JSON.stringify(opt.body);
      }
    
// console.log(59, 'enviando para o servidor');
      fromLocalstorageToRemote(opt);
    
      return fetch(_url(url), opt)
        .then(resp => { 

// console.log(65, 'recebendo do servidor', Array.from(resp.headers.get('content')), resp);
          fromRemoteToLocalstorage(resp); 
          return APPLICATIONJSON === resp.headers.get(CONTENTTYPE) ? resp.json() : resp;
        });
    
    };

  return { fetchAuth, fetchJson, KEY_AUTHORIZATION };
});






















// /**
// * powered by Moreira 2018-12-31
// */
// 'use strict';

// /* global fetch, localStorage */

// define([], () => {

//   const
//   AUTHORIZATION = 'authorization',
//   HEADERS = 'headers',
//   APPLICATIONJSON = 'application/json',
//   ACCEPT = 'accept',
//   CONTENTTYPE = 'content-type',
//   URLPREFIX = 'WS',
//   _url = url => url.startsWith('/') ? url : `/${URLPREFIX}/${url}`,
  
//   fetchJson = (url, opt = {}) => {

//     const headers = opt[HEADERS] || (opt[HEADERS] = {});
//     ACCEPT in headers || (headers[ACCEPT] = APPLICATIONJSON);
//     CONTENTTYPE in headers || (headers[CONTENTTYPE] = APPLICATIONJSON);
    
//     return fetch(_url(url), opt).then(resp => resp.json());
//   },

//   fetchAuth = (url, opt = {}) => {
    
//     const headers = opt[HEADERS] || (opt[HEADERS] = {});
//     ACCEPT in headers || (headers[ACCEPT] = APPLICATIONJSON);
//     CONTENTTYPE in headers || (headers[CONTENTTYPE] = APPLICATIONJSON);

//     if (!(AUTHORIZATION in headers)) {
//       const token = localStorage.getItem(AUTHORIZATION);
//       if (token) headers[AUTHORIZATION] = token;
//     }

//     return fetch(_url(url), opt).then(resp => {
      
//       if (resp.ok && resp[HEADERS].has(AUTHORIZATION))
//         localStorage.setItem(AUTHORIZATION, resp[HEADERS].get(AUTHORIZATION));
//       else 
//         localStorage.removeItem(AUTHORIZATION);

//       return resp.json() || {};
//     });

//   };

//   return { fetchAuth, fetchJson };
// });
