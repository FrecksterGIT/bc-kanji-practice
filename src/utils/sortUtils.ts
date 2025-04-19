/**
 * Utility functions for sorting items by date
 */

/**
 * Compares two dates for sorting purposes
 * @param dateA The first date to compare
 * @param dateB The second date to compare
 * @returns -1 if dateA comes before dateB, 1 if dateA comes after dateB, 0 if they are equal or neither exists
 */
export function compareDates(dateA: Date | null | undefined, dateB: Date | null | undefined): number {
    // If both dates exist, compare them
    if (dateA && dateB) {
        return dateA.getTime() - dateB.getTime();
    }

    // If only one date exists, put the one with a date first
    if (dateA) return -1;
    if (dateB) return 1;

    // If neither has a date, maintain original order
    return 0;
}

/**
 * Creates a sort function for items with IDs that can be mapped to dates
 * @param datesMap A Map that maps item IDs to dates
 * @returns A sort function that can be used with Array.sort()
 */
export function createDateSortFunction<T extends { id: number }>(
    datesMap: Map<number, Date | null | undefined>
): (a: T, b: T) => number {
    return (a: T, b: T) => {
        const dateA = datesMap.get(a.id);
        const dateB = datesMap.get(b.id);
        return compareDates(dateA, dateB);
    };
}
