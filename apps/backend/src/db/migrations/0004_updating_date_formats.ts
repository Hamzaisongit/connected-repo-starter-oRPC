import { change } from '../db_script';

change(async (db) => {
  await db.changeEnumValues('api_product_enum', ['adherence_log_create_100_30days'], ['intake_log_create_100_30days']);

  await db.query`
    UPDATE "users" 
    SET "timezone" = 'Etc/UTC' 
    WHERE "timezone" IS NULL;
  `;

  await db.changeTable('users', (t) => ({
    timezone: t.change(t.varchar(255).nullable(), t.string().default('Etc/UTC')),
  }));

  await db.changeTable('daily_compliances', (t) => ({
    date: t.change(t.timestamp(), t.date()),
    adherencePercentage: t.rename('intakePercentage'),
  }));

  await db.changeTable('user_adherence_logs', (t) => ({
    logTimezone: t.add(t.string().default('Etc/UTC')),
    timeZoneOffset: t.drop(t.smallint()),
  }));
});
