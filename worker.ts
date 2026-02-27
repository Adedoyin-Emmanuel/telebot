import { Bot } from "./src/bot";
import { getConfig } from "./src/config";
import { logger } from "./src/utils/logger";

export interface Env {
  BOT_TOKEN: string;
  // Add your custom environment variables and bindings here:
  // MY_VAR: string;
  // MY_KV: KVNamespace;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      const config = getConfig(env);
      const bot = new Bot(config);

      const url = new URL(request.url);
      const path = url.pathname;

      // GET / — Setup webhook + status page
      if (path === "/" && request.method === "GET") {
        await bot.setupWebhook(url.origin);
        return new Response("Bot is running. Webhook registered.", {
          status: 200,
        });
      }

      // POST /webhook — Handle Telegram updates
      if (path === "/webhook" && request.method === "POST") {
        const update = await request.json();
        await bot.handleWebhook(update);
        return new Response("OK", { status: 200 });
      }

      // GET /webhook — Register webhook manually
      if (path === "/webhook" && request.method === "GET") {
        await bot.setupWebhook(url.origin);
        return new Response("Webhook registered.", { status: 200 });
      }

      // GET /health — Health check
      if (path === "/health") {
        return new Response("OK", { status: 200 });
      }

      return new Response("Not found", { status: 404 });
    } catch (error) {
      logger.error("Worker error", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },

  // Uncomment to enable scheduled/cron jobs:
  //
  // async scheduled(
  //   event: ScheduledEvent,
  //   env: Env,
  //   ctx: ExecutionContext
  // ): Promise<void> {
  //   const config = getConfig(env);
  //   const bot = new Bot(config);
  //
  //   logger.info("Cron job triggered", { cron: event.cron });
  //
  //   switch (event.cron) {
  //     case "0 */6 * * *":
  //       // Your scheduled task logic here
  //       break;
  //     default:
  //       logger.warn("Unknown cron expression", { cron: event.cron });
  //   }
  // },
};
