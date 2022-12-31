import type { NS } from './NetscriptDefinitions';
import type { AcceptedArg } from './helpers/getArgHelp';
import type { MainFunc } from './helpers/argParser';

import argParser from './helpers/argParser';

const MoneyGainPerLevel = 1.5;

// -=- Allowed Key Args -=-
const acceptedKArgs: AcceptedArg[] = [
  {
    fullKeyword: 'max-money-percent',
    shortKeyword: 'm',
    type: 'number',
    required: false,
    default: 70,
    description: 'The max amount of money to spend on hack net upgrades (in percent of current money) (between 0 and 100).',
  },
  {
    fullKeyword: 'cooldown',
    shortKeyword: 'c',
    type: 'number',
    required: false,
    default: 100,
    description: 'The cooldown time between each hack net upgrade (in milliseconds).',
  },
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
  const maxMoneyPercent = kargs['max-money-percent'] as number;
  const cooldown = kargs['cooldown'] as number;

  ns.disableLog('ALL');
  ns.enableLog('print');

  const print = (msg: string) => {
    if (kargs['verbose']) {
      ns.tprint(msg);
      return;
    }

    ns.print(msg);
  }

  while (true) {
    // -=- Hack Net Upgrade -=-
    const hackNodeCount = ns.hacknet.numNodes();

    for (let i = 0; i < hackNodeCount; i++) {
      const { level, cores, ram, production } = ns.hacknet.getNodeStats(i);

      const levelMult = MoneyGainPerLevel * level;
      const ramMult = Math.pow(1.035, ram - 1);
      const coresMult = (cores + 5) / 6;

      const hackNetNodeMoney = ns.getPlayer().mults.hacknet_node_money || 1

      const levelIncrease = (
          (ramMult * coresMult * (MoneyGainPerLevel * (Math.min(level+1, 200))) * hackNetNodeMoney) - production
        ) / ns.hacknet.getLevelUpgradeCost(i, 1);
      const ramIncrease = (
          (Math.pow(1.035, (Math.min(ram * 2, 64)) - 1) * coresMult * levelMult * hackNetNodeMoney) - production
        ) / ns.hacknet.getRamUpgradeCost(i, 1);
      const coresIncrease = (
          (ramMult * ((Math.min(cores+1, 16) + 5) / 6) * levelMult * hackNetNodeMoney) - production
        ) / ns.hacknet.getCoreUpgradeCost(i, 1);

      const increases = [
        ['level', levelIncrease],
        ['ram', ramIncrease],
        ['cores', coresIncrease],
      ]
        .filter(([, increase]) => increase > 0)
        
      if (increases.length === 0) {
        continue;
      }

      const [key] = (
        increases
          .sort((a, b) => {
            return (a[1] as number) - (b[1] as number)
          })
          .reverse()
      )[0];

      switch (key) {
        case 'level':
          const cost = ns.hacknet.getLevelUpgradeCost(i, 1);

          if (cost < ns.getServerMoneyAvailable('home') * (maxMoneyPercent / 100)) {
            ns.hacknet.upgradeLevel(i, 1);
            print(`INFO: Upgraded level of hacknet node ${i} to ${level + 1}`);
          }
          break;
        case 'ram':
          const ramCost = ns.hacknet.getRamUpgradeCost(i, 1);

          if (ramCost < ns.getServerMoneyAvailable('home') * (maxMoneyPercent / 100)) {
            ns.hacknet.upgradeRam(i, 1);
            print(`INFO: Upgraded ram of hacknet node ${i} to ${ram * 2}`);
          }
          break;
        case 'cores':
          const coresCost = ns.hacknet.getCoreUpgradeCost(i, 1);

          if (coresCost < ns.getServerMoneyAvailable('home') * (maxMoneyPercent / 100)) {
            ns.hacknet.upgradeCore(i, 1);
            print(`INFO: Upgraded cores of hacknet node ${i} to ${cores + 1}`);
          }
          break;
      }
    }

    if (ns.hacknet.getPurchaseNodeCost() < ns.getServerMoneyAvailable('home') * (maxMoneyPercent / 100)) {
      ns.hacknet.purchaseNode();
      print(`INFO: Purchased a new hacknet node`);
    }
    
    // -=- Cool Down -=-
    await ns.sleep(cooldown);
  }
};

// -=- Run On Script Startup -=-
export async function main(ns: NS) {
  const args = arguments[0]['args'];

  await argParser(ns, args, acceptedKArgs, program)
}