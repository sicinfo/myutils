/**
 * application: myutils 
 *
 * powered by Moreira in 2019-02-13
 */
'use strict';

console.log('loading...', __filename);

module.exports = class {

  constructor(accept, reject, options) {
    reject({'code': 404, 'message': 'not found'});
  }

};
