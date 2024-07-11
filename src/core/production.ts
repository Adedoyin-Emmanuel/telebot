import { VercelRequest, VercelResponse } from "@vercel/node";
import { logger } from "../utils";
import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { VERCEL_URL } from "../constants";

const PORT = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000;

const production = async (
	req: VercelRequest,
	res: VercelResponse,
	bot: Telegraf<Context<Update>>,
) => {
	logger.log("Bot runninng in production mode");
	logger.log(`setting webhook: ${VERCEL_URL}`);

    if (!VERCEL_URL) {
        
		throw new Error("VERCEL_URL is not set.");
	}

	const getWebhookInfo = await bot.telegram.getWebhookInfo();
	if (getWebhookInfo.url !== VERCEL_URL + "/api") {
		logger.log(`deleting webhook ${VERCEL_URL}`);
		await bot.telegram.deleteWebhook();
		logger.log(`setting webhook: ${VERCEL_URL}/api`);
		await bot.telegram.setWebhook(`${VERCEL_URL}/api`);
	}

	if (req.method === "POST") {
		await bot.handleUpdate(req.body as unknown as Update, res);
	} else {
		res.status(200).json("Listening to bot events...");
	}
	logger.log(`starting webhook on port: ${PORT}`);
};

export default production;