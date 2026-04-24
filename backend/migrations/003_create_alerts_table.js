/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('alerts', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('crime_report_id').references('id').inTable('crime_reports').onDelete('CASCADE');
    table.uuid('triggered_by').references('id').inTable('users').onDelete('SET NULL');
    
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.enum('alert_type', ['crime_report', 'prediction_alert', 'emergency', 'system']).notNullable();
    table.enum('priority', ['low', 'medium', 'high', 'critical']).notNullable();
    
    // Location data
    table.specificType('location', 'geography(POINT, 4326)');
    table.string('area_description');
    table.decimal('radius_km', 5, 2); // Alert radius in kilometers
    
    // Notification channels
    table.boolean('send_sms').defaultTo(false);
    table.boolean('send_email').defaultTo(false);
    table.boolean('send_push').defaultTo(false);
    
    // Targeting
    table.json('target_users'); // Specific users to notify
    table.json('target_areas'); // Geographic areas to target
    table.enum('target_role', ['all', 'citizens', 'police', 'admin']).defaultTo('all');
    
    // Status and timestamps
    table.enum('status', ['pending', 'sent', 'failed', 'cancelled']).defaultTo('pending');
    table.timestamp('expires_at');
    table.timestamp('sent_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Metadata
    table.json('delivery_status'); // Track delivery to each channel
    table.text('error_message');
    
    // Indexes
    table.index(['alert_type']);
    table.index(['priority']);
    table.index(['status']);
    table.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('alerts');
};
