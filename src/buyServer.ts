import { NS } from './NetscriptDefinitions';

const getPowersToN = (n: number): number[] => {
  const powers = [];
  let power = 1;
  while (power <= n) {
    powers.push(power);
    power *= 2;
  }
  return powers;
}

export async function main(ns: NS) {
  const maxRam = ns.getPurchasedServerMaxRam();

  const RAM = await ns.prompt(
    'Server RAM (GB)',
    {
      type: 'select',
      choices: getPowersToN(maxRam).map((ram) => {
        const price = ns.nFormat(ns.getPurchasedServerCost(ram), "0.00a");

        return `${ram}GB, $${price}`;
      })
    }
  ) as string | undefined;

  if (!RAM) {
    ns.tprint('WARNING: Purchase cancelled');
    return;
  } 

  const ram = parseInt(RAM.split('GB')[0]);
  const cost = ns.getPurchasedServerCost(ram);

  if (ns.getServerMoneyAvailable('home') < cost) {
    ns.tprint('ERROR: Insufficient funds');
    return;
  }

  let hostname = await ns.prompt('Server hostname', { type: 'text' }) as string | undefined;

  if (!hostname) {
    ns.tprint('WARNING: No hostname provided defaulting to "server"');
    hostname = 'server';
  }

  try {
    const server = ns.purchaseServer(hostname, ram);

    ns.tprint(`SUCCESS: Server ${server} purchased successfully with ${ram}GB RAM`);
  } catch (error) {
    ns.tprint(`ERROR: ${(error as Error).message}`);
  }
}
