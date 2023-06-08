import * as crypto from "crypto";
import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from "@azure/functions";

app.http("LoginHttpTrigger", {
	methods: ["GET"],
	route: "login",
	authLevel: "function",
	handler: async (
		request: HttpRequest,
		context: InvocationContext
	): Promise<HttpResponseInit> => {
		context.log(`Webhook event received at "${request.url}"!`);

		const XeroButton = "<a href='/api/connect'>Connect to Xero</a>";

		return {
			body: `<!DOCTYPE html><html><head><title>Page Title</title></head><body>${XeroButton}</body></html>`,
			headers: { "content-type": "text/html" },
		};
	},
});

app.http("WebhooksHttpTrigger", {
	methods: ["POST"],
	route: "webhooks",
	authLevel: "function",
	handler: async (
		request: HttpRequest,
		context: InvocationContext
	): Promise<HttpResponseInit> => {
		context.log(`Webhook event received at "${request.url}"!`);

		return {
			status: (await verifyWebhookEventSignature(request, context)) ? 200 : 401,
		};
	},
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

	const computedSignature = crypto
		.createHmac("sha256", XERO_WEBHOOK_KEY)
		.update(rawBody.toString())
		.digest("base64");
	const xeroSignature = request.headers.get("x-xero-signature");

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
