var LOWALPHA = 'abcdefghijklmnopqrstuvwxyz';
var HIALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var DIGIT = '0123456789';
var SAFE = '$-_.+';
var EXTRA = '!*\'(),';
var ESCAPE = '%';
var UNATIONAL = '~[]';
var RESERVED = ';/?#:@&=';

// These characters get double bytes since they are less frequent
var DOUBLECHAR = '$!()~@';

var HTTP_URL = DIGIT + ';/?#:&=' + HIALPHA + LOWALPHA + '-_.+' + '*\',' + '[]' + DOUBLECHAR;

var VALID = DIGIT + HIALPHA + LOWALPHA + SAFE + EXTRA + ':@&=' + UNATIONAL;

// Exports

exports.url = HTTP_URL.split('');

exports.valid = VALID.split('');

exports.digit = DIGIT.split('');

exports.doublechar = DOUBLECHAR.split('');

var to = exports.to = {};
var from = exports.from = {};

var i = 0;
var l = exports.url.length - exports.doublechar.length;
for (; i < l; i++) {
  var c = exports.url[i];
  var v = exports.valid[i];
  to[c] = v;
  from[v] = c;
}

// Compute the mapping

exports.extras = exports.valid.slice(i);

var toD = exports.toD = {};
var fromD = exports.fromD = {};
l = exports.doublechar.length;
for (i = 0; i < l; i++) {
  var c = exports.doublechar[i];
  var v = exports.valid[i];
  toD[c] = v;
  fromD[v] = c;
}

exports.dict = exports.valid.slice(i, -exports.extras.length);
