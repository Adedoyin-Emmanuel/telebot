import { Context } from "telegraf";

const replyToMessage = (ctx: Context, messageId: number, string: string) => {
	ctx.reply(string, {
		reply_parameters: { message_id: messageId },
	});
};

export default replyToMessage;
