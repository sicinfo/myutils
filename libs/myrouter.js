/**
 * application: myrouter
 * 
 * powered by Moreira in 2019-02-08
 * 
 */
'use strict';

console.log('loading...', __filename);

const symb = Symbol(),
  
Myrouter = module.exports = class {

  constructor(req, res, options) {
    this[symb] = { req, res, options };
    
    if (this.isGetMethod) Myrouter.do_.call(this, req, res);
    else {
      req.on('data', chunk => { this[symb].body = JSON.parse(chunk) });
      req.on('end', () => { Myrouter.do_.call(this, req, res) });
    }
  }
  
  static do_(req, res) {

    const { service } = this;
    if (!service) {
      const { join } = require('path'), { originalUrl, url } = this;
      return this.status(404).json({ 'mesage': `${join(originalUrl.split(url)[0], url)} - not found!` });
    }
    
    new service(this[symb].options).do_()
    // .then(Myauth.validade)
    .then(({ code, data, headers = [] }) => {
      if (headers.length) headers.forEach(header => this.setHeader(...header));
      this.status(code).json({ data });
    })
    // .catch(MyAuth.renew)
    .catch(({ code = 500, message }) => {
      console.warn(code, message);
      this.status(code).json({ message });
    });
  }
    
  get dirname() {
    return this[symb].options.dirname;
  }
  
  // segundo nível
  get service() {
    
    const _this = this, { url } = _this;
    if ('/' === url) return;
    
    const services = _this[symb].options[symb] || (_this[symb].options[symb] = {});
    if (!(url in services)) {
      const filename = require('path').join(_this.dirname, _this.dirservices, `${url.slice(1)}-service.js`);
      
      if (!require('fs').existsSync(filename)) return;
      
      services[url] = class extends require(filename) {
        get originalUrl() { return _this.originalUrl }
        get method() { return _this.method }
        get key() { return _this.key }
        get rev() { return _this.rev }
        get query() { return _this.query }
        get body() { return _this.body }
      };
    }
    
    return services[url];
  }
  
  get query() {
    if (!this.has('query')) 
      this[symb].query = this.isGetMethod ? require('url').parse(this.originalUrl, true).query : {};

    return this[symb].query;
  }
    
  get body() {
    return this[symb].body || {};
  }
  
  get method() {
    if (!this.has('method'))
      this[symb].method = this[symb].req.method;

    return this[symb].method;
  }
  
  get isGetMethod() {
    return 'GET' === this.method;
  }
  
  get headers() {
    if (!this.has('headers'))
      this[symb].headers = this[symb].req.headers;

    return this[symb].headers;
  }
  
  get hostname() {
    return this.headers.host;
  }
  
  get key() {
    if (!this.has('key'))
      this[symb].key = this[symb].req.url.split('/')[2];

    return this[symb].key;
  }
  
  get rev() {
    if (!this.has('rev'))
      this[symb].rev = this[symb].req.url.split('/')[3];

    return this[symb].rev;
  }
  
  get url() {
    if (!this.has('url'))
      this[symb].url = this[symb].req.url.split('/').slice(0, 2).join('/');

    return this[symb].url;
  }
  
  get originalUrl() {
    if (!this.has('originalUrl'))
      this[symb].originalUrl = this[symb].req.originalUrl;

    return this[symb].originalUrl;
  }
  
  get dirservices() {
    return 'services';
  }
  
  has(arg) { 
    return arg in this[symb];
  }
  
  setHeader(key, val) {
    this.headers.setHeader(key, val);
    return this;
  }
  
  status(code) {
    this[symb].res.statusCode = code;
    return this;
  }
  
  json(data) {
    this[symb].res.setHeader('content-type', 'application/json');
    this[symb].res.end(JSON.stringify(data), 'utf8');
  }
  
  send(args) {
    this[symb].res.setHeader('content-type', 'text/plain');
    this[symb].res.end(args || '', 'utf8');
  }
  
};