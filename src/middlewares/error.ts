import { Context } from "telegraf";
import { logger } from "../utils";

export default function (error: unknown, ctx: Context) {
	logger(error);
	ctx.react("😢", true);
	ctx.reply("Oh sugar, an error occurred. Please try again later.");
}
