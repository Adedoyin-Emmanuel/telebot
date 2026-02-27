# Telebot

A production-ready Telegram bot starter built on **Cloudflare Workers** and **Telegraf**. Zero servers, zero cold starts, deployed globally at the edge.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Adedoyin-Emmanuel/telebot)

---

## Features

- **Edge-first** — Runs on Cloudflare's global network with near-zero latency
- **Webhook-based** — No polling; Telegram pushes updates to your Worker
- **Auto webhook registration** — Visit your Worker URL and the webhook is set up automatically
- **TypeScript** — Full type safety out of the box
- **Cron-ready** — Scheduled jobs support built in (commented out, ready to enable)
- **KV-ready** — Cloudflare KV namespace bindings pre-configured in comments
- **Minimal dependencies** — Only Telegraf; no Express, no Axios, no bloat

---

## Project Structure

```
telebot/
├── worker.ts                  # Cloudflare Worker entry point (fetch + scheduled handlers)
├── src/
│   ├── bot/
│   │   ├── index.ts           # Bot class — webhook setup, update handling
│   │   └── commands.ts        # Command handlers (/start, /help, messages)
│   ├── config/
│   │   └── index.ts           # Environment config factory
│   └── utils/
│       └── logger.ts          # Structured logging utility
├── wrangler.toml              # Cloudflare Workers configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
├── .dev.vars.example          # Example local secrets file
└── .gitignore
```

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (or [Bun](https://bun.sh/))
- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

### 1. Clone and install

```bash
git clone https://github.com/Adedoyin-Emmanuel/telebot.git
cd telebot
npm install
```

### 2. Set up your bot token

Create a `.dev.vars` file for local development:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and add your bot token:

```
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 3. Run locally

```bash
npm run dev
```

Wrangler starts a local dev server. Visit the URL shown in the terminal (e.g., `http://localhost:8787`) to auto-register the webhook.

> **Note:** For local webhook testing, you'll need a tunnel like [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/) or [Outray](https://outray.dev/) to expose your local server to Telegram.

### 4. Deploy to production

Set your bot token as a secret in Cloudflare:

```bash
npx wrangler secret put BOT_TOKEN
```

Then deploy:

```bash
npm run deploy
```

Visit your deployed Worker URL (e.g., `https://telebot.<your-subdomain>.workers.dev`) once to register the webhook. Done — your bot is live.

---

## How It Works

### Request Flow

```
Telegram servers
    │
    ▼
POST /webhook ──► Cloudflare Worker (worker.ts)
                      │
                      ▼
                  Bot.handleWebhook()
                      │
                      ▼
                  Telegraf routes to command handlers
                      │
                      ▼
                  /start, /help, message handlers (commands.ts)
```

### Webhook Registration

When you hit `GET /` or `GET /webhook`, the Worker:

1. Checks the current webhook URL via `getWebhookInfo()`
2. If it doesn't match the Worker URL, deletes the old webhook and sets the new one
3. This is idempotent — safe to call multiple times

### Routes

| Method | Path       | Description                          |
|--------|------------|--------------------------------------|
| GET    | `/`        | Register webhook + status page       |
| POST   | `/webhook` | Receive Telegram updates             |
| GET    | `/webhook` | Register webhook manually            |
| GET    | `/health`  | Health check endpoint                |

---

## Adding Commands

Edit `src/bot/commands.ts` to add new commands:

```typescript
import type { Context, Telegraf } from "telegraf";

export function registerCommands(bot: Telegraf): void {
  bot.command("start", handleStart);
  bot.command("help", handleHelp);
  bot.command("ping", handlePing);       // Add new commands here
  bot.on("message", handleMessage);

  bot.catch((err, ctx) => {
    logger.error("Bot error", { error: err, update: ctx.update });
  });
}

async function handlePing(ctx: Context): Promise<void> {
  await ctx.reply("Pong!");
}
```

### Inline Keyboards

```typescript
import { Markup } from "telegraf";

async function handleLinks(ctx: Context): Promise<void> {
  await ctx.reply("Check these out:", {
    reply_markup: {
      inline_keyboard: [
        [
          Markup.button.url("Website", "https://example.com"),
          Markup.button.url("GitHub", "https://github.com"),
        ],
        [
          Markup.button.callback("Click me", "button_clicked"),
        ],
      ],
    },
  });
}

// Handle callback queries from inline buttons
bot.action("button_clicked", async (ctx) => {
  await ctx.answerCbQuery("You clicked the button!");
  await ctx.reply("Button was clicked.");
});
```

### Sending Photos and Media

```typescript
async function handlePhoto(ctx: Context): Promise<void> {
  // Send a single photo
  await ctx.replyWithPhoto("https://example.com/image.jpg", {
    caption: "Here's a photo!",
  });

  // Send a media group (album)
  await ctx.replyWithMediaGroup([
    { type: "photo", media: "https://example.com/1.jpg", caption: "Photo 1" },
    { type: "photo", media: "https://example.com/2.jpg", caption: "Photo 2" },
  ]);
}
```

### Markdown and HTML Formatting

```typescript
async function handleFormatted(ctx: Context): Promise<void> {
  // Markdown
  await ctx.reply("*Bold* _Italic_ `Code` [Link](https://example.com)", {
    parse_mode: "Markdown",
  });

  // HTML
  await ctx.reply("<b>Bold</b> <i>Italic</i> <code>Code</code>", {
    parse_mode: "HTML",
  });
}
```

---

## Scheduled Jobs (Cron Triggers)

To run tasks on a schedule (e.g., send daily digests, clean up data):

### 1. Enable cron triggers in `wrangler.toml`

```toml
[triggers]
crons = ["0 9 * * *"]   # Every day at 9:00 AM UTC
```

### 2. Uncomment the `scheduled` handler in `worker.ts`

```typescript
async scheduled(
  event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  const config = getConfig(env);
  const bot = new Bot(config);

  switch (event.cron) {
    case "0 9 * * *":
      await bot.telegram.sendMessage(CHAT_ID, "Good morning!");
      break;
  }
},
```

### Common Cron Expressions

| Expression       | Schedule                    |
|------------------|-----------------------------|
| `* * * * *`      | Every minute                |
| `0 * * * *`      | Every hour                  |
| `0 9 * * *`      | Every day at 9 AM UTC       |
| `0 9 * * 1`      | Every Monday at 9 AM UTC    |
| `0 */6 * * *`    | Every 6 hours               |
| `0 9 1 * *`      | First day of month, 9 AM    |

---

## Using Cloudflare KV (Persistent Storage)

KV lets you store and retrieve data across requests — useful for user state, caching, feature flags, etc.

### 1. Create a KV namespace

```bash
npx wrangler kv namespace create MY_KV
```

### 2. Add the binding to `wrangler.toml`

```toml
[[kv_namespaces]]
binding = "MY_KV"
id = "your-namespace-id-from-step-1"
```

### 3. Add the binding to the `Env` interface in `worker.ts`

```typescript
export interface Env {
  BOT_TOKEN: string;
  MY_KV: KVNamespace;
}
```

### 4. Use KV in your handlers

```typescript
// Store a value
await env.MY_KV.put("user:123:name", "Alice");

// Read a value
const name = await env.MY_KV.get("user:123:name");

// Store JSON
await env.MY_KV.put("user:123", JSON.stringify({ name: "Alice", score: 42 }));
const user = JSON.parse(await env.MY_KV.get("user:123") || "{}");

// Delete a value
await env.MY_KV.delete("user:123:name");

// Set with expiration (TTL in seconds)
await env.MY_KV.put("session:abc", "data", { expirationTtl: 3600 });
```

> To use KV inside command handlers, pass the `env` object through the config or directly to your Bot class.

---

## Environment Variables and Secrets

| Variable    | Type   | Required | Description                        |
|-------------|--------|----------|------------------------------------|
| `BOT_TOKEN` | Secret | Yes      | Telegram bot token from @BotFather |

### Adding custom variables

**Plain variables** go in `wrangler.toml`:

```toml
[vars]
APP_URL = "https://example.com"
```

**Secrets** are set via the CLI:

```bash
npx wrangler secret put MY_SECRET
```

Access both the same way in your Worker:

```typescript
export interface Env {
  BOT_TOKEN: string;
  APP_URL: string;
  MY_SECRET: string;
}
```

---

## Testing

Run tests with Vitest:

```bash
npm test
```

The project is preconfigured with `@cloudflare/vitest-pool-workers` for testing Workers-specific APIs (KV, scheduled events, etc.).

---

## Deployment

### One-Click Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/chibuezedev/telebot)

After deploying, set the `BOT_TOKEN` secret in your Cloudflare dashboard:

**Workers & Pages** → **telebot** → **Settings** → **Variables and Secrets** → **Add** → Name: `BOT_TOKEN`, Value: your token.

Then visit your Worker URL once to register the webhook.

### Manual Deploy

```bash
# Set the bot token secret
npx wrangler secret put BOT_TOKEN

# Deploy
npm run deploy

# Visit the Worker URL to register the webhook
curl https://telebot.<your-subdomain>.workers.dev
```

---

## Useful References

- [Telegraf Documentation](https://telegraf.js.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare KV](https://developers.cloudflare.com/kv/)
- [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

---

## License

MIT
