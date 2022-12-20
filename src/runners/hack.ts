import { NS } from '../NetscriptDefinitions';

export async function main(ns: NS) {
  await ns.hack(ns.args[0].toString())
}
