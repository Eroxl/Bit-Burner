import type { NS } from '../../NetscriptDefinitions.js';
import type { Bot } from '../types/Bot.js';

import Manager from '../Manager.js';
import AbstractAlgorithm from './AbstractAlgorithm.js';

class BasicAlgorithm extends AbstractAlgorithm {
  constructor (ns: NS, manager: Manager, targets: string[]) {
    super(ns, manager, targets);
  }

  public async runAction(): Promise<void> {
    const target = this._getMostValuableTarget();

    if (!target) {
      return;
    }

    // NOTE:EROXL: (2022-12-18) This could be optimized at ton and a new algorithm should be created to handle this.

    // -=- Security -=-
    const minSecurityLevel = this.ns.getServerMinSecurityLevel(target);
    const currentSecurityLevel = this.ns.getServerSecurityLevel(target);
  
    // -=- Money -=-
    const maxMoney = this.ns.getServerMaxMoney(target);
    const currentMoney = this.ns.getServerMoneyAvailable(target);

    if (currentMoney < maxMoney) {
      const threadsRequired = Math.ceil(this.ns.growthAnalyze(target, (maxMoney / currentMoney)));

      const botsWithThreads = this._calculateHackThreads(threadsRequired, '/runners/grow.js');

      if (botsWithThreads.length === 0) {
        return;
      }

      this.ns.tprint(`INFO: Growing ${target} with ${botsWithThreads.length} bots.`);
      this.ns.tprint(`INFO: Using ${threadsRequired} threads.`);
      this.ns.tprint(`INFO: Estimated time: ${Math.round(this.ns.getGrowTime(target) / 1000)}s.`);
      
      await this.manager.grow(
        target,
        botsWithThreads
      );
    } else if (currentSecurityLevel > minSecurityLevel) {
      const threadsRequired = Math.ceil((currentSecurityLevel - minSecurityLevel) / this.ns.weakenAnalyze(1));

      const botsWithThreads = this._calculateHackThreads(threadsRequired, '/runners/weaken.js');

      if (botsWithThreads.length === 0) {
        return;
      }

      this.ns.tprint(`INFO: Weakening ${target} with ${botsWithThreads.length} bots.`);
      this.ns.tprint(`INFO: Using ${threadsRequired} threads.`);
      this.ns.tprint(`INFO: Estimated time: ${Math.round(this.ns.getWeakenTime(target) / 1000)}s.`);

      await this.manager.weaken(
        target,
        botsWithThreads
      );
    } else {
      const botsWithThreads = this._calculateHackThreads(Infinity, '/runners/hack.js');

      if (botsWithThreads.length === 0) {
        return;
      }

      this.ns.tprint(`INFO: Hacking ${target} with ${botsWithThreads.length} bots.`);
      this.ns.tprint(`INFO: Using MAX threads.`);
      this.ns.tprint(`INFO: Estimated time: ${Math.round(this.ns.getHackTime(target) / 1000)}s`);

      await this.manager.hack(
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
      })).filter((target) => this.ns.getHackingLevel() >= this.ns.getServerRequiredHackingLevel(target.uuid));

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
