export function chooseRandom<T>(values: T[]): T {
    return values[~~(Math.random() * values.length)];
}

export function maximize<T>(elements: Iterable<T>, valueFunction: (element: T) => number, disambiguation?: (elements: T[]) => T): T {
    let max: T[] = [];
    let maxValue = Number.NEGATIVE_INFINITY;
    for (const element of elements) {
        const value = valueFunction(element);
        if (value > maxValue) {
            max = [element];
        }
        else if (value == maxValue) {
            max.push(element);
        }
    }

    return (disambiguation ?? chooseRandom)(max);
}

export function chooseRandomWeighted<T>(values: T[], weights: number[]): T {
    const runningTotal = [0];
    for (const i of weights) {
        runningTotal.push(i + runningTotal[runningTotal.length - 1]);
    }
    const rand = Math.random() * runningTotal[runningTotal.length - 1];
    for (let i = 0; i < values.length; i++) {
        if (rand < runningTotal[i + 1]) {
            return values[i];
        }
    }
    return values[values.length - 1];
}


/**
 * Creates an array with a specified length and fills it with values.
 * @param length The length of the array to be created
 * @param value If this is a function, it will be with each index in the range [0, length) to populate the array.
 *              Otherwise, the array will be filled with this value.
 */
export function createArray<T>(length: number, value: T | ((index: number) => T)): T[] {
    return typeof value == "function"
        ? new Array(length).fill(null).map((_, i) => (value as (index: number) => T)(i))
        : new Array(length).fill(value);
}

export function toArray<T>(iterable: Iterable<T>) {
    return [...iterable];
}