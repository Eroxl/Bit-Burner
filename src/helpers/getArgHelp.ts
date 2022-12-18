interface AcceptedArg {
  fullKeyword: string;
  shortKeyword: string;
  type: 'string' | 'number' | 'flag';
  required?: boolean;
  default?: any;
  description: string;
}

const getArgHelp = (acceptedArgs: AcceptedArg[]) => {
  let parsedArgs = acceptedArgs.map((acceptedArg) => {
    const {
      fullKeyword,
      shortKeyword,
      type,
      required,
      default: defaultVal,
      description,
    } = acceptedArg;

    const title = fullKeyword.toUpperCase().replace('-', ' ')
    const exampleText = type !== 'flag' ? `<${type}>` : ''

    return `
${title}
  Usage:
      --${fullKeyword} ${exampleText}
      -${shortKeyword} ${exampleText}
  Type:
      <${type}>
  Required:
      ${(required && type !== 'flag') ? 'Yes' : 'No'}
  Default:
      ${defaultVal ? (type === 'flag' ? 'false' : defaultVal) : 'None'}
  Description:
      ${description}`
  })

  return parsedArgs.join('')
}

export type { AcceptedArg };

export default getArgHelp;