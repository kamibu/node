// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var common = require('../common');
var assert = require('assert');

function alwaysAssert() {
  assert.ok(0);
}

function isTypeError(e) {
  return e instanceof TypeError;
}

[ undefined,
  null,
  true,
  false,
  '',
  [],
  {},
  NaN,
  +Infinity,
  -Infinity,
  (1.0 / 0.0),      // sanity check
  parseFloat('x'),  // NaN
].forEach(function(value) {
  assert.throws(function() { setTimeout(alwaysAssert, value); }, isTypeError);
  assert.throws(function() { setInterval(alwaysAssert, value); }, isTypeError);
});

// disallow negative repeat values, makes ev.c assert
[ -10, -1, -0.1 ].forEach(function(value) {
  assert.throws(function() { setInterval(alwaysAssert, value); }, isTypeError);
});

var inputs = [0, 0.0, 0.5, 1, 1.0, 10];
var timeouts = [];
var intervals = [];

inputs.forEach(function(value, index) {
  setTimeout(function() {
    timeouts[index] = true;
  }, value);

  var handle = setInterval(function() {
    clearInterval(handle); // disarm timer or we'll never finish
    intervals[index] = true;
  }, value);
});

// additional check for setTimeout(), negative timeouts are allowed
var negatives = [ -10, -1, -0.1 ];

negatives.forEach(function(value, index) {
  setTimeout(function() { timeouts[index + inputs.length] = true; }, value);
});

process.on('exit', function() {
  // assert that all timers have run
  inputs.forEach(function(value, index) {
    assert.equal(true, timeouts[index]);
    assert.equal(true, intervals[index]);
  });

  // additional check for setTimeout()
  negatives.forEach(function(value, index) {
    assert.equal(true, timeouts[index + inputs.length]);
  });
});
