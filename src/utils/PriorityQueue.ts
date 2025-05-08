export class PriorityQueue<T> {
    private queue: T[] = [];
    private comparator: (e1: T, e2: T) => number;
    constructor(initial: T[], comparator: (e1: T, e2: T) => number) {
        this.queue = initial;
        this.comparator = comparator;
    }
    top() {
        if (this.queue.length === 0) {
            throw new Error("no element");
        }
        return this.queue[0];
    }
    pop() {
        if (this.queue.length === 0) {
            throw new Error("no element");
        }
        const res = this.queue[0];
        this.queue.shift();
        return res;
    }
    push(...elem: T[]) {
        this.queue.push(...elem);
        this.queue.sort(this.comparator);
    }
    length() {
        return this.queue.length;
    }
    getInternalArray() {
        return this.queue;
    }
}
