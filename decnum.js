Decnum = function(num, precision) {
    //// Constructor
    var DBASE = 4,
        BASE = Math.pow(10, DBASE);
    precision = (precision != undefined) ? precision : DBASE;

    this._precision = precision;
    this._float = Math.ceil(precision / DBASE);

    if (typeof(num) == 'undefined') {
        num = 0;
    }
    if (num instanceof Decnum) {
        this._positive = num._positive;
        this.BASE = num.BASE;
        this.DBASE = num.DBASE;

        if (this._float != num._float) {
            var delta = (this._float - num._float);
            this._digits = num._shift(delta)._digits;
        } else {
            this._digits = num._digits.slice(0);
        }
    } else {
        var in_data = num.toString(),
        parts = in_data.split("."),
        prec = Math.ceil(precision / DBASE),
        fractional_s = parts[1] ? parts[1] : "",
        integer_s = Math.abs(parts[0]),
        integer_n = parseInt(integer_s),
        digits = [];
        this.BASE = BASE;
        this.DBASE = DBASE;
        // Filling the fractional part with zeroes
        while (fractional_s.length < this._float * DBASE) {
            fractional_s = fractional_s + '0';
        }

        fractional_s = fractional_s.slice(0, this._float * DBASE);

        var fractional_len = this._float,
        integer_len = Math.max(0, Math.ceil(Math.log(integer_n) / Math.log(BASE))),
        ind = 0;


        this._digits = new Array(fractional_len + integer_len);

        for (var i = fractional_s.length; i >= DBASE; i -= DBASE) {
            this._digits[ind] = parseInt(fractional_s.slice(i - DBASE, i), 10);
            ind++;
            if (ind == this._float) break;
        }


        for (var x = integer_n; x != 0; x = Math.floor(x / BASE)) {
            this._digits[ind] = (x % BASE);
            ind++;
        }

        this._positive = num >= 0 ;
    }


    if (this._precision > 0 && (0 != this._precision % this.DBASE)) {
        this._digits[0] -= (this._digits[0] % Math.pow(10, this.DBASE - this._precision % this.DBASE));
    }
};
//// Arithmetics
Decnum.prototype.add = function(x) {
    // non-destructive add
    x = this.coerce_num(x);

    // Some cases of addition are easier to represent as substraction
    if (this._positive != x._positive) {
        if (this._positive) {
            return this.sub(x.negate());
        } else {            //this is negative
            return this.negate().sub(x).__neg();
        }
    }

    var precision = Math.max(this._precision, x._precision),
    c = new Decnum(0, precision),
    len_new = Math.max(this._digits.length, x._digits.length),
    overflow = 0;
    c._digits = new Array(len_new);

    for (var i = 0; i < len_new; i++) {
        var ad = i < this._digits.length ? this._digits[i] : 0,
            bd = i < x._digits.length ? x._digits[i] : 0,
            sum = ad + bd + overflow,
            digit = sum % this.BASE;

        overflow = Math.floor(sum / this.BASE);
        c._digits[i] = digit;
    }

    if (overflow > 0) {
        c._digits.push(overflow);
    }

    c._positive = this._positive;
    return c;
};
Decnum.prototype.sub = function (x) {
    // Non-destructive subtraction operation
    x = this.coerce_num(x);

    // Some subtractions are easier to do as additions
    if (this._positive != x._positive) {
        if (this._positive) {
            return this.add(x.negate());
        } else {            //this is negative
            return this.negate().add(x).__neg();
        }
    }

    var precision = Math.max(this._precision, x._precision),
        c = new Decnum(0, precision);

    if (this._positive) {     // both are positive
        if (this.compare(x) > 0) {
            var a = this,
            b = x;
            c._positive = true;
        } else if (this.compare(x) < 0) {
            var b = this,
            a = x;
            c._positive = false;
        } else {            // this == x
            c._positive = true;
            return c;
        }
    } else {                // both are negative
        if (this.compare(x) > 0) {
            var a = x.negate(),
                b = this.negate();
            c._positive = true;
        } else if (this.compare(x) < 0) {
            var a = this.negate(),
                b = x.negate();
            c._positive = false;
        } else {            // this == x
            c._positive = true;
            return c;
        }
    }

    var len_new = Math.max(a._digits.length, b._digits.length),
    overflow = 0;
    c._digits = new Array(len_new);

    for (var i = 0; i < len_new; i++) {
        var ad = i < a._digits.length ? a._digits[i] : 0,
            bd = i < b._digits.length ? b._digits[i] : 0,
            dif = ad - bd + overflow;

        if (dif < 0) {
            c._digits[i] = (dif + this.BASE);
            overflow = -1;
        } else {
            c._digits[i] = (dif);
            overflow = 0;
        }
    }

    return c;
};
Decnum.prototype.mul = function (x) {
    // Non-destructive multiplication
    x = this.coerce_num(x);

    var c = new Decnum(0, this._precision);

    for (var ix = 0; ix < x._digits.length; ix++) {
        var d = this._mul_digit(x._digits[ix], ix);
        c = c.add(d);
    }

    c._positive = (this._positive == x._positive);
    c.__shift(-x._float);

    // Fill with zeroes if needed
    while (c._digits.length <= c._float) {
        c._digits.push(0);
    }
    // Make sure precision didn't 'increase'

    if (c._precision > 0 && (0 != (c._precision % c.DBASE))) {
        c._digits[0] -= (c._digits[0] % Math.pow(10, c.DBASE - c._precision % c.DBASE));
    }
    return c;
};
Decnum.prototype.mod = function (x) {
    // Non-destructive modulo operations
    x = this.coerce_num(x);

    return this.sub(this.div(x).intPart().mul(x));
};

