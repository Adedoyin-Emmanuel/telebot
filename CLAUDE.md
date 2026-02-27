# Telebot — Project Guide for LLMs

This is a Telegram bot starter running on Cloudflare Workers with Telegraf. This document describes the project structure, conventions, and how to extend the bot.

## Tech Stack

- **Runtime**: Cloudflare Workers (edge, serverless)
- **Bot Framework**: Telegraf v4 (Telegram Bot API wrapper)
- **Language**: TypeScript (strict mode, ES2022 target)
- **Build/Deploy**: Wrangler CLI
- **Package Manager**: npm or bun (both lock files may exist)

## Project Structure

```
telebot/
├── worker.ts              # Entry point. Exports fetch() and optionally scheduled().
├── src/
│   ├── bot/
│   │   ├── index.ts       # Bot class — wraps Telegraf, handles webhook lifecycle
│   │   └── commands.ts    # All command and message handlers registered here
│   ├── config/
│   │   └── index.ts       # Config interface + factory that reads from env
│   └── utils/
│       └── logger.ts      # Structured console logger with [INFO], [ERROR], etc.
├── wrangler.toml          # Cloudflare Workers config (name, bindings, cron)
├── tsconfig.json          # TypeScript config
├── package.json           # Dependencies and scripts
├── .dev.vars.example      # Example local secrets file
└── .gitignore
```

## Architecture

### Request flow

```
Telegram API → POST /webhook → worker.ts fetch() → Bot.handleWebhook() → Telegraf → commands.ts handlers
```

### Key classes and modules

- **`worker.ts`** — The Cloudflare Worker entry point. Handles HTTP routing (`/`, `/webhook`, `/health`). Creates `Bot` instance per request. Contains the `Env` interface with all bindings.
- **`Bot` (src/bot/index.ts)** — Wraps a Telegraf instance. Responsible for webhook setup/teardown and processing updates. Exposes `bot.telegram` for direct Telegram API calls.
- **`registerCommands` (src/bot/commands.ts)** — Registers all Telegraf command and event handlers. This is the single place where bot behavior is defined.
- **`getConfig` (src/config/index.ts)** — Factory that reads `Env` and returns a typed `Config` object.
- **`logger` (src/utils/logger.ts)** — Simple structured logger. Use `logger.info()`, `logger.error()`, etc.

## Conventions

### File and folder placement

| What you're adding | Where it goes |
|---|---|
| New bot command or message handler | `src/bot/commands.ts` — add handler function + register it in `registerCommands()` |
| New bot capability (e.g. sending media, managing groups) | Add a method to `Bot` class in `src/bot/index.ts` |
| New service/API integration | Create `src/services/<name>.ts`, export a class. Import in `worker.ts` or pass to Bot. |
| Scheduled/cron job logic | Create `src/jobs/<name>.ts`. Wire it in the `scheduled()` handler in `worker.ts`. |
| TypeScript interfaces/types | Create `src/types/index.ts` or `src/types/<domain>.ts` |
| Utility functions | Add to `src/utils/` as a new file (e.g. `src/utils/format.ts`) |
| New environment variable | Add to `Env` interface in `worker.ts` + `Config` interface in `src/config/index.ts` |
| New KV namespace or binding | Add to `wrangler.toml` and `Env` interface in `worker.ts` |
| New HTTP route | Add a path check in the `fetch()` handler in `worker.ts` |

### Naming conventions

- **Files**: lowercase kebab-case (e.g. `my-service.ts`). Index files export the module's public API.
- **Classes**: PascalCase (e.g. `Bot`, `ApiService`)
- **Functions**: camelCase (e.g. `handleStart`, `registerCommands`)
- **Interfaces/Types**: PascalCase (e.g. `Config`, `Env`)
- **Constants**: UPPER_SNAKE_CASE for env vars, camelCase for runtime constants

### Code patterns

- **No Express/Hono** — routing is manual path matching in `worker.ts`. Keep it simple.
- **One Bot instance per request** — Workers are stateless. Bot is created fresh in each `fetch()` or `scheduled()` call.
- **Telegraf for bot logic** — Use `bot.command()`, `bot.on()`, `bot.action()` for Telegram interactions. Don't manually call the Telegram HTTP API.
- **Config via factory** — Always read env through `getConfig(env)`, not directly from `env`.
- **Logging** — Use `logger` from `src/utils/logger.ts`, not raw `console.log`.

### Environment and secrets

- **Plain variables**: defined in `[vars]` section of `wrangler.toml`
- **Secrets** (tokens, keys): set via `npx wrangler secret put SECRET_NAME`, never in `wrangler.toml`
- **Local dev secrets**: stored in `.dev.vars` (gitignored), one `KEY=value` per line
- **All bindings** (KV, secrets, vars) are accessed through the `Env` interface in `worker.ts`

## Extending the bot

### Adding a new command

1. Open `src/bot/commands.ts`
2. Write an async handler function: `async function handleMyCommand(ctx: Context): Promise<void> { ... }`
3. Register it in `registerCommands()`: `bot.command("mycommand", handleMyCommand);`

### Adding a scheduled job

1. Uncomment the `[triggers]` section in `wrangler.toml` and add your cron expression
2. Create `src/jobs/my-job.ts` with your logic
3. Uncomment the `scheduled()` handler in `worker.ts`
4. Import and call your job in the appropriate `case` branch

### Adding an external API integration

1. Create `src/services/my-api.ts` with a class that encapsulates the API calls
2. Add any needed env vars to `Env` and `Config`
3. Instantiate the service in `worker.ts` and pass it where needed

### Adding persistent storage (KV)

1. Run `npx wrangler kv namespace create MY_KV`
2. Add the `[[kv_namespaces]]` binding to `wrangler.toml`
3. Add `MY_KV: KVNamespace` to the `Env` interface
4. Use `env.MY_KV.get()`, `env.MY_KV.put()`, `env.MY_KV.delete()` in handlers

## Scripts

```bash
npm run dev      # Start local dev server (requires .dev.vars)
npm run deploy   # Deploy to Cloudflare Workers
npm test         # Run tests with Vitest
```
