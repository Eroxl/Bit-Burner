import type { NS } from '../NetscriptDefinitions';
import type { KArgs } from '../helpers/argParser';
import type { AcceptedArg } from '../helpers/getArgHelp';

import Manager from './Manager';
import BasicAlgorithm from '../algorithms/BasicAlgorithm';
import argParser from '../helpers/argParser';
import recursiveScan from '../helpers/recursiveScan';
import rootComputer from '../helpers/rootComputer';

const acceptedKArgs: AcceptedArg[] = [
  {
    fullKeyword: 'verbose',
    shortKeyword: 'v',
    type: 'flag',
    description: 'Whether or not to print out information to the terminal.',
  },
  {
    fullKeyword: 'help',
    shortKeyword: 'h',
    type: 'flag',
    description: 'Displays a help menu when set to true.'
  }
];

export function autocomplete(data: { flags: (arg0: string[][]) => void; }, _: string[]) {
  data.flags(
    acceptedKArgs.flatMap(
      (karg) => [karg.fullKeyword, karg.shortKeyword]
    ).map((karg) => [karg, '']),
  );

  return [];
}

// -=- Main Program -=-
async function program(ns: NS, kargs: KArgs) {
  const verbose = kargs['verbose'] as boolean;

  // -=- Muting Terminal Output -=-
  if (!verbose) {
    // ~ Print out information to the logs instead of the terminal
    ns.tprint = (...args: any[]) => {
      ns.print(...args);
    }
  }

  const targets = recursiveScan(ns, 10).filter((uuid) => {
    return rootComputer(ns, uuid, false);
  });

  const manager = new Manager(targets, ns);
  const algorithm = new BasicAlgorithm(ns, manager, targets);

  // ~ Disable logging for ns.sleep
  ns.disableLog('ALL');
  ns.enableLog('print')

  // -=- Main Code -=-
  while (true) {
    const newTargets = recursiveScan(ns, 10).filter((uuid) => {
      return rootComputer(ns, uuid, false);
    }).filter((uuid) => !targets.includes(uuid));

    newTargets.forEach((uuid) => {
      algorithm.addTarget(uuid);

      ns.tprint(`Added ${uuid} to the target list.`);
    })

    await algorithm.runAction();

    await ns.sleep(100);
  }
}

// -=- Run On Script Startup -=-
export async function main(ns: NS) {
  const args = arguments[0]['args'];

  await argParser(ns, args, acceptedKArgs, program)
}
