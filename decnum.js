Decnum = function(num, precision) {
    //// Constructor
    var DBASE = 4,
    BASE = Math.pow(10, DBASE),
    precision = (precision != undefined) ? precision : DBASE;

    this._precision = precision;
    this._float = Math.ceil(precision / DBASE);

    if (num instanceof Decnum) {
        this._positive = num._positive;
        this.BASE = num.BASE;
        this.DBASE = num.DBASE;

        if (this._float != num._float) {
            delta = (this._float - num._float);
            this._digits = num._shift(delta)._digits;
        } else {
            this._digits = num._digits.slice(0);   
        }
    } else {
        var in_data = num + '',
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

        for (var i = fractional_s.length; i >= DBASE; i -= DBASE) {
            digits.push(parseInt(fractional_s.slice(i - DBASE, i), 10));

            if (digits.length == this._float) break;
        }

        this._digits = digits;

        for (var x = integer_n; x != 0; x = Math.floor(x / BASE)) {
            this._digits.push(x % BASE);
        }

        while (this._digits.length <= this._float) {
            this._digits.push(0);
        }

        this._positive = num >= 0 ;
    }
    

    //// Constructor ends here

    //// Arithmetics

    // Non-destructive add operation
    this.add = function (x) {
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
        c._digits = [];

        for (var i = 0; i < len_new; i++) {
            var ad = i < this._digits.length ? this._digits[i] : 0,
            bd = i < x._digits.length ? x._digits[i] : 0;
            sum = ad + bd + overflow,
            digit = sum % this.BASE;

            overflow = Math.floor(sum / this.BASE);
            c._digits.push(digit);
        }

        if (overflow > 0) {
            c._digits.push(overflow);
        }

        c._positive = this._positive;
        return c;
    };

    // Non-destructive subtraction operation
    this.sub = function (x) {
        x = this.coerce_num(x);

        // Some subtractions are easier to do as additions
        if (this._positive != x._positive) {
            if (this._positive) {
                return this.add(x.negate());
            } else {            //this is negative
                return this.negate().add(x).__neg();
            }
        }

        var precision = Math.max(this._precision, x._precision);
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
        c._digits = [];

        for (var i = 0; i < len_new; i++) {
            var ad = i < a._digits.length ? a._digits[i] : 0,
            bd = i < b._digits.length ? b._digits[i] : 0;
            dif = ad - bd + overflow;

            if (dif < 0) {
                c._digits.push(dif + this.BASE);
                overflow = -1;
            } else {
                c._digits.push(dif);
                overflow = 0;
            }
        }

        return c;
    };

    // Non-destructive multiplication
    this.mul = function (x) {
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

        return c;
    };

    // Non-destructive modulo operations
    this.mod = function (x) {
        x = this.coerce_num(x);

        return this.sub(this.div(x).intPart().mul(x));
    };

    // Non-destructive division operation
    this.div = function (x) {
        x = this.coerce_num(x);

        if (x.isZero()) {
            throw new Error("Division by 0");
        }

        // Find precision
        var new_precision = x._digits.length,
        divsor = new Decnum(0, 0),
        divend = new Decnum(0, 0),
        div_digits = [];
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

        // Add some zeroes for precision. +1 should be here
        for (var i = 0; i < divsor._digits.length + 1; i++) {
            div_digits.push(0);
        }

        for (var i = 0; i < this._digits.length; i++) {
            div_digits.push(this._digits[i]);
        }

        for (var i = div_digits.length - divsor._digits.length; i < div_digits.length; i++) {
            divend._digits.push(div_digits[i]);
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
        c._digits = [];
        for (var i = result.length - 1; i >= 0 ; i--) {
            c._digits.push(result[i]);
        }

        delta = this._float - divsor._digits.length;

        c.__shift(delta);

        while (c._digits.length <= c._float) {
            c._digits.push(0);
        }
        return c;
    };

    // Compare two numbers. +1 means this > x; 0 equals, -1: this < x
    this.compare = function(x) {
        x = this.coerce_num(x);

        if (this._positive != x._positive) {
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

    // Return -1 * this. Non-destructive
    this.negate = function() {
        var res = this._clone();
        res._positive = !res._positive;
        return res;
    };

    //// Stuff other than (+ - * / <) that is useful

    // Makes sure the other argument is valid
    this.coerce_num = function (x) {
        if (!(x instanceof Decnum)) {
            x = new Decnum(x, this._precision);
        } else {
            if (x._precision != this._precision || x.DBASE != this.DBASE) {
                x = new Decnum(x.to_string(), this._precision);
            }
        }

        return x;
    };

    // Return new decnum which is integer part of old one
    this.int_part = function() {
        return new Decnum(this.to_string().split('.')[0], this._precision);
    };

    // Returns string representation
    this.to_string = function () {
        var res = "",
        start = this._digits.length - 1,
        leadz = true,
        floatp = false;
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

        if (!this._positive && (this.compare((new Decnum(0, this._precision)).__neg()) != 0)) res = "-" + res;
        return res;
    };

    // Absolute value of this. Non-destructive.
    this.abs = function() {
        return this._positive ? this._clone() : this.negate();
    };

    // Exponentation, unfortunately it works only for positive integers
    this.pow = function(x) {
        if (Math.floor(x) != x || x < 0) {
            throw new Error("Exponentation doesn't know how to handle this exponent");
        }

        var res = new Decnum(1, this._precision);
        
        for (var i = 0; i < x; i++) {
            res = res.mul(this);
        }

        return res;
    }

    // This does nothing and is added for compatibility with old broken bignums
    this.round = function () {
        return this._clone();
    };

    this.is_negative = function () {
        return this.isZero() || !(this._positive);
    };

    //// 'Private' functions start here - ie those you won't probably need
    //// Functions starting with one underscore are non-destructive,
    //// Functions starting with two underscores may or may not mess with 'this' andor arguments

    // Util for multiplication
    this._mul_digit = function(digit, position) {
        var c = new Decnum(0, this._precision);
        c._positive = true;
        c._digits = [];         // Fill with appropriate number of zeroes

        for (var i = 0; i < position; i ++) {
            c._digits.push(0);
        }

        var overflow = 0,
        rem = 0;
        for (var i = 0; i < this._digits.length; i++) {
            var mul = this._digits[i] * digit + overflow;
            rem = mul % this.BASE;
            overflow = Math.floor(mul / this.BASE);
            c._digits.push(rem);
        }

        if (overflow > 0)
            c._digits.push(overflow);

        return c;
    };


    // Util for division
    this._div_digit = function(x) {
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

    // Another util for division, this one is destructive.
    this.__div_submul = function (divsor, digit) {
        var temp = [],
        overflow_mul = 0,
        overflow_sub = 0;

        for (var i = 0; i < divsor._digits.length; i++) {
            var mul_res = divsor._digits[i] * digit + overflow_mul,
            digit_mul = mul_res % divsor.BASE,
            overflow_mul = Math.floor(mul_res / divsor.BASE),
            digit_sub = (this._digits[i] ? this._digits[i] : 0) + overflow_sub - digit_mul;
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

    // Return new number, the same as this
    this._clone = function() {
        var res = new Decnum(0, this._precision);
        res._digits = this._digits.slice(0);
        res._float = this._float;
        res._positive = this._positive;

        return res;
    };

    // At the moment everything asserts numbers of the same precision
    this._force_precision = function(precision) {
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
    this._shift = function(delta) {
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

    this._shift_right = function(digs) {
        var res = this._clone();

        for (var i = 0; i < res._digits.length - digs; i++) {
            res._digits[i] = res._digits[i + digs];
        }

        for (var i = 0; i < digs; i++) {
            res._digits.pop();
        }

        return res;
    };

    this._shift_left = function(digs) {
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

    this.isZero = function() {
        for (var i = 0; i < this._digits.length; i++) {
            if (this._digits[i] != 0) {
                return false;
            };
        }

        return true;
    };


    // Destructive negation
    this.__neg = function() {
        this._positive = !this._positive;
        return this;
    };

    // The same as _shift, but breaks this
    // Positive shifts left
    // Negative right
    this.__shift = function(delta) {
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

    this.valueOf = this.to_string;
    this.toString = this.to_string;
    this.subtract = this.sub;
    this.divide = this.div;
    this.multiply = this.mul;
    this.intPart = this.int_part;
};

// Added for compatibility with old code
Decnum.clone = function(x) {
    return x._clone();
};


// Exporting so
if (typeof(module) != 'undefined' && 'exports' in module) {
    module.exports.Decnum = Decnum; // for tests
}
