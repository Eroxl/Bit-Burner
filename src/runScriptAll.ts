import type { NS } from './NetscriptDefinitions';
import type { KArgs } from './helpers/argParser';
import type { AcceptedArg } from './helpers/getArgHelp';

import rootComputer from './helpers/rootComputer';
import recursiveScan from './helpers/recursiveScan';
import argParser from './helpers/argParser';

const acceptedKArgs: AcceptedArg[] = [
    {
        fullKeyword: 'max-depth',
        shortKeyword: 'd',
        type: 'number',
        required: false,
        default: 1,
        description: 'The max depth to search for new computers (recommended to be between 1 and 10).',
    },
    {
        fullKeyword: 'file',
        shortKeyword: 'f',
        type: 'string',
        required: true,
        description: 'The file you want to be run on all found computers.',
    },
    {
        fullKeyword: 'restart-scripts',
        shortKeyword: 'r',
        type: 'flag',
        description: 'Whether or not to restart scripts if they are already running on the found computer.',
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
    const maxDepth = kargs['max-depth'] as number;
    const verbose = kargs['verbose'] as boolean;
    const file = kargs['file'] as string;
    const restartScript = kargs['restart-scripts'] as boolean;
    
    const normalTPrint = ns.tprint;

    if (verbose) {
        ns.tprint = ns.print
    }

    let connectedDevices = recursiveScan(ns, +maxDepth);

    if (typeof connectedDevices === 'string') {
        ns.tprint('WARNING: No computers found.');
        return;
    }

    const duplicateConnectedDevices: { [key: string]: boolean } = {
        home: true
    }
    connectedDevices = connectedDevices.filter((device) => {
        if (duplicateConnectedDevices[device] !== undefined) return false;
        
        duplicateConnectedDevices[device] = true;
        return true;
    });

    connectedDevices.forEach((uuid) => {
        // ~ Check if the server is hackable
        if (ns.getServerRequiredHackingLevel(uuid) > ns.getPlayer().skills.hacking) return;

        // ~ Check if connected devices have been hacked yet
        if (!rootComputer(ns, uuid)) return;

        // ~ Kill the script if it is already running
        const isScriptRunning = ns.scriptRunning(file, uuid);
        if (isScriptRunning && restartScript) {
            ns.kill(file, uuid)
        }

        // ~ Check if the script is already running
        if (isScriptRunning && !restartScript) return;

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
                `INFO: Started ${file} on ${uuid} with ${usableThreads} threads`
            )
            return;
        }
        ns.tprint(
            `ERROR: starting ${file} on ${uuid} with ${usableThreads} threads`
        )
    });

    ns.tprint('INFO: Finished running script on all computers.');

    if (verbose) {
        ns.tprint = normalTPrint
    }
}

// -=- Run On Script Startup -=-
export async function main(ns: NS) {
    const args = arguments[0]['args'];

    argParser(ns, args, acceptedKArgs, program)
}