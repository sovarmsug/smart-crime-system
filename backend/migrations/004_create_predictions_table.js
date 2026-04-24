/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('predictions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('model_name').notNullable(); // Name of the ML model used
    table.string('model_version').notNullable();
    
    // Prediction details
    table.enum('prediction_type', ['hotspot', 'crime_type', 'time_based', 'risk_level']).notNullable();
    table.decimal('confidence_score', 5, 4); // 0.0000 to 1.0000
    table.json('prediction_data'); // JSON object with prediction details
    
    // Geographic area (can be point, polygon, or radius)
    table.specificType('area', 'geography(POLYGON, 4326)');
    table.specificType('center_point', 'geography(POINT, 4326)');
    table.decimal('radius_km', 5, 2); // For circular predictions
    
    // Time period
    table.timestamp('prediction_start').notNullable();
    table.timestamp('prediction_end').notNullable();
    table.enum('time_period', ['hourly', 'daily', 'weekly', 'monthly']).notNullable();
    
    // Risk assessment
    table.enum('risk_level', ['low', 'medium', 'high', 'critical']).notNullable();
    table.json('risk_factors'); // Contributing factors
    table.text('recommendations'); // Actionable recommendations
    
    // Metadata
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_active').defaultTo(true);
    table.text('notes');
    
    // Performance tracking
    table.json('actual_outcome'); // To track prediction accuracy
    table.decimal('accuracy_score', 5, 4); // Updated when actual outcome is known
    
    // Indexes
    table.index(['prediction_type']);
    table.index(['risk_level']);
    table.index(['prediction_start']);
    table.index(['prediction_end']);
    table.index(['is_active']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('predictions');
};
