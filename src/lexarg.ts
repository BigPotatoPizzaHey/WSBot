// Tokenise a command string into a list of tokens.

function readString() {

}

export function lexarg(cmd: string): string[] {
    const ret: string[] = [];
    let curr = '';

    Array.from(cmd).forEach((c) => {
        console.log(c)

        switch (c) {
            case ' ':
                ret.push(curr);
                curr = '';
                break;

            default:
                curr += c;
        }
    });

    if (curr !== '') {
        ret.push(curr);
    }

    return ret;
}

if (require.main === module) {
    console.log(lexarg('hey there'));
}
