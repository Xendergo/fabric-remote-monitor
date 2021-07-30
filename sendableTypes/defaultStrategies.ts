type EachType<T extends object> = {
    +readonly [Property in keyof T]-?: strat<T[Property]>
}

type strat<T> = (data: any) => data is T

/**
 * A set of common strategies that you can input into {@link MakeSendable} so you don't have to constantly retype the same long functions
 */
class Strategies {
    /**
     * Returns a strategy requiring all the strategies inputted to be true
     * @param strats The strategies to check
     * @returns A function representing all the strategies inputted being true
     * @typeParam `T` - The type you're checking for
     */
    all<T>(...strats: ((data: any) => boolean)[]) {
        return function (data: any): data is T {
            for (const strat of strats) {
                if (!strat(data)) {
                    return false
                }
            }

            return true
        }
    }

    /**
     * Returns a strategy requiring any the strategies inputted to be true
     * @param strats The strategies to check
     * @returns A function representing any the strategies inputted being true
     * @typeParam `T` - The type you're checking for
     */
    any<T>(...strats: ((data: any) => boolean)[]) {
        return function (data: any): data is T {
            for (const strat of strats) {
                if (strat(data)) {
                    return true
                }
            }

            return false
        }
    }

    /**
     * Takes in an object type, and an object of strategies for each key in the object type, and returns a strategy for that object type
     * @param strats The strategies for checking each object property
     * @returns A function representing a strategy for checking the object type
     * @typeParam `T` - The object type you're checking for
     */
    each<T extends { [key: string]: any }>(strats: EachType<T>) {
        return function (data: any): data is T {
            for (const key in strats) {
                let value

                try {
                    value = data[key]
                } catch {
                    return false
                }

                if (!strats[key](value)) {
                    return false
                }
            }

            return true
        }
    }

    /**
     * Takes in a tuple type, and a tuple of strategies for each item, and returns a strategy for checking the tuple type
     * @param strats A tuple of strategies for each item in the tuple type
     * @returns A strategy for type checking the tuple type
     * @typeParam `T` - The tuple type you're checking for
     */
    tupleEach<T extends Array<any>>(strats: EachType<T>) {
        return function (data: any): data is T {
            if (!Array.isArray(data) || data.length !== strats.length) {
                return false
            }

            for (let i = 0; i < data.length; i++) {
                if (!strats[i](data[i])) {
                    return false
                }
            }

            return true
        }
    }

    /**
     * Takes in an array of keys and strategies, and returns a strategy that checks if the map includes every key and passes all the strategies
     * @param strats
     * @returns
     */
    mapEach<K, V>(strats: [K, (data: any) => data is V][]) {
        return function (data: any): data is Map<K, V> {
            if (!(data instanceof Map)) {
                return false
            }

            for (const [key, checker] of strats) {
                if (!data.has(key) || !checker(data.get(key))) return false
            }

            return true
        }
    }

    /**
     * Generates a strategy for type checking an array by applying a strategy to each element in the array
     * @param strat The strategy to apply to each element in the array
     * @returns A strategy for type checking the whole array
     * @typeParam `T` - The type you expect to be contained by the array
     */
    Array<T>(strat: strat<T>) {
        return function (data: any): data is Array<T> {
            if (!Array.isArray(data)) {
                return false
            }

            for (const v in data) {
                if (!strat(v)) {
                    return false
                }
            }

            return true
        }
    }

    /**
     * Takes in a strategy for checking the type of the keys, and a strat for checking the values, and returns a strategy ensuring the value is a map, and each key/value pair in the map passes the key and value strats
     * @param keyStrat A strategy for checking the keys in the map
     * @param valueStrat A strategy for checking the values in the map
     * @returns A strategy for checking that a value is a map of the given keys and values
     */
    Map<K, V>(
        keyStrat: (data: any) => data is K,
        valueStrat: (data: any) => data is V
    ) {
        return function (data: any): data is Map<K, V> {
            if (!(data instanceof Map)) return false

            for (const [key, value] of data) {
                if (!keyStrat(key) || !valueStrat(value)) return false
            }

            return true
        }
    }

