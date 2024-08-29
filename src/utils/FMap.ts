export class FMap<T, K, V> implements Map<K, V> {
    private readonly map: Map<T, [K, V]>;
    private readonly f: (key: K) => T;

    constructor(func: (key: K) => T, entries?: Iterable<[K, V]>) {
        this.f = func;
        this.map = new Map(
            [...(entries ?? [])].map(([k, v]) => [func(k), [k, v]])
        );
    }

    [Symbol.toStringTag] = 'FMap'

    get size(): number {
        return this.map.size;
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }

    clear(): void {
        this.map.clear();
    }

    delete(key: K): boolean {
        return this.map.delete(this.f(key));
    }

    entries(): IterableIterator<[K, V]> {
        return this.map.values();
    }

    forEach(callback: (value: V, key: K, map: this) => void, thisArg?: any): void {
        [...this.entries()].forEach(([k, v]) => {
            callback.call(thisArg, v, k, this);
        });
    }

    get(key: K): V | undefined {
        return this.map.get(this.f(key))?.[1];
    }

    set(key: K, value: V): this {
        this.map.set(this.f(key), [key, value]);
        return this;
    }

    has(key: K): boolean {
        return this.map.has(this.f(key));
    }

    keys(): IterableIterator<K> {
        return [...this.map.values()].map(i => i[0])[Symbol.iterator]();
    }

    values(): IterableIterator<V> {
        return [...this.map.values()].map(i => i[1])[Symbol.iterator]();
    }
}

export class FSet<T, V> implements Set<V> {
    private readonly map: FMap<T, V, void>;

    constructor(func: (key: V) => T, entries: Iterable<V> = []) {
        this.map = new FMap(func, [...entries].map(i => [i, undefined]));
    }

    [Symbol.toStringTag] = 'FSet'

    get size(): number {
        return this.map.size;
    }

    [Symbol.iterator](): IterableIterator<V> {
        return this.map.keys();
    }

    clear(): void {
        this.map.clear();
    }

    add(value: V): this {
        this.map.set(value, undefined);
        return this;
    }

    delete(value: V): boolean {
        return this.map.delete(value);
    }

    entries(): IterableIterator<[V, V]> {
        return [...this.map.keys()].map(i => [i, i] as [V, V])[Symbol.iterator]();
    }

    forEach(callback: (value: V, value2: V, set: FSet<T, V>) => void, thisArg: any): void {
        this.map.forEach((_, value) => {
            callback.call(thisArg, value, value, this);
        });
    }

    has(value: V): boolean {
        return this.map.has(value);
    }

    keys(): IterableIterator<V> {
        return this.map.keys();
    }

    values(): IterableIterator<V> {
        return this.map.keys();
    }

    union<U>(_other: ReadonlySetLike<U>): Set<V | U> {
        throw new Error("Union operation not implemented for FSet");
    }

    intersection<U>(_other: ReadonlySetLike<U>): Set<V & U> {
        throw new Error("Intersection operation not implemented for FSet");
    }

    difference<U>(_other: ReadonlySetLike<U>): Set<V> {
        throw new Error("Difference operation not implemented for FSet");
    }

    isDisjointFrom(_other: ReadonlySetLike<unknown>): boolean {
        throw new Error("IsDisjointFrom operation not implemented for FSet");
    }

    isSubsetOf(_other: ReadonlySetLike<unknown>): boolean {
        throw new Error("SubsetOf operation not implemented for FSet");
    }

    isSupersetOf(_other: ReadonlySetLike<unknown>): boolean {
        throw new Error("SupersetOf operation not implemented for FSet");
    }

    symmetricDifference<U>(_other: ReadonlySetLike<U>): Set<V | U> {
        throw new Error("Symmetric difference operation not implemented for FSet");
    }
}

export class SMap<K, V> extends FMap<string, K, V> {
    constructor(entries: Iterable<[K, V]> = []) {
        super(i => (i as { toString(): string }).toString(), entries);
    }
}

export class SSet<V> extends FSet<string, V> {
    constructor(entries: Iterable<V> = []) {
        super(i => (i as { toString(): string }).toString(), entries);
    }
}