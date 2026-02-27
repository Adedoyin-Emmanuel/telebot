import { Telegraf } from "telegraf";

import type { Config } from "../config";
import { logger } from "../utils/logger";
import { registerCommands } from "./commands";

export class Bot {
	private config: Config;
	private telegraf: Telegraf;

	constructor(config: Config) {
		this.config = config;
		this.telegraf = new Telegraf(config.botToken);
		registerCommands(this.telegraf);
	}

	/**
	 * Register the webhook URL with Telegram.
	 * Automatically skips if the webhook is already set to the correct URL.
	 */
	async setupWebhook(workerUrl: string): Promise<void> {
		try {
			const webhookUrl = `${workerUrl.replace("http://", "https://")}/webhook`;
			const webhookInfo = await this.telegraf.telegram.getWebhookInfo();

			if (webhookInfo.url !== webhookUrl) {
				logger.info(`Setting up webhook: ${webhookUrl}`);
				await this.telegraf.telegram.deleteWebhook();
				await this.telegraf.telegram.setWebhook(webhookUrl);
				logger.info("Webhook set successfully");
			} else {
				logger.info("Webhook already set correctly");
			}
		} catch (error) {
			logger.error("Webhook setup error", error);
			throw error;
		}
	}

	/**
	 * Process an incoming Telegram update (from the webhook POST body).
	 */
	async handleWebhook(update: any): Promise<void> {
		try {
			await this.telegraf.handleUpdate(update);
		} catch (error) {
			logger.error("Webhook handling error", error);
			throw error;
		}
	}

	/**
	 * Access the underlying Telegraf Telegram API client.
	 * Useful for sending messages, managing chats, etc.
	 */
	get telegram() {
		return this.telegraf.telegram;
	}
}
