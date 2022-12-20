import type { AcceptedArg } from './getArgHelp';

const parseKArgs = (args: string[], acceptedArgs: AcceptedArg[]) => {
  const kargs: { [key: string]: any } = {};

  const shortformRegex = /^-[\S]+/gm;
  const longformRegex = /^--[\S]+/gm;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    const isShortform = shortformRegex.test(arg);
    const isLongform = longformRegex.test(arg);

    const getAcceptedArgVal = (formattedArg: string) => {
      acceptedArgs.forEach((acceptedArg) => {
          if (
            formattedArg === acceptedArg.shortKeyword
            || formattedArg === acceptedArg.fullKeyword
          ) {
            switch (acceptedArg.type) {
              case 'flag':
                  kargs[acceptedArg.fullKeyword] = true
                  break;
              case 'number':
                  kargs[acceptedArg.fullKeyword] = +args[i+1];
                  break;
              default:
                  kargs[acceptedArg.fullKeyword] = args[i+1];
            }
          }
      })
    }

    if (isShortform && !isLongform) {
      // -=- Short Form Arg -=-
      const formattedArg = arg.substr(1);
      getAcceptedArgVal(formattedArg);
    } else if (isLongform) {
      // -=- Long Form Arg -=-
      const formattedArg = arg.substr(2);
      getAcceptedArgVal(formattedArg);
    }
  }

  return kargs;
}

export type { AcceptedArg };

export default parseKArgs;