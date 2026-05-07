export const APP_NAME = "Type A Buddy";

const envApiBaseUrl =
	(typeof process !== "undefined" &&
		process.env &&
		(process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL)) ||
	"";

export const API_BASE_URL = (envApiBaseUrl || "http://127.0.0.1:8000").replace(
	/\/$/,
	""
);