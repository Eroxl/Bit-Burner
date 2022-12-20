import { PortTypes } from './constants';
import type { NS } from '../NetscriptDefinitions';
import type { BotNetCommand } from './types/Bot';

import MessageWatcher from './MessageWatcher';

/**
 * Verifies that the message is for this bot.
 * @param message The message to verify.
 * @param ns The Netscript API.
 * @returns Whether or not the message is for this bot.
 */
const verifyMessageDestination = (message: BotNetCommand, ns: NS) => {
  // ~ Check for the UUID in the message.
  const uuid = message.uuids.filter((bot) => bot.uuid === ns.getHostname())

  // ~ If the UUID is not found, return undefined.
  if (!uuid.length) return undefined;

  // ~ Return the UUID.
  return uuid[0];
}

/**
 * Kills the bot.
 * @param message The message to verify.
 * @param ns The Netscript API.
 */
const kill = (message: BotNetCommand, ns: NS) => {
  // ~ Check if the message is for this bot.
  if (!verifyMessageDestination(message, ns)) return;

  // ~ Kill the bot.
  ns.exit();
}

/**
 * Runs the appropriate command.
 * @param message The message to verify.
 * @param ns The Netscript API.
 */
const actions = (message: BotNetCommand, ns: NS) => {
  // ~ Check if the message is for this bot.
  const uuid = verifyMessageDestination(message, ns)

  // ~ Check for the UUID.
  if (!uuid) return;

  // ~ Check for a target.
  if (message.payload.target === undefined) {
    ns.writePort(PortTypes.ERRORS, JSON.stringify({
      type: 'missing-target',
      payload: {
        command: message.type,
        uuid: uuid.uuid,
      },
    }))
    return;
  }

  // ~ Check the message type and run the appropriate script.
  switch (message.type) {
    case 'hack':
      ns.run(
        'runners/hack.js',
        uuid.threads || 1,
        message.payload.target,
      )
      break;
    case 'grow':
      ns.run(
        'runners/grow.js',
        uuid.threads || 1,
        message.payload.target,
      )
      break;
    case 'weaken':
      ns.run(
        'runners/weaken.js',
        uuid.threads || 1,
        message.payload.target,
      )
      break;
    default:
      ns.writePort(PortTypes.ERRORS, JSON.stringify({
        type: 'unknown-command',
        payload: {
          command: message.type,
          uuid: uuid.uuid,
        },
      }))
  }
}

/**
 * Main function for the bot. Watches for messages and runs the appropriate scripts as well as waiting for the kill message.
 * @param ns The Netscript API.
 */
export async function main(ns: NS) {
  // -=- Watchers -=-
  // ~ Watcher for running scripts
  const actionPortWatcher = new MessageWatcher(
    ns.getPortHandle(PortTypes.ACTION),
    ns
  );

  // ~ Watcher for stopping the bot
  const killPortWatcher = new MessageWatcher(
    ns.getPortHandle(PortTypes.KILL),
    ns
  );

  // -=- Subscribe -=-
  actionPortWatcher.subscribe(actions);
  killPortWatcher.subscribe(kill);

  // -=- Wait Forever -=-
  await new Promise(() => {});
}
