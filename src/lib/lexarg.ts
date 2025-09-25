// Tokenise a command string into a list of tokens.

import {lickJSON} from "./jsonConsumer";

export function lexarg(cmd: string): string[] {
    const ret: string[] = [];
    let curr = '';

    for (let i = 0; i < cmd.length; i++) {
        const c = cmd.charAt(i);

        switch (c) {
            case ' ':
                ret.push(curr);
                curr = '';
                break;

            case '"':
                try {
                    const end = lickJSON(cmd, i);
                    ret.push(JSON.parse(cmd.slice(i, end)));
                    i = end;
                } catch (e) {
                    curr += c;
                }
                break;

            default:
                curr += c;
        }
    }

    if (curr !== '') {
        ret.push(curr);
    }

    return ret;
}

if (require.main === module) {
    console.log(lexarg(`hey there "buddy boo yeet " aaaa ' aa'`));
}
