import z from "zod";

export const API_PRODUCT_REQUEST_STATUS_ENUM = ["AI Error", "Invalid API route", "No active subscription", "Requests exhausted", "Pending", "Server Error", "Success"] as const;
export const apiProductRequestStatusZod = z.enum(API_PRODUCT_REQUEST_STATUS_ENUM);
export type ApiProductRequestStaus = z.infer<typeof apiProductRequestStatusZod>;

export const API_PRODUCTS = [
  {
    apiRoute: "adherence-logs",
    name: "Log Supplement Adherence",
    sku: "adherence_log_create_100_30days",
    unit_size: 100,
    validity_days: 30,
  }
]as const;
export const apiProductSkuEnum = API_PRODUCTS.map(product => product.sku) as ["adherence_log_create_100_30days"];
export const apiProductSkuZod = z.enum(apiProductSkuEnum);
export type ApiProductSku = z.infer<typeof apiProductSkuZod>;

export const API_REQUEST_METHOD_ENUM = ["GET", "POST", "PUT", "DELETE"] as const;
export const apiRequestMethodZod = z.enum(API_REQUEST_METHOD_ENUM);
export type ApiRequestMethod = z.infer<typeof apiRequestMethodZod>;

export const DAYS_OF_WEEK_ENUM = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export const daysOfWeekZod = z.enum(DAYS_OF_WEEK_ENUM);
export type DaysOfWeek = z.infer<typeof daysOfWeekZod>;

export const THEME_SETTING_ENUM = ["dark", "light", "system"] as const;
export const themeSettingZod = z.enum(THEME_SETTING_ENUM);
export type ThemeSetting = z.infer<typeof themeSettingZod>;

export const USER_ADHERENCE_STATUS_ENUM = ["Taken on-time", "Taken late", "Missed", "Skipped"] as const;
export const userAdherenceStatusZod = z.enum(USER_ADHERENCE_STATUS_ENUM);
export type UserAdherenceStatus = z.infer<typeof userAdherenceStatusZod>;

export const WEBHOOK_STATUS_ENUM = ["Pending", "Sent", "Failed"] as const;
export const webhookStatusZod = z.enum(WEBHOOK_STATUS_ENUM);
export type WebhookStatus = z.infer<typeof webhookStatusZod>;