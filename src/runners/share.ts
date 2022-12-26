import { NS } from '../NetscriptDefinitions';

export async function main(ns: NS) {
  while (true) {
    await ns.share()
  }
}
