/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('crime_reports', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('reported_by').references('id').inTable('users').onDelete('SET NULL');
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.enum('crime_type', [
      'theft', 'assault', 'burglary', 'vandalism', 'fraud', 
      'drug_offense', 'traffic_violation', 'domestic_violence', 
      'cyber_crime', 'murder', 'kidnapping', 'other'
    ]).notNullable();
    table.enum('severity', ['low', 'medium', 'high', 'critical']).notNullable();
    table.enum('status', ['reported', 'under_investigation', 'resolved', 'false_report']).defaultTo('reported');
    
    // Location data with PostGIS
    table.specificType('location', 'geography(POINT, 4326)').notNullable();
    table.string('address');
    table.string('district');
    table.string('county');
    table.string('subcounty');
    table.string('parish');
    table.string('village');
    
    // Timestamps
    table.timestamp('incident_date').notNullable();
    table.timestamp('reported_date').defaultTo(knex.fn.now());
    table.timestamp('resolved_date');
    
    // Additional details
    table.json('evidence'); // Store evidence files/URLs
    table.json('witnesses'); // Witness information
    table.text('notes');
    table.boolean('is_anonymous').defaultTo(false);
    
    // Metadata
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes for performance
    table.index(['crime_type']);
    table.index(['severity']);
    table.index(['status']);
    table.index(['incident_date']);
    table.index(['district']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('crime_reports');
};
