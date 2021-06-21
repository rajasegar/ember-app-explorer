#!/usr/bin/env node

/* globals require process  */

'use strict';

process.title = 'ember-app-explorer';
console.log('Ember App Explorer');
const startServer = require('../server');
startServer(process.cwd());
