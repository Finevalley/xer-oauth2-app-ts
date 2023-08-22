import * as z from "zod";

export const WebhookRequestSchema = z.object({
	events: z.array(z.any()),
	lastEventSequence: z.number().min(1),
	firstEventSequence: z.number().min(1),
	entropy: z.string().min(1),
});

export type WebhookRequest = z.infer<typeof WebhookRequestSchema>;
