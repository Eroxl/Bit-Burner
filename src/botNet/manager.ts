import type { NS, NetscriptPort } from 'NetscriptDefinitions';
import type { Bot, BotNetCommand } from 'botNet/types/Bot';

import { PortTypes } from './constants'
import { Hack, Grow, Weaken } from './types/Commands';
import AbstractAlgorithm from './algorithms/AbstractAlgorithm';

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
  beaconPort: NetscriptPort;
  killPort: NetscriptPort;

  // -=- Beacon Pings -=-
  beaconInterval: number;

  // -=- Algorithm -=-
  algorithmInterval: number = -1;
  algorithm?: AbstractAlgorithm;

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

    // -=- Ports -=-
    this.commandPort = ns.getPortHandle(PortTypes.ACTION);
    this.errorPort = ns.getPortHandle(PortTypes.ERRORS);
    this.beaconPort = ns.getPortHandle(PortTypes.BEACON);
    this.killPort = ns.getPortHandle(PortTypes.KILL);

    // -=- Setup Bot Net -=-
    this.beaconPort.clear();
    this.beaconPort.write(Date.now());

    // ~ Send new beacon pings every 5 seconds
    this.beaconInterval = setInterval(this._send_beacon_ping, 5000);

    // ~ Clear kill port
    this.ns.clearPort(PortTypes.KILL);
  }

  // -=- Beacon Pings -=-
  /**
   * Send a beacon ping to the botNet.
   */
  _send_beacon_ping() {
    this.beaconPort.clear();
    this.beaconPort.write(Date.now());
  }

  // -=- Bot Management -=-
  /**
   * Adds a bot to the botNet.
   * @param bot - The bot to add.
   */
  addBot(bot: string) {
    this.botUUIDs.push(bot);

    if (this.algorithm) {
      this.algorithm.addTarget(bot);
    }
  }

  /**
   * Removes a bot from the botNet.
   * @param bot - The bot to remove.
   */
  removeBot(bot: string) {
    this.botUUIDs = this.botUUIDs.filter((uuid) => uuid !== bot);

    if (this.algorithm) {
      this.algorithm.removeTarget(bot);
    }
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

    if (!success) {
      this.ns.print(`ERROR: Failed to dispatch command to botNet: ${command.type}.`)
    } else {
      this.ns.print(`INFO: Dispatched command to botNet: ${command.type}.`)
    }
  }

  /**
   * Dispatches a kill command to the botNet.
   * @param bots - Optional array of bots to kill. If not provided, all bots in the bot net will be killed.
   */
  _kill(bots?: string[]) {
    if (!bots) bots = this.botUUIDs
    
    this.killPort.clear()

    const success = this.killPort.write(JSON.stringify({
      uuids: bots,
    }));

    if (!success) {
      this.ns.print('ERROR: Failed to dispatch command to botNet.')
    } else {
      this.ns.print(`INFO: Killed ${bots.length} bots.`)
    }
  }

  // -=- Main Actions -=-
  /**
   * Dispatch the command to hack a device using the botnet.
   * @param uuid - UUID of the target of the hack command
   * @param bots - Array of bots to hack with
   */
  private _hack(uuid: string, bots: Bot[]) {
    this._dispatchCommand({
      type: 'hack',
      payload: {
        target: uuid,
      },
      uuids: bots,
    })

    // ~ Wait for hack request to be fulfilled
    while (this.ns.getPortHandle(PortTypes.ACTION).empty) {
      this.ns.sleep(100)
    }
  }

  /**
   * Dispatch the command to grow a device using the botnet.
   * @param uuid - UUID of the target of the grow command
   * @param bots - Array of bots to grow with
   */
  private _grow(uuid: string, bots: Bot[]) {
    this._dispatchCommand({
      type: 'grow',
      payload: {
        target: uuid,
      },
      uuids: bots,
    })

    // ~ Wait for hack request to be fulfilled
    while (this.ns.getPortHandle(PortTypes.ACTION).empty) {
      this.ns.sleep(100)
    }
  }

  /**
   * Dispatch the command to weaken a device using the botnet.
   * @param uuid - UUID of the target of the weaken command
   * @param bots - Array of bots to weaken with
   */
  private _weaken(uuid: string, bots: Bot[]) {
    this._dispatchCommand({
      type: 'weaken',
      payload: {
        target: uuid,
      },
      uuids: bots,
    })

    // ~ Wait for hack request to be fulfilled
    while (this.ns.getPortHandle(PortTypes.ACTION).empty) {
      this.ns.sleep(100)
    }
  }

  // -=- Main Function -=-
  /** 
   * Start the botnet with a given algorithm
   * @param algorithmType - The algorithm to run the botnet with
  */
  public start<A extends AbstractAlgorithm>(
    // TODO:EROXL: (2022-12-18) Hack to make this work, would be nice to fix in the future.
    algorithmType: new (ns: NS, hack: Hack, grow: Grow, weaken: Weaken, targets: string[]) => A,
    targets: string[]
  ) {
    const algorithm = new algorithmType(
      this.ns,
      this._hack,
      this._grow,
      this._weaken,
      targets,
    );

    this.algorithm = algorithm;

    this.algorithmInterval = setInterval(algorithm.runAction, 1000);
  }

  // -=- Clean Up -=-
  /**
   * Stop the botnet
   */
  public stop() {
    // ~ Stop sending beacon pings
    clearInterval(this.beaconInterval);

    // ~ Stop running the algorithm if it's running
    if (this.algorithmInterval !== -1)  clearInterval(this.algorithmInterval);

    // ~ Kill all bots on the network
    this._kill()
  }
}

export default Manager;
