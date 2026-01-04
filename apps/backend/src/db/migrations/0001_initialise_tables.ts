import { change } from '../db_script';

change(async (db) => {
  await db.createEnum('api_request_method_enum', ['GET', 'POST', 'PUT', 'DELETE']);

  await db.createEnum('api_status_enum', ['AI Error', 'Invalid API route', 'No active subscription', 'Requests exhausted', 'Pending', 'Server Error', 'Success']);

  await db.createEnum('api_product_enum', ['adherence_log_create_100_30days']);

  await db.createEnum('user_adherence_status_enum', ['Taken on-time', 'Taken late', 'Missed', 'Skipped']);

  await db.createEnum('webhook_status_enum', ['Pending', 'Sent', 'Failed']);

  await db.createTable(
    'accounts',
    (t) => ({
      id: t.string().primaryKey(),
      userId: t.uuid(),
      accountId: t.string(),
      providerId: t.string(),
      accessToken: t.text().nullable(),
      refreshToken: t.text().nullable(),
      accessTokenExpiresAt: t.timestamp().nullable(),
      refreshTokenExpiresAt: t.timestamp().nullable(),
      scope: t.text().nullable(),
      idToken: t.text().nullable(),
      password: t.text().nullable(),
      createdAt: t.timestamps().createdAt,
      updatedAt: t.timestamps().updatedAt,
    }),
    (t) => t.index(['userId']),
  );

  await db.createTable(
    'sessions',
    (t) => ({
      id: t.string().primaryKey(),
      token: t.string(),
      userId: t.uuid().nullable(),
      ipAddress: t.string().nullable(),
      userAgent: t.text().nullable(),
      browser: t.string().nullable(),
      os: t.string().nullable(),
      device: t.string().nullable(),
      deviceFingerprint: t.string().nullable(),
      markedInvalidAt: t.timestamp().nullable(),
      expiresAt: t.timestamp(),
      createdAt: t.timestamps().createdAt,
      updatedAt: t.timestamps().updatedAt,
    }),
    (t) => 
      t.index(
        [
          'id',
          {
            column: 'expiresAt',
            order: 'DESC',
          },
          {
            column: 'markedInvalidAt',
            order: 'DESC',
          },
        ]
      ),
  );

  await db.createTable('teams', (t) => ({
    teamId: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    allowApiSubsCreationForSkus: t.array(t.string()).default([]),
    allowedDomains: t.array(t.string()),
    allowedIPs: t.array(t.string()),
    apiSecretHash: t.string().select(false),
    name: t.string(),
    rateLimitPerMinute: t.integer(),
    subscriptionAlertWebhookUrl: t.string().nullable(),
    subscriptionAlertWebhookBearerToken: t.string().select(false).nullable(),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));

  await db.createTable('users', (t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    email: t.string().unique(),
    emailVerified: t.boolean().default(false),
    name: t.string(),
    image: t.string().nullable(),
    timeZone: t.string().nullable(),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));

  await db.createTable(
    'verifications',
    (t) => ({
      identifier: t.string(),
      value: t.text(),
      expiresAt: t.timestamp(),
      createdAt: t.timestamps().createdAt,
      updatedAt: t.timestamps().updatedAt,
    }),
    (t) => t.primaryKey(['identifier', 'value']),
  );
});

change(async (db) => {
  await db.createTable(
    'api_product_request_logs',
    (t) => ({
      apiProductRequestId: t.string(26).primaryKey(),
      teamId: t.uuid(),
      teamUserReferenceId: t.string(),
      requestBodyText: t.text().nullable(),
      requestBodyJson: t.json().nullable(),
      method: t.enum('api_request_method_enum'),
      path: t.string(),
      ip: t.string(),
      status: t.enum('api_status_enum').default('Pending'),
      responseText: t.text().nullable(),
      responseJson: t.json().nullable(),
      responseTime: t.integer(),
      createdAt: t.timestamps().createdAt,
      updatedAt: t.timestamps().updatedAt,
    }),
    (t) => 
      t.index(
        [
          'teamId',
          {
            column: 'createdAt',
            order: 'DESC',
          },
        ]
      ),
  );

  await db.createTable('daily_compliances', (t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    userId: t.uuid().foreignKey('users', 'id', {
      onUpdate: 'RESTRICT',
      onDelete: 'CASCADE',
    }),
    adherencePercentage: t.decimal(),
    date: t.timestamp(),
    dailyShieldOpeningBalance: t.smallint(),
    dailyShieldClosingBalance: t.smallint(),
    dailyShieldUsed: t.boolean(),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));

  await db.createTable(
    'subscriptions',
    (t) => ({
      subscriptionId: t.string(26).primaryKey(),
      expiresAt: t.timestamp(),
      maxRequests: t.integer(),
      apiProductSku: t.enum('api_product_enum'),
      apiProductQuantity: t.smallint(),
      requestsConsumed: t.integer(),
      teamId: t.uuid(),
      teamUserReferenceId: t.string(),
      billingInvoiceNumber: t.string().nullable(),
      billingInvoiceDate: t.timestamp().nullable(),
      notifiedAt90PercentUse: t.timestamp().nullable(),
      paymentReceivedDate: t.timestamp().nullable(),
      paymentTransactionId: t.string().nullable(),
      createdAt: t.timestamps().createdAt,
      updatedAt: t.timestamps().updatedAt,
    }),
    (t) => t.index(['teamId', 'teamUserReferenceId', 'apiProductSku']),
  );

  await db.createTable('user_stacks', (t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    userId: t.uuid().foreignKey('users', 'id', {
      onUpdate: 'RESTRICT',
      onDelete: 'CASCADE',
    }),
    name: t.string(),
    instructions: t.array(t.string()),
    isActive: t.boolean(),
    dosage: t.smallint(),
    unit: t.string(),
    days: t.array(t.string()),
    timesOfDay: t.array(t.string()),
    imageUrl: t.string().nullable(),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));

  await db.createTable('user_stats', (t) => ({
    userId: t.uuid().primaryKey().foreignKey('users', 'id', {
      onUpdate: 'RESTRICT',
      onDelete: 'CASCADE',
    }),
    currentStreak: t.integer().default(0),
    longestStreak: t.integer().default(0),
    currentStreakShieldsUsed: t.smallint().default(0),
    longestStreakShieldsUsed: t.smallint().default(0),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));
});

change(async (db) => {
  await db.createTable('user_adherence_logs', (t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    userId: t.uuid().foreignKey('users', 'id', {
      onUpdate: 'RESTRICT',
      onDelete: 'CASCADE',
    }),
    supplementId: t.uuid().foreignKey('user_stacks', 'id', {
      onUpdate: 'RESTRICT',
      onDelete: 'CASCADE',
    }),
    reason: t.string().nullable(),
    status: t.enum('user_adherence_status_enum'),
    scheduledFor: t.timestamp(),
    actualAt: t.timestamp(),
    timeZoneOffset: t.smallint(),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));

  await db.createTable(
    'webhook_call_queue',
    (t) => ({
      webhookCallQueueId: t.string(26).primaryKey(),
      teamId: t.uuid(),
      webhookUrl: t.string(),
      payload: t.json(),
      status: t.enum('webhook_status_enum'),
      attempts: t.integer().default(0),
      maxAttempts: t.integer(),
      lastAttemptAt: t.timestamp().nullable(),
      scheduledFor: t.timestamp(),
      sentAt: t.timestamp().nullable(),
      subscriptionId: t.string().foreignKey('subscriptions', 'subscriptionId', {
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      }),
      errorMessage: t.text().nullable(),
      createdAt: t.timestamps().createdAt,
      updatedAt: t.timestamps().updatedAt,
    }),
    (t) => t.index(['status', 'scheduledFor']),
  );
});
