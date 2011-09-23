module.exports.Decnum = Decnum; // for tests


Decnum = function(num, precision) {
    // Konstruktor
    var in_data = JSON.stringify(num, precision), //quick shit
    parts = in_data.split("."),
    prec = Math.ceil(precision / DBASE),
    fractional_s = parts[1] ? parts[1] : "",                      //Split shit around float point
    integer_s = Math.abs(parts[0]),
    fractional_n = fractional_s ? parseInt(fractional_s) : 0,
    integer_n = parseInt(integer_s),
    DBASE = 2,
    BASE = Math.pow(10, DBASE),
    digits = [];

    this._float = precision;    
    this._precision = Math.ceil(precision / DBASE);
    this.BASE = BASE;    
    // We have to do some stupid shit to make fractional part work as expected :/

    // Fill with zeroes to have good digits in our 'base'
    fractional_n *= Math.pow(10, fractional_s.length % DBASE);
    
    for (var x = fractional_n; x != 0; x = Math.floor(x / BASE)) {
        digits.push(x % BASE);
    }

    // Shift
    var delta = this._precision - digits.length;
    console.log([digits, delta]);

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

    // if (integer_n == 0){
    //     this._digits.push(0);
    // } else {
        for (var x = integer_n; x != 0; x = Math.floor(x / BASE)) {
            this._digits.push(x % BASE);
        }
    // }
    this._positive = num >= 0 ;
    // Konstruktor koniec


    // Arithmetics
    this.add = function (x) {
        // Non-destructive add operation
        if (this._positive != x._positive) { // Some cases of addition are easier to represent as substraction
            if (this._positive) {
                return this.subtract(x.negate);
            } else {            //this is negative
                return this.negate().subtract(x).negate();
            }
        }

        var precision = Math.max(this._precision, x._precision),
        a = this._force_precision(precision),
        b = x._force_precision(precision),
        c = new Decnum(0, precision);

        console.log(c);
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
                return this.add(x.negate);
            } else {            //this is negative
                return this.negate().add(x).negate();
            }
        } 

        return 9;
    };

    this.mul = function (x) {
        // Non-destructive multiplication
    };

    this.div = function (x) {
        // Non-destructive division
    };


    this.to_string = function () {
        var res = this._positive ? "" : "-";
        if (this._digits.length - 1 < this._precision) {
            res += "0.";
        }
        for (var i = this._digits.length - 1; i >= 0; i--) {
            var chunk = this._digits[i].toString(),
            maxlen = this.BASE.toString().length - 1;

            if (i != this._digits.length - 1) {
                while(chunk.length < maxlen) {
                    chunk = "0" + chunk;
                }
            }
            res += chunk;

            if (i == this._precision)
                res += ".";
        }

        // TO DO remove trailing/leading zeros?

        return res;
    };


    // Handy stuff
    this.negate = function() {
        var res = this._clone();
        res._positive = !res._positive;
        return res;
    };

    // Internal stuff
    this._clone = function() {
        return new Decnum(parseFloat(this.to_string()), this._float);
    };

    // At the moment precision of all numbers is 'forced'
    this._force_precision = function(precision) {
        var res = this._clone(),
        len = this.length,
        delta = this._precision - precision;
        return this._shift(delta);
    };


    this._shift = function(delta) {
        var res;
        if (delta == 0) res = this._clone();
        if (delta < 0) {
            res = this._shift_right(delta);
        }
        if (delta > 0) {
            res = this._shift_left(-delta);
        }

        return res;
    };

    // 234.54 >> 2 = 2.34
    this._shift_right = function(digs) {
        var res = this._clone();

        for (var i = 0; i < res._digits.length - digs; i++) {
            res._digits[i] = res._digits[i + digs];
        }

        for (var i = res._digits.length - 1; i > res._digits.length - 1 - digs; i--) {
            res._digits[i] = 0;
        }

        return res;
    };
    
    // 213.98 << 2 = 21398.00
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

        return res;
    };
    
};