    /**
     * Takes in a strategy for checking each value in a set and returns a strategy checking if a value is a set of the given type
     * @param strat A strategy for checking each value in the set
     * @returns A strategy checking if a value is a set with the given type
     */
    Set<V>(strat: (data: any) => data is V) {
        return function (data: any): data is Set<V> {
            if (!(data instanceof Set)) return false

            for (const value of data) {
                if (!strat(value)) return false
            }

            return true
        }
    }

    /**
     * Returns a strategy that ensures that the value being checked is triple equal to the value passed into this function
     * @param value The value to check against
     * @returns A strategy for type checking T
     * @typeParam `T` - The type you're checking for
     */
    value<T>(value: T) {
        return function (data: any): data is T {
            return data === value
        }
    }

    /**
     * Returns a strategy that ensures that a value doesn't exist, useful if you know the value is contained in the class prototype
     * @returns A strategy ensuring type T doesn't exist
     * @typeParam `T` - The type you're checking for
     */
    isPrototype<T>() {
        return function (data: any): data is T {
            return data === undefined
        }
    }

    /**
     * Trust that a value is always the correct type, good for saving effort type checking stuff when there's no network or untrusted actors to mess up data
     *
     * Can also be used on the `channel` property for {@link Sendable}, since it's type checked by the library itself
     *
     * @returns A strategy always returning true
     * @typeParam `T` - The type you're checking for
     */
    trust<T>() {
        return function (data: any): data is T {
            return true
        }
    }

    /**
     * Return a strategy that type checks a value and applies a filter to ensure the value is valid
     * @param strat A strategy to ensure the value is the correct type
     * @param filter A filter to narrow down the allowed values
     * @returns A strategy checking the type and applying the filter
     * @typeParam `T` - The type you're checking for
     */
    and<T>(strat: strat<T>, filter: (data: T) => boolean) {
        return function (data: any): data is T {
            return strat(data) && filter(data)
        }
    }

    /**
     * Returns a strategy that checks if a value is a T1 and then if T1 is a T2
     * @param strat1 The strategy for checking if the value is a T1
     * @param strat2 The strategy for checking if the T1 is a T2
     * @returns A strategy checking that the value is T2
     * @typeParam `T1` - The intermediate type you're checking for first
     * @typeParam `T2` - The type you're checking for
     */
    narrow<T1, T2 extends T1>(
        strat1: strat<T1>,
        strat2: (data: T1) => data is T2
    ) {
        return function (data: any): data is T2 {
            return strat1(data) && strat2(data)
        }
    }

    /**
     * Returns a strategy that checks if a value is a string and matches a regex
     * @param regex The regex to test against
     * @returns The strategy testing if a value matches the regex
     */
    match(regex: RegExp) {
        return function (data: any): data is string {
            return typeof data === "string" && regex.test(data)
        }
    }

    /**
     * A strategy checking if the value is a number
     */
    number(data: any): data is number {
        return typeof data === "number"
    }

    /**
     * A strategy checking if the value is a string
     */
    string(data: any): data is string {
        return typeof data === "string"
    }

    /**
     * A strategy checking if the value is a boolean
     */
    boolean(data: any): data is boolean {
        return typeof data === "boolean"
    }

    /**
     * A strategy checking if the value is a bigint
     */
    bigint(data: any): data is bigint {
        return typeof data === "bigint"
    }

    /**
     * A strategy checking if the value is a symbol
     */
    symbol(data: any): data is symbol {
        return typeof data === "symbol"
    }

    /**
     * A strategy checking if the value is a function
     */
    function(data: any): data is Function {
        return typeof data === "function"
    }

    /**
     * A strategy checking if the value is an object
     */
    object(data: any): data is object {
        return typeof data === "object"
    }

    /**
     * A strategy checking if the value is null
     */
    null(data: any): data is null {
        return data === null
    }

    /**
     * A strategy checking if the value is undefined
     */
    undefined(data: any): data is undefined {
        return data === undefined
    }
}

export const strats = new Strategies()
