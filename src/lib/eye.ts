// Based on https://synthetic.garden/3y3.htm
// Based on https://github.com/ArjixWasTaken/3y3/blob/main/3y3.js
// Typescript version

export function encode(text: string): string {
    let ret = '';
    for (const c of text) {
        let i = c.codePointAt(0) ?? 32;
        ret += String.fromCodePoint(0x00 < i && i < 0x7f ? i + 0xe0000 : i);
    }
    return ret;
}

export function decode(text: string): string {
    let ret = '';
    for (const c of text) {
        let i = c.codePointAt(0) ?? 32;
        ret += String.fromCodePoint(0xe0000 < i && i < 0xe007f ? i - 0xe0000 : i);
    }
    return ret;
}

export function detect(text: string): boolean {
    for (const c of text) {
        const i = c.codePointAt(0) ?? 32;
        if (0xe0000 < i && i < 0xe007f) {
            return true;
        }
    }
    return false;
}

export function secondSightify(text: string): string {
    return (detect(text)) ? decode(text): encode(text);
}

if (require.main === module) {
    const encoded = encode('HEY BUDDY how are you 123123123');
    console.log(JSON.stringify(encoded))
    console.log(JSON.stringify(decode(encoded)))
    console.log(JSON.stringify(detect(encoded)))
    console.log(JSON.stringify(detect("Not encoded")))
    console.log(JSON.stringify(secondSightify("Not encoded")))
    console.log(JSON.stringify(secondSightify(encoded)))
}
