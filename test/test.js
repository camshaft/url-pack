var should = require('should');

var url = require('../bnf').url;
var urlc = require('../');

// urlc.setDict([
//   'https://example.com/path/to/dict/compression',
//   'TESTING/1234567'
// ]);

var sum = 0.0, count = 0;

// it('should dict compress', function() {
//   property('https://example.com/path/to/dict/compression/TESTING/1234567/other-part');
// });

it('should pass quickcheck', function() {
  forAll(property, randomUrl);
});

// it('should integer compress', function() {
//   forAll(property, randomNumber);
// });

it('should have a decent encoding ratio', function() {
  (sum / count).should.be.within(0, 1);
});

function property(input) {
  console.log(input);
  var encoded = urlc.encode(input);
  console.log(encoded);
  // Verify it can be uri encoded, with the exception of '[' and ']'
  encodeURI(encoded)
    .replace(/%5B/g, '[')
    .replace(/%5D/g, ']')
    .should.eql(encoded);
  sum += input.length
    ? encoded.length / input.length
    : 1.0;
  count++;
  var decoded = urlc.decode(encoded);
  console.log(decoded, '\n')
  decoded.should.eql(input);
  return decoded;
}

function forAll(property) {
  var generators = Array.prototype.slice.call(arguments, 1);
  for (var i = 0; i < 10000; i ++) {
    var values = generators.map(fn);
    property.apply(null, values);
  }
  function fn(f) { return f(); }
}

function randomUrl() {
  var len = Math.floor(Math.random() * 500);
  var randomString = [];
  for (var i = 0; i < len; i++) {
    var j = Math.floor(Math.random() * url.length);
    randomString.push(url[j]);
  }
  return randomString.join('');
}

function randomNumber(i) {
  if (i < 0) return '';
  if (!i) i = Math.floor(Math.random() * 5);
  return randomNumber(i - 1) + Math.floor(Math.random() * 10000);
}
