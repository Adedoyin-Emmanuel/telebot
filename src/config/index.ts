export interface Config {
  botToken: string;
}

export const getConfig = (env: any): Config => ({
  botToken: env.BOT_TOKEN,
});
