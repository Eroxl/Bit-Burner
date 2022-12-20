import { NS } from '../NetscriptDefinitions';

export async function main(ns: NS) {
  await ns.grow(ns.args[0].toString())
}
