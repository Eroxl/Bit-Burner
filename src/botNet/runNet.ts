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
  if (verbose) {
    // ~ Print out information to the logs instead of the terminal
    ns.tprint = ns.print
  }

  const targets = recursiveScan(ns, 10).filter((uuid) => {
    return rootComputer(ns, uuid)
  });

  const manager = new Manager(targets, ns);
  manager.start(BasicAlgorithm, targets)

  // -=- Main Code -=-
  while (true) {
    const newTargets = recursiveScan(ns, 10).filter((uuid) => {
      return rootComputer(ns, uuid)
    }).filter((uuid) => !targets.includes(uuid));

    newTargets.forEach((uuid) => {
      manager.addBot(uuid)
    })

    ns.sleep(1000)
  }
}

// -=- Run On Script Startup -=-
export async function main(ns: NS) {
  const args = arguments[0]['args'];

  argParser(ns, args, acceptedKArgs, program)
}
