/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('crime_reports').del();

  // Get user IDs for linking
  const users = await knex('users').select('id', 'role');
  const adminUser = users.find(u => u.role === 'admin');
  const policeUser = users.find(u => u.role === 'police_officer');
  const citizenUser = users.find(u => u.role === 'citizen');

  const sampleCrimes = [
    {
      reported_by: citizenUser?.id,
      title: 'Mobile Phone Theft',
      description: 'My mobile phone was snatched by unknown assailants while walking along Kampala Road near the taxi park.',
      crime_type: 'theft',
      severity: 'medium',
      location: knex.raw(`ST_SetSRID(ST_MakePoint(32.5825, 0.3476), 4326)`),
      address: 'Kampala Road, near Taxi Park',
      district: 'Kampala',
      county: 'Kampala Central',
      subcounty: 'Central Division',
      parish: 'Nakasero',
      village: 'Kampala Central',
      incident_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),

      evidence: JSON.stringify(['witness_statement', 'cctv_footage_requested']),
      witnesses: JSON.stringify([
        {
          name: 'John Doe',
          phone: '+256712345678',
          statement: 'Saw two men running from the scene'
        }
      ]),

      notes: 'Victim was not injured but phone valued at UGX 800,000',
      is_anonymous: false,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },

    {
      reported_by: policeUser?.id,
      title: 'Burglary at Shop',
      description: 'Unknown persons broke into a retail shop and stole electronics and cash.',
      crime_type: 'burglary',
      severity: 'high',
      location: knex.raw(`ST_SetSRID(ST_MakePoint(32.5750, 0.3450), 4326)`),
      address: 'Shop No. 12, Nakasero Market',
      district: 'Kampala',
      county: 'Kampala Central',
      subcounty: 'Nakasero',
      parish: 'Nakasero',
      village: 'Nakasero Market',
      incident_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),

      evidence: JSON.stringify(['broken_lock', 'fingerprints_collected']),
      witnesses: JSON.stringify([
        {
          name: 'Security Guard',
          phone: '+256712345679',
          statement: 'Heard glass breaking around 2 AM'
        }
      ]),

      notes: 'Estimated loss: UGX 5,000,000',
      is_anonymous: false,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },

    {
      reported_by: citizenUser?.id,
      title: 'Assault Incident',
      description: 'Physical altercation resulted in injuries to victim.',
      crime_type: 'assault',
      severity: 'high',
      location: knex.raw(`ST_SetSRID(ST_MakePoint(32.5900, 0.3500), 4326)`),
      address: 'Makerere University Main Campus',
      district: 'Kampala',
      county: 'Kampala Central',
      subcounty: 'Makerere',
      parish: 'Makerere',
      village: 'Main Campus',
      incident_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),

      evidence: JSON.stringify(['medical_report', 'witness_statements']),
      witnesses: JSON.stringify([
        {
          name: 'Student A',
          phone: '+256712345680',
          statement: 'Saw the argument escalating'
        },
        {
          name: 'Student B',
          phone: '+256712345681',
          statement: 'Victim was attacked without provocation'
        }
      ]),

      notes: 'Victim sustained minor injuries and received medical attention',
      is_anonymous: true,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },

    {
      reported_by: adminUser?.id,
      title: 'Traffic Violation',
      description: 'Vehicle running red light and causing near accident.',
      crime_type: 'traffic_violation',
      severity: 'medium',
      location: knex.raw(`ST_SetSRID(ST_MakePoint(32.5800, 0.3400), 4326)`),
      address: 'Jinja Road and Entebbe Road Junction',
      district: 'Kampala',
      county: 'Kampala Central',
      subcounty: 'Central Division',
      parish: 'Kampala',
      village: 'Jinja Road',
      incident_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),

      evidence: JSON.stringify(['traffic_camera_footage']),
      witnesses: JSON.stringify([
        {
          name: 'Traffic Officer',
          phone: '+256712345682',
          statement: 'Observed violation'
        }
      ]),

      notes: 'Vehicle registration noted, citation issued',
      is_anonymous: false,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },

    {
      reported_by: citizenUser?.id,
      title: 'Vandalism of Public Property',
      description: 'Unknown persons vandalized public park benches and signage.',
      crime_type: 'vandalism',
      severity: 'low',
      location: knex.raw(`ST_SetSRID(ST_MakePoint(32.5700, 0.3600), 4326)`),
      address: 'Kololo Independence Grounds',
      district: 'Kampala',
      county: 'Kampala Central',
      subcounty: 'Kololo',
      parish: 'Kololo',
      village: 'Independence Grounds',
      incident_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),

      evidence: JSON.stringify(['photos_of_damage']),
      witnesses: JSON.stringify([
        {
          name: 'Park Maintenance Staff',
          phone: '+256712345683',
          statement: 'Found damage during morning inspection'
        }
      ]),

      notes: 'Estimated repair cost: UGX 500,000',
      is_anonymous: false,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },

    {
      reported_by: policeUser?.id,
      title: 'Drug Offense Arrest',
      description: 'Individual found in possession of illegal substances.',
      crime_type: 'drug_offense',
      severity: 'high',
      location: knex.raw(`ST_SetSRID(ST_MakePoint(32.5650, 0.3550), 4326)`),
      address: 'Kisenyi Slum Area',
      district: 'Kampala',
      county: 'Kampala Central',
      subcounty: 'Kampala Central',
      parish: 'Kisenyi',
      village: 'Kisenyi',
      incident_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),

      evidence: JSON.stringify(['seized_substances', 'arrest_report']),
      witnesses: JSON.stringify([
        {
          name: 'Undercover Officer',
          phone: '+256712345684',
          statement: 'Observed illegal transaction'
        }
      ]),

      notes: 'Suspect arrested and taken to Central Police Station',
      is_anonymous: false,
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    },

    {
      reported_by: citizenUser?.id,
      title: 'Domestic Violence Report',
      description: 'Neighbor reported hearing loud arguments and screams from nearby residence.',
      crime_type: 'domestic_violence',
      severity: 'high',
      location: knex.raw(`ST_SetSRID(ST_MakePoint(32.5850, 0.3650), 4326)`),
      address: 'Residential area, Bukoto',
      district: 'Kampala',
      county: 'Kampala Central',
      subcounty: 'Bukoto',
      parish: 'Bukoto',
      village: 'Bukoto Residential',
      incident_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),

      evidence: JSON.stringify(['audio_recording', 'neighbor_statements']),
      witnesses: JSON.stringify([
        {
          name: 'Neighbor 1',
          phone: '+256712345685',
          statement: 'Heard screams around 10 PM'
        },
        {
          name: 'Neighbor 2',
          phone: '+256712345686',
          statement: 'Frequent disturbances from this house'
        }
      ]),

      notes: 'Police responded to the scene, victim received protection',
      is_anonymous: true,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },

    {
      reported_by: adminUser?.id,
      title: 'Cyber Crime - Online Fraud',
      description: 'Multiple reports of fraudulent online transactions targeting local businesses.',
      crime_type: 'cyber_crime',
      severity: 'critical',
      location: knex.raw(`ST_SetSRID(ST_MakePoint(32.5750, 0.3500), 4326)`),
      address: 'Online - Multiple affected businesses in Kampala',
      district: 'Kampala',
      county: 'Kampala Central',
      subcounty: 'Central Division',
      parish: 'Kampala',
      village: 'City Center',
      incident_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),

      evidence: JSON.stringify(['transaction_records', 'email_evidence', 'ip_logs']),
      witnesses: JSON.stringify([
        {
          name: 'IT Security Expert',
          phone: '+256712345687',
          statement: 'Traced IP addresses to multiple locations'
        }
      ]),

      notes: 'Estimated financial loss: UGX 50,000,000 across 15 businesses',
      is_anonymous: false,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ];

  await knex('crime_reports').insert(sampleCrimes);
};