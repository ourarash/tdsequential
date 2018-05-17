//Implementation of TD Sequential in node.js
//Written by Ari Saif (ourarash@gmail.com)
//See this for explanations: http://practicaltechnicalanalysis.blogspot.com/2013/01/tom-demark-sequential.html
module.exports = function(ohlc) {
  return TDSequential(ohlc);
};

var resetSetupCounterAfterCountdownHit13 = true;
var resetCountdownOnTDST = true;
function TDSequential(ohlc) {
  if (!ohlc || ohlc.length === 0) {
    return [];
  }

  let result = [];
  ohlc.forEach((item, i) => {
    let resultObj = {
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
    };
    if (i >= 5) {
      resultObj.sellCoundownIndex = result[i - 1].sellCoundownIndex;
      resultObj.buyCoundownIndex = result[i - 1].buyCoundownIndex;
      resultObj.sellSetup = result[i - 1].sellSetup;
      resultObj.buySetup = result[i - 1].buySetup;
      resultObj.TDSTBuy = result[i - 1].TDSTBuy;
      resultObj.TDSTSell = result[i - 1].TDSTSell;
      resultObj.sellSetupPerfection = result[i - 1].sellSetupPerfection;
      resultObj.buySetupPerfection = result[i - 1].buySetupPerfection;

      let closeLessThanCloseOf4BarsEarlier = ohlc[i].close < ohlc[i - 4].close;
      let closeGreaterThanCloseOf4BarsEarlier = ohlc[i].close > ohlc[i - 4].close;

      // Bearish Price Flip - a close greater than the close four bars earlier, immediately followed by a close less than the close four bars earlier.
      // Bullish Price Flip -  a close less than the close four bars before, immediately followed by a close greater than the close four bars earlier.
      resultObj.bearishFlip = ohlc[i - 1].close > ohlc[i - 5].close && closeLessThanCloseOf4BarsEarlier;
      resultObj.bullishFlip = ohlc[i - 1].close < ohlc[i - 5].close && closeGreaterThanCloseOf4BarsEarlier;

      //TD Buy Setup -  a bearish price flip, which indicates a switch from positive to negative momentum.
      // – After a bearish price flip, there must be nine consecutive closes, each one less than the corresponding close four bars earlier.
      // – Cancellation - If at any point a bar closes higher than the close four bars earlier the setup is canceled and we are waiting for another price flip
      // - Setup perfection – the low of bars 8 or 9 should be lower than the low of bar 6 and bar 7 (if not satisfied expect new low/retest of the low).

      // TD buySetup
      if (resultObj.bearishFlip || (result[i - 1].buySetupIndex > 0 && closeLessThanCloseOf4BarsEarlier)) {
        resultObj.buySetupIndex = (result[i - 1].buySetupIndex + 1 - 1) % 9 + 1;
        resultObj.TDSTBuy = Math.max(item.high, result[i - 1].TDSTBuy);
      } else if (resultObj.bullishFlip || (result[i - 1].sellSetupIndex > 0 && closeGreaterThanCloseOf4BarsEarlier)) {
        resultObj.sellSetupIndex = (result[i - 1].sellSetupIndex + 1 - 1) % 9 + 1;
        resultObj.TDSTSell = Math.min(item.low, result[i - 1].TDSTSell);
      }

      // Did buy setup happen?
      if (resultObj.buySetupIndex === 9) {
        resultObj.buySetup = true;
        resultObj.sellSetup = false;
        resultObj.sellSetupPerfection = false;

        // - Buy Setup perfection – the low of bars 8 or 9 should be lower than the low of bar 6 and bar 7 (if not satisfied expect new low/retest of the low).
        resultObj.buySetupPerfection =
          (ohlc[i - 1].low < ohlc[i - 3].low && ohlc[i - 1].low < ohlc[i - 2].low) ||
          // bar 9 low < 6 and 7
          (ohlc[i].low < ohlc[i - 3].low && ohlc[i].low < ohlc[i - 2].low);
      }

      // Did sell setup happen?
      if (resultObj.sellSetupIndex === 9) {
        resultObj.sellSetup = true;
        resultObj.buySetup = false;
        resultObj.buySetupPerfection = false;

        // - Sell Setup perfection – the high of bars 8 or 9 should be greater than the high of bar 6 and bar 7 (if not satisfied expect new high/retest of the high).

        resultObj.sellSetupPerfection =
          (ohlc[i - 1].high > ohlc[i - 3].high && ohlc[i - 1].high > ohlc[i - 2].high) ||
          // bar 9 high > 6 and 7
          (ohlc[i].high > ohlc[i - 3].high && ohlc[i].high > ohlc[i - 2].high);
      }

      // TD Countdown compares the current close with the low/high two bars earlier and you count 13 bars.
      // TD Buy Countdown
      // starts after the finish of a buy setup.
      // The close of bar 9 should be "less" than the low two bars earlier. If satisfied bar 9 of the setup becomes bar 1 of the countdown. If the condition is not met than bar 1 of the countdown is postponed until the conditions is satisfied and you continue to count until there are a total of thirteen closes, each one less than, or equal to, the low two bars earlier.
      // Countdown qualifier - The low of Countdown bar thirteen must be less than, or equal to, the close of Countdown bar eight.
      // Countdown cancellation:
      // - A sell Setup appears. The price has rallied in the opposite direction and the market dynamic has changed.
      // - close above the highest high for the current buy Setup (break of TDST for the current Setup)
      // - recycle occurs ( new Setup in the same direction and recycle activated )

      // Setup Recycle - A second setup appears in the same direction before/on/after a Countdown - that usually means strength. The question is recycle and start a new Countdown? (there must be a price flip to divide the two setups or the first just continuous)
      // Compare the size of the two setups. The size is the difference between the true high and true low of a setup.
      // - if the second setup is equal or greater than the previous one , but less than 1.618 times its size, then Setup recycle will occur – the trend re-energize itself. Whichever Setup has the larger true range will become the active Setup.
      // - ignore setup recycle if the new setup is smaller or 1.618 times and more, bigger than the previous one – most probably price exhaustion area.
      calculateTDBuyCountdown(result, resultObj, ohlc, item, i);
      calculateTDSellCountdown(result, resultObj, ohlc, item, i);
    }

    result.push(resultObj);
  });
  return result;
}

