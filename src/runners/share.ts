import { NS } from '../NetscriptDefinitions';

export async function main(ns: NS) {
  await ns.share()

  while (true) {
    await ns.sleep(1000)
  }
}
