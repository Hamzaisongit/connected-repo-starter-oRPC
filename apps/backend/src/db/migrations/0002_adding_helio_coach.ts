import { change } from '../db_script';

change(async (db) => {
  await db.addEnumValues('api_status_enum', ['Invalid API route']);

  await db.createEnum('user_adherence_status_enum', ['Taken on-time', 'Taken late', 'Missed', 'Skipped']);

  await db.createEnum('days_of_week_enum', ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

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

  await db.changeTable('teams', (t) => ({
    allowApiSubsCreationForSkus: t.add(t.array(t.string()).default([])),
    subscriptionAlertWebhookUrl: t.change(t.varchar(255), t.string().nullable()),
  }));

  await db.changeTable('users', (t) => ({
    timeZone: t.add(t.string().nullable()),
  }));
});

change(async (db) => {
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
    days: t.enum('days_of_week_enum'),
    timesOfDay: t.array(t.string()),
    imageUrl: t.string().nullable(),
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
});
