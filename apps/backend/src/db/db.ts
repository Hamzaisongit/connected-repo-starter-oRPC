import { dbConfig } from "@backend/db/config";
import { AccountTable } from "@backend/modules/auth/tables/account.auth.table";
import { SessionTable } from "@backend/modules/auth/tables/session.auth.table";
import { VerificationTable } from "@backend/modules/auth/tables/verification.auth.table";
import { JournalEntryTable } from "@backend/modules/journal-entries/tables/journal_entries.table";
import { ApiProductRequestLogsTable } from "@backend/modules/logs/tables/api_product_request_logs.table";
import { UserAdherenceLogTable } from "@backend/modules/logs/tables/user_adherence_logs.table";
import { PromptsTable } from "@backend/modules/prompts/tables/prompts.table";
import { DailyComplianceTable } from "@backend/modules/streaks/tables/dailyCompliance.table";
import { SubscriptionsTable } from "@backend/modules/subscriptions/tables/subscriptions.table";
import { WebhookCallQueueTable } from "@backend/modules/subscriptions/tables/webhookCallQueue.table";
import { SupplementTable } from "@backend/modules/supplements/tables/supplements.table";
import { TeamTable } from "@backend/modules/teams/tables/teams.table";
import { UserStatTable } from "@backend/modules/users/tables/user_stats.table";
import { UserTable } from "@backend/modules/users/tables/users.table";
import { orchidORM } from "orchid-orm/node-postgres";

const databaseURL = `postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}?ssl=${dbConfig.ssl ? "require" : "false"}`;

// Phase 0 Complete: All database tables registered
export const db = orchidORM(
	{
		databaseURL,
		// log: true,
	},
	{
		users: UserTable,
		journalEntries: JournalEntryTable,
		prompts: PromptsTable,
		sessions: SessionTable,
		accounts: AccountTable,
		verifications: VerificationTable,
		subscriptions: SubscriptionsTable,
		teams: TeamTable,
		dailyCompliances: DailyComplianceTable,
		supplements: SupplementTable,
		userAdherenceLogs: UserAdherenceLogTable,
		userStats: UserStatTable,
		apiProductRequestLogs: ApiProductRequestLogsTable,
		webhookCallQueues: WebhookCallQueueTable,
	},
);

export type Db = typeof db;
