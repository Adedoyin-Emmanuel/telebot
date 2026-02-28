import type { Context, Telegraf } from "telegraf";
import { logger } from "../utils/logger";

/**
 * Register all bot commands and event handlers.
 * Add your custom commands here.
 */
export function registerCommands(bot: Telegraf): void {
	// /start - Entry point when a user first interacts with the bot
	bot.command("start", handleStart);

	// /help - Show available commands
	bot.command("help", handleHelp);

	// Handle any text message that isn't a command
	bot.on("message", handleMessage);

	// Global error handler
	bot.catch((err, ctx) => {
		logger.error("Bot error", { error: err, update: ctx.update });
	});
}

async function handleStart(ctx: Context): Promise<void> {
	await ctx.reply(
		"Welcome! I'm Telebot. A Telegram bot running on Cloudflare Workers, built by Adedoyin Emmanuel.\n\nUse /help to see available commands.",
	);
}

async function handleHelp(ctx: Context): Promise<void> {
	const helpText = [
		"*Available Commands*\n",
		"/start - Start the bot",
		"/help - Show this help message",
		"\nBuilt with Telegraf + Cloudflare Workers.",
	].join("\n");

	await ctx.reply(helpText, { parse_mode: "Markdown" });
}

async function handleMessage(ctx: Context): Promise<void> {
	await ctx.reply("I received your message! Use /help to see what I can do.");
}
