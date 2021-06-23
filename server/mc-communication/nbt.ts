import { isMap } from "util/types"

export function decode(data: Buffer): Map<string, TagType> {
    let id = data[0]

    let len = data.readUInt16BE(1)
    
    let name = data.toString("utf-8", 2, len)

    let ret: Map<string, TagType> = new Map()

    ret.set(name, tagTypes.get(id)!.decode(data.slice(3 + len))[0])

    return ret.get("") as Map<string, TagType>
}

export function encode(data: Map<string, TagType>): Buffer {
    const [, encoder] = getEncoder(data)

    let encoded = [10, 0, 0, encoder.encode(data)!]

    return Buffer.from(encoded.flat())
}

export type TagType = int | float | intArray | string | TagType[] | Map<string, TagType>

interface int {
    value: bigint
    type: "byte" | "short" | "int" | "long"
}

interface float {
    value: number
    type: "float" | "double"
}

interface intArray {
    value: bigint[]
    type: "byteArray" | "intArray" | "longArray"
}

function getEncoder(tag: TagType): [number, TagParser] {
    for (let [key, value] of tagTypes) {
        if (value.canEncode(tag)) {
            return [key, value]
        }
    }

    throw new Error("Nothing can encode this tag: " + tag)
}

abstract class TagParser {
    abstract decode(data: Buffer): [TagType, number]
    abstract encode(value: TagType): number[] | null
    abstract canEncode(value: TagType): boolean
}

abstract class TagParserExtendable<T extends TagType> extends TagParser {
    abstract decode(data: Buffer): [TagType, number]
    abstract canEncode(value: TagType): value is T
    encode(value: TagType): number[] | null {
        if (!this.canEncode(value)) return null

        let v = this.encodeChecked(value)
        if (Buffer.isBuffer(v)) {
            return Array.from(v)
        } else {
            return v.map(num => Number(num))
        }
    }

    protected abstract encodeChecked(value: T): number[] | bigint[] | Buffer
}

const tagTypes: Map<number, TagParser> = new Map()

function tagType(id: number) {
    return function(target: {new(): TagParser}) {
        tagTypes.set(id, new target)
    }
}

@tagType(1)
class ByteParser extends TagParserExtendable<int> {
    decode(data: Buffer): [int, number] {
        return [{
            value: BigInt(data[0]),
            type: "byte"
        }, 1]
    }

    canEncode(value: TagType): value is int {
        return typeof value === "object" && "type" in value && value.type === "byte"
    }

    encodeChecked(value: int) {
        return [value.value]
    }
}

@tagType(2)
class ShortParser extends TagParserExtendable<int> {
    decode(data: Buffer): [int, number] {
        return [{
            value: BigInt(data.readInt16BE()),
            type: "short",
        }, 2]
    }

    canEncode(value: TagType): value is int {
        return typeof value === "object" && "type" in value && value.type === "short"
    }

    encodeChecked(value: int) {
        let buf = Buffer.alloc(2)

        buf.writeInt16BE(Number(value.value))

        return buf
    }
}

@tagType(3)
class IntParser extends TagParserExtendable<int> {
    decode(data: Buffer): [int, number] {
        return [{
            value: BigInt(data.readInt32BE()),
            type: "int",
        }, 4]
    }

    canEncode(value: TagType): value is int {
        return typeof value === "object" && "type" in value && value.type === "int"
    }

    encodeChecked(value: int) {
        let buf = Buffer.alloc(4)

        buf.writeInt32BE(Number(value.value))

        return buf
    }
}

@tagType(4)
class LongParser extends TagParserExtendable<int> {
    decode(data: Buffer): [int, number] {
        return [{
            value: data.readBigInt64BE(),
            type: "long",
        }, 8]
    }

    canEncode(value: TagType): value is int {
        return typeof value === "object" && "type" in value && value.type === "long"
    }

    encodeChecked(value: int) {
        let buf = Buffer.alloc(8)

        buf.writeBigInt64BE(value.value)

        return buf
    }
}

@tagType(5)
class FloatParser extends TagParserExtendable<float> {
    decode(data: Buffer): [float, number] {
        return [{
            value: data.readFloatBE(),
            type: "float",
        }, 4]
    }

    canEncode(value: TagType): value is float {
        return typeof value === "object" && "type" in value && value.type === "float"
    }

    encodeChecked(value: float) {
        let buf = Buffer.alloc(4)

        buf.writeFloatBE(value.value)

        return buf
    }
}

@tagType(6)
class DoubleParser extends TagParserExtendable<float> {
    decode(data: Buffer): [float, number] {
        return [{
            value: data.readDoubleBE(),
            type: "double",
        }, 8]
    }

    canEncode(value: TagType): value is float {
        return typeof value === "object" && "type" in value && value.type === "double"
    }

    encodeChecked(value: float) {
        let buf = Buffer.alloc(8)

        buf.writeDoubleBE(value.value)
        
        return buf
    }
}

