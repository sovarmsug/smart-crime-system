/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('notifications', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.enum('type', ['role_assigned', 'role_updated', 'role_revoked', 'department_change', 'crime_assigned', 'assignment_updated']).notNullable();
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.enum('priority', ['low', 'medium', 'high', 'critical']).defaultTo('medium');
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at').nullable();
    table.string('action_url').nullable();
    table.uuid('assigned_by').nullable();
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('assigned_by').references('id').inTable('users').onDelete('SET NULL');
    
    // Indexes
    table.index(['user_id']);
    table.index(['type']);
    table.index(['is_read']);
    table.index(['priority']);
    table.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('notifications');
};
