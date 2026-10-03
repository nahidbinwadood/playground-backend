/**
 * LOCAL TEST HELPER ONLY — delete after use. Not referenced by the app.
 *
 * Admin users are seeded directly in the database (see userSchema.ts), so
 * there is no signup path to an admin token. This mints one for an existing
 * admin user so the admin-only note routes can be exercised over HTTP.
 *
 * The token is written to a file rather than stdout so it never lands in a
 * shell history or transcript.
 */
require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const OUT = process.argv[2] || '/tmp/pb-token.txt';

(async () => {
  if (!process.env.DB_URL || !process.env.JWT_ACCESS_SECRET) {
    console.error('ERR missing DB_URL or JWT_ACCESS_SECRET');
    process.exit(2);
  }

  await mongoose.connect(process.env.DB_URL);

  // No models are registered in this script, so mongoose.connection.collections
  // is empty — go straight to the driver instead.
  const db = mongoose.connection.db;
  const names = (await db.listCollections().toArray()).map((c) => c.name);

  const users = db.collection('users');
  const user = await users.findOne({
    role: 'admin',
    isDeleted: { $ne: true },
  });

  if (!user) {
    console.error('ERR no admin user found in', JSON.stringify(names));
    process.exit(4);
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES }
  );

  fs.writeFileSync(OUT, token);
  console.log(
    'TOKEN_WRITTEN',
    `to=${OUT}`,
    `admin=${user.email}`,
    `expiresIn=${process.env.JWT_ACCESS_EXPIRES}`
  );

  await mongoose.disconnect();
})().catch((error) => {
  console.error('ERR', error.message);
  process.exit(1);
});
