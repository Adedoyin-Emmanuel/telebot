import { Context } from "telegraf";
import { logger } from "../utils";


const replyToMessage = (ctx: Context, messageId: number, string: string) =>
	ctx.reply(string, {
		reply_parameters: { message_id: messageId },
	});

const greeting = () => async (ctx: Context) => {
	logger('Triggered "greeting" text command');

	const messageId = ctx.message?.message_id;
	const userName = `${ctx.message?.from.first_name} ${ctx.message?.from.last_name}`;

	if (messageId) {
		await replyToMessage(ctx, messageId, `Hi, ${userName}!`);
	}
};

export { greeting };
