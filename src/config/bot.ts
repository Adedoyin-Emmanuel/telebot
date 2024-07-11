import { Telegraf } from "telegraf";
import { BOT_TOKEN } from "../constants";


const bot = new Telegraf(BOT_TOKEN as string);

export default bot;