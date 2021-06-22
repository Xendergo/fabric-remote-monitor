export function read(data: Buffer): Map<string, TagType> {
    let id = data[0]

    let len = data.readUInt16BE(1)
    
    let name = data.toString("utf-8", 2, len)

    let ret: Map<string, TagType> = new Map()

    ret.set(name, tagTypes.get(id)!.decode(data.slice(3 + len))[0])

    return ret.get("") as Map<string, TagType>
}

export type TagType = int | float | int[] | string | TagType[] | Map<string, TagType>

interface int {
    value: bigint
    type: "byte" | "short" | "int" | "long"
}

interface float {
    value: number
    type: "float" | "double"
}

interface TagParser {
    decode(data: Buffer): [TagType, number]

}

const tagTypes: Map<number, TagParser> = new Map()

function tagType(id: number) {
    return function(target: {new(): TagParser}) {
        tagTypes.set(id, new target)
    }
}

@tagType(1)
class ByteParser {
    decode(data: Buffer): [int, number] {
        return [{
            value: BigInt(data[0]),
            type: "byte"
        }, 1]
    }
}

@tagType(2)
class ShortParser {
    decode(data: Buffer): [int, number] {
        return [{
            value: BigInt(data.readInt16BE()),
            type: "short",
        }, 2]
    }
}

@tagType(3)
class IntParser {
    decode(data: Buffer): [int, number] {
        return [{
            value: BigInt(data.readInt32BE()),
            type: "int",
        }, 4]
    }
}

@tagType(4)
class LongParser {
    decode(data: Buffer): [int, number] {
        return [{
            value: data.readBigInt64BE(),
            type: "long",
        }, 8]
    }
}

@tagType(5)
class FloatParser {
    decode(data: Buffer): [float, number] {
        return [{
            value: data.readFloatBE(),
            type: "float",
        }, 4]
    }
}

@tagType(6)
class DoubleParser {
    decode(data: Buffer): [float, number] {
        return [{
            value: data.readDoubleBE(),
            type: "double",
        }, 8]
    }
}

@tagType(7)
class ByteArrayParser {
    decode(data: Buffer): [int[], number] {
        let size = data.readInt32BE()

        let ret: int[] = new Array(size)

        for (let i = 4; i < 4 + size; i++) {
            ret[i - 4] = {
                value: BigInt(data[i]),
                type: "byte",
            }
        }

        return [ret, size + 4]
    }
}

@tagType(8)
class StringParser {
    decode(data: Buffer): [string, number] {
        let len = data.readUInt16BE()

        return [data.toString("utf-8", 2, 2 + len), 2 + len]
    }
}

@tagType(9)
class ListParser {
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
}

@tagType(10)
class CompoundParser {
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
}

@tagType(11)
class IntArrayParser {
    decode(data: Buffer): [int[], number] {
        let size = data.readInt32BE()

        let ret: int[] = new Array(size)

        for (let i = 0; i < size; i++) {
            ret[i] = {
                value: BigInt(data.readInt32BE(4 + i * 4)),
                type: "int",
            }
        }

        return [ret, size * 4 + 4]
    }
}

@tagType(12)
class LongArrayParser {
    decode(data: Buffer): [int[], number] {
        let size = data.readInt32BE()

        let ret: int[] = new Array(size)

        for (let i = 0; i < size; i++) {
            ret[i] = {
                value: data.readBigInt64BE(4 + i * 8),
                type: "long",
            }
        }

        return [ret, size * 8 + 4]
    }
}