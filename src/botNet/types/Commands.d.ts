// ~ Type Definitions for the Algorithm class
import { Bot } from 'botNet/types/Bot';
import { NS } from 'NetscriptDefinitions';

/**
 * Dispatch the command to hack a device using the botnet.
 * @param uuid - UUID of the target of the hack command
 * @param bots - Array of bots to hack with
 */
export type Hack = (uuid: string, bots: Bot[]) => Promise<void>;

/**
 * Dispatch the command to grow a device using the botnet.
 * @param uuid - UUID of the target of the grow command
 * @param bots - Array of bots to grow with
 */
export type Grow = Hack;

/**
 * Dispatch the command to weaken a device using the botnet.
 * @param uuid - UUID of the target of the weaken command
 * @param bots - Array of bots to weaken with
 */
export type Weaken = Hack;
