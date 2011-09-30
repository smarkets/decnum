var nm = require('../decnum');

DEFAULT_NUMTESTS = 10000;

function error_msg(testname, expected, result, data) {
    msg = "\n" + testname + " FAILED!\nExpected: " + expected + " Result: " + result + "\n" + "Test data: " + data;
    return msg;
}

function almost_equal(x, y, epsilon) {
    var epsilon = epsilon || 0.01;
    return Math.abs(parseFloat(x) - parseFloat(y)) < epsilon;
}

function random_num(precision, max_digits) {
    var digs = max_digits ? 9 : max_digits;
     a = (Math.random() - 0.5) * Math.pow(10, 4);
    return precision ? Math.round(a * precision) / precision : a;
}

exports.test_creation = function(test) {
    var PRECISION = 4,
    NUMTESTS = DEFAULT_NUMTESTS;

    test.expect(NUMTESTS);

    for (var i = 0; i < NUMTESTS; i++) {
        var x = random_num(PRECISION),
        result = (new nm.Decnum(x, PRECISION)).toString(),
        expected = x;

        test.ok(almost_equal(result, expected), error_msg("creation", expected, result, x));

    }

    test.done();
};

exports.test_comparison = function(test) {
    var PRECISION = 4,
    NUMTESTS = DEFAULT_NUMTESTS;
    test.expect(NUMTESTS);

    for (var i = 0; i < NUMTESTS; i++) {
        var a = random_num(PRECISION),
        b = random_num(PRECISION),
        expected = 0;

        if (a < b) {
            expected = -1;
        }

        if (a > b) {
            expected = 1;
        }

        var aN = new nm.Decnum(a, PRECISION),
        bN = new nm.Decnum(b, PRECISION),
        result = aN.compare(bN);

        test.ok(expected == result, error_msg("comparison", expected, result, [a, b]));
    }

    test.done();
};

exports.test_addition = function(test) {
    var PRECISION = 4,
    NUMTESTS = DEFAULT_NUMTESTS;

    test.expect(NUMTESTS);

    for (var i = 0; i < NUMTESTS; i++) {
        var a = random_num(PRECISION),
        b = random_num(PRECISION),
        expected = a + b,
        result = (new nm.Decnum(a, PRECISION)).add(new nm.Decnum(b, PRECISION)).to_string();

        // Leave only
        test.ok(almost_equal(expected, result), error_msg("addition", expected, result, [a, b]));
    }
    test.done();
};

exports.test_subtraction = function(test) {
    var PRECISION = 4,
    NUMTESTS = DEFAULT_NUMTESTS;

    test.expect(NUMTESTS);

    for (var i = 0; i < NUMTESTS; i++) {
        // Get some random number
        var a = random_num(PRECISION),
        b = random_num(PRECISION),
        expected = a - b,
        result = (new nm.Decnum(a, PRECISION)).sub(new nm.Decnum(b, PRECISION)).to_string();

        test.ok(almost_equal(expected, result), error_msg("subtraction", expected, result, [a, b]));

    }
    test.done();
};

exports.test_multiplication = function(test) {
    var PRECISION = 4,
    NUMTESTS = DEFAULT_NUMTESTS;
    test.expect(NUMTESTS);
    for (var i = 0; i < NUMTESTS; i++) {
        var a = random_num(PRECISION, 4),
        b = random_num(PRECISION, 4),
        expected = a * b,
        aN = new nm.Decnum(a, PRECISION),
        bN = new nm.Decnum(b, PRECISION),
        result = aN.mul(bN).to_string();

        test.ok(almost_equal(expected, result), error_msg("multiplication", expected, result, [a, b]));
    }

    test.done();
};

exports.test_division = function(test) {
    var PRECISION = 4,
    NUMTESTS = DEFAULT_NUMTESTS;
    test.expect(NUMTESTS);
    for (var i = 0; i < NUMTESTS; i++) {
        var a = random_num(PRECISION, 4),
        b = random_num(PRECISION, 4);
        if (Math.abs(b) < 0.001) b = 1; // Avoid div by zero
        var expected = a / b,
        aN = new nm.Decnum(a, PRECISION),
        bN = new nm.Decnum(b, PRECISION),
        result = aN.div(bN).to_string();

        test.ok(almost_equal(expected, result), error_msg("division", expected, result, [a, b]));
    }

    test.done();
};
