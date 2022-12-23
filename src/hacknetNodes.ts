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

  while (true) {
    // -=- Hack Net Upgrade -=-
    const hackNodeCount = ns.hacknet.numNodes();

    for (let i = 0; i < hackNodeCount; i++) {
      const { level, cores, ram } = ns.hacknet.getNodeStats(i);

      const levelMult = MoneyGainPerLevel * level;
      const ramMult = Math.pow(1.035, ram - 1);
      const coresMult = (cores + 5) / 6;

      let breakWhile = true;

      while (breakWhile) {
        const levelIncrease = level < 200 ? (MoneyGainPerLevel * (level + 1)) - levelMult : -Infinity;
        const ramIncrease = ram < 64 ? Math.pow(1.035, ram) - ramMult : -Infinity;
        const coresIncrease = cores < 16 ?  ((cores + 6) / 6) - coresMult : -Infinity;

        const sorted = [
          ['level', levelIncrease],
          ['ram', ramIncrease],
          ['cores', coresIncrease],
        ].sort((a, b) => a[1] < b[1] ? 1 : -1);

        for (let j = 0; j < sorted.length; j++) {
          const increase = sorted[j];
          const [key] = increase;

          let breakLoop = false;

          switch (key) {
            case 'level':
              const cost = ns.hacknet.getLevelUpgradeCost(i, 1);

              if (cost < ns.getServerMoneyAvailable('home') * (maxMoneyPercent / 100)) {
                ns.hacknet.upgradeLevel(i, 1);
                breakLoop = true;
              }
              break;
            case 'ram':
              const ramCost = ns.hacknet.getRamUpgradeCost(i, 1);

              if (ramCost < ns.getServerMoneyAvailable('home') * (maxMoneyPercent / 100)) {
                ns.hacknet.upgradeRam(i, 1);
                breakLoop = true;
              }
              break;
            case 'cores':
              const coresCost = ns.hacknet.getCoreUpgradeCost(i, 1);

              if (coresCost < ns.getServerMoneyAvailable('home') * (maxMoneyPercent / 100)) {
                ns.hacknet.upgradeCore(i, 1);
                breakLoop = true;
              }
              break;
          }

          breakWhile = breakLoop;
        }
      }
    }

    while (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes()) {
      if (ns.hacknet.getPurchaseNodeCost() < ns.getServerMoneyAvailable('home') * (maxMoneyPercent / 100)) {
        ns.hacknet.purchaseNode();
      } else {
        break;
      }
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