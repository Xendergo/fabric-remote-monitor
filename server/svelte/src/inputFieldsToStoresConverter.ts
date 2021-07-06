import type { Writable } from "svelte/store"
import type {
    AllowedInputFieldTypes,
    InputFields,
    InputFieldsClassesConstraint,
    ListenerManager,
    Sendable,
} from "../../networking/sendableTypesHelpers"

class NetworkingWritable<T> implements Writable<T> {
    constructor(initial: T) {
        this.value = initial
    }

    private subscribers: Set<(value: T, suppressNetworking: boolean) => void> =
        new Set()
    private value: T

    set(value: T, suppressNetworking: boolean = false) {
        if (value === this.value) return

        this.value = value
        this.subscribers.forEach(v => {
            v(this.value, suppressNetworking)
        })
    }

    update(updater: (value: T) => T, suppressNetworking: boolean = false) {
        this.set(updater(this.value), suppressNetworking)
    }

    subscribe(callback: (value: T, suppressNetworking: boolean) => void) {
        this.subscribers.add(callback)
        callback(this.value, true)

        return () => {
            this.subscribers.delete(callback)
        }
    }
}

type AsWritable<T extends InputFieldsClassesConstraint<T>> = {
    -readonly [Property in keyof T]: NetworkingWritable<T[Property]>
}

export class InputFieldsAsStores<T extends InputFieldsClassesConstraint<T>> {
    constructor(
        fields: InputFields<T>,
        listenerManager: ListenerManager<Sendable, any>
    ) {
        this.fields = (Object.keys(fields.fields) as (keyof T)[])
            .map(key => {
                const field = new NetworkingWritable<AllowedInputFieldTypes>(
                    fields.fields[key].type() == "bool" ? false : null
                )

                listenerManager.listen(fields.fields[key], data => {
                    field.set(
                        (data as unknown as { value: AllowedInputFieldTypes })
                            .value
                    )
                })

                return [key, field] as [
                    keyof T,
                    NetworkingWritable<AllowedInputFieldTypes>
                ]
            })
            .reduce((a, v) => {
                ;(a[
                    v[0]
                ] as unknown as NetworkingWritable<AllowedInputFieldTypes>) =
                    v[1]
                return a
            }, {} as AsWritable<T>)

        this.everything = new NetworkingWritable(
            (Object.keys(fields.fields) as (keyof T)[]).reduce((a, v) => {
                ;(a[v] as AllowedInputFieldTypes) =
                    fields.fields[v].type() == "bool" ? false : null

                return a
            }, {} as T)
        )

        for (const key in this.fields) {
            this.fields[key].subscribe((data, suppressNetworking) => {
                console.log("YOO")
                this.everything.update(v => {
                    v[key] = data
                    return v
                }, true)

                if (!fields.sendAsEverything && !suppressNetworking) {
                    listenerManager.send(new fields.fields[key](data))
                }
            })
        }

        if (fields.sendAsEverything) {
            this.everything.subscribe((data, suppressNetworking) => {
                if (suppressNetworking) return

                listenerManager.send(new fields.Everything(data))
            })
        }

        this.everything.subscribe(data => {
            for (const key in data) {
                this.fields[key].set(data[key], true)
            }
        })
    }

    fields: AsWritable<T>

    everything: NetworkingWritable<T>
}
