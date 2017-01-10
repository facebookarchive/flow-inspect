#!/usr/bin/env node
'use strict';

const inspect = require('./');

let stdin = '';

process.stdin
  .setEncoding('utf8')
  .on('readable', () => {
    var chunk = process.stdin.read();
    if (chunk !== null) stdin += chunk;
  })
  .on('end', () => {
    const types = JSON.parse(stdin);
    const stdout = inspect(types)
    process.stdout.write(stdout + '\n');
  });
