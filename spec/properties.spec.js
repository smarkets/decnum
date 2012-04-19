/*global require, describe, beforeEach, it, expect */
/*jslint white: true, vars: true */
var nm = require('../decnum');

describe('Arithmetic properties', function() {
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

    it('Throws division by zero', function() {
        var left = new nm.Decnum(1),
            right = new nm.Decnum(0);
        expect(function () {
            return left.div(right);
        }).toThrow('Division by 0');
    });
});
