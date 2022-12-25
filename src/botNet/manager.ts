import type { NS, NetscriptPort } from '../NetscriptDefinitions';
import type { Bot, BotNetCommand } from './types/Bot';

import { PortTypes } from './constants';

/**
 * @class
 * @classdesc Manager class for the botNet. Dispatches the botNet's commands and runs the botNet's main program.
 */
class Manager {
  // -=- Properties -=-
  botUUIDs: string[];
  ns: NS;

  // -=- Ports -=-
  commandPort: NetscriptPort;
  errorPort: NetscriptPort;
  killPort: NetscriptPort;

  // -=- Constructor -=-
  /**
   * Creates a new botNet manager.
   * @constructor
   * @param botUUIDs - The UUIDs of the bots in the botNet.
   * @param ns - The Netscript API.
   * @returns A new botNet manager.
   * 
   * @example
   * const botUUIDs = ['uuid-1', 'uuid-2'];
   * const botNetManager = new Manager(botUUIDs, ns);
   * botNetManager.addBot('uuid-3');
   * botNetManager.removeBot('uuid-2');
   * botNetManager.start(algorithm);
   */
  constructor(botUUIDs: string[], ns: NS) {
    // -=- Properties -=-
    this.botUUIDs = botUUIDs;
    this.ns = ns;

    this.botUUIDs.forEach((uuid) => {
      this.ns.scp([
        '/botNet/bot.js',
        '/botNet/MessageWatcher.js',
        '/botNet/constants.js',
        '/runners/hack.js',
        '/runners/grow.js',
        '/runners/weaken.js',
        '/runners/share.js',
      ], uuid);

      this.ns.exec('/botNet/bot.js', uuid, 1)
    })

    // -=- Ports -=-
    this.commandPort = ns.getPortHandle(PortTypes.ACTION);
    this.errorPort = ns.getPortHandle(PortTypes.ERRORS);
    this.killPort = ns.getPortHandle(PortTypes.KILL);

    // ~ Clear kill port
    this.ns.clearPort(PortTypes.KILL);
  }

  // -=- Bot Management -=-
  /**
   * Adds a bot to the botNet.
   * @param bot - The bot to add.
   */
  addBot(bot: string) {
    this.botUUIDs.push(bot);

    // -=- Add the scripts to the bot -=-
    this.ns.scp([
      '/botNet/bot.js',
      '/botNet/MessageWatcher.js',
      '/botNet/constants.js',
      '/runners/hack.js',
      '/runners/grow.js',
      '/runners/weaken.js',
    ], bot);

    this.ns.exec('/botNet/bot.js', bot, 1)
  }

  /**
   * Removes a bot from the botNet.
   * @param bot - The bot to remove.
   */
  removeBot(bot: string) {
    this.botUUIDs = this.botUUIDs.filter((uuid) => uuid !== bot);
  }

  // -=- Command Dispatching -=-
  /**
   * Dispatches a command to the botNet.
   * @param command - The command to dispatch.
   */
  _dispatchCommand(command: BotNetCommand) {
    const success = this.commandPort.tryWrite(JSON.stringify({
      type: command.type,
      payload: command.payload,
      uuids: command.uuids,
    }));
  }

  /**
   * Dispatches a kill command to the botNet.
   * @param bots - Optional array of bots to kill. If not provided, all bots in the bot net will be killed.
   */
  kill(bots?: string[]) {
    if (!bots) bots = this.botUUIDs
    
    this.killPort.clear()

    const success = this.killPort.write(JSON.stringify({
      uuids: bots,
    }));
  }

  // -=- Main Actions -=-
  /**
   * Dispatch the command to hack a device using the botnet.
   * @param uuid - UUID of the target of the hack command
   * @param bots - Array of bots to hack with
   */
  async hack(uuid: string, bots: Bot[]) {
    this._dispatchCommand({
      type: 'hack',
      payload: {
        target: uuid,
      },
      uuids: bots,
    })

    // ~ Wait for hack request to be fulfilled
    while (this.commandPort.empty()) {
      await this.ns.sleep(100)
    }
  }

  /**
   * Dispatch the command to grow a device using the botnet.
   * @param uuid - UUID of the target of the grow command
   * @param bots - Array of bots to grow with
   */
  async grow(uuid: string, bots: Bot[]) {
    this._dispatchCommand({
      type: 'grow',
      payload: {
        target: uuid,
      },
      uuids: bots,
    })

    // ~ Wait for hack request to be fulfilled
    while (this.commandPort.empty()) {
      await this.ns.sleep(100)
    }
  }

  /**
   * Dispatch the command to weaken a device using the botnet.
   * @param uuid - UUID of the target of the weaken command
   * @param bots - Array of bots to weaken with
   */
  async weaken(uuid: string, bots: Bot[]) {
    this._dispatchCommand({
      type: 'weaken',
      payload: {
        target: uuid,
      },
      uuids: bots,
    })

    // ~ Wait for hack request to be fulfilled
    while (this.commandPort.empty()) {
      await this.ns.sleep(100)
    }
  }

  /**
   * Dispatch the command to share a devices RAM with a faction
   * @param bots - Array of bots to share
   */
  async share(bots: Bot[]) {
    this._dispatchCommand({
      type: 'share',
      payload: {
        target: 'none'
      },
      uuids: bots,
    })

    // ~ Wait for hack request to be fulfilled
    while (this.commandPort.empty()) {
      await this.ns.sleep(100)
    }
  }
}

export default Manager;
