/**
 * application myutils
 * 
 * powered by Moreira in 2019-01-30
 */
'use strict';

console.log('loading...', __filename);

const 
{ isArray } = Array,
{ assign, keys } = Object,
{ Database } = require('arangojs'),
Joi = require('joi'),
symb = Symbol(),

// MyAuth = require('./myauth'),
// { Database } = require('arangojs'),

Service = module.exports = class extends require('./myservice') {
  
  constructor(options) {
    super(options);
    this[symb] = { options };
    
    this.collectionCreate();
  }
  
  collectionCreate() {
    
    const { collectionDefinitions, db } = this;
    (isArray(collectionDefinitions) ? collectionDefinitions : [collectionDefinitions])
    .forEach(async (definition, index) => {

      if ('string' === typeof definition) definition = { 'name': definition };

      index || definition.name || (definition.name = this.collectionName);

      const collection = db[this.collectionType](definition.name);
      await collection.exists() || await collection.create();
    
      const { indexes } = definition;
      if (!indexes) return;
                  
      const indexFields = (await collection.indexes()).map(index => index.fields.join('|'));
      
      (isArray(indexes) ? indexes : [indexes])
      .forEach(index => {
        
        if ('string' === typeof index || isArray(index)) {
          index = (arg => (arg['fields'] = index, arg))({});
        }
        
        let { fields } = index;
        if (!isArray(fields)) fields = [fields];
        if (indexFields.includes(fields.join('|'))) return;

        const { type, sparse } = index;
        if (undefined === sparse && undefined === type) index['sparse'] = true;
        if (undefined === type) index['type'] = 'hash';
        
        collection.createIndex(assign(index, {fields}));
      });
    });

  }

//   do_(args) {


    
//     return super.do_(args)
//     .catch((arg) => {
      
// console.log(75, __filename, '\n', arg);      
      
//       const 
//       { isArangoError, isJoi, token } = arg,
//       resp = { token };
            
//       isArangoError ? assign(resp, {
//         'code': arg.response.body.code,
//         'message': arg.response.body.errorMessage
//       }) :
      
//       isJoi ? assign(resp, {
//         'code': 412,
//         'message': arg.details.map(obj => obj.message)
//       }) : 
      
//       assign(resp, {
//         'code': arg.code || 500,
//         'message': arg.message
//       });
      
//       return resp;
//     });
//   }
    
/*  do_(router) {
    
    const _token = router.token;
    
    return new Promise((res, rej) => {
      this[`do_${router.method.toLowerCase()}`](res, rej, router);
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
    
*/

  do_get(accept, reject, options) {
    
    new Promise((_accept, _reject) => {
      super.do_get(_accept, _reject, options);
    })
    .then(data => {
      
      if (this.isEdge) keys(data.data).filter(doc => {
        keys(data.data[doc]) 
          .filter(key => ['_from', '_to'].includes(key))
          .map(key => [key].concat(data.data[doc][key].split('/')))
          .filter(([key, _key, _val]) => {
            data.data[doc][_key] = _val;
            delete data.data[doc][key];
          });
      });

      accept(data);
    })
    .catch(reject);
  }

  do_getByKey(accept, reject) {
    this.collection.document(this.key)
    .then(arg => {
      accept({ 'data': Service._parseData(arg) });
    })
    .catch(reject);
  }
    
  do_getByQuery(accept, reject) {

    const 
      _filter = q => (a => a ? ` FILTER ${a}` : '')(
        keys(q)
        .map(k => ({ 'k': `d.${k}`, 'v': q[k], 'd': isNaN(q[k]) ? '"' : '' }))
        .map(({ k, v, d }) => ({ k, 'v': `${d}${v}${d}` }))
        .map(({ k, v }) => v.match(/%|_/) ? `LIKE(${k}, ${v}, true)` : `${k} == ${v}`)
        .join(' AND ')
      ),
      
      { db, collectionName, query } = this;
    
    // log(`FOR d IN ${collectionName}${_filter(query)} RETURN d`);
    db.query(`FOR d IN ${collectionName}${_filter(query)} RETURN d`)
    .then(({ count, _result }) => {
      accept({ 'count': count || _result.length, 'data': Service._parseData(_result) });
    })
    .catch(reject);
  }
  
  do_put(accept, reject) {
    
    let body;
    if (!(body = Service.dataAndOptionsFrom(reject, this.body))) return;
    
    // validada dados
    const { data, saveOptions, validateOptions } = body;
    Joi.validate(data, this.schema, validateOptions)
    .then(async value => {
      
      const args = [value];
      
      if (this.isEdge) {
        
        let _collection = this.edge['from'], _document = value[_collection];
        if (await this.db.collection(_collection).document(_document)) {
          args.push(`${_collection}/${_document}`);
          delete value[_collection];
        }
        else reject({'code': 404, 'message': `not found document from [ ${_collection}/${_document} ]`});
        
        _collection = this.edge['to']; _document = value[_collection];
        if (await this.db.collection(_collection).document(_document)) {
          args.push(`${_collection}/${_document}`);
          delete value[_collection];
        }
        else reject({'code': 404, 'message': `not found document to [ ${_collection}/${_document} ]`});
        
      }
      
      if (args.length == 1 || this.isEdge && args.length == 3) {
        args.push(saveOptions);
        return this.save(...args);
      }
      
    })
    .then(({_key, _rev}) => accept(
      {'data': (obj => (obj[`${_key}/${_rev}`] = {}, obj))({})}
    ))
    .catch(reject);
  }

  do_patch(res, rej, { key, rev, body}) {
    
    if (!Service.keyAndRevFrom(rej, key, rev)) return;
    if (!(body = Service.dataAndOptionsFrom(rej, body, this.schema))) return;
    
    const { data, schema, saveOptions, validateOptions } = body;

    // validada dados
    Joi.validate(data, schema, validateOptions)
    .then(value => this.update(key, rev, value, saveOptions))
    .then(res)
    .catch(rej);

  }
  
  do_delete(res, rej, { key, rev, body }) {
    
    if (!Service.keyAndRevFrom(rej, key, rev)) return;
    
    const { removeOptions = {}} = body;
    
    this.remove(key, rev, removeOptions)
    .then(arg => { res({}) })
    .catch(rej);
  
  }
  
  save(...args) {
    return this.collection.save(...args);
  }
  
  update(key, rev, data, options) {
    return this.collection.update(key, data, assign({ 'keepNull': false }, options, { rev }));
  }
  
  remove(key, rev, options) {
    return this.collection.remove(key, assign({}, options, { rev }));
  }

  get db() {
    
    const { databaseName } = this;
    if (!('db' in this[symb] && databaseName in this[symb].db)) {
      
      if (!('db' in this[symb])) this[symb].db = {};
      this[symb].db[databaseName] = new Database();
      
      const { basicAuth } = this;
      this[symb].db[databaseName]
        .useDatabase(databaseName)
        .useBasicAuth(...basicAuth);
    }
    
    return this[symb].db[databaseName];
  }
  
  get edge() {
    return false;
  }
  
  get isEdge() {
    return !!this.edge;
  }
  
  get collectionType() {
    if (!('collectionType' in this[symb]))
      this[symb].collectionType = `${this.isEdge ? 'edgeC' : 'c'}ollection`;
      
    return this[symb].collectionType;
  }
  
  get collection() {
    return this.db[this.collectionType](this.collectionName);
  }

  // list colections to create
  get collectionDefinitions() { 
    return [];
  }
  
  //
  get requiredAuthorization() { 
    return false;
  }
    
  // implementar
  get schema() {}
  
  get collectionName() {
    return this.originalUrl.split('/')[3];
  }
  
  get databaseName() {
    return this.originalUrl.split('/')[2];
  }
  
  get basicAuth() {
    
    if (!('basicAuth' in this[symb])) {
      const { username, passwd } = this.dbconfig;
      this[symb].basicAuth = [username, passwd];
    }
    
    return this[symb].basicAuth;
  }

  get dbconfig() {

    if (!('dbconfig' in this[symb])) {
      const { readFileSync, existsSync } = require('fs'), { dbconfig } = this[symb].options;
      this[symb].dbconfig = existsSync(dbconfig) && dbconfig.endsWith('.json') &&
        JSON.parse(readFileSync(dbconfig)).arangodb[this.databaseName] ||  null;
    }
    
    return this[symb].dbconfig;
  }
  
  static _parseData(args) {
    const data = {};

    (isArray(args) ? args : [args]).forEach(arg => {
      data[`${arg._key}/${arg._rev}`] = assign(...keys(arg)
        .filter(key => !key.match(/^_(id|key|rev)$/))
        .map(key => (obj => (obj[key] = arg[key], obj))({})));
    });

    return data;
  }
  
  static dataAndOptionsFrom(cb, body, schema) {
    
    const { data, saveOptions = {}, validateOptions = {} } = body;
    
    // remove os objects de configuração
    // remove _id, _rev, _key
    body = (data => assign(
      ...keys(data)
      .filter(key => !key.match(/^(_(id|key|rev))|((validate|save)Options)$/))
      .map(key => (obj => (obj[key] = data[key], obj))({}))
    ))(data || body);
    
    // remove attributos que não existe
    // serão validados
    schema && (schema = assign(
      ...keys(schema)
      .filter(key => key in body)
      .map(key => (obj => (obj[key] = schema[key], obj))({}))
    ));
    
    if (keys(body).length) return {
      'data': body,
      saveOptions,
      schema,
      'validateOptions': assign({
        'allowUnknown': true,
        'abortEarly': false,
        'presence': 'required'
      }, validateOptions)
    };

    else cb({ 'code': 409, 'message': 'no {data} to save' });
  }
  
  static keyAndRevFrom(cb, key, rev) {
    if (key && (rev || undefined == rev)) return true;
    cb({ 'code': 412, 'message': `'../:key/:rev' is required` });
  }
      
  static get DOC_NOT_FOUND() { 
    return { 'code': 404, 'message': 'doct not found' };
  }
  
};












