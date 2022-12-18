interface AcceptedArg {
  fullKeyword: string;
  shortKeyword: string;
  type: string;
  description: string;
}

const getArgHelp = (acceptedArgs: AcceptedArg[]) => {
  let parsedArgs = acceptedArgs.map((acceptedArg) => {
    const fullKeyword = acceptedArg.fullKeyword;
    const shortKeyword = acceptedArg.shortKeyword;
    const type = acceptedArg.type;
    const description = acceptedArg.description;

    const title = fullKeyword.toUpperCase().replace('-', ' ')
    const exampleText = type !== 'flag' ? `<${type}>` : ''

    return `
${title}
  Usage:
      --${fullKeyword} ${exampleText}
      -${shortKeyword} ${exampleText}
  Type:
      <${type}>
  Description:
      ${description}`
  })

  return parsedArgs.join('')
}

export type { AcceptedArg };

export default getArgHelp;