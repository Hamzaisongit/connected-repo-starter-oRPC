import { API_PRODUCT_REQUEST_STATUS_ENUM, API_REQUEST_METHOD_ENUM, apiProductSkuEnum, DAYS_OF_WEEK_ENUM, USER_ADHERENCE_STATUS_ENUM, WEBHOOK_STATUS_ENUM } from "@connected-repo/zod-schemas/enums.zod";
import { createBaseTable } from "orchid-orm";
import { ulid } from "ulid";

export const BaseTable = createBaseTable({
  autoForeignKeys: false,
  nowSQL: `now() AT TIME ZONE 'UTC'`,
	snakeCase: true,

	columnTypes: (t) => ({
		...t,
    apiProductSkuEnum: () => t.enum("api_product_enum", apiProductSkuEnum),
    apiRequestMethodEnum: () => t.enum("api_request_method_enum", API_REQUEST_METHOD_ENUM),
    apiProductRequestStatusEnum: () => t.enum("api_status_enum", API_PRODUCT_REQUEST_STATUS_ENUM),
    daysOfWeekEnum: () => t.enum("days_of_week_enum", DAYS_OF_WEEK_ENUM),
    timestampNumber: () => t.timestamp().asNumber(),
    ulid: () => t.string(26).default(() => ulid()),
    userAdherenceStatusEnum: () => t.enum("user_adherence_status_enum", USER_ADHERENCE_STATUS_ENUM),
    webhookStatusEnum: () => t.enum("webhook_status_enum", WEBHOOK_STATUS_ENUM),

		timestamps: () => ({
      createdAt: t.timestamps().createdAt.asNumber(),
      updatedAt: t.timestamps().updatedAt.asNumber(),
    }),
	}),
});

export const { sql } = BaseTable;