Decnum.prototype.div = function (x) {
    // Non-destructive division operation
    x = this.coerce_num(x);

    if (x.isZero()) {
        throw new Error("Division by 0");
    }

    // Find precision
    var new_precision = x._digits.length,
    divsor = new Decnum(0, 0),
    divend = new Decnum(0, 0);
    divsor._digits = [];
    divend._digits = [];
    divsor._positive = true;
    divend._positive = true;

    for (var i = 0; i < x._digits.length; i++) {
        divsor._digits.push(x._digits[i]);
    }

    // Eliminate leading zeroes
    while (divsor._digits[divsor._digits.length - 1] == 0) {
        divsor._digits.pop();
    }

    var div_digits = new Array(divsor._digits.length + 1 + this._digits.length);

    // Add some zeroes for precision. +1 should be here
    for (var i = 0; i < divsor._digits.length + 1; i++) {
        div_digits[i] = 0;
    }

    for (var i = divsor._digits.length + 1, j = 0; i < this._digits.length + divsor._digits.length + 1; i++, j++) {
        div_digits[i] = this._digits[j];
    }

    divend._digits = new Array(divsor._digits.length);
    for (var i = div_digits.length - divsor._digits.length, j = 0; i < div_digits.length; i++, j++) {
        divend._digits[j] = (div_digits[i]);
    }

    for (var i = 0; i < divsor._digits.length; i++) {
        div_digits.pop();
    }

    var result = [];
    // Now the algo
    while (divend._digits.length < divsor._digits.length) {
        divend._digits.push(0);
    }

    while (div_digits.length > 0) {
        var digit = divsor._div_digit(divend);
        result.push(digit);
        // Przesun tempa

        divend.__div_submul(divsor, digit); //Equivalent to, replaced for speed:
        // divend = divend.sub(divsor.mul(new Decnum(digit, divsor._precision)));
        divend.__shift(1);
        divend._digits[0] = div_digits.pop();

    }

    var c = new Decnum(0, this._precision);
    c._positive = (this._positive == x._positive);
    c._digits = new Array(result.length);
    for (var i = result.length - 1, j = 0; i >= 0 ; i--, j++) {
        c._digits[j] = result[i];
    }

    var delta = this._float - divsor._digits.length;

    c.__shift(delta);

    while (c._digits.length <= c._float) {
        c._digits.push(0);
    }

    // Make sure precision didn't 'increase'

    if (c._precision > 0 && (0 != (c._precision % c.DBASE))) {
        c._digits[0] = c._digits[0] - (c._digits[0] % Math.pow(10, c.DBASE - c._precision % c.DBASE));
    }
    return c;
};

