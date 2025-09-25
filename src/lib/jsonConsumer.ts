// 'consume' json until natural end
import {lexarg} from "./lexarg";

const DIGITS = '0123456789';

function readJSONNumber(str: string): number {
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

            return subRet;
        }

    }

    let [frac, str2] = readFraction(str);
    ret += frac;
    ret += readExponent(str2);

    return JSON.parse(ret);
}

/**
 * Reads a JSON string and stops at the natural end (i.e. when brackets close, or when quotes end, etc.)
 * @param str String that would usually go in JSON.parse()
 * @param i Starting index. Defaults at 0.
 */
export function consumeJSON(str: string, i: number = 0) {
    // named by ChatGPT
    const section = str.slice(i);
    if (section.startsWith('true')) {
        return true;
    } else if (section.startsWith('false')) {
        return false;
    } else if (section.endsWith('null')) {
        return null;
    } else if ('0123456789.-'.includes(section.charAt(0))) {
        return readJSONNumber(section);
    }

    let depth = 0;
    let JSONText = '';
    let outString = true;
    let unescaped = true;

    for (let i = 0; i < section.length; i++) {
        const char = section.charAt(i);

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
            return JSON.parse(JSONText.trim());
        }
    }
    throw `Unclosed JSON Error; read ${JSONText}`;
}


if (require.main === module) {
    console.log(consumeJSON(`"hey there" idk man`));
    console.log(consumeJSON(`{"hey there": 123, "aa": [2, {}, [1, 2]]} idk man`));
}
