import { Context } from "telegraf";
import createDebug from "debug";

import { author, name, version } from "../../package.json";

const debug = createDebug("bot:about_command");

const about = () => async (ctx: Context) => {
	const message = `*${name} ${version}*\n By ${author.name}. \n Find me on ${author.email}. \n Github ${author.url}`;
	debug(`Triggered "about" command with message \n${message}`);
	await ctx.replyWithMarkdownV2(message, { parse_mode: "Markdown" });
};

export { about };
