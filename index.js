/**
 * Module dependencies
 */

var bnf = require('./bnf');
var to = bnf.to;
var from = bnf.from;
var toD = bnf.toD;
var fromD = bnf.fromD;
var extras = bnf.extras;
var dictExtras = bnf.dict;
var valid = bnf.valid;
var digit = bnf.digit;

// Reserve for integer compression
var intChar = reserve();

// Reserve for double chars
var dChar = reserve();

/**
 * Initialize a compressor
 *
 * @param {String} dict
 */

function Compressor(dict) {
  this.setDict(dict || []);
  // TODO copy the bnf to the instance for mutations
}

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

  if (words.length > dictExtras.length) {
    throw new TypeError('Provided dict exceeds length of available characters');
  }

  var self = this;
  var dict = {};
  var res = [];

  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var str = self.encode(word, true);
    var c = dictExtras[i];
    dict[str] = c;
    fromD[c] = word;
    str = str.replace(/([^a-zA-Z0-9_-]{1})/g, function(match, c) {
      return '\\' + c;
    });
    res.push(str);
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

  for (var i = 0; i < str.length; i = i + 1) {
    var c = str.charAt(i);
    var t = to[c];

    if (!t) t = toD[c] ? dChar + toD[c] : undefined;

    if (typeof t === 'undefined') {
      throw new TypeError('Invalid character ' + c);
    }

    chars = chars + t;
  }

  if (this._re) {
    var dict = this._dict;
    chars = chars.replace(this._re, function(m, word) {
      return dChar + dict[word];
    });
  }

  if (compressInts !== false) chars = this._compressInts(chars);

  return chars;
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
  for (var i = 0; i < str.length; i = i + 1) {
    var c = str.charAt(i);

    // We found an integer character
    if (c === intChar) {
      if (parsingInt !== null) {
        chars = chars + self._decompressInt(parsingInt);
        parsingInt = null;
      } else {
        parsingInt = '';
      }
      continue;
    }

    // We found a double character
    // if (c === dChar) {
    //   i = i + 1;
    //   c = str.charAt(i);
    //   var f = fromD[c];
    //   if (typeof f === 'undefined') {
    //     throw new TypeError('Invalid character ' + c);
    //   }
    //   if (parsingInt !== null) {
    //     parsingInt = parsingInt + f;
    //   } else {
    //     chars = chars + f;
    //   }
    //   continue;
    // }

    // We're in the middle of parsing an integer
    if (parsingInt !== null) {
      parsingInt = parsingInt + c;
      continue;
    }

    // Either pull from the double character list or the regular list
    var f = from[c];
    if (c === dChar) {
      i = i + 1;
      c = str.charAt(i);
      f = fromD[c];
    }

    if (typeof f === 'undefined') {
      console.log(str);
      console.log(chars);
      console.log(i, c, f);
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
    return intChar + converted + intChar;
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
  '.com',
  'THE',
  'the',
  'EST',
  'est',
  'FOR',
  'for',
  'AND',
  'and',
  'HIS',
  'his',
  'ENT',
  'ent',
  'THA',
  'tha'
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
  return valid.pop();
}
