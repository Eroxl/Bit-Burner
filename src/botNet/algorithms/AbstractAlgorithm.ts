import { NS } from 'NetscriptDefinitions';
import { Hack, Grow, Weaken } from 'botNet/types/Commands';

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
  protected hack: Hack;
  protected grow: Grow;
  protected weaken: Weaken;
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
  constructor (ns: NS, hack: Hack, grow: Grow, weaken: Weaken, targets: string[]) {
    this.ns = ns;
    this.hack = hack;
    this.grow = grow;
    this.weaken = weaken;
    this.targets = targets;
  }

  /**
   * Add a target to the algorithm.
   * @param uuid - UUID of the target to add
   */
  public addTarget(uuid: string) {
    this.targets.push(uuid);
  }

  /**
   * Remove a target from the algorithm.
   * @param uuid - UUID of the target to remove
   */
  public removeTarget(uuid: string) {
    this.targets = this.targets.filter((target) => target !== uuid);
  }

  /**
   * Run the algorithm.
   * @abstract
   */
  abstract runAction(): void;
}

export default AbstractAlgorithm;
