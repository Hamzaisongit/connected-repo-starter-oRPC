import * as cron from 'node-cron';
import { env, isTest } from '@backend/configs/env.config';
import { logger } from '@backend/utils/logger.utils';

let cronJob: cron.ScheduledTask | null = null;

/**
 * Start the supplement reminder cron job that runs every minute
 * Only starts in non-test environments
 */
export const startSupplementReminderCron = () => {
	// Skip cron job in test environment
	if (isTest) {
		logger.info('Skipping supplement reminder cron job in test environment');
		return;
	}

	// Schedule to run every minute
	cronJob = cron.schedule('* * * * *', async () => {
		try {
			logger.info('Running scheduled supplement reminder check...');

			// Make HTTP request to the cron endpoint
			const response = await fetch(`${env.VITE_API_URL}/cron/schedule-supplement-reminders`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${env.CRON_JOB_TOKEN}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				const errorText = await response.text();
				logger.error(
					{
						status: response.status,
						statusText: response.statusText,
						body: errorText,
					},
					'Supplement reminder cron job failed',
				);
				return;
			}

			const result = await response.json();
			logger.info(
				{
					usersProcessed: result.usersProcessed,
					eventsPublished: result.eventsPublished,
				},
				'Supplement reminder cron job completed successfully',
			);

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error(
				{
					error: errorMessage,
				},
				'Error running supplement reminder cron job',
			);
		}
	});

	// Start the cron job
	cronJob.start();
	logger.info('Supplement reminder cron job started - will run every minute');
};

/**
 * Stop the supplement reminder cron job
 */
export const stopSupplementReminderCron = () => {
	if (cronJob) {
		cronJob.stop();
		cronJob = null;
		logger.info('Supplement reminder cron job stopped');
	}
};

/**
 * Check if the cron job is initialized
 */
export const isSupplementReminderCronRunning = (): boolean => {
	return cronJob !== null;
};