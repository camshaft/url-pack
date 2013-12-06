var should = require('should');

var url = require('../bnf').url;
var urlc = require('../');

urlc.setDict([
  'https://example.com/path/to/dict/compression',
  'testing/1234567'
]);

it('should dict compress', function() {
  property('https://example.com/path/to/dict/compression/testing/1234567/other-part');
});

it('should pass quickcheck', function() {
  forAll(property, randomUrl);
});

it('should integer compress', function() {
  forAll(property, randomNumber);
});

function property(input) {
  input = input.toLowerCase();
  var encoded = urlc.encode(input);
  // Verify it can be uri encoded, with the exception of '[' and ']'
  encodeURI(encoded)
    .replace(/%5B/g, '[')
    .replace(/%5D/g, ']')
    .should.eql(encoded);
  var rate = encoded.length / input.length;
  if (input.length) rate.should.be.within(0, 1);
  var decoded = urlc.decode(encoded);
  decoded.should.eql(input);
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

function randomNumber() {
  return '' + Math.floor(Math.random() * 9007199254740992);
}
