import type { Writable } from "svelte/store"
import type {
    Sendable,
    ListenerManager,
    AllowedInputFieldTypes,
    InputFields,
    InputFieldsClassesConstraint,
} from "triangulum"

/**
 * A writable store used by {@link InputFieldsAsStores} which allows giving the option to not update the server about certain things
 *
 * Useful for avoiding sending the same data to the server multiple times
 *
 * Also exposes the value stored in the store as a getter and setter, so it can still be used as a normal value if using it as a store is inconvenient
 */
export class NetworkingWritable<T> implements Writable<T> {
    constructor(initial: T) {
        this._value = initial
    }

    private subscribers: Set<(value: T, suppressNetworking: boolean) => void> =
        new Set()
    private _value: T

    set(value: T, suppressNetworking: boolean = false) {
        if (value === this._value) return

        this._value = value
        this.subscribers.forEach(v => {
            v(this._value, suppressNetworking)
        })
    }

    update(updater: (value: T) => T, suppressNetworking: boolean = false) {
        this._value = updater(this._value)
        this.subscribers.forEach(v => {
            v(this._value, suppressNetworking)
        })
    }

    subscribe(callback: (value: T, suppressNetworking: boolean) => void) {
        this.subscribers.add(callback)
        callback(this._value, true)

        return () => {
            this.subscribers.delete(callback)
        }
    }

    get value() {
        return this._value
    }

    set value(newValue: T) {
        this.set(newValue)
    }
}

/**
 * A [mapped type](www.typescriptlang.org/docs/handbook/2/mapped-types.html) that converts an object to the same object with the properties as stores
 */
type AsWritable<T extends InputFieldsClassesConstraint<T>> = {
    -readonly [Property in keyof T]: NetworkingWritable<T[Property]>
}

/**
 * A class that takes in a {@link InputFields} instance and generates svelte stores & listeners from it
 *
 * The svelte stores are synced with the server, so setting them will send a message to the server using the InputFields instance
 *
 * This also respects the sendAsEverything option in the InputFields instance
 *
 * @typeParam `T` An interface of types to be transmitted by the InputFieldsAsStores instance
 */
export class InputFieldsAsStores<T extends InputFieldsClassesConstraint<T>> {
    /**
     * @param fields The InputFields instance this class should use
     * @param listenerManager The ListenerManager this class should use to send data to the server
     */
    constructor(
        fields: InputFields<T>,
        listenerManager: ListenerManager<Sendable>
    ) {
        let thisFields: AsWritable<T> = {} as AsWritable<T>

        for (const key in fields.fields) {
            const options = fields.fieldOptions[key]

            const field = new NetworkingWritable<AllowedInputFieldTypes>(
                options.default ?? (options.type == "bool" ? false : null)
            )

            listenerManager.listen(fields.fields[key], data => {
                field.set(
                    (data as unknown as { value: AllowedInputFieldTypes }).value
                )
            })
            ;(thisFields[
                key
            ] as unknown as NetworkingWritable<AllowedInputFieldTypes>) = field
        }

        this.fields = thisFields

        const defaultValues = (
            Object.keys(fields.fields) as (keyof T)[]
        ).reduce((a, v) => {
            ;(a[v] as AllowedInputFieldTypes) =
                fields.fields[v].type() == "bool" ? false : null

            return a
        }, {} as T)

        this.localEverything = new NetworkingWritable(defaultValues)

        this.everything = new NetworkingWritable(
            Object.assign({}, defaultValues)
        )

        this.addListeners(fields, listenerManager)
    }

    private addListeners(
        fields: InputFields<T>,
        listenerManager: ListenerManager<Sendable>
    ) {
        listenerManager.listen(fields.Everything, data => {
            for (const key in data) {
                if (key === "channel" || key === "constructor") continue

                this.fields[key as keyof T].set(data[key as keyof T], true)
            }

            this.localEverything.set(data)
        })

        for (const key in this.fields) {
            this.fields[key].subscribe((data, suppressNetworking) => {
                this.everything.update(v => {
                    ;(v[key] as AllowedInputFieldTypes) = data
                    return v
                }, suppressNetworking)

                if (fields.sendAsEverything || suppressNetworking) return

                listenerManager.send(new fields.fields[key](data))
            })
        }

        this.everything.subscribe((data, suppressNetworking) => {
            for (const key in data) {
                this.fields[key].set(data[key], true)
            }

            if (!fields.sendAsEverything || suppressNetworking) return

            listenerManager.send(new fields.Everything(data))
        })
    }

    /**
     * All the fields in the {@link InputFields} instance reflected as svelte stores & synced with the server as well as the `everything` property
     */
    fields: AsWritable<T>

    /**
     * The `Everything` field in the {@link InputFields} instance reflacted as a svelte store & synced with the server as well as the `fields` property
     */
    everything: NetworkingWritable<T>

    /**
     * A store that can be used to store data temporarily before being synced with the server, like if you have a submit button that sends a bunch of input fields to the server at once
     *
     * Changes to `fields` or `everything` will be reflected in this object, but changes to this object won't change anything else.
     *
     * The intended way to sync with the server would be something like this:
     * ```ts
     * const localEverything = fieldsAsStores.localEverything
     *
     * fieldsAsStores.everything.set($localEverything)
     * ```
     */
    localEverything: NetworkingWritable<T>
}
