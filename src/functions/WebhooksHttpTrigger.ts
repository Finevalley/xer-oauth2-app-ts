import * as crypto from "crypto";
import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from "@azure/functions";
import jwtDecode from "jwt-decode";
import { TokenSet } from "openid-client";
import { XeroAccessToken, XeroClient, XeroIdToken } from "xero-node";

const client_id: string = process.env.XERO_CLIENT_ID!;
const client_secret: string = process.env.XERO_CLIENT_SECRET!;
const redirectUrl: string = process.env.XERO_REDIRECT_URI!;
const scopes =
	"openid profile email accounting.settings accounting.reports.read accounting.journals.read accounting.contacts accounting.attachments accounting.transactions offline_access";

const xero = new XeroClient({
	clientId: client_id,
	clientSecret: client_secret,
	redirectUris: [redirectUrl],
	scopes: scopes.split(" "),
});

app.http("LoginHttpTrigger", {
	methods: ["GET"],
	route: "login",
	authLevel: "function",
	handler: async (
		request: HttpRequest,
		context: InvocationContext,
	): Promise<HttpResponseInit> => {
		context.log(`Webhook event received at "${request.url}"!`);

		const XeroButton = "<a href='/api/connect'>Connect to Xero</a>";

		return {
			body: `<!DOCTYPE html><html><head><title>Page Title</title></head><body>${XeroButton}</body></html>`,
			headers: { "content-type": "text/html" },
		};
	},
});

app.http("ConnectHttpTrigger", {
	methods: ["GET"],
	route: "connect",
	authLevel: "function",
	handler: async (
		request: HttpRequest,
		context: InvocationContext,
	): Promise<HttpResponseInit> => {
		context.log(`Webhook event received at "${request.url}"!`);

		try {
			const consentUrl: string = await xero.buildConsentUrl();
			return {
				status: 302,
				headers: { location: consentUrl },
			};
		} catch (err) {
			return {
				body: "Sorry, something went wrong",
				status: 500,
			};
		}
	},
});

app.http("CallbackHttpTrigger", {
	methods: ["GET"],
	route: "callback",
	authLevel: "function",
	handler: async (
		request: HttpRequest,
		context: InvocationContext,
	): Promise<HttpResponseInit> => {
		context.log(`Webhook event received at "${request.url}"!`);

		try {
			const tokenSet: TokenSet = await xero.apiCallback(request.url);
			await xero.updateTenants();

			if (!tokenSet || !tokenSet.id_token || !tokenSet.access_token) {
				return { body: "Sorry, something went wrong", status: 500 };
			}

			const decodedIdToken: XeroIdToken = jwtDecode(tokenSet.id_token);
			const decodedAccessToken: XeroAccessToken = jwtDecode(
				tokenSet.access_token,
			);

			return {
				status: 302,
				headers: { location: "/api/organisation" },
			};
		} catch (err) {
			return {
				body: "Sorry, something went wrong",
				status: 500,
			};
		}
	},
});

app.http("WebhooksHttpTrigger", {
	methods: ["POST"],
	route: "webhooks",
	authLevel: "function",
	handler: async (
		request: HttpRequest,
		context: InvocationContext,
	): Promise<HttpResponseInit> => {
		context.log(`Webhook event received at "${request.url}"!`);

		return {
			status: (await verifyWebhookEventSignature(request, context)) ? 200 : 401,
		};
	},
});

async function verifyWebhookEventSignature(
	request: HttpRequest,
	context: InvocationContext,
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
			"Signature failed. Webhook might not be from Xero or you have misconfigured something...",
		);
		context.log(
			`Got {${computedSignature}} when we were expecting {${xeroSignature}}`,
		);
		return false;
	}
}
