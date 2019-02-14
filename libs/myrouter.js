/**
 * application: myrouter
 * 
 * powered by Moreira in 2019-02-08
 * 
 */
'use strict';
const { log, warn } = console;
log('loading...', __filename);

const 
{ join } = require('path'),   
{ readdirSync } = require('fs'),   
Url = require('url'),
symb = Symbol(),

myclass = (_routes, options) => class {

  constructor(req, res) {
    const _url = req.url.split('/');
    
    this[symb] = {
      'req': req,
      'res': res,
      'method': req.method,
      'headers': req.headers,
      'originalUrl': req.originalUrl,
      'url': _url.slice(0, 2).join('/'),
      'key': _url[2],
      'rev': _url[3]
    };

    if ('GET' === req.method) {
      this[symb].query = Url.parse(req.url, true).query;
      this[symb].body = {};
    }
      
    else {
      this[symb].query = {};
      this[symb].body = (async() => await new Promise((accept, reject) => {
        
        let body = {};

        req.on('data', chunk => {
          body = JSON.parse(chunk);
        });

        req.on('end', () => {
          accept(body);
        });

      }))();
    }

    this.do_();
  }
  
  do_() {
    
    if (!this.service) return this.status(404).send();
    
    const { hostname, body, query, key, rev } = this;
    
    this.service.do_(this.method, this)

    .then(({ code, data, headers = [] }) => {
      if (headers.length) headers.forEach(header => this.setHeader(...header));
      this.status(code).json({ data });
    })

    // .catch(MyAuth.renew)

    .catch(({ code, message }) => {
      warn(code, message);
      this.status(code).json({ 'error': message });
    });

  }
    
  get query() {
    return this[symb].query || {};
  }
  
  get body() {
    return this[symb].body || {};
  }
  
  get method() {
    return this[symb].method;
  }
  
  get headers() {
    return this[symb].headers;
  }
  
  get hostname() {
    return this.headers.host;
  }
  
  get key() {
    return this[symb].key;
  }
  
  get rev() {
    return this[symb].rev;
  }
  
  get url() {
    return this[symb].url;
  }
  
  get originalUrl() {
    return this[symb].originalUrl;
  }
  
  // segundo nível
  get service() {
    const { url } = this; 
    
    log(118, 'segundo nível - url', url);
    log(118, 'segundo nível - options', options);

    if ('string' === typeof _routes[url])
      _routes[url] = new (require(_routes[url]))(options);
      
    return _routes[url];
  }
    
  setHeader(key, val) {
    this[symb].res.setHeader(key, val);
    return this;
  }
  
  status(code) {
    this[symb].res.statusCode = code;
    return this;
  }
  
  json(data) {
    const { res } = this[symb];
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(data), 'utf8');
  }
  
  send(args) {
    const { res } = this[symb];
    res.setHeader('content-type', 'text/plain');
    res.end(args || '', 'utf8');
  }
  
};

module.exports = (
  options,
  _dirname,
  _routes = {}, 
  SERVICE_DIR = 'services', 
  SERVICE_JS = 'service.js'
) => {
  _dirname = join(_dirname, SERVICE_DIR);
  
  // segundo nível de micro serviço
  // micro serviço da aplicação
  readdirSync(_dirname)
  .filter(_filename => _filename.endsWith(SERVICE_JS))
  .forEach(_filename => { 
    _routes[`/${_filename.split('-')[0].toLowerCase()}`] = join(_dirname, _filename);
  });
  
  const { defaultDb } = options;

  return myclass(_routes, { defaultDb, 'options': options[defaultDb] });
    
};
  
