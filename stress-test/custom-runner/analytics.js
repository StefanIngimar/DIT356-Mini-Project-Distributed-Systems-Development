export function calculateMedian(array) {
    if (array.length === 0) {
        return 0;
    }

    const sorted = array.sort((a, b) => a - b);

    const isArrayOdd = sorted.length % 2 === 0;
    const middleElementIdx = Math.floor(sorted.length / 2);
    if (isArrayOdd) {
        return sorted[middleElementIdx];
    }

    return (sorted[middleElementIdx - 1] + sorted[middleElementIdx]) / 2;
}
