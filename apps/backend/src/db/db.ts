import { dbConfig } from "@backend/db/config";
import { AccountTable } from "@backend/modules/auth/tables/account.auth.table";
import { SessionTable } from "@backend/modules/auth/tables/session.auth.table";
import { VerificationTable } from "@backend/modules/auth/tables/verification.auth.table";
import { DailyComplianceTable } from "@backend/modules/daily_complainces/tables/daily_complainces.table";
import { ApiProductRequestLogsTable } from "@backend/modules/logs/tables/api_product_request_logs.table";
import { UserIntakeLogTable } from "@backend/modules/logs/tables/user_adherence_logs.table";
import { RewardsLedgerTable } from "@backend/modules/rewards_ledger/tables/rewards_ledger.table";
import { SubscriptionsTable } from "@backend/modules/subscriptions/tables/subscriptions.table";
import { WebhookCallQueueTable } from "@backend/modules/subscriptions/tables/webhookCallQueue.table";
import { TeamTable } from "@backend/modules/teams/tables/teams.table";
import { UserStackTable } from "@backend/modules/user_stacks/tables/user_stacks.table";
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
		accounts: AccountTable,
		apiProductRequestLogs: ApiProductRequestLogsTable,
		dailyCompliances: DailyComplianceTable,
		rewardsLedger: RewardsLedgerTable,
		sessions: SessionTable,
		subscriptions: SubscriptionsTable,
		teams: TeamTable,
		userIntakeLogs: UserIntakeLogTable,
		users: UserTable,
		userStacks: UserStackTable,
		userStats: UserStatTable,
		verifications: VerificationTable,
		webhookCallQueues: WebhookCallQueueTable,
	},
);

export type Db = typeof db;
