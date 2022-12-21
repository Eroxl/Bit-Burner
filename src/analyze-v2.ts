import { NS } from './NetscriptDefinitions';

import formatStorageSize from './helpers/formatStorageSize';

export function autocomplete(data: { servers: string[] }, _: string[]) {
  return [
    ...data.servers
  ];
}
// -=- Run On Script Startup -=-
export async function main(ns: NS) {
  let serverUUID = arguments[0]['args'][0] || ns.getHostname();

  const server = ns.getServer(serverUUID);

  const isServerHackable = server.requiredHackingSkill <= ns.getHackingLevel()
  const growEffect = server.moneyAvailable * (Math.min(1 + (1.03 - 1) / server.hackDifficulty, 1.0035) / 100);

  const title = (str: string) => `\x1b[4m${str}\x1b[0m`

  const colourStatus = (status: boolean, str: string) => {
    return status ? `\x1b[32m${str}\x1b[0m` : `\x1b[31m${str}\x1b[0m`
  }
  `
    Server UUID: ${serverUUID}
    Backdoored: ${colourStatus(server.backdoorInstalled, server.backdoorInstalled ? 'Yes' : 'No')}
    Player Owned:  ${colourStatus(server.purchasedByPlayer, server.purchasedByPlayer ? 'Yes' : 'No')}
    Server RAM:
      Used: ${formatStorageSize(server.ramUsed * 1000)}
      Max: ${formatStorageSize(server.maxRam * 1000)}
      Percent Used: ${Math.round(server.ramUsed / server.maxRam * 100)}%
    Hack:
      Rooted: ${colourStatus(server.hasAdminRights, server.hasAdminRights ? 'Yes' : 'No')}
        PORTS:
          ${
            (() => {
              const ports = [
                {
                  name: 'FTP',
                  open: server.ftpPortOpen,
                },
                {
                  name: 'SSH',
                  open: server.sshPortOpen,
                },
                {
                  name: 'SMTP',
                  open: server.smtpPortOpen,
                },
                {
                  name: 'HTTP',
                  open: server.httpPortOpen,
                },
                {
                  name: 'SQL',
                  open: server.sqlPortOpen,
                },
              ];

              return ports.map(
                (port) => {
                  return `${port.name}: ${colourStatus(port.open, port.open ? 'Open' : 'Closed')}`
                }
              ).join('\n' + ' '.repeat(10))
            })()
          }
      Required Hacking Level: ${colourStatus(isServerHackable, ''+server.requiredHackingSkill)}
      Hack Effect: $${ns.nFormat(server.moneyAvailable * ns.hackAnalyze(serverUUID), '0.00a')}
      Hack Chance: ${Math.round(ns.hackAnalyzeChance(serverUUID) * 100)}%
      Hack Time: ${ns.tFormat(ns.getHackTime(serverUUID))}s
      Hack Threads to Empty: ${Math.ceil(ns.hackAnalyzeThreads(serverUUID, server.moneyAvailable))} threads
    Money:
      Current: $${ns.nFormat(server.moneyAvailable, '0.00a')}
      Max: $${ns.nFormat(server.moneyMax, '0.00a')}
      Percent Available: ${Math.round(server.moneyAvailable !== 0 ? server.moneyAvailable / server.moneyMax * 100 : 0)}%
      Grow:
        Grow Time: ${ns.tFormat(ns.getGrowTime(serverUUID))}s
        Grow Effect: +$${ns.nFormat(growEffect, '0.00a')}
        Grow Threads To Max: ${Math.ceil(ns.growthAnalyze(serverUUID, server.moneyMax / server.moneyAvailable))} threads
    Security:
      Min Security Level: ${server.minDifficulty}
      Current Security Level:
        Value: ${Math.round(server.hackDifficulty * 100) / 100}
        Magnitude: ${Math.round(server.hackDifficulty / server.minDifficulty * 100) / 100}x
      Weaken:
        Weaken Time: ${ns.tFormat(ns.getWeakenTime(serverUUID))}s
        Weaken Effect: -${ns.weakenAnalyze(1)}
        Weaken Threads To Min: ${Math.ceil((server.minDifficulty - server.hackDifficulty) / ns.weakenAnalyze(1) * -1) } threads
    Network:
      Connected To:
        ${
          ns.scan(serverUUID).join('\n' + ' '.repeat(8))
        }
      `.split('\n').map(
        (line) => {
          const [key, value] = line.split(':');
          if (line.includes(':')) {
            const indentation = line.match(/^ +/)
            line = `${indentation}${title(key.trim())}: ${value}`
          }
          line = line.replace(/^ {4}/, '')

          ns.tprint(line);
        });
}