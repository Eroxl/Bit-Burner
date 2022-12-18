import { NS } from '../NetscriptDefinitions';

/**
 * Recursively scans for all connected devices up to `maxDepth` using `ns.scan()`.
 */
const recursiveScan = (ns: NS, maxDepth: number) => {  
  const foundDevices: { [key: string]: boolean } = {};

  const scan = (uuid: string, currDepth: number) => {
      foundDevices[uuid] = true;

      if (currDepth >= maxDepth) return uuid;

      let connectedDevices = ns.scan(uuid).filter((deviceUUID: string) => {
          return foundDevices[deviceUUID] === undefined
      });

      connectedDevices = connectedDevices.flatMap((deviceUUID) => {
          return scan(deviceUUID, currDepth + 1);
      })

      if (uuid !== '') {
          connectedDevices.push(uuid);
      }

      return connectedDevices;
  }

  const foundDevicesArray = scan('', 0);
  
  if (typeof foundDevicesArray === 'string') {
      ns.print('ERROR No computers found.');
      return [];
  }

  return foundDevicesArray;
};

export default recursiveScan;
