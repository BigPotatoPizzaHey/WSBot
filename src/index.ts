import {Message} from "whatsapp-web.js";

// noinspection ES6ConvertRequireIntoImport
const {Client, LocalAuth} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const minimist: (args: string[]) => Record<string, string | string[]> = require('minimist');
// import {string_to_unicode_variant} from "string-to-unicode-variant";
import {lexarg} from "./lib/lexarg";
import {secondSightify} from "./lib/eye";

const BOTTED_MSG = secondSightify('@NOREPLY.BPPH');

const client = new Client({
    puppeteer: {
        headless: true,
    },
    authStrategy: new LocalAuth()
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('loading_screen', (percent: string, message: string) => {
    console.log(`Loading: ${percent}% ${message}`);
});

client.on('qr', (qr: string) => {
    console.log('qr is', typeof qr, qr);
    qrcode.generate(qr, {small: true});
});

////////////////////////////////////////////////////////////////
enum Help {
    ping = "> Get the pong time in ms",
    pong = "> Get the ping time in ms",
    echo = "> Copy the message that you replied to, and send it.",
    botted = "> Check if the message was sent by the bot or not",
    "3y3" = "> Convert to or from 3y3 encoded text.\n" +
        "> The stuff in the quotes after the arrow `->` has hidden 3y3 characters in it. It's invisible!\n" +
        "> You can also go here: https://synthetic.garden/3y3.htm",
    eye = Help["3y3"],
    help = "> Show this help message."
}

function helpMsg(cmd: string = ''): string {
    if (Object.keys(Help).includes(cmd)) {
        const msg = Help[cmd as keyof typeof Help];
        return `Help for \`${cmd}\`:\n${msg}`;
    }
    const keys = Object.keys(Help);
    const keysMsg = keys.join('\n- ');

    return `\
\`Help\`:
Available commands:
- ${keysMsg}`;
}

client.on('message_create', async (message: Message) => {
    const user = await message.getContact();
    const body = message.body;

    console.log(`${user.name} (${user.pushname} @${user.number}) sent '${body}' T:${message.timestamp}`);

    // NOTE: Be careful not to cause self-responding chains. That would be bad.
    if (!(body.startsWith(".m ") || body === '.m')) {
        return;
    }
    if (body.endsWith(BOTTED_MSG) && message.fromMe) {
        return;
    }

    const latency = Date.now() - message.timestamp * 1000;
    const kwargs = minimist(lexarg(body));
    const args = kwargs['_'];
    const cmd = args.length > 1 ? args[1] : '';

    function mkResp(msg: string): string {
        if (!msg.endsWith(BOTTED_MSG)) {
            msg += BOTTED_MSG;
        }
        return msg;
    }

    async function respond(msg: string) {
        return await message.reply(mkResp(msg));
    }

    if (kwargs.h) {
        await respond(helpMsg(cmd));
        return;
    }

    let result;
    let argMsg;

    switch (cmd) {
        case "ping":
        case "pong":
            const verb = cmd == "ping" ? "Pong" : "Ping";
            await respond(`${verb}! Latency is ${latency}ms.`);
            break;

        case "echo":
            const quoted = await message.getQuotedMessage();
            const echo = quoted ? quoted.body : 'Couldn\'t fetch message.';
            await respond(echo);
            break;

        case "botted":
            argMsg = await message.getQuotedMessage() ?? message;
            result = argMsg.fromMe && argMsg.body.endsWith(BOTTED_MSG);
            await respond(`> ${result}`);
            break;

        case "eye":
        case "3y3":
            const text = args[2] ?? 'nothing';
            result = secondSightify(text);
            await respond(`> Converting to/from 3y3 encoded text. \n` +
                `> Note that 3y3 text is invisible. Copy paste the text in the "quotes" after the \`->\` and send it back to \`.m 3y3\` to decode it\n` +
                `${JSON.stringify(text)} -> ${JSON.stringify(result)}`);
            break;

        case "help":
            const helpCmd = args[2] ?? '';
            await respond(helpMsg(helpCmd));
            break;

        default:
            await respond(`\
Could not work out what you wanted.

kwargs:
\`\`\`
${JSON.stringify(kwargs, null, 2)}
\`\`\`

${helpMsg(cmd)}

> This was sent because you started your message with \`.m\`
`);
            break;
    }

});

client.initialize(); /*.then((_: any) => {
    console.log('Client is initialized!');
});
*/