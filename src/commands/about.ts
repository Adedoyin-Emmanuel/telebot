import { Context } from "telegraf";
import { logger } from "../utils";

import { author, name, version } from "../../package.json";


const about = () => async (ctx: Context) => {
	const message = `*${name} ${version}*\n By ${author.name}. \n Find me on ${author.email}. \n Github ${author.url}`;
	logger(`Triggered "about" command with message \n${message}`);
	await ctx.replyWithMarkdownV2(message, { parse_mode: "Markdown" });
};

export { about };
