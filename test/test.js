"use strict";

var expect = require("chai").expect;
var TDSequential = require("../index");

describe("#TDSequential", function() {
  it("should return [] if input is null", function() {
    var result = TDSequential();
    expect(result).to.deep.equal([]);
  });

  it("should return an array if input is of length 1", function() {
    var result = TDSequential([
      {
        time: 1525651200,
        close: 9377.81,
        high: 9662.23,
        low: 9202.13,
        open: 9643.99,
        volumefrom: 73842.44,
        volumeto: 692580062.51
      }
    ]);
    expect(result).to.deep.equal([
      {
        buySetupIndex: 0,
        sellSetupIndex: 0,
        buyCoundownIndex: 0,
        sellCoundownIndex: 0,
        countdownIndexIsEqualToPreviousElement: true,
        sellSetup: false,
        buySetup: false,
        sellSetupPerfection: false,
        buySetupPerfection: false,
        bearishFlip: false,
        bullishFlip: false,
        TDSTBuy: 0,
        TDSTSell: 0,
        countdownResetForTDST: false
      }
    ]);
  });

  it("should return an array of the same length", function() {
    let input = [
      {
        time: 1525651200,
        close: 9377.81,
        high: 9662.23,
        low: 9202.13,
        open: 9643.99,
        volumefrom: 73842.44,
        volumeto: 692580062.51
      },
      {
        time: 1525737600,
        close: 9196.13,
        high: 9472.09,
        low: 9063.07,
        open: 9377.08,
        volumefrom: 72659.12,
        volumeto: 673924125.29
      },
      {
        time: 1525824000,
        close: 9321.16,
        high: 9373.46,
        low: 8987.27,
        open: 9196.13,
        volumefrom: 67939.11,
        volumeto: 625495066.08
      },
      {
        time: 1525910400,
        close: 9032.22,
        high: 9393.95,
        low: 9017.13,
        open: 9321.52,
        volumefrom: 67915.99,
        volumeto: 629850604.12
      },
      {
        time: 1525996800,
        close: 8421,
        high: 9032.27,
        low: 8363.5,
        open: 9032.22,
        volumefrom: 134727.27,
        volumeto: 1176888629.2
      },
      {
        time: 1526083200,
        close: 8486.67,
        high: 8653.8,
        low: 8225.97,
        open: 8420.82,
        volumefrom: 92805.87,
        volumeto: 783972252.35
      },
      {
        time: 1526169600,
        close: 8709.46,
        high: 8773.96,
        low: 8350.91,
        open: 8488.07,
        volumefrom: 61066.94,
        volumeto: 525395861.86
      },
      {
        time: 1526256000,
        close: 8672.9,
        high: 8883,
        low: 8312.72,
        open: 8709.46,
        volumefrom: 101370.46,
        volumeto: 874543293.99
      },
      {
        time: 1526342400,
        close: 8480.16,
        high: 8848.69,
        low: 8441.25,
        open: 8672.88,
        volumefrom: 84517.8,
        volumeto: 730739738.9
      },
      {
        time: 1526428800,
        close: 8344.78,
        high: 8501.65,
        low: 8119.17,
        open: 8480.16,
        volumefrom: 95203.5,
        volumeto: 789660713.22
      },
      {
        time: 1526515200,
        close: 8313.93,
        high: 8476.45,
        low: 8218.3,
        open: 8342.69,
        volumefrom: 39690.66,
        volumeto: 331105667.29
      }
    ]
    var result = TDSequential(input);
    expect(result).to.have.lengthOf(input.length);
    expect(result[result.length-1].buySetupIndex).to.be.equal(2);
  });
});
