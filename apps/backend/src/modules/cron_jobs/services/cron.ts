import { createAllUsersDailyComplianceService } from '@backend/modules/daily_complainces/services/create.daily_compliance.service';
import { reminderUserStackService } from '@backend/modules/user_stacks/services/reminder.user_stacks.service';
import { logger } from '@backend/utils/logger.utils';
import * as cron from 'node-cron';

// Mutex flag to prevent concurrent cron job execution
let isCronJobRunning = false;

// Schedule to run every minute
// TODO: make the name a bit descriptive if possible   
export const perMinuteCronJobs: cron.ScheduledTask = cron.schedule(
	'* * * * *', 
	async () => {
		// Check if previous job is still running
		if (isCronJobRunning) {
			logger.warn('Skipping cron job - previous job still running');
			return;
		}

		// Acquire mutex lock
		isCronJobRunning = true;

		try {
			logger.info('Running scheduled supplement reminder check...');

			// Make function calls
			await Promise.all([
				reminderUserStackService(), 
				createAllUsersDailyComplianceService()
			]);

			logger.info(
				"Cron job completed successfully",
			);

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error(
				{
					error: errorMessage,
				},
				'Error running supplement reminder cron job',
			);
		} finally {
			// Release mutex lock
			isCronJobRunning = false;
		}
	}
);