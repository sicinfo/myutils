/**
 * application myutils
 * 
 * powered by Moreira in 2019-02-18
 */
'use strict';

console.log('loading...', __filename);

const 
  { isArray } = Array(),
  { assign } = Object,
  symb = Symbol;
  
module.exports = class extends require('./arangodb-doc') {
  
    constructor(options) {
      super(assign(options, {'edge': true} ));
    }

};