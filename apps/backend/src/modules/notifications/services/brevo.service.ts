import { env } from "@backend/configs/env.config";
import { logger } from "@backend/utils/logger.utils";
import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";

const defaultClient = new TransactionalEmailsApi();
(defaultClient as any).authentications.apiKey.apiKey = env.BREVO_API_KEY;

export interface SendEmailParams {
	to: string;
	templateId: number;
	params: Record<string, string | number | boolean>;
}

export const sendTemplateEmail = async ({
	to,
	templateId,
	params,
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> => {
	try {
		logger.info(
			{
				to,
				templateId,
				paramsKeys: Object.keys(params),
			},
			"Sending Brevo template email...",
		);

		const smtpEmail = new SendSmtpEmail();
		smtpEmail.sender = {
			email: env.BREVO_SENDER_EMAIL || 'noreply@yourdomain.com',
			name: env.BREVO_SENDER_NAME || 'YourAppName',
		};
		smtpEmail.to = [
			{
				email: to,
			},
		];
		smtpEmail.templateId = templateId;
		smtpEmail.params = params;

		const result = await defaultClient.sendTransacEmail(smtpEmail);

		logger.info(
			{
				to,
				templateId,
				messageId: result.body?.messageId,
			},
			"Brevo email sent successfully",
		);

		return {
			success: true,
			messageId: result.body?.messageId,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(
			{
				to,
				templateId,
				error: errorMessage,
			},
			"Failed to send Brevo email",
		);

		return {
			success: false,
			error: errorMessage,
		};
	}
};

export const sendWelcomeEmail = async (email: string, name: string) => {
	logger.info({ email, name }, "Sending welcome email to user...");

	const result = await sendTemplateEmail({
		to: email,
		templateId: env.WELCOME_EMAIL_TEMPLATE_ID || 1,
		params: {
			name,
			email,
		},
	});

	if (result.success) {
		logger.info({ email, messageId: result.messageId }, "Welcome email sent successfully");
	} else {
		logger.error({ email, error: result.error }, "Failed to send welcome email");
	}

	return result;
};

export const sendReminderEmail = async (params: {
	email: string;
	name: string;
	supplementName: string;
	scheduledTime: string;
}) => {
	const { email, name, supplementName, scheduledTime } = params;

	logger.info(
		{
			email,
			supplementName,
		},
		"Sending reminder email to user...",
	);

	const result = await sendTemplateEmail({
		to: email,
		templateId: env.REMINDER_EMAIL_TEMPLATE_ID || 2,
		params: {
			name,
			email,
			supplementName,
			scheduledTime,
		},
	});

	if (result.success) {
		logger.info({ email, messageId: result.messageId }, "Reminder email sent successfully");
	} else {
		logger.error({ email, error: result.error }, "Failed to send reminder email");
	}

	return result;
};
