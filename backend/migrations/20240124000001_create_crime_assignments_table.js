/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('crime_assignments', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('crime_id').notNullable();
    table.uuid('officer_id').notNullable();
    table.uuid('assigned_by').notNullable();
    table.enum('status', ['assigned', 'in_progress', 'completed', 'cancelled']).defaultTo('assigned');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('crime_id').references('id').inTable('crime_reports').onDelete('CASCADE');
    table.foreign('officer_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('assigned_by').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes
    table.index(['crime_id']);
    table.index(['officer_id']);
    table.index(['status']);
    table.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('crime_assignments');
};
