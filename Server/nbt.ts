export function read(data: Buffer): { [index: string]: TagType } {
    let id = data[0]

    let len = data.readUInt16BE(1)
    
    let name = data.toString("utf-8", 2, len)

    let ret: { [index: string]: TagType } = {}

    ret[name] = tagTypes.get(id)!.parse(data.slice(3 + len))

    return (ret[""] as { [index: string]: TagType })[0] as { [index: string]: TagType }
}

export type TagType = number | bigint | number[] | string | TagType[] | { [index: string]: TagType }

interface TagParser {
    parse(data: Buffer): [TagType, number]
}

const tagTypes: Map<number, TagParser> = new Map()

function tagType(id: number) {
    return function(target: {new(): TagParser}) {
        tagTypes.set(id, new target)
    }
}

@tagType(1)
class ByteParser {
    parse(data: Buffer): [number, number] {
        return [data[0], 1]
    }
}

@tagType(2)
class ShortParser {
    parse(data: Buffer): [number, number] {
        return [data.readInt16BE(), 2]
    }
}

@tagType(3)
class IntParser {
    parse(data: Buffer): [number, number] {
        return [data.readInt32BE(), 4]
    }
}

@tagType(4)
class LongParser {
    parse(data: Buffer): [bigint, number] {
        return [data.readBigInt64BE(), 8]
    }
}

@tagType(5)
class FloatParser {
    parse(data: Buffer): [number, number] {
        return [data.readFloatBE(), 4]
    }
}

@tagType(6)
class DoubleParser {
    parse(data: Buffer): [number, number] {
        return [data.readDoubleBE(), 8]
    }
}

@tagType(7)
class ByteArrayParser {
    parse(data: Buffer): [number[], number] {
        let size = data.readInt32BE()

        let ret = new Array(size)

        for (let i = 4; i < 4 + size; i++) {
            ret[i - 4] = data[i]
        }

        return [ret, size + 4]
    }
}

@tagType(8)
class StringParser {
    parse(data: Buffer): [string, number] {
        let len = data.readUInt16BE()

        return [data.toString("utf-8", 2, 2 + len), 2 + len]
    }
}

@tagType(9)
class ListParser {
    parse(data: Buffer): [TagType[], number] {
        let id = data[0]

        let len = data.readInt32BE(1)

        let size = 5

        let ret: TagType[] = []

        for (let i = 0; i < len; i++) {
            let [value, offset] = tagTypes.get(id)!.parse(data.slice(size))
            ret.push(value)
            size += offset
        }

        return [ret, size]
    }
}

@tagType(10)
class CompoundParser {
    parse(data: Buffer): [{ [index: string]: TagType }, number] {
        let ret: { [index: string]: TagType } = {}
        for (var i = 0; data[i] != 0;) {
            let id = data[i]
            i++

            let len = data.readUInt16BE(i)
            i += 2
            
            let name = data.toString("utf-8", i, i + len)
            i += len

            let [value, offset] = tagTypes.get(id)!.parse(data.slice(i))

            i += offset

            ret[name] = value
        }

        return [ret, i]
    }
}

@tagType(11)
class IntArrayParser {
    parse(data: Buffer): [number[], number] {
        let size = data.readInt32BE()

        let ret = new Array(size)

        for (let i = 0; i < size; i++) {
            ret[i] = data.readInt32BE(4 + i * 4)
        }

        return [ret, size * 4 + 4]
    }
}

@tagType(11)
class LongArrayParser {
    parse(data: Buffer): [bigint[], number] {
        let size = data.readInt32BE()

        let ret = new Array(size)

        for (let i = 0; i < size; i++) {
            ret[i] = data.readBigInt64BE(4 + i * 8)
        }

        return [ret, size * 8 + 4]
    }
}