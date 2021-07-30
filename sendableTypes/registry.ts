import type { Sendable } from "./sendableTypesHelpers"

export class Registry<
    T extends Sendable,
    TypeCheckingLayers extends Array<(data: any) => boolean>,
    CustomData = undefined
> {
    entries: Map<
        string,
        [{ prototype: object }, TypeCheckingLayers, CustomData]
    > = new Map()

    /**
     * Register a class to this registry
     *
     * @deprecated this function shouldn't be used directly, instead use the `@MakeSendable` decorator on your type
     *
     * @param classToRegister The class you want to register
     * @param strats The strategies to use for type checking your type
     */
    register(
        classToRegister: { new (...values: any[]): T; channel(): string },
        strats: TypeCheckingLayers,
        customData: CustomData
    ) {
        const channel = classToRegister.channel()

        this.entries.set(channel, [classToRegister, strats, customData])
    }
}
