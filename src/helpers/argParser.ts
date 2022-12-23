import type { NS } from '../NetscriptDefinitions';
import type { AcceptedArg } from './getArgHelp';

import getArgHelp from './getArgHelp';
import parseKArgs from './parseKArgs';

interface KArgs {
  [key: string]: string | boolean | number;
}

interface MainFunc {
  (ns: NS, kargs: KArgs): Promise<void>;
}

/**
 * Parses command line arguments and runs the main program. Supports `--help` and `-h` flags.
 */
const argParser = async (ns: NS, args: string[], argSchema: AcceptedArg[], mainFunc: MainFunc) => {
  // -=- Help Flag -=-
  if (args.includes('--help') || args.includes('-h')) {
    ns.tprint(getArgHelp(argSchema));
    return;
  }

  // -=- Key Args -=-
  const kargs = parseKArgs(args, argSchema);

  // -=- Required Args -=-
  const missingArgs = argSchema.filter((arg) => {
    return arg.required && kargs[arg.fullKeyword] === undefined;
  });

  if (missingArgs.length > 0) {
    ns.tprint(`Missing required args: ${missingArgs.map((arg) => arg.fullKeyword).join(', ')}\n`);
    ns.tprint(getArgHelp(argSchema));
    return;
  }

  argSchema.forEach((arg) => {
    if (kargs[arg.fullKeyword] === undefined && arg.default !== undefined) {
      kargs[arg.fullKeyword] = arg.default;
    }
  });

  // -=- Main Program -=-
  await mainFunc(ns, kargs);
};

export type { KArgs, MainFunc };

export default argParser;
