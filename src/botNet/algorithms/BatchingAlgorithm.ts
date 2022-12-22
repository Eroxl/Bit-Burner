import type { Bot } from '../types/Bot.js';
import type { NS } from '../../NetscriptDefinitions.js';
import type Manager from '../Manager.js';
import formatStorageSize from '../../helpers/formatStorageSize.js';

import AbstractAlgorithm from './AbstractAlgorithm';

/**
 * Batching algorithm to try to optimize the use of threads.
 */
class BatchingAlgorithm extends AbstractAlgorithm {
  delay: number;
  growScriptPrice: number;
  hackScriptPrice: number;
  weakenScriptPrice: number;
  batchInProgress: boolean;
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
    this.batchInProgress = false;
  }

  public async runAction(): Promise<void> {
    if (this.batchInProgress) return;

    // -=- Get Batch Info's -=-
    const availableRAM = this._calculateAvailableRAM();

    const target = this._getMostValuableTarget(availableRAM);

    const batchRAM = this._calculateBatchRam(target);

    // ~ If there is not enough RAM to run 1 batch, return
    if (availableRAM < batchRAM.total) {
      if (Object.keys(this.reservedThreads).length > 0) return;

      this.ns.print(`ERROR: Not enough RAM to run 1 batch. Available: ${formatStorageSize(availableRAM*1000)}, Required: ${formatStorageSize(batchRAM.total*1000)}`);
      return;
    }

    // ~ Get the number of batches that can be run
    const batchCount = Math.floor(availableRAM / batchRAM.total);

    let batchDelay = 0;

    this.ns.print(`INFO: Starting ${batchCount} batches with ${formatStorageSize(batchRAM.total * 1000 * batchCount)} memory for ${target}`);
    this.ns.print(`INFO: Estimated time to complete: ${this.ns.tFormat(batchCount * (this.ns.getWeakenTime(target) + this.delay * 4))}`);

    // -=- Run Batches -=-
    for (let i = 0; i < batchCount; i++) {
      // -=- Common Functions -=-
      const getReservedBots = (bots: Bot[]) => {
        return Object.fromEntries(bots.map((bot) => [bot.uuid, (bot.threads || 0)]));
      }

      const freeReservedThreads = (bots: {[uuid: string]: number}) => {
        Object.entries(bots).forEach(([uuid, threads]) => {
          this.reservedThreads[uuid] -= threads;

          if (this.reservedThreads[uuid] == 0) {
            delete this.reservedThreads[uuid];
          } else if (this.reservedThreads[uuid] < 0) {
            this.ns.print(`ERROR: Negative reserved threads for ${uuid}`);
            delete this.reservedThreads[uuid];
          }
        });
      }

      const reserveThreads = (bots: [string, number][]) => {
        bots.forEach(([uuid, threads]) => {
          if (this.reservedThreads[uuid]) {
            this.reservedThreads[uuid] += threads;
          } else {
            this.reservedThreads[uuid] = threads;
          }
        });
      }
        

      // -=- Calculate Bots -=-
      const weaken1Bots = this._calculateBotsWithThreads(this.weakenScriptPrice, batchRAM.weaken1);
      const reservedWeaken1Bots = getReservedBots(weaken1Bots);

      const growBots = this._calculateBotsWithThreads(this.growScriptPrice, batchRAM.grow, reservedWeaken1Bots);
      const reservedGrowBots = getReservedBots(growBots)

      const weaken2Bots = this._calculateBotsWithThreads(this.weakenScriptPrice, batchRAM.weaken2, {
        ...reservedWeaken1Bots,
        ...reservedGrowBots,
      });
      const reservedWeaken2Bots = getReservedBots(weaken2Bots)

      const hackBots = this._calculateBotsWithThreads(this.hackScriptPrice, batchRAM.hack, {
        ...reservedWeaken1Bots,
        ...reservedGrowBots,
        ...reservedWeaken2Bots
      });
      const reservedHackBots = getReservedBots(hackBots);

      // -=- Execute Batch -=-
      // ~ Weaken 1
      setTimeout(async () => {
        await this.manager.weaken(target, weaken1Bots);

        setTimeout(() => {
          freeReservedThreads(reservedWeaken1Bots);
        }, this.ns.getWeakenTime(target));
      }, batchDelay);

      // ~ Grow
      setTimeout(async () => {
        await this.manager.grow(target, growBots);

        // -=- Release Threads -=-
        setTimeout(() => {
          freeReservedThreads(reservedGrowBots);
        }, this.ns.getGrowTime(target));
      }, batchDelay + this.ns.getWeakenTime(target) - (this.ns.getGrowTime(target) - this.delay));

      // ~ Weaken 2
      setTimeout(async () => {
        await this.manager.weaken(target, weaken2Bots);

        // -=- Release Threads -=-
        setTimeout(() => {
          freeReservedThreads(reservedWeaken2Bots);
        }, this.ns.getWeakenTime(target));
      }, batchDelay + (2 * this.delay));

      // ~ Hack
      setTimeout(async () => {
        await this.manager.hack(target, hackBots);

        // -=- Release Threads -=-
        setTimeout(() => {
          freeReservedThreads(reservedHackBots);
        }, this.ns.getHackTime(target));
      }, batchDelay + this.ns.getWeakenTime(target) - (this.ns.getHackTime(target) - (this.delay * 4)));
      
      // ~ Remove Batch In Progress after the last batch finishes
      if (i == batchCount - 1) {
        setTimeout(() => {
          this.ns.print(`INFO: Batch finished for ${target}`)
          this.batchInProgress = false;
        }, batchDelay + this.ns.getWeakenTime(target) + (this.delay * 4));
      }
      
      // -=- Reserve Threads -=-
      reserveThreads([
        ...Object.entries(reservedWeaken1Bots),
        ...Object.entries(reservedGrowBots),
        ...Object.entries(reservedWeaken2Bots),
        ...Object.entries(reservedHackBots),
      ]);

      // -=- Set Batch In Progress -=-
      if (!this.batchInProgress) this.batchInProgress = true;

      // -=- Calculate Batch Delay -=-
      batchDelay += this.ns.getWeakenTime(target) + (this.delay * 4);
    }
  }

  /**
   * Calculate the RAM (in GB) available for the botnet
   * @returns The usable RAM (in GB) of the botnet
   */
  private _calculateAvailableRAM(): number {
    return this.targets.map((target) => (
      this.ns.getServerMaxRam(target)
        - this.ns.getServerUsedRam(target)
        - (this.reservedThreads[target] || 0)
    )).reduce((a, b) => a + b, 0);
  }

  /**
   * Calculate the threads required of each bot to execute a function
   * @param scriptPrice RAM (in GB) required to execute a function
   * @param totaleRam Total RAM (in GB) required 
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
   * Calculate the RAM (in GB) required to full execute a batch.
   * @param target Target to calculate the RAM (in GB) for
   * @returns RAM (in GB) required to fully execute a batch
   */
  private _calculateBatchRam(target: string) {
    const batchThreads = this._calculateBatchThreads(target);

    const weakenRam = this.weakenScriptPrice * batchThreads.weaken1;
    const growRam = this.growScriptPrice * batchThreads.grow;
    const weaken2Ram = this.weakenScriptPrice * batchThreads.weaken2;
    const hackRam = this.hackScriptPrice * batchThreads.hack;

    return {
      weaken1: weakenRam,
      grow: growRam,
      weaken2: weaken2Ram,
      hack: hackRam,
      total: growRam + weakenRam + weaken2Ram + hackRam,
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
    let currentMoney = this.ns.getServerMoneyAvailable(target);
    
    // -=- Growing -=-
    if (currentMoney === 0) {
      currentMoney = 1;
    }

    const requiredGrowThreads = Math.ceil(this.ns.growthAnalyze(target, (maxMoney / currentMoney)));

    // -=- Weakening -=-
    const requiredInitialWeakenThreads = Math.ceil((currentSecurityLevel - minSecurityLevel) / this.ns.weakenAnalyze(1));
    const requiredPostWeakenThreads = Math.ceil(((minSecurityLevel + this.ns.growthAnalyzeSecurity(requiredGrowThreads)) / this.ns.weakenAnalyze(1)));

    // -=- Hacking -=-
    const requiredHackingThreads = Math.ceil(1 / this.ns.hackAnalyze(target));

    return {
      weaken1: requiredInitialWeakenThreads,
      grow: requiredGrowThreads,
      weaken2: requiredPostWeakenThreads,
      hack: requiredHackingThreads,
    }
  }

  /**
   * Get the most valuable target based on the servers maxMoney that can be hacked with our current memory.
   * @returns UUID of the most valuable target
   */
  private _getMostValuableTarget(availableRam: number) {
    const targetMaxMoney = this.targets.map((target) => ({
      uuid: target,
      money: this.ns.getServerMaxMoney(target),
    }))
      .filter((target) => this.ns.getHackingLevel() >= this.ns.getServerRequiredHackingLevel(target.uuid))
      .filter((target) => target.money > 0)
      .filter((target) => this._calculateBatchRam(target.uuid).total <= availableRam);

    return targetMaxMoney.reduce((prev, current) => (prev.money > current.money) ? prev : current).uuid;
  }
}

export default BatchingAlgorithm;