/*


  
  
  
  
      // else if (payload) return {
      //   'code': code || 200,
      //   'data': payload,
      //   'headers': MyAuth.sign({'payload': payload.user})
      // };

      // else if (_key && _rev) return {
      //   'code': code || 200,
      //   'data': (obj => (obj[`${_key}/${_rev}`] = {}, obj))({})
      // };





  
//   const 
//   { data = {}, saveOptions = {}, validateOptions = {} } = body,
//   collection = db.collection(collectionName);

//   // remove os objects de configuração
//   if (!Object.keys(data).length) {
//     Object.keys(body)
//     .filter(_key => !_key.match(/^validate|save)Options$/))
//     .same(_key => { data[_key] = body[_key] });
//   }
  
//   // remove _id, _rev, _key
//   Object.keys(data)
//   .filter(_key => _key.match(/^_(id|key|rev)$/))
//   .forEach(_key => { delete data[key] });
    
//   if (!(Object.keys(data).length)) {
//     return res({'error': {'code': 409, 'message': 'no data to update'}})
//   }
  
//   // redefine os parametros padrão
//   Object.assign(validateOptions,{ 'allowUnknown': true }, validateOptions);
  
//   // para alterações validar somente os dados enviados
//   if (key) updatePut({ res, rej, collection, key, rev, data, schema, validateOptions, saveOptions }))
//   else savePut({ res, rej, collection, data, schema, validateOptions, saveOptions }))
    
// });

    
    
    
    
    
  // }
  


*/