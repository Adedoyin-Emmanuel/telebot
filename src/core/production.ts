import { VercelRequest, VercelResponse } from "@vercel/node";
import { logger } from "../utils";
import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { VERCEL_URL } from "../constants";
import { config } from "dotenv";

config();

const PORT = process.env.PORT || 2800;

const production = async (
	req: VercelRequest,
	res: VercelResponse,
	bot: Telegraf<Context<Update>>,
) => {
	logger("Bot runninng in production mode");
	logger(`setting webhook: ${VERCEL_URL}`);

	if (!VERCEL_URL) {
		throw new Error("VERCEL_URL is not set.");
	}

	const getWebhookInfo = await bot.telegram.getWebhookInfo();
	if (getWebhookInfo.url !== VERCEL_URL + "/api") {
		logger(`deleting webhook ${VERCEL_URL}`);
		await bot.telegram.deleteWebhook();
		logger(`setting webhook: ${VERCEL_URL}/api`);
		await bot.telegram.setWebhook(`${VERCEL_URL}/api`);
	}

	if (req.method === "POST") {
		await bot.handleUpdate(req.body as unknown as Update, res);
	} else {
		res
			.status(200)
			.json(
				`Webhook is ${await bot.telegram.getWebhookInfo()} Listening to bot events... on port ${PORT} ${VERCEL_URL}`,
			);
	}
	logger(`starting webhook on port: ${PORT}`);
};

export default production;
