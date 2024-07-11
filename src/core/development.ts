import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { logger } from "../utils";

const development = async (bot: Telegraf<Context<Update>>) => {
	const botInfo = (await bot.telegram.getMe()).username;

	logger.log("Bot is running on dev mode");
	logger.log(`${botInfo} deleting webhook`);
	await bot.telegram.deleteWebhook();
	logger.log(`${botInfo} starting polling`);

	await bot.launch();

	process.once("SIGINT", () => bot.stop("SIGINT"));
	process.once("SIGTERM", () => bot.stop("SIGTERM"));
};

export default development;
