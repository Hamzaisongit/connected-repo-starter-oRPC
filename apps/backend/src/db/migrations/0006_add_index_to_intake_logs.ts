import { change } from '../db_script';

change(async (db) => {
  await db.changeTable('user_adherence_logs', (t) => ({
    ...t.add(
      t.index(
        [
          'supplementId',
          {
            column: 'scheduledFor',
            order: 'DESC',
          },
        ]
      ),
    ),
  }));
});
