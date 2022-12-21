import type { NS } from '../../NetscriptDefinitions.js';
import type Manager from '../Manager.js';

import AbstractAlgorithm from './AbstractAlgorithm';

/**
 * Batching algorithm to try to optimize the use of threads.
 */
class BatchingAlgorithm extends AbstractAlgorithm {
  delay: number;
  
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
  }

  public async runAction(): Promise<void> {
    const target = this._getMostValuableTarget();
  }

  // -=- Calculations -=-
  private _getMostValuableTarget(): string {
    const targetMaxMoney = this.targets.map((target) => ({
        uuid: target,
        money: this.ns.getServerMoneyAvailable(target),
      })).filter((target) => this.ns.getHackingLevel() >= this.ns.getServerRequiredHackingLevel(target.uuid));

      return targetMaxMoney.reduce((prev, current) => (prev.money > current.money) ? prev : current).uuid;
  }
}

export default BatchingAlgorithm;
