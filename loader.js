require('babel-register');
require('babel-polyfill');
require('dotenv').config({ path: './.env' });

require('./server/server.js');
