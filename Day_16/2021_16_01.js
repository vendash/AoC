const sampleStr = '420D610055D273AF1630010092019207300B278BE5932551E703E608400C335003900AF0402905009923003880856201E95C00B60198D400B50034400E20101DC00E10024C00F1003C400B000212697140249D049F0F8952A8C6009780272D5D074B5741F3F37730056C0149658965E9AED7CA8401A5CC45BB801F0999FFFEEE0D67050C010C0036278A62D4D737F359993398027800BECFD8467E3109945C1008210C9C442690A6F719C48A351006E9359C1C5003E739087E80F27EC29A0030322BD2553983D272C67508E5C0804639D4BD004C401B8B918E3600021D1061D47A30053801C89EF2C4CCFF39204C53C212DABED04C015983A9766200ACE7F95C80D802B2F3499E5A700267838803029FC56203A009CE134C773A2D3005A77F4EDC6B401600043A35C56840200F4668A71580043D92D5A02535BAF7F9A89CF97C9F59A4F02C400C249A8CF1A49331004CDA00ACA46517E8732E8D2DB90F3005E92362194EF5E630CA5E5EEAD1803E200CC228E70700010A89D0BE3A08033146164177005A5AEEB1DA463BDC667600189C9F53A6FF6D6677954B27745CA00BCAE53A6EEDC60074C920001B93CFB05140289E8FA4812E071EE447218CBE1AA149008DBA00A497F9486262325FE521898BC9669B382015365715953C5FC01AA8002111721D4221007E13C448BA600B4F77F694CE6C01393519CE474D46009D802C00085C578A71E4001098F518639CC301802B400E7CDDF4B525C8E9CA2188032600E44B8F1094C0198CB16A29180351EA1DC3091F47A5CA0054C4234BDBC2F338A77B84F201232C01700042A0DC7A8A0200CC578B10A65A000601048B24B25C56995A30056C013927D927C91AB43005D127FDC610EF55273F76C96641002A4F0F8C01CCC579A8D68E52587F982996F537D600'

const hex_to_bin = {
    '0': ['0', '0', '0', '0'],
    '1': ['0', '0', '0', '1'],
    '2': ['0', '0', '1', '0'],
    '3': ['0', '0', '1', '1'],
    '4': ['0', '1', '0', '0'],
    '5': ['0', '1', '0', '1'],
    '6': ['0', '1', '1', '0'],
    '7': ['0', '1', '1', '1'],
    '8': ['1', '0', '0', '0'],
    '9': ['1', '0', '0', '1'],
    'A': ['1', '0', '1', '0'],
    'B': ['1', '0', '1', '1'],
    'C': ['1', '1', '0', '0'],
    'D': ['1', '1', '0', '1'],
    'E': ['1', '1', '1', '0'],
    'F': ['1', '1', '1', '1']
}

const operCodes = [
    function sum(...args) {
        return args.reduce(function (acc, cur) {
            return acc + cur
        })
    },
    function product(...args) {
        return args.reduce(function (acc, cur) {
            return acc * cur
        })
    },
    function min(...args) {
        return Math.min(...args)
    },
    function max(...args) {
        return Math.max(...args)
    },
    undefined, //...
    function gt(a, b) {
        return a > b ? 1 : 0
    },
    function lt(a, b) {
        return a < b ? 1 : 0
    },
    function eq(a, b) {
        return a === b ? 1 : 0
    }]

function hexToBin(str) {
    const arr = [];
    for (let c = 0; c < str.length; c++) {
        arr.push(...hex_to_bin[str[c]])
    }
    return arr
}

function arrPartToDec(arr, start, end) {
    let strPart = ''
    for (let i = start; i <= end; i++) {
        strPart += arr[i]
    }
    return parseInt(strPart, 2)
}

function arrPart(arr, start, end) {
    let strPart = ''
    for (let i = start; i <= end; i++) {
        strPart += arr[i]
    }
    return strPart
}

function parsePacket(signal, curPos, level) {
    const version = arrPartToDec(signal, curPos, curPos + 2)
    const typeID = arrPartToDec(signal, curPos + 3, curPos + 5)
    curPos = curPos + 6
    if (typeID === 4) {
        //literal
        let result = ''
        let isNext = true
        while (isNext) {
            if (signal[curPos] === '0') {
                isNext = false;
            }
            curPos++
            result += arrPart(signal, curPos, curPos + 3)
            curPos += 4
        }
        const value = parseInt(result, 2)
        packets.push({ version, typeID, value, level })
    } else {
        //operator
        level++
        const typeLength = signal[curPos]
        curPos++
        let length
        if (typeLength === '0') {
            //15-bit length
            length = arrPartToDec(signal, curPos, curPos + 14)
            curPos += 15
            let subPacketLength
            const partEnd = length + curPos
            do {
                subPacketLength = parsePacket(signal, curPos, level)
                curPos = subPacketLength
            } while (subPacketLength < partEnd)
            curPos = subPacketLength
        }
        else {
            //11-bit length
            length = arrPartToDec(signal, curPos, curPos + 10)
            curPos += 11
            for (let d = 0; d < length; d++) {
                curPos = parsePacket(signal, curPos, level)
            }
        }
        packets.push({ version, typeID, typeLength, length, level })

    }
    return curPos
}

function countVersions(arr) {
    let sum = 0;
    arr.forEach(e => {
        sum += e.version
    })
    return sum
}

function findHighestLevel(packets) {
    let max = 0;
    for (const packet of packets) {

        if (packet.level > max) max = packet.level
    }
    return max
}

function doTheMaths(packets, currLevel) {
    let numbs = []
    while (packets.length>1) {
        for (let i = 0; i < packets.length; i++) {
            if (packets[i].level === currLevel) {
                if (packets[i].typeID === 4) {
                    numbs.push(packets[i].value)
                    packets.splice(i,1)
                    i--
                } else {
                    if (numbs.length !== 0) {
                        const newItem = { typeID: 4, value: operCodes[packets[i].typeID](...numbs), level: currLevel - 1 }
                        packets[i] = newItem
                        numbs = []
                    }
                }
            } 
        }
        currLevel--
    }
}

const sampleStrArr = hexToBin(sampleStr)
const packets = []

parsePacket(sampleStrArr, 0, 0)

console.log('Part1: ', countVersions(packets))
doTheMaths(packets, findHighestLevel(packets))
console.log('Part2: ',packets[0].value)