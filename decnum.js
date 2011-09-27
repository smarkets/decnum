Decnum = function(num, precision) {
    // Konstruktor
    var in_data = JSON.stringify(num, precision), //Probably some better argumetn validation is needed
    parts = in_data.split("."),
    prec = Math.ceil(precision / DBASE),
    fractional_s = parts[1] ? parts[1] : "",                      //Split shit around float point
    integer_s = Math.abs(parts[0]),
    fractional_n = fractional_s ? parseInt(fractional_s) : 0,
    integer_n = parseInt(integer_s),
    DBASE = 2,
    BASE = Math.pow(10, DBASE),
    digits = [];

    this._precision = precision;
    this._float = Math.ceil(precision / DBASE);
    this.BASE = BASE;
    this.DBASE = DBASE;
    // We have to do some stupid shit to make fractional part work as expected :/
    // Fill with zeroes to have good digits in our 'base'
    // fractional_n *= Math.pow(10, fractional_s.length % DBASE);

    while (fractional_s.length % DBASE) {
        fractional_s = fractional_s + '0';
    }

    for (var i = fractional_s.length; i >= DBASE; i -= DBASE) {
        digits.push(parseInt(fractional_s.slice(i - DBASE, i), 10));
    }

    // Shift
    // This thing desperately needs refactoring
    var delta = this._float - digits.length;

    if (delta < 0) {
        delta *= -1;

        for (var i = 0; i < digits.length - delta; i++) {
            digits[i] = digits[i + delta];
        }

        for (var i = 0; i < delta; i++) {
            digits.pop();
        }
    } else if (delta > 0) {
        for (var i = 0; i < delta; i++) {
            digits.push(0);
        }

        for (var i = digits.length - 1; i >= delta; i--) {
            digits[i] = digits[i - delta];
        }

        for (var i = delta - 1; i >= 0; i--) {
            digits[i] = 0;
        }
    }

    this._digits = digits;

    for (var x = integer_n; x != 0; x = Math.floor(x / BASE)) {
        this._digits.push(x % BASE);
    }

    while (this._digits.length <= this._float) {
        this._digits.push(0);
    }

    this._positive = num >= 0 ;

    ////////////
    // Konstruktor koniec
    ////////////
   
    // Arithmetics
    this.add = function (x) {
        // Non-destructive add operation
        if (this._positive != x._positive) { // Some cases of addition are easier to represent as substraction
            if (this._positive) {
                return this.sub(x.negate());
            } else {            //this is negative
                return this.negate().sub(x).__neg();
            }
        }

        var precision = Math.max(this._precision, x._precision),
        a = this,
        b = x,
        c = new Decnum(0, precision),
        len_new = Math.max(a._digits.length, b._digits.length),
        overflow = 0;
        c._digits = [];

        for (var i = 0; i < len_new; i++) {
            var ad = i < a._digits.length ? a._digits[i] : 0,
            bd = i < b._digits.length ? b._digits[i] : 0;
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

    this.sub = function (x) {
        // Non-destructive subtraction operation

        // Some subtraction are easier to do as additions
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

    this.mul = function (x) {
        // Non-destructive multiplication
        var c = new Decnum(0, this._precision);

        for (var ix = 0; ix < x._digits.length; ix++) {
            var d = this._mul_digit(x._digits[ix], ix);
            c = c.add(d);
        }

        c._positive = (this._positive == x._positive);
        c.__shift(-x._float);

        // It's unclear whether empty digits are legal
        while (c._digits.length <= c._float) {
            c._digits.push(0);
        }

        return c;
    };

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

    this.div = function (x) {
        // Optimize against special cases like dividing by 10?
        // Find precision
        var new_precision = x._digits.length;

        // Copy some shit into them
        var divsor = new Decnum(0, 0),
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

        // Now you have to put stuff adjusting the floating point accordingly co bedzie dosc irytujace
        var c = new Decnum(0, this._precision);
        c._positive = (this._positive == x._positive); // Incidentally this works
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

    this._div_digit = function(x) {
        // Util for division
        // This only works for x >= 0

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

    // This function is meant *only* to be used inside division to make it a little bit faster
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

    this.to_string = function () {
        var res = "",
        start = this._digits.length - 1,
        leadz = true,
        floatp = false;
        maxlen = this.BASE.toString().length - 1;
        // if (this._digits.length - 1 < this._float) {
        //     res += "0.";
        // }

        // Zero-length zero is a bug in multiplication
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

        // TO DO remove trailing/leading zeros?
        if (res[0] == '.' || res.length == 0) {
            res = '0' + res;
        }

        // There is some problem with 'negative zero' atm
        if (!this._positive && (this.compare((new Decnum(0, this._precision)).__neg()) != 0)) res = "-" + res;
        return res;
    };



    this.compare = function(x) {
        if (this._positive != x._positive) {
            return this._positive ? 1 : -1;
        }

        // What if one is longer? no rczaej trzbae przedluzyc druga..
        if (this._precision == x._precision) {
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

        } else {
            // oops, it will break. but everything silently asserts the same precision of numbers
        }

        return 0;
    };

    // Return -1 * this
    this.negate = function() {
        var res = this._clone();
        res._positive = !res._positive;
        return res;
    };

    //// Internal stuff - nondestructive functions

    this._clone = function() {
        var res = new Decnum(0, this._precision);
        res._digits = this._digits.slice(0);
        res._float = this._float;
        res._positive = this._positive;

        return res;
    };

    // At the moment precision of all numbers is 'forced'
    this._force_precision = function(precision) {
        var new_float = Math.ceil(precision / this.DBASE),
        delta = new_float - this._float,
        res = this._shift(delta);
        res._float = new_float;
        res._precision = precision;
        return res;
    };

    // Note that this shifts shift by 'big digit'
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

    //// Internal stuff - destructive functions

    this.__neg = function() {
        this._positive = !this._positive;
        return this;
    };

    // Note that this shifts shift by 'big digit'
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


};


module.exports.Decnum = Decnum; // for tests