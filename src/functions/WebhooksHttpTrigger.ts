import * as crypto from "crypto";
import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from "@azure/functions";

export async function WebhooksHttpTrigger(
	request: HttpRequest,
	context: InvocationContext
): Promise<HttpResponseInit> {
	context.log(`Webhook event recieved at "${request.url}"!`);

	return {
		status: (await verifyWebhookEventSignature(request, context)) ? 200 : 401,
	};
}

app.http("WebhooksHttpTrigger", {
	methods: ["POST"],
	route: "webhooks",
	authLevel: "function",
	handler: WebhooksHttpTrigger,
});

async function verifyWebhookEventSignature(
	request: HttpRequest,
	context: InvocationContext
) {
	const XERO_WEBHOOK_KEY = process.env.XERO_WEBHOOK_KEY;

	const rawBody = await request.text();

	context.log(request.headers);
	context.log(rawBody);

	if (!request.text) {
		context.log("Signature failed. No request body was provided...");
		return false;
	}

	if (!XERO_WEBHOOK_KEY) {
		context.log("Signature failed. No XERO_WEBHOOK_KEY was provided...");
		return false;
	}

	let computedSignature = crypto
		.createHmac("sha256", XERO_WEBHOOK_KEY)
		.update(rawBody.toString())
		.digest("base64");
	let xeroSignature = request.headers.get("x-xero-signature");

	if (xeroSignature === computedSignature) {
		context.log("Signature passed! This is from Xero!");
		return true;
	} else {
		// If this happens someone who is not Xero is sending you a webhook
		context.log(
			"Signature failed. Webhook might not be from Xero or you have misconfigured something..."
		);
		context.log(
			`Got {${computedSignature}} when we were expecting {${xeroSignature}}`
		);
		return false;
	}
}
