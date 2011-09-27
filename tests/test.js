var nm = require('../decnum');

DEFAULT_NUMTESTS = 100;

function error_msg(testname, expected, result, data) {
    msg = testname + " FAILED!\n" + "Expected: " + expected + " Result: " + result + "\n" + "Test data: " + data;
    return msg;
}


exports.test_creation = function(test) {
    var PRECISION = 4,
    NUMTESTS = DEFAULT_NUMTESTS;

    test.expect(NUMTESTS);

    for (var i = 0; i < NUMTESTS; i++) {
        // Get some random number
        var x = Math.random() * 1000,
        y = new nm.Decnum(x, PRECISION),
        t = Number(x).toString().split("."),
        a = t[0],
        b = t[1] + "00000",
        z = a + "." + b.slice(0, 4);
        // Leave only

        test.ok(z == y.to_string(), "expected: " + z  + " got: " + y.to_string() + " root: " + x.toString());

    }

    test.done();
};



exports.test_comparison = function(test) {
    var PRECISION = 4,
    NUMTESTS = DEFAULT_NUMTESTS;
    test.expect(NUMTESTS);

    for (var i = 0; i < NUMTESTS; i++) {
        var a = Math.random() * 1000,
        b = Math.random() * 1000,
        a = Math.round(a * PRECISION) / PRECISION  * (Math.random() > 0.5 ? 1 : -1),
        b = Math.round(b * PRECISION) / PRECISION  * (Math.random() > 0.5 ? 1 : -1),
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

        test.ok(expected == result, "expected: " + expected + " got: " + result + " test data: " + a + " " + b);
    }


    test.done();
}


exports.test_addition = function(test) {
    var PRECISION = 4,
    NUMTESTS = DEFAULT_NUMTESTS;

    test.expect(NUMTESTS);

    for (var i = 0; i < NUMTESTS; i++) {
        // Get some random number
        var a = Math.random() * 1000,
        b = Math.random() * 1000,
        a = Math.round(a * PRECISION) / PRECISION * (Math.random() > 0.5 ? 1 : -1),
        b = Math.round(b * PRECISION) / PRECISION * (Math.random() > 0.5 ? 1 : -1),
        t = ((a + b) + "").split("."),
        intp = t[0],
        frcp = t[1] ? t[1] + "0000" : "0000",
        x = (new nm.Decnum(a, PRECISION)).add(new nm.Decnum(b, PRECISION)),
        z = intp + "." + frcp.slice(0, 4);

        // Leave only
        test.ok(z == x.to_string(), "expected: " + z  + " got: " + x.to_string() + " root: " + a.toString()+ " " + b.toString());

    }
    test.done();
};

exports.test_subtraction = function(test) {
    var PRECISION = 4,
    NUMTESTS = DEFAULT_NUMTESTS;

    test.expect(NUMTESTS);

    for (var i = 0; i < NUMTESTS; i++) {
        // Get some random number
        var a = Math.random() * 1000,
        b = Math.random() * 1000,
        a = Math.round(a * PRECISION) / PRECISION * (Math.random() > 0.5 ? 1 : -1),
        b = Math.round(b * PRECISION) / PRECISION * (Math.random() > 0.5 ? 1 : -1);
        // console.log([a,b]);
        var t = ((a - b) + "").split("."),
        intp = t[0],
        frcp = t[1] ? t[1] + "0000" : "0000",
        x = (new nm.Decnum(a, PRECISION)).sub(new nm.Decnum(b, PRECISION)),
        z = intp + "." + frcp.slice(0, 4);

        // Leave only
        // console.log("ok");
        test.ok(z == x.to_string(), "expected: " + (a - b)  + " got: " + x.to_string() + " root: " + a.toString()+ " " + b.toString());

    }
    test.done();
};

function almost_equal(x, y) {
    var epsilon = 0.01;
    return Math.abs(parseFloat(x) - parseFloat(y)) < epsilon;
}

exports.test_multiplication = function(test) {
    var PRECISION = 4,
    NUMTESTS = DEFAULT_NUMTESTS;
    test.expect(NUMTESTS);
    for (var i = 0; i < NUMTESTS; i++) {
        // Get some random number
        var a = Math.random() * 1000,
        b = Math.random() * 1000,
        a = Math.round(a * PRECISION) / PRECISION * (Math.random() > 0.5 ? 1 : -1),
        b = Math.round(b * PRECISION) / PRECISION * (Math.random() > 0.5 ? 1 : -1),
        // console.log([a,b]);
        expected = a * b;

        var aN = new nm.Decnum(a, PRECISION),
        bN = new nm.Decnum(b, PRECISION),
        result = aN.mul(bN).to_string();
        // Leave only
        // console.log("ok");
        test.ok(almost_equal(expected, result), error_msg("multiplication", expected, result, [a, b]));
    }

    test.done();
};

// Todo test shifting