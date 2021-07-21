type EachType<T extends object> = {
    +readonly [Property in keyof T]-?: (data: any) => data is T[Property]
}

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
     * Generates a strategy for type checking an array by applying a strategy to each element in the array
     * @param strat The strategy to apply to each element in the array
     * @returns A strategy for type checking the whole array
     * @typeParam `T` - The type you expect to be contained by the array
     */
    Array<T>(strat: (data: any) => data is T) {
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
