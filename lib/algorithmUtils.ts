/**
 * Binary Search Algorithm
 * Efficiently finds an item in a sorted array in O(log N) time.
 * 
 * @param array Sorted array of items
 * @param key The property to compare (e.g., 'bookId')
 * @param target The value we are searching for
 * @returns The item if found, null otherwise
 */
export function binarySearch<T>(array: T[], key: keyof T, target: any): T | null {
  let left = 0;
  let right = array.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = array[mid][key];

    if (midValue === target) {
      return array[mid];
    } else if (midValue < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return null;
}

/**
 * Ensures an array is sorted by a specific key before performing binary search.
 */
export function sortAndSearch<T>(array: T[], key: keyof T, target: any): T | null {
  const sorted = [...array].sort((a, b) => {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  });
  return binarySearch(sorted, key, target);
}
