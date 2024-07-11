import { Context } from "telegraf";
import { logger } from "../utils";
import { replyToMessage } from "../utils";

const greeting = () => async (ctx: Context) => {
	logger('Fired "greeting" text command');

	const messageId = ctx.message?.message_id;
	const userName = `${ctx.message?.from.first_name} ${ctx.message?.from.last_name}`;

	if (messageId) {
		await replyToMessage(ctx, messageId, `Hi, ${userName}!`);
	}
};

export { greeting };
