/**
 * Module dependencies
 */

var bnf = require('./bnf');
var to = bnf.to;
var from = bnf.from;
var extras = bnf.extras;
var valid = bnf.valid;
var digit = bnf.digit;

// Reserve for integer compression
var intTo = reserve();
var intFrom = '<';
to[intFrom] = intTo;
from[intTo] = intFrom;

/**
 * Initialize a compressor
 *
 * @param {String} dict
 */

function Compressor(dict) {
  this.setDict(dict || []);
  // TODO copy the bnf to the instance for mutations
};

/**
 * Update the compressors dictionary
 *
 * @param {Array} words
 * @return {Compressor}
 */

Compressor.prototype.setDict = function(words) {
  // Reset the dict
  this._dict = null;
  this._re = null;

  if (!words || !words.length) return this;

  if (words.length > extras.length) {
    throw new TypeError('Provided dict exceeds length of available characters');
  }

  var self = this;
  var dict = {};
  var res = [];

  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var str = self.encode(word, false);
    res.push(str);
    var c = extras[i];
    dict[str] = c;
    from[c] = word;
  }

  this._dict = dict;

  this._re = new RegExp('(' + res.sort(function(a, b) {
    return b.length - a.length;
  }).join('|') + ')', ['g']);

  return this;
};

/**
 * Encode a url
 *
 * @param {String}
 * @param {Boolean} compressInts
 * @return {String}
 */

Compressor.prototype.encode = function(str, compressInts) {
  if (!str) return '';
  var chars = '';
  str = str.toLowerCase();

  if (compressInts !== false) str = this._compressInts(str);

  var inInt = false;
  for (var i = 0; i < str.length; i += 1) {
    var c = str[i];
    if (c === intFrom) {
      inInt = !inInt;
      chars = chars + intTo;
      continue;
    }
    if (inInt) {
      chars = chars + c;
      continue;
    }

    var t = to[c];
    if (typeof t === 'undefined') {
      throw new TypeError('Invalid character ' + c);
    }

    chars = chars + to[c];
  }

  if (!this._re) return chars;

  var dict = this._dict;
  return chars.replace(this._re, function(m, word) {
    return dict[word];
  });
};

/**
 * Decode an encoded string
 *
 * @param {String} str
 * @return {String}
 */

Compressor.prototype.decode = function(str) {
  if (!str) return '';
  var chars = '';
  var self = this;

  var parsingInt = null;
  for (var i = 0; i < str.length; i += 1) {
    var c = str[i];
    if (c === intTo) {
      if (parsingInt !== null) {
        chars = chars + self._decompressInt(parsingInt);
        parsingInt = null;
      } else {
        parsingInt = '';
      }
      continue;
    }

    if (parsingInt !== null) {
      parsingInt = parsingInt + c;
      continue;
    }

    var f = from[c];
    if (typeof f === 'undefined') {
      throw new TypeError('Invalid character ' + c);
    }

    chars = chars + f;
  }

  return chars;
};

/**
 * Compress all integers in a string greater than 5 digits
 *
 * @api private
 */

Compressor.prototype._compressInts = function(str) {
  return str.replace(/([1-9][0-9]{4,14})/g, function(m, number) {
    var converted = convert(number, digit, valid);
    return intFrom + converted + intFrom;
  });
};

/**
 * Decompress an integer
 *
 * @api private
 */

Compressor.prototype._decompressInt = function(str) {
  return convert(str, valid, digit);
};

/**
 * Expose a singleton
 */

module.exports = new Compressor([
  'http://',
  'https://',
  '/?',
  '.com',
  // The most common letter pairs
  // http://en.wikipedia.org/wiki/Letter_frequency
  'th',
  'he',
  'an',
  're',
  'er',
  'in',
  'on',
  'at',
  'nd',
  'st',
  'es',
  'en'
]);

/**
 * Expose the Compressor class
 */

module.exports.Compressor = Compressor;

/**
 * Convert an arbitrary base to another
 */

function convert(src, srctable, desttable) {
  var srclen = srctable.length;
  var destlen = desttable.length;
  // first convert to base 10
  var val = 0;
  var numlen = src.length;
  for (var i = 0; i < numlen; i ++) {
    val = val * srclen + srctable.indexOf(src.charAt(i));
  }
  if (val < 0) return 0;
  // then covert to any base
  var r = val % destlen;
  var res = desttable[r];
  var q = Math.floor(val / destlen);
  while (q) {
    r = q % destlen;
    q = Math.floor(q / destlen);
    res = desttable[r] + res;
  }
  return res;
}

function reserve() {
  extras.pop();
  valid.pop();
  return valid.pop();
}
