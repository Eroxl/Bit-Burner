/**
 * Formats a storage size in megabytes to a human readable string
 * @param size Size in megabytes
 * @returns Formatted size
 */
const formatStorageSize = (size: number) => {
  const units = ['MB', 'GB', 'TB', 'PB'];
  let unitIndex = 0;
  while (size >= 1024) {
    size /= 1024;
    unitIndex++;
  }
  return `${Math.round(size * 100) / 100} ${units[Math.min(unitIndex, units.length - 1)]}`;
}

export default formatStorageSize;
