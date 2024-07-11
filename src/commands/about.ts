import { Context } from "telegraf";
import { logger, capitalize } from "../utils";

import { author, name, version } from "../../package.json";

const about = () => async (ctx: Context) => {
	const message = `*${capitalize(name)} ${version}*\n By ${author.name}. \n Send me a mail at ${author.email}. \n Find me on Github ${author.url}`;
	logger(`Triggered "about" command with message \n${message}`);
	await ctx.replyWithMarkdownV2(message, { parse_mode: "Markdown" });
};

export { about };
