import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from "@azure/functions";
import * as crypto from "crypto";

export async function WebhooksHttpTrigger(
	request: HttpRequest,
	context: InvocationContext
): Promise<HttpResponseInit> {
	context.log(`Webhook event recieved at "${request.url}"!`);
	context.log(request.headers);
	context.log(request.body);

	return { status: verifyWebhookEventSignature(request) ? 200 : 401 };
}

app.http("WebhooksHttpTrigger", {
	methods: ["POST"],
	route: "webhooks",
	authLevel: "function",
	handler: WebhooksHttpTrigger,
});

function verifyWebhookEventSignature(req: HttpRequest) {
	const WEBHOOK_KEY = process.env.WEBHOOK_KEY;

	if (!req.body) {
		console.log("Signature failed. No request body was provided...");
		return false;
	}

	if (!WEBHOOK_KEY) {
		console.log("Signature failed. No WEBHOOK_KEY was provided...");
		return false;
	}

	let computedSignature = crypto
		.createHmac("sha256", WEBHOOK_KEY)
		.update(req.body.toString())
		.digest("base64");
	let xeroSignature = req.headers.get("x-xero-signature");

	if (xeroSignature === computedSignature) {
		console.log("Signature passed! This is from Xero!");
		return true;
	} else {
		// If this happens someone who is not Xero is sending you a webhook
		console.log(
			"Signature failed. Webhook might not be from Xero or you have misconfigured something..."
		);
		console.log(
			`Got {${computedSignature}} when we were expecting {${xeroSignature}}`
		);
		return false;
	}
}
