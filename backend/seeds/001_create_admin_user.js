/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Insert seed entries
  const bcrypt = require('bcryptjs');
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash('admin123', saltRounds);

  await knex('users').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      first_name: 'System',
      last_name: 'Administrator',
      email: 'admin@smartcrime.ug',
      password_hash: passwordHash,
      role: 'admin',
      status: 'active',
      email_verified: true,
      phone_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      first_name: 'Police',
      last_name: 'Officer',
      email: 'police@smartcrime.ug',
      password_hash: passwordHash,
      role: 'police_officer',
      status: 'active',
      badge_number: 'PO001',
      station: 'Kampala Central Police Station',
      email_verified: true,
      phone_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      first_name: 'John',
      last_name: 'Citizen',
      email: 'citizen@smartcrime.ug',
      password_hash: passwordHash,
      role: 'citizen',
      status: 'active',
      email_verified: true,
      phone_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
