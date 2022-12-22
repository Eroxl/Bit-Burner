import type { NS } from '../NetscriptDefinitions';

import Manager from './Manager';
import BatchingAlgorithm from './algorithms/BatchingAlgorithm';
import recursiveScan from '../helpers/recursiveScan';
import rootComputer from '../helpers/rootComputer';

// -=- Main Program -=-
export async function main(ns: NS) {

  const targets = recursiveScan(ns, 10).filter((uuid) => {
    return rootComputer(ns, uuid, false);
  });

  const manager = new Manager(targets, ns);
  const algorithm = new BatchingAlgorithm(ns, manager, targets);

  // ~ Disable logging for ns.sleep
  ns.disableLog('ALL');
  ns.enableLog('print');

  // -=- Main Code -=-
  while (true) {
    const newTargets = recursiveScan(ns, 10).filter((uuid) => {
      return rootComputer(ns, uuid, false);
    }).filter((uuid) => !targets.includes(uuid));

    newTargets.forEach((uuid) => {
      algorithm.addTarget(uuid);

      ns.print(`Added ${uuid} to the target list.`);
    });

    await algorithm.runAction();

    await ns.sleep(100);
  }
}