@tagType(7)
class ByteArrayParser extends TagParserExtendable<intArray> {
    decode(data: Buffer): [intArray, number] {
        let size = data.readInt32BE()

        let ret: bigint[] = new Array(size)

        for (let i = 4; i < 4 + size; i++) {
            ret[i - 4] = BigInt(data[i])
        }

        return [{
            value: ret,
            type: "byteArray",
        }, size + 4]
    }

    canEncode(value: TagType): value is intArray {
        return typeof value === "object" && "type" in value && value.type === "byteArray"
    }

    encodeChecked(value: intArray) {
        let buf = Buffer.alloc(4)

        buf.writeInt32BE(value.value.length)

        return [...buf, ...value.value.map(v => Number(v))]
    }
}

@tagType(8)
class StringParser extends TagParserExtendable<string> {
    decode(data: Buffer): [string, number] {
        let len = data.readUInt16BE()

        return [data.toString("utf-8", 2, 2 + len), 2 + len]
    }

    canEncode(value: TagType): value is string {
        return typeof value === "string"
    }

    encodeChecked(value: string) {
        let buf = Buffer.from("00"+value, "utf-8")
        
        buf.writeInt16BE(buf.length - 2)

        return buf
    }
}

@tagType(9)
class ListParser extends TagParserExtendable<TagType[]> {
    decode(data: Buffer): [TagType[], number] {
        let id = data[0]

        let len = data.readInt32BE(1)

        let size = 5

        if (id == 0) {
            return [[], 5]
        }

        let ret: TagType[] = []

        for (let i = 0; i < len; i++) {
            let [value, offset] = tagTypes.get(id)!.decode(data.slice(size))
            ret.push(value)
            size += offset
        }

        return [ret, size]
    }

    canEncode(value: TagType): value is TagType[] {
        return Array.isArray(value)
    }

    encodeChecked(values: TagType[]) {
        if (values.length == 0) {
            return [0, 0, 0, 0, 0]
        }
        
        let lengthBuf = Buffer.alloc(4)
        lengthBuf.writeInt32BE(values.length)
        let ret = [Array.from(lengthBuf)]

        let [id, encoder] = getEncoder(values[0])

        ret.unshift([id])

        for (const value of values) {
            const encoded = encoder.encode(value)

            if (encoded == null) throw new Error("The elements of a list aren't the same type: " + values)

            ret.push(encoded)
        }

        return ret.flat(Infinity) as number[]
    }
}

@tagType(10)
class CompoundParser extends TagParserExtendable<Map<string, TagType>> {
    decode(data: Buffer): [Map<string, TagType>, number] {
        let ret: Map<string, TagType> = new Map()

        for (var i = 0; data[i] != 0;) {
            let id = data[i]
            i++

            let len = data.readUInt16BE(i)
            i += 2
            
            let name = data.toString("utf-8", i, i + len)
            i += len

            let [value, offset] = tagTypes.get(id)!.decode(data.slice(i))

            i += offset

            ret.set(name, value)
        }

        return [ret, i]
    }

    canEncode(value: TagType): value is Map<string, TagType> {
        return isMap(value)
    }

    encodeChecked(values: Map<string, TagType>) {
        type retType = (number | retType)[]

        let ret: retType = []

        for (const [key, value] of values) {
            const [id, encoder] = getEncoder(value)

            ret.push(id)

            ret.push(new StringParser().encode(key)!)

            ret.push(encoder.encode(value)!)
        }

        ret.push(0)

        return ret.flat(Infinity) as number[]
    }
}

@tagType(11)
class IntArrayParser extends TagParserExtendable<intArray> {
    decode(data: Buffer): [intArray, number] {
        let size = data.readInt32BE()

        let ret: bigint[] = new Array(size)

        for (let i = 0; i < size; i++) {
            ret[i] = BigInt(data.readInt32BE(4 + i * 4))
        }

        return [{
            value: ret,
            type: "intArray"
        }, size * 4 + 4]
    }

    canEncode(value: TagType): value is intArray {
        return typeof value === "object" && "type" in value && value.type === "intArray"
    }

    encodeChecked(value: intArray) {
        let ints = value.value

        let buf = Buffer.alloc(4 + ints.length * 4)

        buf.writeInt32BE(ints.length)

        for (let i = 0; i < ints.length; i++) {
            buf.writeInt32BE(Number(ints[i]), i * 4 + 4)
        }

        return buf
    }
}

@tagType(12)
class LongArrayParser extends TagParserExtendable<intArray> {
    decode(data: Buffer): [intArray, number] {
        let size = data.readInt32BE()

        let ret: bigint[] = new Array(size)

        for (let i = 0; i < size; i++) {
            ret[i] = data.readBigInt64BE(4 + i * 8)
        }

        return [{
            value: ret,
            type: "longArray",
        }, size * 8 + 4]
    }

    canEncode(value: TagType): value is intArray {
        return typeof value === "object" && "type" in value && value.type === "longArray"
    }

    encodeChecked(value: intArray) {
        let ints = value.value

        let buf = Buffer.alloc(4 + ints.length * 8)

        buf.writeInt32BE(ints.length)

        for (let i = 0; i < ints.length; i++) {
            buf.writeBigInt64BE(ints[i], i * 8 + 4)
        }

        return buf
    }
}