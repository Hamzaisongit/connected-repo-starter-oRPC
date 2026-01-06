import { change } from '../db_script';

change(async (db) => {
  await db.createEnum('theme_setting_enum', ['dark', 'light', 'system']);

  await db.changeTable('user_stacks', (t) => ({
    reminderTime: t.add(t.time().default('08:00:00')),
    days: t.rename('reminderDays'),
    timesOfDay: t.drop(t.array(t.varchar(255))),
  }));
});

change(async (db) => {
  await db.changeTable('users', (t) => ({
    themeSetting: t.add(t.enum('theme_setting_enum').default('system')),
    timeZone: t.rename('timezone'),
  }));
});
