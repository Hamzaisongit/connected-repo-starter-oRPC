import { change } from '../db_script';

change(async (db) => {
  await db.changeTable('sessions', (t) => ({
    ...t.add(
      t.unique(['token'])
    ),
  }));

  await db.changeTable('users', (t) => ({
    themeSetting: t.change(t.enum('theme_setting_enum').default(t.sql`'system'::theme_setting_enum`), t.enum('theme_setting_enum').default('light')),
  }));
});
