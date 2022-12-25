import { NS, TIX } from '../NetscriptDefinitions';

import type { AcceptedArg } from '../helpers/parseKArgs';
import type { KArgs } from '../helpers/argParser';
import argParser from '../helpers/argParser';

// -=- Accepted KArgs -=-
const acceptedKArgs: AcceptedArg[] = [
  {
    fullKeyword: 'max-money-percent',
    shortKeyword: 'm',
    description: 'The maximum amount of money to spend on a stock (Default: 10) (in percent)',
    type: 'number',
    default: 10,
  },
  {
    fullKeyword: 'max-loss-percent',
    shortKeyword: 'l',
    description: 'The maximum amount of money to lose on a stock (Default: 10) (in percent)',
    type: 'number',
    default: 10,
  },
  {
    fullKeyword: 'help',
    shortKeyword: 'h',
    description: 'Prints this help message',
    type: 'flag',
  }
];

/**
 * Checks if a stock is a good buy
 * @param stock The TIX stock namespace
 * @param symbol The symbol of the stock to check
 * @param maxMoney The maximum amount of money to spend on the stock
 * @returns Whether or not the stock is a good buy
 */
const shouldBuy = (stock: TIX, symbol: string, maxMoney: number) => {
  // -=- Stock Data -=-
  const volatility = stock.getVolatility(symbol);
  const forecast = stock.getForecast(symbol);
  const price = stock.getPrice(symbol);

  // -=- Checks -=-
  // ~ Check if the stock has low volatility
  //   is forecasted to go down or is too expensive
  if (
    volatility < 0.005
    || forecast < 0.60
    || price > maxMoney
  ) return false;
  
  return true;
}

/**
 * Checks if a stock should be sold
 * @param stock The TIX stock namespace
 * @param symbol The symbol of the stock to check
 * @param maxMoney The maximum amount of money to spend on the stock
 * @returns Whether or not the stock should be sold
 */
const shouldSell = (stock: TIX, symbol: string, purchasePrice: number, maxLossPercent: number) => {
  // -=- Stock Data -=-
  const forecast = stock.getForecast(symbol);
  
  // -=- Loss Stop -=-
  // ~ Check if the stock has lost more than 10%
  //   of its value and isn't forecasted to go up a lot
  if (
    stock.getPrice(symbol) < (purchasePrice * (1-(maxLossPercent/100)))
    && forecast < 0.75
  ) return true;

  // -=- Forecast Stop -=-
  // ~ Check if the stock is forecasted to go down
  if (forecast < 0.6) return true;

  return false;
}

// -=- Main Program -=-
const stockBuyer = async (ns: NS, kArgs: KArgs) => {
  // -=- Mute -=-
  ns.disableLog('ALL');
  ns.enableLog('print');

  // -=- KArgs -=-
  const maxMoneyPercent = kArgs['max-money-percent'] as number;
  const maxLossPercent = kArgs['max-loss-percent'] as number;

  // -=- Error Messages -=-
  if (!ns.stock.hasWSEAccount()) {
    ns.print('ERROR: You need to have a Wall Street Exchange account to use this script.');
    return;
  }

  if (!ns.stock.hasTIXAPIAccess()) {
    ns.print('ERROR: You need to have TIX API Access to use this script.');
    return;
  }

  if (!ns.stock.has4SDataTIXAPI()) {
    ns.print('ERROR: You need to have the 4S Data TIX API to use this script.');
    return;
  }

  // -=- Main Program Loop -=-
  while (true) {
    // ~ Get player's money
    const money = ns.getServerMoneyAvailable('home');
    const maxMoney = money * (maxMoneyPercent/100);

    // ~ Get all stock symbols
    const symbols = ns.stock.getSymbols();
    
    // ~ For each symbol check if it is a good buy
    symbols.forEach((symbol) => {
      // -=- Buy Stock -=-
      if (shouldBuy(ns.stock, symbol, maxMoney)) {
        // ~ Get the current price of the stock
        const price = ns.stock.getPrice(symbol);
        const maxShares = ns.stock.getMaxShares(symbol);
        const shares = Math.floor(maxMoney/price);

        // ~ Buy the stock
        const boughtPrice = ns.stock.buyStock(symbol, Math.min(maxShares, shares));

        // ~ Check if the stock was bought
        if (boughtPrice === 0) return;

        // ~ Print the stock bought
        ns.print(`INFO: Bought ${shares} shares of $${symbol.toUpperCase()} for $${ns.nFormat(boughtPrice, '0.00a')}`);
      }
    });

    // ~ For each owned stock check if it should be sold
    const positions = symbols.map((symbol) => {
      const [shares, avgPrice] = ns.stock.getPosition(symbol);

      if (shares === 0) return;

      const symbolData = {
        symbol,
        shares,
        avgPrice,
      };

      return symbolData;
    }).filter((symbol) => symbol !== undefined);

    positions.forEach((position) => {
      if (!position) return;

      const { symbol, shares, avgPrice } = position;

      // -=- Sell Stock -=-
      if (shouldSell(ns.stock, symbol, avgPrice, maxLossPercent)) {
        // ~ Sell the stock
        const soldPrice = ns.stock.sellStock(symbol, shares);

        if (soldPrice === 0) return;

        if (soldPrice < avgPrice) {
          ns.print(`INFO: Sold ${shares} shares of $${symbol.toUpperCase()} at a loss of -$${ns.nFormat(soldPrice - avgPrice, '0.00a')}`);
        } else {
          ns.print(`INFO: Sold ${shares} shares of $${symbol.toUpperCase()} at a profit of +$${ns.nFormat(soldPrice - avgPrice, '0.00a')}`);
        }
      }
    });

    // ~ Wait 6 seconds
    await ns.sleep(6000);
  }
};

// -=- Terminal Autocomplete -=-
export function autocomplete(data: { flags: (arg0: string[][]) => void; }, _: string[]) {
  // ~ Add the accepted KArgs to the autocomplete
  data.flags(
      acceptedKArgs.flatMap(
          (karg) => [karg.fullKeyword, karg.shortKeyword]
      ).map((karg) => [karg, '']),
  );

  // ~ Don't add any non KArgs to the autocomplete
  return [];
}

// -=- Called by Netscript -=-
export async function main(ns: NS) {
  // -=- Parse Arguments -=-
  // ~ Get the arguments passed to the script
  const args = arguments[0]['args'];

  // ~ Parse the arguments and call the main program
  await argParser(ns, args, acceptedKArgs, stockBuyer)
}
