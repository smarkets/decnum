Decnum - Javascript large integer handling
==========================================

Decnum is a pure-Javascript library for handling large integers with arbitrary precision.

<<<<<<< HEAD
Usage and examples
==================

Creation and basic usage:

To create use new Decnum(number, precision) - where number is number from which you want to create a decnum. This could be string, int, float or another decnum. To see contents use method toString or valueOf (both of them do exactly the same).


> x = new Decnum(2, 3)
> x.toString()
'2.000'

> x = new Decnum('2.43999', 2)
> x.toString()
'2.43'

Arithmetics:

All operations are non-destructive. Ie arguments are not affected, and new decnum is returned. The argument passed to operation doesn't have to be a decnum.

> x = new Decnum(0.7, 2)
> y = new Decnum(1.3, 2)
> x.add(y).toString()
'2.00'
> y.sub(5).toString()
'-3.70'
> z = x.mul(y)
> x.toString()
'0.70'
> y.toString()
'1.30'
> z.toString()
'0.91'

Supported operations:
=====================

1-argument methods:
-------------------

All of them accept as argument decnum/float/integer/string and return a decnum; they don't change neither given instance nor argument, (unless stated otherwise).

Addition:

> x = new Decnum(0.7, 2)
> y = new Decnum(1.3, 2)
> x.add(y).toString()
'2.00'
> x.add("1").toString()
'1.70'

Subtraction:

> x = new Decnum(0.7, 2)
> y = new Decnum(1.3, 2)
> x.sub(y).toString()
'-0.60'
> x.sub("-1").toString()
'1.70'

Multiplication:

> x = new Decnum(0.7, 2)
> y = new Decnum(1.3, 2)
> x.mul(y).toString()
'0.91'
> x.mul("100").toString()
'70.00'

Division:

> x = new Decnum(1.2, 2)
> y = new Decnum(0.3, 2)
> x.div(y).toString()
'4.00'
> x.div(-0.1).toString()
'-12.00'

Comparison.
This will return +1 if first argument is greater, 0 if they are equal and -1 if first is lesser.

> x = new Decnum(13.23, 2)
> y = new Decnum(-1, 4)
> x.compare(13)
1
> x.compare(13.23)
0
> y.compare(x)
-1
> y.compare('-1')
0

Exponentation:
Note: this one accepts only positives integers.

> x = new Decnum(1.7, 3)
> x.pow(2).toString()
'2.890'
> x.pow(2.3)
[Error: Exponentation doesn't know how to handle this exponent ...]

Modulo:

> x = new Decnum(13, 1)
> y = new Decnum(-90, 1)
> y.mod(x).toString()
'-12.0'

> x = new Decnum(3.14, 2)
> y = new Decnum(2.5, 2)
> x.mod(y).toString()
'0.64'

0-argument methods:
-------------------
(None of them modifies given decnum instance, unless stated otherwise)

Negation (ie. x * -1):

> x = new Decnum(-1, 2)
> x.negate().toString()
1.00

Absolute value:

> x = new Decnum(-12, 2)
> x.abs().toString()
12.00

> y = new Decnum(-91, 2)
> y.abs().toString()
91.00
 
Checking if it's zero:

> x = new Decnum(0, 1)
> x.isZero()
true
> y = new Decnum(0.004, 2)
> y.isZero()
true

Tests
-----

`Decnum` is run using [nodeunit](https://github.com/caolan/nodeunit):

    nodeunit tests/test.js

The tests are generated automatically to avoid assumptions.

