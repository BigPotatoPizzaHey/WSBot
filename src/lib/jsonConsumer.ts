// 'consume' json until natural end
import {lexarg} from "./lexarg";

const DIGITS = '0123456789';

function readJSONNumber(str: string) {
    let ret = '';

    const minus = str.charAt(0) == '-';
    if (minus) {
        ret += '-';
        str = str.slice(1);
    }

    function readFraction(sub: string) {
        let subRet = '';
        if (sub.charAt(0) == '.') {
            subRet += '.';
            sub = sub.slice(1);
            while (DIGITS.includes(sub.charAt(0))) {
                subRet += sub.charAt(0);
                sub = sub.slice(1);
            }
        }

        return [subRet, sub];
    }

    function readExponent(sub: string) {
        let subRet = '';
        if (sub.charAt(0).toLowerCase() == 'e') {
            subRet += sub.charAt(0);
            sub = sub.slice(1);

            if ('-+'.includes(sub.charAt(0))) {
                subRet += sub.charAt(0);
                sub = sub.slice(1);
            }

            if (!DIGITS.includes(sub.charAt(0))) {
                throw `Invalid exponent: ${sub}`;
            }

            while (DIGITS.includes(sub.charAt(0))) {
                subRet += sub.charAt(0);
                sub = sub.slice(1);
            }
        }
        return subRet;
    }

    if (str.charAt(0) === '0') {
        ret += '0';
        str = str.slice(1);
    } else if ('123456789'.includes(str.charAt(0))) {
        while (DIGITS.includes(str.charAt(0))) {
            ret += str.charAt(0);
            str = str.slice(1);
        }
    }

    let [frac, str2] = readFraction(str);
    ret += frac;
    ret += readExponent(str2);

    return ret;
}

/**
 * Find natural end of JSON
 * @param str
 * @param i
 */
export function lickJSON(str: string, i: number) {
    const section = str.slice(i);
    if (section.startsWith('true')) {
        return i + 4;
    } else if (section.startsWith('false')) {
        return i + 5;
    } else if (section.startsWith('null')) {
        return i + 4;
    } else if ('0123456789.-'.includes(section.charAt(0))) {
        return i + readJSONNumber(section).length;
    }

    let depth = 0;
    let JSONText = '';
    let outString = true;
    let unescaped = true;

    for (let j = 0; j < section.length; j++) {
        const char = section.charAt(j);

        JSONText += char;

        if (char == '"') {
            if (JSONText.length > 1) {
                unescaped = JSONText.charAt(-2) !== '\\';
            } else {
                unescaped = true;
            }

            if (unescaped) {
                outString = !outString;

                if (outString) {
                    depth--;
                } else {
                    depth++;
                }
            }
        }

        if (outString) {
            if ('[{'.includes(char)) {
                depth++;
            } else if ('}]'.includes(char)) {
                depth--;
            }
        }

        if (depth === 0 && JSONText.trim().length > 1) {
            return i + j + 1;
        }
    }
    throw `Unclosed JSON Error; read ${JSONText}`;
}

/**
 * Reads a JSON string and stops at the natural end (i.e. when brackets close, or when quotes end, etc.)
 * @param str String that would usually go in JSON.parse()
 * @param i Starting index. Defaults at 0.
 */
export function consumeJSON(str: string, i: number = 0) {
    // named by ChatGPT
    const end = lickJSON(str, i);
    return JSON.parse(str.slice(i, end));
}


if (require.main === module) {
    console.log(consumeJSON(`true a`));
    console.log(consumeJSON(`false a`));
    console.log(consumeJSON(`null a`));
    console.log(consumeJSON(`1 a`));
    console.log(consumeJSON(`-1 a`));
    console.log(consumeJSON(`-1.5 a`));
    console.log(consumeJSON(`1e+20 a`));
    console.log(consumeJSON(`-1e+20 a`));
    console.log(consumeJSON(`-1e2 a`));
    console.log(consumeJSON(`1.20 a`));
    console.log(consumeJSON(`1.20e2 a`));
    console.log(consumeJSON(`1.20e2 a`));
    console.log(consumeJSON(`"hey there" idk man`));
    console.log(consumeJSON(`{"hey there": 123, "aa": [2, {}, [1, 2]]} idk man`));
}
