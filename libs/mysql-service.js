/**
 * application: myutils
 * 
 * powered by Moreira in 2019-02-14
 */
'use strict';

console.log('loading...', __filename);

const 
symb = Symbol(),
Service = module.exports = class extends require('./myservice') {
  
  constructor(arg) {
    super(arg);
    this[symb] = arg;
    
  }
  
  do_getByKey(accept, reject, { key }) {
    
  }

  
}