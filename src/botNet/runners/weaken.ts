import { NS } from '../../NetscriptDefinitions';

export async function main(ns: NS) {
  ns.weaken(ns.args[0].toString())
}
