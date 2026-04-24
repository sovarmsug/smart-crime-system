/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  console.log('Starting test data seeding...');
  
  // First, get existing users to assign roles
  const users = await knex('users').select('*');
  console.log(`Found ${users.length} users in database`);
  
  if (users.length === 0) {
    console.log('No users found. Please run user seeds first.');
    return;
  }

  // Log user details for debugging
  console.log('Users found:', users.map(u => ({ id: u.id, email: u.email, role: u.role })));

  // Create test crime reports
  const { v4: uuidv4 } = require('uuid');
  
  const crimeReports = [
    {
      id: uuidv4(),
      reported_by: users[0]?.id || null,
      title: 'Armed Robbery at Shoprite',
      description: 'Unknown assailants robbed Shoprite supermarket at gunpoint, stole cash and electronics',
      crime_type: 'theft',
      severity: 'critical',
      location: knex.raw('ST_SetSRID(ST_MakePoint(32.5825, 0.3476), 4326)'),
      address: 'Shoprite, Lugogo',
      district: 'Kampala',
      county: 'Kampala',
      subcounty: 'Kawempe',
      parish: 'Lugogo',
      village: 'Lugogo',
      incident_date: new Date('2024-01-24T14:30:00'),
      evidence: JSON.stringify(['cctv_footage.mp4', 'witness_statement.pdf']),
      witnesses: JSON.stringify([]),
      notes: 'High priority case - immediate investigation required',
      is_anonymous: false,
      status: 'reported',
      created_at: new Date('2024-01-24T14:30:00'),
      updated_at: new Date('2024-01-24T14:30:00')
    },
    {
      id: uuidv4(),
      reported_by: users[1]?.id || null,
      title: 'Car Theft in Ntinda',
      description: 'Toyota Premio stolen from residential driveway during night',
      crime_type: 'theft',
      severity: 'high',
      location: knex.raw('ST_SetSRID(ST_MakePoint(32.5925, 0.3526), 4326)'),
      address: 'Ntinda, Block 10',
      district: 'Kampala',
      county: 'Kampala',
      subcounty: 'Nakawa',
      parish: 'Ntinda',
      village: 'Ntinda',
      incident_date: new Date('2024-01-24T12:15:00'),
      evidence: JSON.stringify(['photo.jpg', 'police_report.pdf']),
      witnesses: JSON.stringify([]),
      notes: 'Vehicle theft - check CCTV footage',
      is_anonymous: false,
      status: 'under_investigation',
      created_at: new Date('2024-01-24T12:15:00'),
      updated_at: new Date('2024-01-24T12:15:00')
    },
    {
      id: uuidv4(),
      reported_by: users[2]?.id || null,
      title: 'Assault in Kabalagala',
      description: 'Physical assault during bar fight, victim hospitalized',
      crime_type: 'assault',
      severity: 'medium',
      location: knex.raw('ST_SetSRID(ST_MakePoint(32.5725, 0.3176), 4326)'),
      address: 'Kabalagala',
      district: 'Kampala',
      county: 'Kampala',
      subcounty: 'Makindye',
      parish: 'Kabalagala',
      village: 'Kabalagala',
      incident_date: new Date('2024-01-24T10:45:00'),
      evidence: JSON.stringify(['medical_report.pdf']),
      witnesses: JSON.stringify([]),
      notes: 'Victim receiving medical treatment',
      is_anonymous: true,
      status: 'under_investigation',
      created_at: new Date('2024-01-24T10:45:00'),
      updated_at: new Date('2024-01-24T10:45:00')
    },
    {
      id: uuidv4(),
      reported_by: users[0]?.id || null,
      title: 'Burglary in Residential Area',
      description: 'House broken into, electronics and jewelry stolen',
      crime_type: 'burglary',
      severity: 'high',
      location: knex.raw('ST_SetSRID(ST_MakePoint(32.6025, 0.3626), 4326)'),
      address: 'Bukoto, Residential Area',
      district: 'Kampala',
      county: 'Kampala',
      subcounty: 'Nakawa',
      parish: 'Bukoto',
      village: 'Bukoto',
      incident_date: new Date('2024-01-24T09:30:00'),
      evidence: JSON.stringify(['photos.jpg', 'inventory_list.pdf']),
      witnesses: JSON.stringify([]),
      notes: 'Forced entry through back door',
      is_anonymous: false,
      status: 'reported',
      created_at: new Date('2024-01-24T09:30:00'),
      updated_at: new Date('2024-01-24T09:30:00')
    },
    {
      id: uuidv4(),
      reported_by: users[1]?.id || null,
      title: 'Vandalism at Public Park',
      description: 'Park benches and playground equipment damaged',
      crime_type: 'vandalism',
      severity: 'low',
      location: knex.raw('ST_SetSRID(ST_MakePoint(32.5825, 0.3376), 4326)'),
      address: 'Entebbe Road Public Park',
      district: 'Wakiso',
      county: 'Entebbe',
      subcounty: 'Katabi',
      parish: 'Entebbe Town',
      village: 'Entebbe',
      incident_date: new Date('2024-01-24T16:20:00'),
      evidence: JSON.stringify(['damage_photos.jpg']),
      witnesses: JSON.stringify([]),
      notes: 'Minor damage - community service recommended',
      is_anonymous: true,
      status: 'reported',
      created_at: new Date('2024-01-24T16:20:00'),
      updated_at: new Date('2024-01-24T16:20:00')
    }
  ];

  // Insert crime reports
  await knex('crime_reports').del(); // Clean existing data
  await knex('crime_reports').insert(crimeReports);

  // Create test assignments
  const policeOfficers = users.filter(u => ['police_officer', 'district_commander'].includes(u.role));
  console.log(`Found ${policeOfficers.length} police officers:`, policeOfficers.map(u => ({ id: u.id, email: u.email, role: u.role })));
  const assignments = [];

  if (policeOfficers.length > 0 && crimeReports.length > 0) {
    assignments.push({
      id: uuidv4(),
      crime_id: crimeReports[1].id,
      officer_id: policeOfficers[0].id,
      assigned_by: users.find(u => u.role === 'admin')?.id || policeOfficers[0].id,
      status: 'in_progress',
      notes: 'Officer is investigating the vehicle theft case',
      created_at: new Date('2024-01-24T13:00:00'),
      updated_at: new Date('2024-01-24T13:00:00')
    });

    if (policeOfficers.length > 1) {
      assignments.push({
        id: uuidv4(),
        crime_id: crimeReports[2].id,
        officer_id: policeOfficers[1].id,
        assigned_by: users.find(u => u.role === 'admin')?.id || policeOfficers[1].id,
        status: 'assigned',
        notes: 'Assigned to investigate assault case',
        created_at: new Date('2024-01-24T11:00:00'),
        updated_at: new Date('2024-01-24T11:00:00')
      });
    }
  }

  // Insert assignments
  await knex('crime_assignments').del(); // Clean existing data
  if (assignments.length > 0) {
    await knex('crime_assignments').insert(assignments);
  }

  // Create test notifications
  const notifications = [];
  const adminUser = users.find(u => u.role === 'admin');
  console.log('Admin user found:', adminUser ? { id: adminUser.id, email: adminUser.email } : 'No admin user found');

  if (adminUser && policeOfficers.length > 0) {
    // Add first notification
    if (policeOfficers[0] && crimeReports[1]) {
      notifications.push({
        id: uuidv4(),
        user_id: policeOfficers[0].id,
        type: 'crime_assigned',
        title: 'New Crime Assignment',
        message: 'You have been assigned to investigate: Car Theft in Ntinda',
        priority: 'high',
        is_read: false,
        action_url: `/crimes/${crimeReports[1].id}`,
        assigned_by: adminUser.id,
        metadata: JSON.stringify({ crime_id: crimeReports[1].id }),
        created_at: new Date('2024-01-24T13:00:00'),
        updated_at: new Date('2024-01-24T13:00:00')
      });
    }

    // Add second notification if we have a second officer
    if (policeOfficers[1] && crimeReports[2]) {
      notifications.push({
        id: uuidv4(),
        user_id: policeOfficers[1].id,
        type: 'crime_assigned',
        title: 'New Crime Assignment',
        message: 'You have been assigned to investigate: Assault in Kabalagala',
        priority: 'high',
        is_read: false,
        action_url: `/crimes/${crimeReports[2].id}`,
        assigned_by: adminUser.id,
        metadata: JSON.stringify({ crime_id: crimeReports[2].id }),
        created_at: new Date('2024-01-24T11:00:00'),
        updated_at: new Date('2024-01-24T11:00:00')
      });
    }

    // Add role assignment notification
    if (policeOfficers[0]) {
      notifications.push({
        id: uuidv4(),
        user_id: policeOfficers[0].id,
        type: 'role_assigned',
        title: 'Role Assignment',
        message: 'You have been assigned as Police Officer',
        priority: 'medium',
        is_read: true,
        action_url: '/profile',
        assigned_by: adminUser.id,
        metadata: JSON.stringify({ role: 'police_officer' }),
        created_at: new Date('2024-01-20T10:00:00'),
        updated_at: new Date('2024-01-20T10:00:00')
      });
    }
  }

  // Insert notifications
  await knex('notifications').del(); // Clean existing data
  if (notifications.length > 0) {
    await knex('notifications').insert(notifications);
  }

  console.log('Test data seeded successfully!');
  console.log(`- Created ${crimeReports.length} crime reports`);
  console.log(`- Created ${assignments.length} assignments`);
  console.log(`- Created ${notifications.length} notifications`);
};
