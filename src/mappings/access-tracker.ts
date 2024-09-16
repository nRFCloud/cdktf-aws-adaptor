/**
 * Tracks which properties of an object have been accessed
 * Additionally, supports various operations on the properties
 * Slow, but useful in the context of a build step
 *
 * @internal
 */
export class AccessTracker<T> {
    private accessedProperties: Set<string> = new Set();
    private properties: Set<string> = new Set();

    private obj: T;
    public proxy: T;

    constructor(obj: T) {
        this.obj = JSON.parse(JSON.stringify(obj));
        this.proxy = this.createProxy(obj);
        this.properties = new Set(this.inspectProperties(obj));

        // Lock the object to prevent further modifications
        Object.freeze(this.obj);
    }

    private createProxy(target: T, path: string[] = []): T {
        if (typeof target !== "object" || target === null) {
            throw new Error("Target is not an object");
        }

        return new Proxy(target, {
            get: (obj, prop) => {
                const propPath = [...path, prop.toString()].join(".");
                if (path.length === 0 && !this.properties.has(propPath)) {
                    return;
                }
                this.accessedProperties.add(propPath);
                const value = obj[prop as keyof typeof obj];
                if (value && typeof value === "object") {
                    return this.createProxy(value as T, [...path, prop.toString()]);
                }
                return value;
            },
        });
    }

    private inspectProperties(obj: T, path: string[] = []): string[] {
        const properties = [];
        for (const key in obj) {
            if (obj[key] === undefined) {
                continue;
            }
            const propPath = [...path, key].join(".");
            properties.push(propPath);
            if (obj[key] && typeof obj[key] === "object") {
                properties.push(...this.inspectProperties(obj[key] as T, [...path, key]));
            }
        }
        return properties;
    }

    public isAllPropertiesAccessed(): boolean {
        for (const property of this.properties) {
            if (!this.accessedProperties.has(property)) {
                return false;
            }
        }
        return true;
    }

    public hasProperty(path: string): boolean {
        const pattern = this.pathToReg(path);
        for (const property of this.properties) {
            if (pattern.test(property)) {
                return true;
            }
        }
        return false;
    }

    public matchingProperties(path: string): string[] {
        const pattern = this.pathToReg(path);
        return Array.from(this.properties).filter((property) => pattern.test(property));
    }

    public partiallyClone(paths: string[]): unknown {
        const regExps = paths.map(this.pathToReg);
        const matchingPaths = new Set<string>();
        for (const property of this.properties) {
            for (const regExp of regExps) {
                if (regExp.test(property)) {
                    matchingPaths.add(property);
                }
            }
        }
        return this.partiallyCloneExact(Array.from(matchingPaths));
    }

    public partiallyCloneExact(paths: string[]): unknown {
        // Find all matching paths
        const matchingPaths = paths.filter((path) => this.hasProperty(path));

        // Create a safe intermediary object
        const clonedObj = JSON.parse(JSON.stringify(this.obj));

        // Build a new object with only the matching paths
        const newObj = {};

        function cloneNestedProperty(from: Record<string, unknown>, to: Record<string, unknown>, path: string[]): void {
            const key = Array.isArray(from) ? +path.shift()! : path.shift() as string;

            if (path.length === 0) {
                if (typeof from[key] !== "object") to[key] = from[key];
            } else {
                if (!to[key]) {
                    to[key] = Array.isArray(from[key]) ? [] : {};
                }
                cloneNestedProperty(from[key] as Record<string, unknown>, to[key] as Record<string, unknown>, path);
            }
        }

        for (const path of matchingPaths) {
            cloneNestedProperty(clonedObj, newObj, path.split("."));
        }

        return newObj;
    }

    public clone(): T {
        return this.partiallyCloneExact(Array.from(this.properties)) as T;
    }

    public cloneAccessed(): T {
        return this.partiallyCloneExact(Array.from(this.accessedProperties)) as T;
    }

    public cloneUnaccessed(): T {
        return this.partiallyCloneExact(this.getUnaccessedProperties()) as T;
    }

    /**
     * Removes all properties under the given JSON path from the properties list
     */
    public removePropertiesUnderPath(path: string): void {
        const regExp = this.pathToReg(path);
        for (const property of Array.from(this.properties)) {
            if (regExp.test(property)) {
                this.properties.delete(property);
                this.accessedProperties.delete(property);
            }
        }
    }

    private pathToReg(path: string): RegExp {
        const parts = path.split(".");
        const regParts = parts.map(part => part === "*" ? "[^.]*" : part);
        return new RegExp(`^${regParts.join("\\.")}`);
    }

    public getUnaccessedProperties(): string[] {
        return Array.from(this.properties).filter((property) => !this.accessedProperties.has(property));
    }

    public getAccessedProperties(): string[] {
        return Array.from(this.accessedProperties);
    }

    public touchPathReg(exp: RegExp): void {
        for (const property of this.properties) {
            if (exp.test(property)) {
                this.accessedProperties.add(property);
            }
        }
    }

    /**
     * Touches all paths under the given JSON path
     */
    public touchPath(path: string): void {
        this.touchPathReg(this.pathToReg(path));
    }
}
