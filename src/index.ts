import {Message} from "whatsapp-web.js";

// noinspection ES6ConvertRequireIntoImport
const {Client, LocalAuth} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const minimist: (args: string[]) => Record<string, string | string[]> = require('minimist');
// import {string_to_unicode_variant} from "string-to-unicode-variant";

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

}

client.on('message_create', async (message: Message) => {
    const user = await message.getContact();
    const body = message.body;

    console.log(`${user.name} (${user.pushname} @${user.number}) sent '${body}' T:${message.timestamp}`);

    // NOTE: Be careful not to cause self-responding chains. That would be bad.
    if (!(body.startsWith(".m ") || body === '.m')) {
        return;
    }
    const latency = Date.now() - message.timestamp * 1000;
    const kwargs = minimist(body.split(' '));
    const args = kwargs['_'];
    const cmd = args.length > 1 ? args[1] : '';

    async function respond(msg: string) {
        return await message.reply(msg);
    }

    function helpMsg(cmd: string = ''): string {
        if (Object.keys(Help).includes(cmd)) {
            const msg = Help[cmd as keyof typeof Help];
            return `Help for \`${cmd}\`:\n${msg}`;
        }
        const keys = Object.keys(Help);
        const keysMsg = keys.join('\n- ');

        return `\
Help:
Available commands:
- ${keysMsg}`;
    }

    if (kwargs.h) {
        await respond(helpMsg(cmd));
        return;
    }

    switch (cmd) {
        case "ping":
        case "pong":
            const verb = cmd == "ping" ? "Pong" : "Ping";
            await respond(`${verb}! Latency is ${latency}ms.`);
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