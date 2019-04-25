import fs from 'fs';
const data = fs.readdirSync(__dirname);
const controllers = {};
const except = [
  'index.js'
];

for ( let i=0; i < data.length; i++ ) {
  if ( !except.includes( data[i] ) ) {
    let key = data[i].replace('.js','');
    let value = require(`./${data[i]}`);
    controllers[key] = value.options;
  }
}

export { controllers };
