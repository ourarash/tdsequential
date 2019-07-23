# TD Sequential

[![NPM](https://badge.fury.io/js/tdsequential.svg)](https://www.npmjs.com/package/tdsequential)
[![NPM Downloads][downloadst-image]][downloads-url]

[downloads-image]: https://img.shields.io/npm/dm/tdsequential.svg
[downloadst-image]: https://img.shields.io/npm/dt/tdsequential.svg
[downloads-url]: https://npmjs.org/package/tdsequential


Implementation of TD Sequential Indicator in node.js. 

Tom Demark Sequential indicator specifies when a trend is forming or is getting exhausted, and when to get into a trade. It is widely used in Forex, stock market, and cryptocurrency trading.

TD Sequential indicator consist of two components. TD Setup is the first one and it is a prerequisite for the TD Countdown

## Package Description

This module is an implementation of TD Sequential in node.js based on [this link](http://practicaltechnicalanalysis.blogspot.com/2013/01/tom-demark-sequential.html).

The input is an array of ohlc (open, high, low, and close) values. For example:

```javascript
let ohlc = [{
  open: 100,
  high: 200,
  low: 10,
  close: 50,
}, ...
]
```

The output is an array of the same size where each entry has the following fields:

```javascript
{
  buySetupIndex: 0,                                 //Counting for buy setup
  sellSetupIndex: 0,                                //Counting for sell setup
  buyCoundownIndex: 0,                              //Counting for buy countdown
  sellCoundownIndex: 0,                             //Counting for sell countdown

  countdownIndexIsEqualToPreviousElement: true,     //Indicates that the countdown index on item i is the same as i-1

  sellSetup: false,                                 //Indicates Sell setup happened
  buySetup: false,                                  //Indicates Buy setup happened
  sellSetupPerfection: false,                       //Indicates a perfect Sell Setup
  buySetupPerfection: false,                        //Indicates a perfect Buy Setup

  bearishFlip: false,                               //Indicates a bearish flip happened
  bullishFlip: false,                               //Indicates a bullish flip happened

  TDSTBuy: 0,                                       //highest high(usually the high of bar 1) for a buy setup
  TDSTSell: 0,                                      //the lowest low(usually the low of bar 1) for sell setup
  countdownResetForTDST: false                      //Indicates the countdown got reset due to observing TDST
}
```

## Install

```bash
npm i -S tdsequential
```

## Usage

```javascript
var TDSequential = require("tdsequential");

let result = TDSequential([
  {
    time: 1525651200,
    close: 9377.81,
    high: 9662.23,
    low: 9202.13,
    open: 9643.99,
    volume: 73842.44,
  },
  ...
]);

console.log("result: ", JSON.stringify(result, null, 2));
```

## Examples:
This package is used to implement TD Sequential indicator in Bitcoin CrazYness app:

[BitcoinCrazYness.com](http://bitcoincrazyness.com)

Below is an example screenshot. The setup numbers are annotated on the top, and the countdown numbers are annotated on the bottom.

A perfrect setup is highlighted with a "P" mark.

![TD Sequential Example in BitcoinCrazYness App](https://raw.githubusercontent.com/ourarash/tdsequential/master/screenshots/example1.jpg)
*Example of TD Sequential from BitcoinCrazYness app*
 
![TD Sequential Example in BitcoinCrazYness App](https://raw.githubusercontent.com/ourarash/tdsequential/master/screenshots/example3.jpg)

## License

[MIT](http://vjpr.mit-license.org)
