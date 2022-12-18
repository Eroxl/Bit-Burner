import { Grow, Hack, Weaken } from 'botNet/types/Commands';
import AbstractAlgorithm from './AbstractAlgorithm';
import { NS } from 'NetscriptDefinitions';
import { Bot } from 'botNet/types/Bot';

class BasicAlgorithm extends AbstractAlgorithm {
  constructor (ns: NS, hack: Hack, grow: Grow, weaken: Weaken, targets: string[]) {
    super(ns, hack, grow, weaken, targets);
  }

  public async runAction(): Promise<void> {
    // -=- Hack -=-
    /**
     *  if security is not minimum {
            determine how many threads we need to lower security to the minimum
            find available ram for those threads
            copy the weaken script to the server(s) with RAM
            launch the weaken script(s)
            sleep until weaken is finished
        } else if money is not maximum {
            do the same thing, but with the grow script
        } else {
            do the same thing, but with the hack script
        }
     */
      
      // ~ Get the most valuable target
      const target = this._getMostValuableTarget();

      // ~ Get the security level of the target
      const security = this.ns.getServerSecurityLevel(target);

      if (security === this.ns.getServerMinSecurityLevel(target)) {
        await this.hack(target, this._calculateHackThreads(Infinity, 'hack.js'));
      } else {
        await this.weaken(target, this._calculateHackThreads(Infinity, 'weaken.js'));
      }
  }

  // -=- Calculations -=-
  // NOTE:EROXL: (2022-12-18) This could be WAY for complex I'm just trying to get something working for now.
  private _getMostValuableTarget(): string {
    const targetMaxMoney = this.targets.map((target) => ({
        uuid: target,
        money: this.ns.getServerMoneyAvailable(target),
      }));

      return targetMaxMoney.reduce((prev, current) => (prev.money > current.money) ? prev : current).uuid;
    }

  /**
   * Calculate the threads required for each bot in the bot net to reach maxThreads.
   * @param maxThreads - Maximum number of threads to use
   * @param script - Script to get RAM usage from
   * @param bots - Optional array of bot uuids to hack with (if not provided, all bots in the bot net will be used)
   * @returns An array of `Bot` objects with their `thread` attributes populated with the number of threads required by each bot.
   */
  private _calculateHackThreads(maxThreads: number, script: string) {
    const botsWithThreads: Bot[] = [];

    // ~ Get the RAM usage of the script
    const ramUsage = this.ns.getScriptRam(script);

    let threadCount = 0;

    // ~ Calculate the number of threads required for each bot
    for (let i = 0; i < this.targets.length; i++) {
      const botUUID = this.targets[i];
      if (threadCount > maxThreads) {
        break;
      }

      const botAvailableRam = this.ns.getServerMaxRam(botUUID) - this.ns.getServerUsedRam(botUUID);
      const botThreads = Math.floor(botAvailableRam / ramUsage);

      threadCount += botThreads;

      if (threadCount > 0) {
        botsWithThreads.push({
          uuid: botUUID,
          threads: botThreads,
        });
      }
    }

    return botsWithThreads;
  }
}