function calculateTDSellCountdown(result, resultObj, ohlc, item, i) {
  // TD Sell countdown
  if (
    // Sell setup appears
    (result[i - 1].sellSetup && resultObj.buySetup) ||
    // Close above TDSTBuy
    (resetCountdownOnTDST && item.close < item.TDSTSell)
  ) {
    resultObj.sellCoundownIndex = 0;
    resultObj.countdownResetForTDST = true;
  } else if (resultObj.sellSetup) {
    if (
      item.close > ohlc[i - 2].high
      // && item.close > ohlc[i - 1].high
    ) {
      resultObj.sellCoundownIndex = (result[i - 1].sellCoundownIndex + 1 - 1) % 13 + 1;
      resultObj.countdownIndexIsEqualToPreviousElement = false;
    }
  }

  //If this item and the preivous one were both 13, we set it to zero
  if (resultObj.sellCoundownIndex === 13 && result[i - 1].sellCoundownIndex === 13) {
    resultObj.sellCoundownIndex = 0;
  }

  //A.S: If coundown  hit 13, and we were counting another  setup, we reset that  setup
  if (
    resetSetupCounterAfterCountdownHit13 &&
    (resultObj.sellCoundownIndex === 13 && resultObj.sellSetupIndex > 0)
  ) {
    resultObj.sellSetupIndex = 1;
  }

  // If we just reset the countdown
  if (resultObj.sellCoundownIndex !== 13 && result[i - 1].sellCoundownIndex === 13) {
    resultObj.sellSetup = false;
    resultObj.sellSetupPerfection = false;
    resultObj.sellCoundownIndex = 0;
  }
}

function calculateTDBuyCountdown(result, resultObj, ohlc, item, i) {
  //First we do cancellations:
  //If we were doing buy countdown, and now sell setup happens
  if (
    // Sell setup appears
    (result[i - 1].buySetup && resultObj.sellSetup) ||
    // Close above TDSTBuy
    (resetCountdownOnTDST && item.close > item.TDSTBuy)
  ) {
    resultObj.buyCoundownIndex = 0;
    resultObj.countdownResetForTDST = true;
  } else if (resultObj.buySetup) {
    if (
      item.close < ohlc[i - 2].low
      // && item.close > ohlc[i - 1].low
    ) {
      resultObj.buyCoundownIndex = (result[i - 1].buyCoundownIndex + 1 - 1) % 13 + 1;
      resultObj.countdownIndexIsEqualToPreviousElement = false;
    }
  }

  //If this item and the preivous one were both 13, we set it to zero
  if (resultObj.buyCoundownIndex === 13 && result[i - 1].buyCoundownIndex === 13) {
    resultObj.buyCoundownIndex = 0;
  }

  //A.S: If coundown  hit 13, and we were counting another buy setup, we reset that buy setup
  if (resetSetupCounterAfterCountdownHit13 && (resultObj.buyCoundownIndex === 13 && resultObj.buySetupIndex > 0)) {
    resultObj.buySetupIndex = 1;
  }

  // If we just reset the countdown
  if (resultObj.buyCoundownIndex !== 13 && result[i - 1].buyCoundownIndex === 13) {
    resultObj.buySetup = false;
    resultObj.buySetupPerfection = false;
    resultObj.buyCoundownIndex = 0;
  }
}
