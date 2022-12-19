import type { NS } from './NetscriptDefinitions.js';

export async function main(ns: NS) {
  const files = ns.ls('home');
  const fileMap: { [key: string]: any } = {};

  files.forEach((file) => {
    const path = file.split('/');
    const fileName = path.pop();

    if (!fileName) return;

    if (path.length === 0) {
      fileMap[fileName] = file;
      return;
    }

    path.shift()

    // ~ Create the path map
    const pathMap: { [key: string]: any } = {};
    let currPathMap = pathMap;

    path.forEach((dir) => {
      currPathMap[dir] = {};
      currPathMap = currPathMap[dir];
    });

    currPathMap[fileName] = fileName;
    
    // ~ Merge the path map into the file map
    const merge = (fileMap: { [key: string]: any }, pathMap: { [key: string]: any }) => {
      Object.keys(pathMap).forEach((key) => {
        const value = pathMap[key];

        if (fileMap[key] === undefined) {
          fileMap[key] = value;
        } else {
          merge(fileMap[key], value);
        }
      });
    }

    merge(fileMap, pathMap);
  })

  const printTree = (fileMap: { [key: string]: any }, depth: number) => {
    const keys = Object.keys(fileMap);

    keys.forEach((key, index) => {
      const value = fileMap[key];

      if (typeof value === 'string') {
        const colour = (value.endsWith('.script') || value.endsWith('.js')) ? '\u001b[33m' : '\u001b[32m';

        if (index === keys.length - 1) {
          ns.tprint(`\x1b[37m${'┃ '.repeat(depth)}┗━━ ${colour}${key}\u001b[0m`);
        } else {
          ns.tprint(`\x1b[37m${'┃ '.repeat(depth)}┣━━ ${colour}${key}\u001b[0m`);
        }
      } else {
        if (index === keys.length - 1) {
          ns.tprint(`\x1b[37m${'┃ '.repeat(depth)}┗━┳━ \u001b[36m${key}\u001b[0m`);
        } else  {
          ns.tprint(`\x1b[37m${'┃ '.repeat(depth)}┣━┳━ \u001b[36m${key}\u001b[0m`);
        }
        
        printTree(value, depth + 1);
      }
    });
  }

  printTree(fileMap, 0);
}