import type { NS } from '../NetscriptDefinitions';

const rootComputer = (ns: NS, uuid: string) => {
  if (ns.hasRootAccess(uuid)) return true;

  const numPortsReq = ns.getServerNumPortsRequired(uuid)
  const portOpeners = [
      {
          hackFunc: ns.brutessh,
          fileName: 'BruteSSH',
      },
      {
          hackFunc: ns.ftpcrack,
          fileName: 'FTPCrack',
      },
      {
          hackFunc: ns.relaysmtp,
          fileName: 'relaySMTP',
      },
      {
          hackFunc: ns.httpworm,
          fileName: 'HTTPWorm',
      },
      {
          hackFunc: ns.sqlinject,
          fileName: 'SQLInject',
      },
  ]

  for (let i = numPortsReq; i > 0; i--) {
      const portOpener = portOpeners[i - 1];

      if (!ns.fileExists(`${portOpener.fileName}.exe`)) {
          ns.tprint(`WARNING: Unable to hack ${uuid}; research on ${portOpener.fileName} required`)
          return false;
      }

      portOpener.hackFunc(uuid);
  } 

  ns.nuke(uuid);
  return true;
}

export default rootComputer;
