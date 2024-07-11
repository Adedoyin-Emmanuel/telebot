import { bot } from "./config/";
import { IS_PRODUCTION } from "./constants";
import { errorHandler } from "./middlewares";

import { about } from "./commands";
import { greeting } from "./chat";

import { VercelRequest, VercelResponse } from "@vercel/node";
import { development, production } from "./core";

bot.command("about", about());
bot.on("message", greeting());

bot.catch(errorHandler);

export const launchVercel = async (req: VercelRequest, res: VercelResponse) => {
	await production(req, res, bot);
};

IS_PRODUCTION && development(bot);
