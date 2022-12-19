import { Grow, Hack, Weaken } from 'botNet/types/Commands';
import AbstractAlgorithm from './AbstractAlgorithm';
import { NS } from 'NetscriptDefinitions';
import { Bot } from 'botNet/types/Bot';

class BasicAlgorithm extends AbstractAlgorithm {
  constructor (ns: NS, hack: Hack, grow: Grow, weaken: Weaken, targets: string[]) {
    super(ns, hack, grow, weaken, targets);
  }

  public async runAction(): Promise<void> {
    const target = this._getMostValuableTarget();

    if (!target) {
      return;
    }

    // NOTE:EROXL: (2022-12-18) This could be optimized at ton and a new algorithm should be created to handle this.

    // -=- Security -=-
    const maxSecurityLevel = this.ns.getServerMinSecurityLevel(target);
    const currentSecurityLevel = this.ns.getServerSecurityLevel(target);
  
    // -=- Money -=-
    const maxMoney = this.ns.getServerMaxMoney(target);
    const currentMoney = this.ns.getServerMoneyAvailable(target);

    if (currentSecurityLevel > maxSecurityLevel) {
      const threadsRequired = Math.ceil((maxSecurityLevel - currentSecurityLevel) / this.ns.weakenAnalyze(1));

      const botsWithThreads = this._calculateHackThreads(threadsRequired, 'botNet/runners/weaken.js');

      this.weaken(
        target,
        botsWithThreads
      );
    } else if (currentMoney < maxMoney) {
      const threadsRequired = Math.ceil(this.ns.growthAnalyze(target, (maxMoney / currentMoney)));

      const botsWithThreads = this._calculateHackThreads(threadsRequired, 'botNet/runners/grow.js');

      this.grow(
        target,
        botsWithThreads
      );
    } else {
      const botsWithThreads = this._calculateHackThreads(Infinity, 'botNet/runners/hack.js');

      this.hack(
        target,
        botsWithThreads
      );
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

export default BasicAlgorithm;
