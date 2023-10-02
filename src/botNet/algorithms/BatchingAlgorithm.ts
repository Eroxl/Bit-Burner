import type { Bot } from '../types/Bot.js';
import type { NS } from '../../NetscriptDefinitions.js';
import type Manager from '../manager.js';
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
  reservedRAM: {
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

    this.reservedRAM = {};
  }

  public isBatchInProgress(): boolean {
    return Object.keys(this.reservedRAM).length > 0;
  }

  /**
   * Prepares the server for the algorithm to run by minimizing security and maximizing money.
   * @param target Target server to prepare
   */
  public async _prepServer(target: string): Promise<void> {
    // -=- Check If Server Is Ready -=-
    if (
      this.ns.getServerMaxMoney(target) <= this.ns.getServerMoneyAvailable(target)
      && this.ns.getServerSecurityLevel(target) <= this.ns.getServerMinSecurityLevel(target)
    ) {
      return;
    }

    this.ns.print(`INFO: Preparing ${target} for batching algorithm...`);

    // -=- Grow -=-
    while (this.ns.getServerMaxMoney(target) > this.ns.getServerMoneyAvailable(target)) {
      this.ns.print(`INFO: Growing ${target}...`);

      const bots = this._calculateBotsWithThreads(this.growScriptPrice, Infinity);

      await this.manager.grow(target, bots);

      // ~ Wait for this iteration to finish before starting the next one
      await this.ns.sleep(this.ns.getGrowTime(target) + (this.delay * 4));
    }

    // -=- Weaken -=-
    while (this.ns.getServerSecurityLevel(target) > this.ns.getServerMinSecurityLevel(target)) {
      this.ns.print(`INFO: Weakening ${target}...`);

      const bots = this._calculateBotsWithThreads(this.weakenScriptPrice, Infinity);

      this.manager.weaken(target, bots);

      // ~ Wait for this iteration to finish before starting the next one
      await this.ns.sleep(this.ns.getWeakenTime(target) + (this.delay * 4));
    }

    this.ns.print(`INFO: Prepared ${target} for batching`);
  }

  public async runAction() {
    // -=- Get Batch Info's -=-
    const availableRAM = this._calculateAvailableRAM();

    const target = this._getMostValuableTarget(availableRAM);

    if (!target) {
      this.ns.print('INFO: No target found, you probably need more RAM');
      return;
    }

    await this._prepServer(target);

    let batchRAM = this._calculateBatchRam(target);
    
    // ~ Get the number of batches that can be run
    const batchCount = Math.floor(availableRAM / batchRAM.total);

    if (batchCount <= 0) {
      this.ns.print(`INFO: Not enough RAM to execute 1 batch, you probably need ${formatStorageSize((batchRAM.total - availableRAM) * 1000)} more RAM.`);
      return;
    }

    let batchDelay = 0;

    this.ns.print(`INFO: Starting ${batchCount} batches with ${formatStorageSize(batchRAM.total * 1000 * batchCount)} memory for ${target}`);
    this.ns.print(`INFO: Estimated time to complete: ${this.ns.tFormat(this.ns.getWeakenTime(target) + (this.delay * 4 * batchCount))}`);

    // -=- Run Batches -=-
    for (let i = 0; i < batchCount; i++) {
      // -=- Common Functions -=-
      const getReservedBots = (bots: Bot[], scriptPrice: number) => {
        return Object.fromEntries(bots.map((bot) => [bot.uuid, (bot.threads || 0) * scriptPrice]));
      }

      const freeReservedRAM = (bots: {[uuid: string]: number}) => {
        Object.entries(bots).forEach(([uuid, ram]) => {
          this.reservedRAM[uuid] -= ram;

          if (this.reservedRAM[uuid] == 0) {
            delete this.reservedRAM[uuid];
          } else if (this.reservedRAM[uuid] < 0) {
            this.ns.print(`ERROR: Negative reserved threads for ${uuid}`);
            delete this.reservedRAM[uuid];
          }
        });
      }

      const reserveRAM = (bots: [string, number][]) => {
        bots.forEach(([uuid, ram]) => {
          if (this.reservedRAM[uuid]) {
            this.reservedRAM[uuid] += ram;
          } else {
            this.reservedRAM[uuid] = ram;
          }
        });
      }

      // -=- Calculate Bots -=-
      const weaken1Bots = this._calculateBotsWithThreads(this.weakenScriptPrice, batchRAM.weaken1);
      const reservedWeaken1Bots = getReservedBots(weaken1Bots, this.weakenScriptPrice);

      const growBots = this._calculateBotsWithThreads(this.growScriptPrice, batchRAM.grow, reservedWeaken1Bots);
      const reservedGrowBots = getReservedBots(growBots, this.growScriptPrice)

      const weaken2Bots = this._calculateBotsWithThreads(this.weakenScriptPrice, batchRAM.weaken2, {
        ...reservedWeaken1Bots,
        ...reservedGrowBots,
      });
      const reservedWeaken2Bots = getReservedBots(weaken2Bots, this.weakenScriptPrice)

      const hackBots = this._calculateBotsWithThreads(this.hackScriptPrice, batchRAM.hack, {
        ...reservedWeaken1Bots,
        ...reservedGrowBots,
        ...reservedWeaken2Bots
      });
      const reservedHackBots = getReservedBots(hackBots, this.hackScriptPrice);


      // -=- Execute Batch -=-
      // ~ Hack
      setTimeout(async () => {
        await this.manager.hack(target, weaken1Bots);

        // ~ Release threads
        setTimeout(() => {
          freeReservedRAM(reservedHackBots);
        }, this.ns.getHackTime(target));
      }, batchDelay + this.ns.getWeakenTime(target) - this.ns.getHackTime(target) - this.delay);

      // ~ Weaken 1
      setTimeout(async () => {
        await this.manager.weaken(target, growBots);

        // ~ Release threads
        setTimeout(() => {
          freeReservedRAM(reservedWeaken1Bots);
        }, this.ns.getWeakenTime(target));
      }, batchDelay);

      // ~ Grow
      setTimeout(async () => {
        await this.manager.grow(target, weaken2Bots);

        // ~ Release threads
        setTimeout(() => {
          freeReservedRAM(reservedGrowBots);
        }, this.ns.getGrowTime(target));
      }, batchDelay + this.ns.getWeakenTime(target) - this.ns.getGrowTime(target) + this.delay);

      // ~ Weaken 2
      setTimeout(async () => {
        await this.manager.weaken(target, hackBots);

        // ~ Release threads
        setTimeout(() => {
          freeReservedRAM(reservedWeaken2Bots);
        }, this.ns.getWeakenTime(target));
      }, batchDelay + (this.delay * 2));

      // ~ Remove Batch In Progress after the last batch finishes
      if (i == batchCount - 1) {
        setTimeout(() => {
          if (this.isBatchInProgress()) {
            this.ns.print(`ERROR: Batch finished for ${target} but not all threads were released`)
          }

          this.ns.print(`INFO: Batch finished for ${target}`)
        }, batchDelay + this.ns.getWeakenTime(target) + (this.delay * 3));
      }

      // -=- Reserve Threads -=-
      reserveRAM([
        ...Object.entries(reservedWeaken1Bots),
        ...Object.entries(reservedGrowBots),
        ...Object.entries(reservedWeaken2Bots),
        ...Object.entries(reservedHackBots),
      ]);

      // -=- Calculate Batch Delay -=-
      batchDelay += this.delay * 5
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
        - (this.reservedRAM[target] || 0)
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
    additionalReservedRAM?: { [uuid: string]: number }
  ) {
    const botsWithThreads: Bot[] = [];
    let currentRam = 0;

    this.targets.forEach((target) => {
      if (currentRam >= totalRam) return;

      // ~ Either get the devices ram or the remaining ram
      const targetRAM = Math.min(
        (
          this.ns.getServerMaxRam(target)
          - this.ns.getServerUsedRam(target)
          - (this.reservedRAM[target] || 0)
          - (additionalReservedRAM?.[target] || 0)
        ),
        totalRam - currentRam
      );

      if (targetRAM < scriptPrice) return;

      let threads = Math.floor(targetRAM / scriptPrice);

      currentRam += threads * scriptPrice

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
    // -=- Variables -=-
    const maxMoney = this.ns.getServerMaxMoney(target);

    // -=- Hacking -=-
    /**
     * Solve the number of hacking threads required to hack a server
     * @param ns NS object
     * @param maxMoney Maximum money of the server
     * @param target Target to hack
     * @returns Number of hacking threads required to hack the server
     */
    const solveHackThreads = (ns: NS, maxMoney: number, target: string) => {
      let requiredHackingThreads = 0;
      let remainingMoney = maxMoney;

      while (remainingMoney >= 0.1) {
        requiredHackingThreads++;
        remainingMoney -= remainingMoney * ns.hackAnalyze(target);
      }

      return requiredHackingThreads;
    }

    const requiredHackingThreads = solveHackThreads(this.ns, maxMoney, target);

    // -=- Growing -=-
    /**
     * Get the growth percent of a server
     * @param ns NS object
     * @param securityLevel Current security level of the server
     * @param serverGrowth Current growth of the server
     * @returns Growth percent of the server
     */
    const getGrowPercent = (ns: NS, securityLevel: number, serverGrowth: number) => {
      const baseGrowthRate = 1.0300;
      const maxGrowPercent = 1.0035;

      let serverGrowthValue = Math.min(
        1 + (baseGrowthRate - 1) / securityLevel,
        maxGrowPercent
      );
      let serverGrowthPercent = serverGrowth / 100;

      return Math.pow(
        serverGrowthValue,
        serverGrowthPercent * (ns.getPlayer().mults.hacking_grow || 1)
      );
    }

    /**
     * Solve the number of threads required to grow a server
     * @param ns NS object
     * @param target Target to solve the number of threads for
     * @returns Number of threads required to grow a server
     */
    const solveGrowThreads = (ns: NS, target: string) => {
      // -=- Variables -=-
      const baseGrowth = getGrowPercent(
        ns,
        ns.getServerSecurityLevel(target),
        ns.getServerGrowth(target),
      );
      const maxMoney = ns.getServerMaxMoney(target);

      // -=- Calculations -=-
      // SOURCE: https://github.com/xxxsinx/bitburner/blob/ca6d04190b0f51730a502a37b27fdcb728d52f6a/grow.js#L47
      let threads = 1000;
      let prev = threads;
      for (let i = 0; i < 30; ++i) {
        let factor = maxMoney / Math.min(0 + threads, maxMoney - 1);
        threads = Math.log(factor) / Math.log(baseGrowth);
        
        if (Math.ceil(threads) == Math.ceil(prev)) break;
        
        prev = threads;
      }

      return Math.ceil(Math.max(threads, prev));
    }
    
    const requiredGrowThreads = solveGrowThreads(this.ns, target);

    // -=- Weakening -=-

    // ~ Counteract the hack increasing server security
    const requiredInitialWeakenThreads = Math.ceil(this.ns.hackAnalyzeSecurity(requiredHackingThreads) / this.ns.weakenAnalyze(1));

    // ~ Counteract the grow increasing server security
    const requiredPostWeakenThreads = Math.ceil(this.ns.growthAnalyzeSecurity(requiredGrowThreads) / this.ns.weakenAnalyze(1));

    return {
      weaken1: requiredInitialWeakenThreads,
      grow: requiredGrowThreads,
      weaken2: requiredPostWeakenThreads,
      hack: requiredHackingThreads,
    }
  }

  // TODO:EROXL: (2022-12-21) This needs to be heavily improved
  /**
   * Get the most valuable target based on the servers maxMoney that can be hacked with our current memory.
   * @returns UUID of the most valuable target
   */
  private _getMostValuableTarget(availableRam: number) {
    const targetMaxMoney = this.targets.map((target) => ({
      uuid: target,
      money: this.ns.getServerMaxMoney(target),
    }))
      .filter((target) => (this.ns.getHackingLevel() / 3) >= this.ns.getServerRequiredHackingLevel(target.uuid))
      .filter((target) => target.money > 0)
      .filter((target) => this._calculateBatchRam(target.uuid).total < availableRam);

    try {
      return targetMaxMoney.reduce((prev, current) => (prev.money > current.money) ? prev : current).uuid;
    } catch (error: unknown) {
      if (!(error instanceof TypeError)) throw error;

      if (error.message === 'Reduce of empty array with no initial value') {
        return;
      }

      throw error;
    }
  }
}

export default BatchingAlgorithm;
