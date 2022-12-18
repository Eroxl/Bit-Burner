import type { NS } from '../NetscriptDefinitions';
import type { KArgs } from '../helpers/argParser';
import type { AcceptedArg } from '../helpers/getArgHelp';

import argParser from '../helpers/argParser';

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
    const normalTPrint = ns.tprint;
    if (verbose) {
        // ~ Print out information to the logs instead of the terminal
        ns.tprint = ns.print
    }

    // -=- Main Code -=-
    

    // -=- Unmuting Terminal Output -=-
    if (verbose) {
        ns.tprint = normalTPrint
    }
}

// -=- Run On Script Startup -=-
export async function main(ns: NS) {
    const args = arguments[0]['args'];

    argParser(ns, args, acceptedKArgs, program)
}
