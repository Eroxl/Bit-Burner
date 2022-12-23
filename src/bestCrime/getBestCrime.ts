import { NS } from '../NetscriptDefinitions';

import crimeInfo from './crimeInfo';

export async function main(ns: NS) {
  const player = ns.getPlayer();

  const incomePerS = Object.values(crimeInfo).map((crime) => {
    const {
      name,
      time,
      money,
      difficulty,
      weights,
    } = crime;

    const {
      hacking_success_weight,
      strength_success_weight,
      defense_success_weight,
      dexterity_success_weight,
      agility_success_weight,
      charisma_success_weight,
    } = weights as any;

    // SOURCE: https://github.com/bitburner-official/bitburner-src/blob/018053d79ed47a9d6af00d09800d75549ac27ab7/src/Crime/Crime.ts#L119
    // NOTE: Decimal form
    const successRate = Math.min(
      (
        (
          (hacking_success_weight || 0) * player.skills.hacking +
          (strength_success_weight || 0) * player.skills.strength +
          (defense_success_weight || 0) * player.skills.defense +
          (dexterity_success_weight || 0) * player.skills.dexterity +
          (agility_success_weight || 0) * player.skills.agility +
          (charisma_success_weight || 0) * player.skills.charisma +
          0.025 * player.skills.intelligence
        )
        / 975
        / difficulty
        * (player.mults.crime_success || 1)
        * 1 + (Math.pow(player.skills.intelligence, 0.8)) / 600
      ),
      1
    );

    return {
      name,
      moneyPerS: (successRate * money) / (time / 1_000)
    }
  })

  const incomerPerSSorted = incomePerS.sort(((a, b) => a.moneyPerS < b.moneyPerS ? 1 : -1));

  const message = incomerPerSSorted.map((item) => {
    return `${item.name}: $${ns.nFormat(item.moneyPerS, '0.00a')}/s`;
  }).join('\n')

  ns.print
  ns.tprint(`\x1b[36m \n${message} \x1b[0m`);
}
