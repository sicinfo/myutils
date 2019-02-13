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
  
}