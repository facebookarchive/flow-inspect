// @flow

'use strict';

const chalk = require('chalk');

const INDENT = chalk.gray('  ');

let hasKind = value => !!value.kind || !!value.name;
let hasArrayOfKinds = value => Array.isArray(value) && value.every(hasKind);

function maybePrint(key, value, indent) {
  if (key === 'kind' || key === 'name' || key === 'reason') return false;
  if (typeof value !== 'object' ) return chalk.blue(value);
  if (hasKind(value)            ) return printValue(value, indent);
  if (hasArrayOfKinds(value)    ) return printList(value, indent);
  return printObject(value, indent);
}

function printValue(value, indent) {
  return printType(value, indent + INDENT);
}

function maybePrintKeyValue(key, value, indent) {
  const printedKey = chalk.yellow(key) + chalk.gray(':') + ' ';
  const printedValue = maybePrint(key, value, indent);

  if (printedValue) {
    return `\n${indent}${printedKey}${printedValue}`
  } else {
    return false;
  }
}

function printList(list, indent) {
  let body = '';
  let innerIndent = indent + INDENT;

  if (list.length) {
    body += '\n';
    for (let item of list) {
      body += innerIndent + printValue(item, innerIndent) + '\n';
    }
    body += indent;
  }

  return chalk.gray('[') + body + chalk.gray(']')
}

function printObject(val, indent) {
  let body = '';
  let keys = Object.keys(val);
  let innerIndent = indent + INDENT;

  if (keys.length) {
    for (let key of keys) {
      const printedKeyValue = maybePrintKeyValue(key, val[key], innerIndent);
      if (printedKeyValue) body += printedKeyValue;
    }
    body += '\n' + indent;
  }

  return chalk.gray('{') + body + chalk.gray('}');
}

function printPos({line, column}) {
  return `${line},${column}`;
}

function printReason(reason) {
  const {start, end} = reason.pos;
  const printedPos = chalk.italic(`${printPos(start)} - ${printPos(end)}`);
  return chalk.gray(`(${reason.desc}) @ ${printedPos}`);
}

function printType(type, indent) {
  const {kind, name, reason} = type;
  const keys = Object.keys(type);

  let printedKind = chalk.green(kind || chalk.italic(name));
  if (reason) printedKind += ' ' + printReason(reason);

  let printedKeys = '';

  keys.forEach(key => {
    const printedKeyValue = maybePrintKeyValue(key, type[key], indent);
    if (printedKeyValue) printedKeys += printedKeyValue;
  });

  return printedKind + printedKeys;
}

module.exports = function inspect(types /* : Object */) /* : string */ {
  return types.map(type => {
    const raw = JSON.parse(type.raw_type);
    return printType(raw, INDENT);
  }).join('\n')
};
