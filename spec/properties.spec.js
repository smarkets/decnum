/*global require, describe, beforeEach, it, expect */
/*jslint white: true, vars: true */
var nm = require('../decnum');

describe('Arithmetic properties', function () {
    "use strict";

    var numTests = 10000;

    beforeEach(function () {
        this.addMatchers({
            toBeCloseToFloat: function (expected, epsilon) {
                if (typeof epsilon === 'undefined') {
                    epsilon = 0.01;
                }
                return Math.abs(parseFloat(this.actual) - parseFloat(expected)) < epsilon;
            }
        });
    });

    var randomNumber = function (precision) {
        var a = (Math.random() - 0.5) * Math.pow(10, 4);
        if (typeof precision === 'undefined') {
            return a;
        }
        return Math.round(a * precision) / precision;
    };

    it('Can create round-trip decimals', function () {
        var precision = 4,
            i,
            expected,
            result;
        expect(numTests).toBeGreaterThan(0);
        for (i = 0; i < numTests; i += 1) {
            expected = randomNumber(precision);
            result = new nm.Decnum(expected, precision);
            expect(result.valueOf()).toBeCloseToFloat(expected);
        }
    });

    it('Can compare for equality', function () {
        var precision = 4,
            i,
            expected,
            left,
            right;
        expect(numTests).toBeGreaterThan(0);
        for (i = 0; i < numTests; i += 1) {
            left = randomNumber(precision);
            right = randomNumber(precision);
            expected = 0;
            if (left < right) {
                expected = -1;
            }
            if (right < left) {
                expected = 1;
            }
            left = new nm.Decnum(left, precision);
            right = new nm.Decnum(right, precision);
            expect(left.compare(right)).toBe(expected);
        }
    });

    it('Can perform addition', function () {
        var precision = 4,
            i,
            expected,
            left,
            right;
        expect(numTests).toBeGreaterThan(0);
        for (i = 0; i < numTests; i += 1) {
            left = randomNumber(precision);
            right = randomNumber(precision);
            expected = left + right;
            expect(new nm.Decnum(left, precision)
                   .add(new nm.Decnum(right, precision))
                   .valueOf())
                .toBeCloseToFloat(expected);
        }
    });

    it('Can perform subtraction', function () {
        var precision = 4,
            i,
            expected,
            left,
            right;
        expect(numTests).toBeGreaterThan(0);
        for (i = 0; i < numTests; i += 1) {
            left = randomNumber(precision);
            right = randomNumber(precision);
            expected = left - right;
            expect(new nm.Decnum(left, precision)
                   .sub(new nm.Decnum(right, precision))
                   .valueOf())
                .toBeCloseToFloat(expected);
        }
    });

    it('Can perform multiplication', function () {
        var precision = 4,
            i,
            expected,
            left,
            right;
        expect(numTests).toBeGreaterThan(0);
        for (i = 0; i < numTests; i += 1) {
            left = randomNumber(precision);
            right = randomNumber(precision);
            expected = left * right;
            expect(new nm.Decnum(left, precision)
                   .mul(new nm.Decnum(right, precision))
                   .valueOf())
                .toBeCloseToFloat(expected);
        }
    });

    it('Can perform division', function () {
        var precision = 4,
            i,
            expected,
            left,
            right;
        expect(numTests).toBeGreaterThan(0);
        for (i = 0; i < numTests; i += 1) {
            left = randomNumber(precision);
            right = randomNumber(precision);
            expected = left / right;
            left = new nm.Decnum(left, precision);
            right = new nm.Decnum(right, precision);
            if (right.isZero()) {
                expect(function () {
                    left.div(right);
                }).toThrow('Division by 0');
            } else {
                expect(left.div(right).valueOf()).toBeCloseToFloat(expected);
            }
        }
    });

    it('Throws division by zero', function () {
        var left = new nm.Decnum(1),
            right = new nm.Decnum(0);
        expect(function () {
            return left.div(right);
        }).toThrow('Division by 0');
    });

    it('Can perform -0.7500 % -279.0000', function () {
        var precision = 4,
            left = new nm.Decnum('-0.7500', precision),
            right = new nm.Decnum('-279.0000', precision);
        expect(left.mod(right).valueOf()).toBeCloseToFloat(-0.75);
    });

    it('Can perform modulo operations', function () {
        var precision = 4,
            i,
            expected,
            left,
            right;
        expect(numTests).toBeGreaterThan(0);
        for (i = 0; i < numTests; i += 1) {
            left = randomNumber(precision);
            right = randomNumber(precision);
            expected = left % right;
            left = new nm.Decnum(left, precision);
            right = new nm.Decnum(right, precision);
            if (right.isZero()) {
                expect(function () {
                    left.mod(right);
                }).toThrow('Division by 0');
            } else {
                expect(left.mod(right).valueOf())
                    .toBeCloseToFloat(expected);
            }
        }
    });

    it('Can compare "negative zero"', function () {
        var badZero = new Decnum(0);
        badZero._digits = [0, 0];
        badZero._positive = false;
        expect(badZero.compare(new Decnum('-1.23'))).toBe(1);
        expect(badZero.compare(new Decnum('1.23'))).toBe(-1);
        expect(badZero.compare(new Decnum(0))).toBe(0);
        expect(new Decnum('-0.75').compare(badZero)).toBe(-1);
        expect(new Decnum('0.75').compare(badZero)).toBe(1);
        expect(new Decnum(0).compare(badZero)).toBe(0);
    });

    it('Can compare numbers', function () {
        var precision = 4,
            i,
            expected,
            left,
            right;
        expect(numTests).toBeGreaterThan(0);
        for (i = 0; i < numTests; i += 1) {
            left = randomNumber(precision);
            right = randomNumber(precision);
            if (left === right) {
                expected = 0;
            }
            if (left > right) {
                expected = 1;
            }
            if (right > left) {
                expected = -1;
            }
            left = new nm.Decnum(left, precision);
            right = new nm.Decnum(right, precision);
            expect(left.compare(right)).toBe(expected);
        }
    });

    it('Can negate numbers', function () {
        var precision = 4,
            i,
            expected,
            left,
            leftDecimal;
        expect(numTests).toBeGreaterThan(0);
        for (i = 0; i < numTests; i += 1) {
            left = randomNumber(precision);
            leftDecimal = new nm.Decnum(left, precision);
            expect(leftDecimal.negate()).toBeCloseToFloat(left * -1);
        }
    });

    it('Can subtract small numbers', function () {
        var a = new nm.Decnum('0.2', 8);
        a._digits.push(0);
        var b = new nm.Decnum('0.5', 8);
        expect(a.sub(b)).toBeCloseToFloat(-0.3);
    });

    it('Can compare numbers with different floats', function () {
        var a = new nm.Decnum('0.3', 8);
        var b = new nm.Decnum('0.3', 8);
        expect(a.compare(b)).toBe(0);
        b._float = 1;  // b becomes 3000.0
        // Compare 0.3 to 3000.0
        expect(a.compare(b)).toBe(-1);
        expect(b.compare(a)).toBe(1);
    });
});