Decnum.prototype.compare = function(x) {
    // Compare two numbers. +1 means this > x; 0 equals, -1: this < x
    x = this.coerce_num(x);

    var newFloat = Math.max(this._float, x._float);

    for (var i = 0; i < (newFloat - this._float); i++)
        this._digits.unshift(0);
    for (var i = 0; i < (newFloat - x._float); i++)
        x._digits.unshift(0);

    this._float = newFloat;
    x._float = newFloat;

    while (this._digits.length > 1 && this._digits[this._digits.length - 1] == 0)
        this._digits.pop();
    while (x._digits.length > 1 && x._digits[x._digits.length - 1] == 0)
        x._digits.pop();

    if (this.isZero()) {
        if (x.isZero()) {
            return 0;
        }
        return x._positive ? -1 : 1;
    }

    if (x.isZero()) {
        return this._positive ? 1 : -1;
    }

    if (this._positive !== x._positive) {
        return this._positive ? 1 : -1;
    }

    var res = 0;

    if (this._digits.length != x._digits.length) {
        if (this._digits.length > x._digits.length) {
            return this._positive ? 1 : -1;
        } else {
            return this._positive ? -1 : 1;
        }
    }

    for (var i = this._digits.length - 1; i >= 0; i--) {
        if (this._digits[i] > x._digits[i]) return this._positive ? 1 : -1;
        if (this._digits[i] < x._digits[i]) return this._positive ? -1 : 1;
    }

    return 0;
};
Decnum.prototype.negate = function() {
    // Return -1 * this. Non-destructive
    var res = this._clone();
    res._positive = !res._positive;
    return res;
};
//// Stuff other than (+ - * / <) that is useful
Decnum.prototype.coerce_num = function (x) {
    // Makes sure the other argument is valid
    if (!(x instanceof Decnum)) {
        x = new Decnum(x, this._precision);
    } else {
        if (x._precision != this._precision || x.DBASE != this.DBASE) {
            x = new Decnum(x.to_string(), this._precision);
        }
    }

    return x;
};
Decnum.prototype.int_part = function() {
    // Return new decnum which is integer part of old one
    return new Decnum(this.to_string().split('.')[0], this._precision);
};
Decnum.prototype.to_string = function () {
    // Returns string representation
    var res = "",
        start = this._digits.length - 1,
        leadz = true,
        floatp = false,
        maxlen = this.BASE.toString().length - 1;

    if (this._digits.length == 0) return '0';

    for (var i = this._digits.length - 1; i >= 0; i--) {
        if (i == this._float - 1) {
            res += ".";
            floatp = true;
        }

        var chunk = this._digits[i].toString();

        if (floatp) {
            while(chunk.length < maxlen) {
                chunk = "0" + chunk;
            }

            if (i == 0 && (this._precision % this.DBASE != 0)) {   //Last digits after floating point
                chunk = chunk.slice(0, this._precision % this.DBASE);
            }
        } else {
            if (chunk == 0 && leadz) {
               continue;
            } else {
                while(chunk.length < maxlen && !leadz) {
                    chunk = "0" + chunk;
                }
            }
        }
        res += chunk;
        leadz = false;
    }

    if (res[0] == '.' || res.length == 0) {
        res = '0' + res;
    }

    if (!this._positive && !this.isZero()) {
        res = "-" + res;
    }

    return res;
};
Decnum.prototype.abs = function() {
    // Absolute value of this. Non-destructive.
    return this._positive ? this._clone() : this.negate();
};
Decnum.prototype.pow = function(x) {
    // Exponentation, unfortunately it works only for positive integers
    if (Math.floor(x) != x || x < 0) {
        throw new Error("Exponentation doesn't know how to handle this exponent");
    }

    var res = new Decnum(1, this._precision);

    for (var i = 0; i < x; i++) {
        res = res.mul(this);
    }

    return res;
};
Decnum.prototype.round = function () {
    // This does nothing and is added for compatibility with old broken bignums
    return this._clone();
};
Decnum.prototype.is_negative = function () {
    return this.isZero() || !(this._positive);
};

//// 'Private' functions start here - ie those you won't probably need
//// Functions starting with one underscore are non-destructive,
//// Functions starting with two underscores may or may not mess with 'this' andor arguments

Decnum.prototype._mul_digit = function(digit, position) {
    // Util for multiplication
    var c = new Decnum(0, this._precision),
    ind = 0;
    c._positive = true;
    c._digits = new Array(position + this._digits.length);         // Fill with appropriate number of zeroes

    for (var i = 0; i < position; i ++) {
        c._digits[ind] = (0);
        ind++;
    }

    var overflow = 0,
        rem = 0;
    for (var i = 0; i < this._digits.length; i++) {
        var mul = this._digits[i] * digit + overflow;
        rem = mul % this.BASE;
        overflow = Math.floor(mul / this.BASE);
        c._digits[ind] = (rem);
        ind++;
    }

    if (overflow > 0)
        c._digits.push(overflow);

    return c;
};


Decnum.prototype._div_digit = function(x) {
    // Util for division
    if (!this._positive) {
        return this.negate()._div_digit(x);
    }

    var a = 0,
    b = this.BASE - 1,
    c = 0;

    while (a < b) {
        c = Math.floor((a + b) / 2 ) + 1;
        var t = this.mul(new Decnum(c, this._precision)).compare(x);

        if (t > 0) { //
            b = c - 1;
        } else {
            a = c;
        }
    }

    return a;
};

