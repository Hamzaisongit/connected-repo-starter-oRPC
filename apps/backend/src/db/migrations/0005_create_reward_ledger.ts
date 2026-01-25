import { ulid } from 'ulid';
import { change } from '../db_script';

change(async (db) => {
  await db.addEnumValues('user_adherence_status_enum', ['Shield used']);

  await db.createEnum('rewards_transaction_type_enum', ['Assigned', 'Convert', 'Earn', 'Revert', 'Use']);

  // Create User Stats entry for the existing users where missing
  await db.query`
    INSERT INTO user_stats (user_id)
    SELECT u.id
    FROM users u
    LEFT JOIN user_stats us ON us.user_id = u.id
    WHERE us.user_id IS NULL;
  `

  await db.changeTable('daily_compliances', (t) => ({
    intakeCount: t.add(t.smallint().default(0)),
    shieldsUsed: t.add(t.smallint().default(0)),
    totalSupplements: t.add(t.smallint().default(0)),
    dailyShieldOpeningBalance: t.rename('shieldsOpeningBalance'),
    dailyShieldClosingBalance: t.rename('shieldsClosingBalance'),
    dailyShieldUsed: t.drop(t.boolean()),
    ...t.add(
      t.index(
        [
          'userId',
          {
            column: 'date',
            order: 'DESC',
          },
        ]
      ),
    ),
  }));

  await db.changeTable('user_stats', (t) => ({
    coinsBalance: t.add(t.integer().default(0).check(t.sql`"coins_balance" >= 0`)),
    shieldsBalance: t.add(t.integer().default(0).check(t.sql`"shields_balance" >= 0`)),
  }));

  await db.changeTable('user_adherence_logs', (t) => ({
    ...t.drop(
      t.foreignKey(
        ['supplement_id'],
        'public.user_stacks',
        ['id'],
        {
          onUpdate: 'RESTRICT',
          onDelete: 'CASCADE',
        },
      ),
    ),
    ...t.add(
      t.foreignKey(
        ['supplement_id'],
        'user_stacks',
        ['id'],
        {
          onDelete: 'RESTRICT',
          onUpdate: 'RESTRICT',
        },
      ),
    ),
  }));
});

change(async (db) => {
  await db.createTable('rewards_ledger', (t) => ({
    rewardLedgerId: t.string(26).primaryKey(),
    userId: t.uuid().foreignKey('users', 'id', {
      onUpdate: 'RESTRICT',
      onDelete: 'CASCADE',
    }),
    intakeLogId: t.uuid().nullable(),
    amountCoins: t.smallint(),
    amountShields: t.smallint(),
    reason: t.string(),
    transactionType: t.enum('rewards_transaction_type_enum'),
    createdAt: t.timestamps().createdAt,
    updatedAt: t.timestamps().updatedAt,
  }));

  // Add 5 shields to existing users as welcome bonus
  const users = await db.query`
    SELECT id FROM users;
  `;

  for (const user of users.rows) {
    const id = ulid();
    await Promise.all([
      db.query`
        INSERT INTO rewards_ledger (reward_ledger_id, user_id, intake_log_id, amount_coins, amount_shields, reason, transaction_type, created_at, updated_at)
        VALUES (${id}, ${user.id}, NULL, 0, 5, 'Welcome bonus.', 'Assigned', NOW(), NOW());
      `,
      db.query`
        UPDATE user_stats
        SET shields_balance = 5
        WHERE user_id = ${user.id};
      `]
    );
  }
});
