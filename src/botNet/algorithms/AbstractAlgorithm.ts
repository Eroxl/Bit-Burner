import Manager from '../Manager.js';
import type { NS } from '../../NetscriptDefinitions.js';

/**
 * Base class for all algorithms.
 * @param ns - Netscript API
 * @param hack - Hack action
 * @param grow - Grow action
 * @param weaken - Weaken action
 * @param targets - Array of targets
 *
 * @example
 * const algorithm = new AbstractAlgorithm(ns, hack, grow, weaken, targets);
 * algorithm.runAction();
 * algorithm.addTarget(uuid);
 * algorithm.runAction();
 * algorithm.removeTarget(uuid);
 */
abstract class AbstractAlgorithm {
  protected ns: NS;
  protected manager: Manager;
  protected targets: string[];

  /**
   * Constructor for the Algorithm class.
   * @param ns - Netscript API
   * @param hack - Hack action
   * @param grow - Grow action
   * @param weaken - Weaken action
   * @param targets - Array of targets
   * @returns Algorithm instance
   */
  constructor (ns: NS, manager: Manager, targets: string[]) {
    this.ns = ns;
    this.manager = manager;
    this.targets = targets;
  }

  /**
   * Add a target to the algorithm.
   * @param uuid - UUID of the target to add
   */
  public addTarget(uuid: string) {
    this.targets.push(uuid);

    this.manager.addBot(uuid);
  }

  /**
   * Remove a target from the algorithm.
   * @param uuid - UUID of the target to remove
   */
  public removeTarget(uuid: string) {
    this.targets = this.targets.filter((target) => target !== uuid);

    this.manager.removeBot(uuid);
  }

  /**
   * Run the algorithm.
   * @abstract
   */
  abstract runAction(): Promise<void>;
}

export default AbstractAlgorithm;