Decnum.prototype.__div_submul = function (divsor, digit) {
    // Another util for division, this one is destructive.
    var temp = [],
        overflow_mul = 0,
        overflow_sub = 0;

    for (var i = 0; i < divsor._digits.length; i++) {
        var mul_res = divsor._digits[i] * digit + overflow_mul,
            digit_mul = mul_res % divsor.BASE,
            digit_sub = (this._digits[i] ? this._digits[i] : 0) + overflow_sub - digit_mul;
        overflow_mul = Math.floor(mul_res / divsor.BASE);

        if (digit_sub < 0) {
            overflow_sub = -1;
            digit_sub += this.BASE;
        } else {
            overflow_sub = 0;
        }

        this._digits[i] = digit_sub;
    }
    // "Unroll"

    var index = divsor._digits.length,
        digit_sub = (this._digits[index] ? this._digits[index] : 0) + overflow_sub - overflow_mul;

    if (digit_sub < 0) {
        overflow_sub = -1;
        digit_sub += this.BASE;
    } else {
        overflow_sub = 0;
    }

    this._digits[index] = digit_sub;

    while (!(this._digits[this._digits.length - 1]) && this._digits.length > 1) {
        this._digits.pop();
    };
};
Decnum.prototype._clone = function() {
    // Return new number, the same as this
    var res = new Decnum(0, this._precision);
    res._digits = this._digits.slice(0);
    res._float = this._float;
    res._positive = this._positive;

    return res;
};

Decnum.prototype._force_precision = function(precision) {
    // At the moment everything asserts numbers of the same precision
    var new_float = Math.ceil(precision / this.DBASE),
    delta = new_float - this._float,
    res = this._shift(delta);
    res._float = new_float;
    res._precision = precision;
    return res;
};

// Note that those shifts by digit, which is DBASE digits long
// Positive shifts left
// Negative right
Decnum.prototype._shift = function(delta) {
    var res;
    if (delta == 0) res = this._clone();
    if (delta < 0) {
        res = this._shift_right(-delta);
    }
    if (delta > 0) {
        res = this._shift_left(delta);
    }

    return res;
};

Decnum.prototype._shift_right = function(digs) {
    var res = this._clone();

    for (var i = 0, j = (res._digits.length - digs); i < j; i++) {
        res._digits[i] = res._digits[i + digs];
    }

    for (var i = 0; i < digs; i++) {
        res._digits.pop();
    }

    return res;
};

Decnum.prototype._shift_left = function(digs) {
    var res = this._clone();
    for (var i = 0; i < digs; i++) {
        res._digits.push(0);
    }

    for (var i = res._digits.length - 1; i >= digs; i--) {
        res._digits[i] = res._digits[i - digs];
    }

    for (var i = digs - 1; i >= 0; i--) {
        res._digits[i] = 0;
    }

    while (res._digits[res._digits.length - 1] == 0 && res._digits.length > res._float + 1) {
        res._digits.pop();
    }

    return res;
};

Decnum.prototype.isZero = function() {
    for (var i = 1; i < this._digits.length; i++) {
        if (this._digits[i] != 0) {
            return false;
        };
    }
    // Last digit may contain some garbage
    if (0 != (this._precision % this.DBASE)) {
        return (this._digits[0] < Math.pow(10, this.DBASE - this._precision % this.DBASE));
    }
    return (this._digits[0] == 0);
};


// Destructive negation
Decnum.prototype.__neg = function() {
    this._positive = !this._positive;
    return this;
};

// The same as _shift, but breaks this
// Positive shifts left
// Negative right
Decnum.prototype.__shift = function(delta) {
    if (delta < 0) {
        var delt = -delta;

        for (var i = 0; i < this._digits.length - delt; i++) {
            this._digits[i] = this._digits[i + delt];
        }

        for (var i = 0; i < delt; i++) {
            this._digits.pop();
        }
    }

    if (delta > 0) {
        for (var i = 0; i < delta; i++) {
            this._digits.push(0);
        }

        for (var i = this._digits.length - 1; i >= delta; i--) {
            this._digits[i] = this._digits[i - delta];
        }

        for (var i = delta - 1; i >= 0; i--) {
            this._digits[i] = 0;
        }
    }

    while (this._digits[this._digits.length - 1] == 0 && this._digits.length > this._float + 1) {
        this._digits.pop();
    }

    return this;
};

// aliases for backward compatibility
Decnum.prototype.valueOf = Decnum.prototype.to_string;
Decnum.prototype.toString = Decnum.prototype.to_string;
Decnum.prototype.subtract = Decnum.prototype.sub;
Decnum.prototype.divide = Decnum.prototype.div;
Decnum.prototype.multiply = Decnum.prototype.mul;
Decnum.prototype.intPart = Decnum.prototype.int_part;

// Added for compatibility with old code
Decnum.clone = function(x) {
    return x._clone();
};


// Exporting so
if (typeof(module) != 'undefined' && 'exports' in module) {
    module.exports.Decnum = Decnum; // for tests
}
