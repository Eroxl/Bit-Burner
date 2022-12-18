import type { NS } from './NetscriptDefinitions';
import getArgHelp from './helpers/getArgHelp';
import parseKArgs from './helpers/parseKArgs';

const acceptedKArgs = [
    {
        fullKeyword: 'max-depth',
        shortKeyword: 'd',
        type: 'number',
        description: 'The max depth to search for new computers (recommended to be between 1 and 10).',
    },
    {
        fullKeyword: 'file',
        shortKeyword: 'f',
        type: 'string',
        description: 'The file you want to be run on all found computers.',
    },
    {
        fullKeyword: 'restart-scripts',
        shortKeyword: 'r',
        type: 'flag',
        description: 'Whether or not to restart scripts if they are already running on the found computer.',
    },
    {
        fullKeyword: 'help',
        shortKeyword: 'h',
        type: 'flag',
        description: 'Displays a help menu when set to true.'
    }
]

export function autocomplete(data: { flags: (arg0: string[][]) => void; }, args: string[]) {
    data.flags(
        acceptedKArgs.flatMap(
            (karg) => [karg.fullKeyword, karg.shortKeyword]
        ).map((karg) => [karg, '']),
    );

    return [];
}

export async function main(ns: NS) {
    const args = arguments[0]['args'];

    if (args.includes('--help') || args.includes('-h')) {
        ns.tprint(
            getArgHelp(acceptedKArgs)
        )
        return;
    }

    const kargs = parseKArgs(
        args,
        acceptedKArgs,
    );

    const recursiveScan = (maxDepth: number) => {  
        const foundDevices: { [key: string]: boolean } = {};

        const scan = (uuid: string, currDepth: number) => {
            foundDevices[uuid] = true;

            if (currDepth >= maxDepth) return uuid;

            let connectedDevices = ns.scan(uuid).filter((deviceUUID) => {
                return foundDevices[deviceUUID] === undefined
            });

            connectedDevices = connectedDevices.flatMap((deviceUUID) => {
                return scan(deviceUUID, currDepth + 1);
            })

            if (uuid !== '') {
                connectedDevices.push(uuid);
            }

            return connectedDevices;
        }

        return scan('', 0);
    };

    const maxDepth = kargs['max-depth'] || 1

    let connectedDevices = recursiveScan(+maxDepth);

    if (typeof connectedDevices === 'string') {
        ns.tprint('No computers found.');
        return;
    }

    const file = kargs['file']

    const restartScript = kargs['restart-scripts'] || false;

    const pwnComputer = (uuid: string) => {
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
                ns.tprint(`Unable to hack ${uuid}; research on ${portOpener.fileName} required`)
                return false;
            } 

            portOpener.hackFunc(uuid);
        } 

        ns.nuke(uuid);
        return true;
    }

    const duplicateConnectedDevices: { [key: string]: boolean } = {
        home: true
    }
    connectedDevices = connectedDevices.filter((device) => {
        if (duplicateConnectedDevices[device] !== undefined) return false;
        
        duplicateConnectedDevices[device] = true;
        return true;
    });

    for (let i = 0; i < connectedDevices.length; i++) {
        const uuid = connectedDevices[i];

        if (ns.getServerRequiredHackingLevel(uuid) <= ns.getPlayer().skills.hacking) {
            // ~ Check if connected devices have been hacked yet
            if (pwnComputer(uuid)) {
                const isScriptRunning = ns.scriptRunning(file, uuid);

                if (isScriptRunning && restartScript) {
                    ns.kill(file, uuid)
                }

                if (!isScriptRunning || restartScript === true) {
                    // ~ Get max threads script can use
                    const availableMemory = ns.getServerMaxRam(uuid) - ns.getServerUsedRam(uuid);
                    
                    const usableThreads = Math.floor(availableMemory / ns.getScriptRam(file))
                
                
                    // ~ Copy the script
                    ns.scp(
                        file,
                        uuid,
                    )

                    // ~ Run the script
                    const status = ns.exec(
                        file,
                        uuid,
                        usableThreads === 0 ? 1 : usableThreads,
                    );

                    if (status !== 0) {
                        ns.tprint(
                            `Started ${file} on ${uuid} with ${usableThreads} threads`
                        )
                    } else {
                        ns.tprint(
                            `Error starting ${file} on ${uuid} with ${usableThreads} threads`
                        )
                    }
                }
            }
        }
    }
}
