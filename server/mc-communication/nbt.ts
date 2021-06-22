import { isMap } from "util/types"

export function decode(data: Buffer): Map<string, TagType> {
    let id = data[0]

    let len = data.readUInt16BE(1)
    
    let name = data.toString("utf-8", 2, len)

    let ret: Map<string, TagType> = new Map()

    ret.set(name, tagTypes.get(id)!.decode(data.slice(3 + len))[0])

    return ret.get("") as Map<string, TagType>
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

abstract class TagParser {
    abstract decode(data: Buffer): [TagType, number]
    abstract encode(value: TagType): number[] | null
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
        let buf = Buffer.alloc(2)

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
        let buf = Buffer.alloc(2)

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
        let buf = Buffer.alloc(4)

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
        return value.value
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
}

@tagType(9)
class ListParser extends TagParserExtendable<TagType[]> {
    decode(data: Buffer): [TagType[], number] {
        let id = data[0]

        let len = data.readInt32BE(1)

        let size = 5

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
}