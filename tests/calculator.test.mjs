import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, formatResult } from '../src/calculator.mjs';

test('respects precedence, parentheses and whitespace', () => {
  assert.equal(calculate('2 + 3 * 4'), 14);
  assert.equal(calculate('(2 + 3) * 4'), 20);
  assert.equal(calculate(' 18 / (2 + 1) '), 6);
});
test('accepts decimal point, decimal comma and unary signs', () => {
  assert.equal(calculate('1,5 + .5'), 2);
  assert.equal(calculate('-(2 + 3) * -2'), 10);
  assert.equal(calculate('5 - -2'), 7);
  assert.equal(calculate('-0'), 0);
});
test('reports malformed expressions and division by zero', () => {
  for (const input of ['', ' ', '2 +', '1..2', '()', '(1 + 2', '1 2', '2(3)', '0 / 0', '5 / 0']) {
    assert.throws(() => calculate(input), Error, input);
  }
});
test('rejects executable code and unsupported notation', () => {
  for (const input of ['globalThis.process.exit()', 'Math.max(1,2)', '0x20', '1e3', '2 ** 3', '1;2', '<script>']) {
    assert.throws(() => calculate(input), Error, input);
  }
});
test('limits input length and rejects non-string input', () => {
  assert.throws(() => calculate('1'.repeat(161)), /160/);
  assert.throws(() => calculate(null), Error);
  assert.throws(() => calculate(42), Error);
});
test('formats floating-point output for Brazilian Portuguese', () => {
  assert.equal(formatResult(calculate('0.1 + 0.2')), '0,3');
  assert.equal(formatResult(1234.5), '1.234,5');
});
