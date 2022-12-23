import type { NetscriptPort, NS } from '../NetscriptDefinitions';
import type { BotNetCommand } from './types/Bot';

type Watcher = (message: BotNetCommand, ns: NS) => void;

class MessageWatcher {
  private _watchers: Watcher[];
  private _port: NetscriptPort;
  private _watcherInterval: NodeJS.Timer;
  private _ns: NS;

  constructor(port: NetscriptPort, ns: NS) {
    this._watchers = [];
    this._port = port;
    this._ns = ns;

    // ~ Check for new messages every 100ms (10 times a second)
    this._watcherInterval = setInterval(() => {
      // ~ If the port is empty, return
      if (this._port.empty()) return;

      // ~ Get the port data without consuming it
      const portString = this._port.peek();
  
      // ~ If the port data is not a string, return
      if (typeof portString === 'number') return;

      const portData = JSON.parse(portString);
      
      this._watchers.forEach((watcher) => watcher(portData, this._ns));

      // ~ Consume the port data
      const consumedData = JSON.parse(this._port.read() as string);
      
      const hostName = this._ns.getHostname();

      // ~ Remove the devices uuid from the message
      consumedData.uuids = consumedData.uuids.filter((bot: {uuid: string, threads: number}) => (bot.uuid !== hostName && bot.threads !== 0));

      if (consumedData.uuids.length === 0) return;

      // ~ Write the new message to the port
      this._port.write(JSON.stringify(consumedData));
    }, 100)
  }

  subscribe(watcher: Watcher) {
    this._watchers.push(watcher);
  }

  unsubscribe(watcher: Watcher) {
    this._watchers = this._watchers.filter((w) => w !== watcher);
  }

  stop() {
    clearInterval(this._watcherInterval);
  }
}

export default MessageWatcher;
