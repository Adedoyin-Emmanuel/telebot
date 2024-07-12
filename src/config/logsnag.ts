import { LogSnag } from "@logsnag/node";
import { LOGSNAG_PROJECT, LOGSNAG_TOKEN } from "../constants";

const logsnag = new LogSnag({
	token: LOGSNAG_TOKEN as string,
	project: LOGSNAG_PROJECT as string,
});

export default logsnag;
