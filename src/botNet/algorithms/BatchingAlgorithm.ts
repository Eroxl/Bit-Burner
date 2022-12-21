import type { Bot } from '../types/Bot.js';
import type { NS } from '../../NetscriptDefinitions.js';
import type Manager from '../Manager.js';

import AbstractAlgorithm from './AbstractAlgorithm';

/**
 * Batching algorithm to try to optimize the use of threads.
 */
class BatchingAlgorithm extends AbstractAlgorithm {
  delay: number;
  growScriptPrice: number;
  hackScriptPrice: number;
  weakenScriptPrice: number;
  
  reservedThreads: {
    [uuid: string]: number;
  } // Threads waiting to be deployed

  /**
   * 
   * @param ns Netscript API
   * @param manager Botnet Manager
   * @param targets Array of valid targets
   * @param delay Delay between each batch (in ms) (default: 100ms)
   */
  constructor (
    ns: NS,
    manager: Manager,
    targets: string[],
    delay: number = 100,
  ) {
    super(ns, manager, targets);

    this.delay = delay;

    this.growScriptPrice = this.ns.getScriptRam('/runners/grow.js');
    this.hackScriptPrice = this.ns.getScriptRam('/runners/hack.js');
    this.weakenScriptPrice = this.ns.getScriptRam('/runners/weaken.js');

    this.reservedThreads = {};
  }

  public async runAction(): Promise<void> {
    const target = this._getMostValuableTarget();

    if (!target) {
      return;
    }

    const batchRAM = this._calculateBatchRam(target);

    const growBots = this._calculateBotsWithThreads(this.growScriptPrice, batchRAM.grow);
    const reservedGrowBots = Object.fromEntries(growBots.map((bot) => [bot.uuid, (bot.threads || 0)]));

    const weakenBots = this._calculateBotsWithThreads(this.weakenScriptPrice, batchRAM.weaken, reservedGrowBots);
    const reservedWeakenBots = Object.fromEntries(weakenBots.map((bot) => [bot.uuid, (bot.threads || 0)]));

    const hackBots = this._calculateBotsWithThreads(this.hackScriptPrice, batchRAM.hack, {
      ...reservedGrowBots,
      ...reservedWeakenBots,
    });

  }

  /**
   * Calculate the threads required of each bot to execute a function
   * @param scriptPrice RAM required to execute a function
   * @param totaleRam Total RAM required 
   * @returns Number of threads required of each bot to execute a function in the form of an array of bots
   */
  private _calculateBotsWithThreads(
    scriptPrice: number,
    totalRam: number,
    additionalReservedThreads?: { [uuid: string]: number }
  ) {
    const botsWithThreads: Bot[] = [];
    let currentRam = 0;

    this.targets.forEach((target) => {
      if (currentRam >= totalRam) return;

      const targetRAM = (
        this.ns.getServerMaxRam(target)
        - this.ns.getServerUsedRam(target)
        - (this.reservedThreads[target] || 0)
        - (additionalReservedThreads?.[target] || 0)
      );

      if (targetRAM < scriptPrice) return;

      const threads = Math.floor(targetRAM / scriptPrice);

      currentRam += scriptPrice * threads;

      botsWithThreads.push({
        uuid: target,
        threads,
      });
    })

    return botsWithThreads;
  }
  
  /**
   * Calculate the RAM required to full execute a batch.
   * @param target Target to calculate the RAM for
   * @returns RAM required to full execute a batch
   */
  private _calculateBatchRam(target: string) {
    const batchThreads = this._calculateBatchThreads(target);

    const growRam = this.growScriptPrice * batchThreads.grow;
    const weakenRam = this.weakenScriptPrice * batchThreads.weaken;
    const hackRam = this.hackScriptPrice * batchThreads.hack;

    return {
      grow: growRam,
      weaken: weakenRam,
      hack: hackRam,
    }
  }
  
  /**
   * Calculate the threads required to full execute a batch.
   * @param target Target to calculate the threads for
   * @returns Number of threads required to full execute a batch
   */
  private _calculateBatchThreads(target: string) {
    // -=- Security -=-
    const minSecurityLevel = this.ns.getServerMinSecurityLevel(target);
    const currentSecurityLevel = this.ns.getServerSecurityLevel(target);

    // -=- Money -=-
    const maxMoney = this.ns.getServerMaxMoney(target);
    const currentMoney = this.ns.getServerMoneyAvailable(target);
    
    // -=- Growing -=-
    const requiredGrowThreads = Math.ceil(this.ns.growthAnalyze(target, (maxMoney / currentMoney)));

    // -=- Weakening -=-
    const requiredWeakenThreads = Math.max(minSecurityLevel, currentSecurityLevel + this.ns.growthAnalyzeSecurity(requiredGrowThreads)) / this.ns.weakenAnalyze(1);

    // -=- Hacking -=-
    const requiredHackingThreads = Math.ceil((maxMoney - currentMoney) / this.ns.hackAnalyze(target));

    return {
      grow: requiredGrowThreads,
      weaken: requiredWeakenThreads,
      hack: requiredHackingThreads,
    }
  }

  /**
   * Get the most valuable target based on the servers maxMoney. 
   * @returns UUID of the most valuable target
   */
  private _getMostValuableTarget(): string {
    const targetMaxMoney = this.targets.map((target) => ({
        uuid: target,
        money: this.ns.getServerMaxMoney(target),
      })).filter((target) => this.ns.getHackingLevel() >= this.ns.getServerRequiredHackingLevel(target.uuid));

      return targetMaxMoney.reduce((prev, current) => (prev.money > current.money) ? prev : current).uuid;
  }
}

export default BatchingAlgorithm;
