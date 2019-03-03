/**
 * application: myutils
 * 
 * powered by Moreira in 2019-02-14
 * 
 */
'use strict';

console.log('loading...', __filename);

module.exports = arg => {
  const filename = arg ? `${arg}-` : 'my';
  return require(`./libs/${filename}service`);
};