//module.exports.Decnum = Decnum; // for tests


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

    this._precision = precision;    
    this._float = Math.ceil(precision / DBASE);
    this.BASE = BASE;    
    this.DBASE = DBASE;
    // We have to do some stupid shit to make fractional part work as expected :/

    // Fill with zeroes to have good digits in our 'base'
    // fractional_n *= Math.pow(10, fractional_s.length % DBASE);
    
    // for (var x = fractional_n; x != 0; x = Math.floor(x / BASE)) {
    //     digits.push(x % BASE);
    // }
    
    
    for (var i = fractional_s.length; i >= DBASE; i -= DBASE) {
        digits.push(parseInt(fractional_s.slice(i - DBASE, i)));
    }

    // Shift
    var delta = this._float - digits.length;
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
                return this.negate().subtract(x).__neg();
            }
        }

        var precision = Math.max(this._precision, x._precision),
        a = this._force_precision(precision),
        b = x._force_precision(precision),
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
                return this.add(x.negate);
            } else {            //this is negative
                return this.negate().add(x).__neg();
            }
        } 

        var precision = Math.max(this._precision, x._precision);

        if (this._precision == x._precision) {
            if (this.compare(x) > 0) {
                if (this._positive) {
                    var a = this;
                    b = x;
                } else {
                    var b = this.negate(),
                    a = x.negate();                            
                }
            } else if (this.compare(x) < 0) {
                if (this._positive) {
                    var b = this,
                    a = x;
                } else {
                    var a = this.negate(),
                    b = x.negate();                
                }
            } else {            //Zwroc zero
                return new Decnum(0, precision);
            }
        }

        var c = new Decnum(0, precision),
        len_new = Math.max(a._digits.length, b._digits.length),
        overflow = 0;
        c._digits = [];
        c._positive = a._positive;

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
            console.log([dif, overflow]);
        }

        return c;
    };

    this.mul = function (x) {
        // Non-destructive multiplication
    };

    this.div = function (x) {
        // Non-destructive division
    };


    this.to_string = function () {
        var res = this._positive ? "" : "-";
        if (this._digits.length - 1 < this._float) {
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

            if (i == this._float)
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

    // This one is destructive
    this.__neg = function() {
        this._positive = !this._positive;
    }

    // Internal stuff
    this._clone = function() {
        return new Decnum(parseFloat(this.to_string()), this._precision);
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

    // 234.54 >> 2 = 2.34
    this._shift_right = function(digs) {
        var res = this._clone();

        for (var i = 0; i < res._digits.length - digs; i++) {
            res._digits[i] = res._digits[i + digs];
        }

        // for (var i = res._digits.length - 1; i > res._digits.length - 1 - digs; i--) {
        //     res._digits[i] = 0;
        // }

        for (var i = 0; i < digs; i++) {
            res._digits.pop();
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
    
    this.compare = function(x) {
        // First signs
        if (this._positive != x._positive) {
            return this._positive ? 1 : -1;
        }

        // What if one is longer? Probalby we need to propagate len
        if (this._precision == x._precision) {
            var res = 0;

            if (this._digits.length > x._digits.length) {
                return this._positive ? 1 : -1;
            }

            for (var i = this._digits.length - 1; i >= 0; i--) {
                if (this._digits[i] > x._digits[i]) return 1;
                if (this._digits[i] < x._digits[i]) return -1;
            }

        } else {
            // TODO
        }

        return 0;
    };
};
