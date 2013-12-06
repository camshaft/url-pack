var LOWALPHA = 'abcdefghijklmnopqrstuvwxyz';
var HIALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var DIGIT = '0123456789';
var SAFE = '$-_.+';
var EXTRA = '!*\'(),';
var ESCAPE = '%';
var UNATIONAL = '~[]';
var RESERVED = ';/?:@&=#';

var UNRESERVED = LOWALPHA + DIGIT + SAFE + EXTRA;

var UCHAR = UNRESERVED + ESCAPE;

var HTTP_URL = RESERVED + UCHAR + UNATIONAL;

var VALID = HIALPHA + UNRESERVED + UNATIONAL + ':@&=';

// Compute the mapping

exports.url = HTTP_URL.split('');

var to = exports.to = {};
var from = exports.from = {};
var i = 0;
for (; i < exports.url.length; i++) {
  var c = exports.url[i];
  to[c] = VALID[i];
  from[VALID[i]] = c;
}

exports.valid = VALID.split('');

exports.extras = exports.valid.slice(i);

exports.digit = DIGIT.split('');
