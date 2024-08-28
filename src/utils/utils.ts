export function maximize<T>(elements: Iterable<T>, valueFunction: (element: T) => number, disambiguation?: (elements: T[]) => T) : T {
    let max: T[] = [];
    let maxValue = Number.NEGATIVE_INFINITY;
    for(const element of elements) {
        const value = valueFunction(element);
        if(value > maxValue) {
            max = [element];
        }
        else if(value == maxValue) {
            max.push(element);
        }
    }

    return (disambiguation ?? (a => a[~~(Math.random() * a.length)]))(max);
}

export function chooseRandomWeighted<T>(values: T[], weights: number[]) : T {
    const runningTotal = [0];
    for(const i of weights) {
        runningTotal.push(i + runningTotal[runningTotal.length - 1]);
    }
    const rand = Math.random() * runningTotal[runningTotal.length - 1];
    for(let i = 0; i < values.length; i++) {
        if(rand < runningTotal[i + 1]) {
            return values[i];
        }
    }
    return values[values.length - 1];
}