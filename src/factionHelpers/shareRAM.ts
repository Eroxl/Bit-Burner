import type { NS } from '../NetscriptDefinitions';
import type { AcceptedArg } from '../helpers/getArgHelp';
import type { MainFunc } from '../helpers/argParser';

import { PortTypes } from '../botNet/constants';
import Manager from '../botNet/manager';
import recursiveScan from '../helpers/recursiveScan';
import argParser from '../helpers/argParser';

// -=- Allowed Key Args -=-
const acceptedKArgs: AcceptedArg[] = [
  {
    fullKeyword: 'max-ram-percent',
    shortKeyword: 'm',
    type: 'number',
    required: false,
    default: 10,
    description: 'The max percent of RAM that can be used from each server (between 0 and 100).'
  },
  {
    fullKeyword: 'help',
    shortKeyword: 'h',
    type: 'flag',
    description: 'Displays a help menu when set to true.',
  },
];

export function autocomplete(data: { flags: (arg0: string[][]) => void; }, _: string[]) {
  data.flags(
    acceptedKArgs.flatMap(
        (karg) => [karg.fullKeyword, karg.shortKeyword]
    ).map((karg) => [karg, '']),
  );

  return [];
}

// -=- Main Program Code -=-
const program: MainFunc = async (ns, kargs) => {
  const maxRAMPercent = kargs['max-ram-percent'] as number;

  const servers = recursiveScan(ns, 10).filter((uuid) => ns.getServer(uuid).purchasedByPlayer)

  const manager = new Manager(servers, ns)

  const bots = servers.map((uuid) => ({
    uuid,
    threads: Math.floor(
      (ns.getServerMaxRam(uuid) - ns.getServerUsedRam(uuid))
      * (maxRAMPercent / 100)
      / ns.getScriptRam('/runners/share.js')
    )
  }));

  await manager.share(bots);

  ns.atExit(() => {
    const killPort = ns.getPortHandle(PortTypes.KILL);

    if (killPort) {
      killPort.write(JSON.stringify({
        uuids: bots,
      }))
    }
  });

  while (true) {
    await ns.sleep(1000);
  }
};

// -=- Run On Script Startup -=-
export async function main(ns: NS) {
  const args = arguments[0]['args'];

  await argParser(ns, args, acceptedKArgs, program)
}
