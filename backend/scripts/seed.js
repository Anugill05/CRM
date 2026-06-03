require('dotenv').config();
const mongoose = require('mongoose');
const Lead = require('../models/Lead');

const sampleLeads = [
  { name: 'Sarah Chen', email: 'sarah.chen@techflow.io', phone: '+1-555-0191', company: 'TechFlow Inc', status: 'Qualified', source: 'Website', value: 12000, notes: 'Interested in enterprise plan. Follow up next week.' },
  { name: 'Marcus Williams', email: 'mwilliams@greenpeak.com', phone: '+1-555-0234', company: 'GreenPeak Solutions', status: 'New', source: 'Social Media', value: 4500, notes: 'Found via LinkedIn ad campaign.' },
  { name: 'Priya Patel', email: 'p.patel@vertex.ai', phone: '+1-555-0312', company: 'Vertex AI Labs', status: 'Contacted', source: 'Referral', value: 28000, notes: 'Initial call done. Sending proposal.' },
  { name: 'James O\'Brien', email: 'jobs@cloudnine.net', phone: '+1-555-0456', company: 'CloudNine Networks', status: 'Converted', source: 'Cold Call', value: 50000, notes: 'Closed deal. Signed 1-year contract.' },
  { name: 'Amira Hassan', email: 'amira.h@novabrand.co', phone: '+1-555-0567', company: 'Nova Brand Studio', status: 'Lost', source: 'Email', value: 0, notes: 'Went with competitor. Budget constraints.' },
  { name: 'Derek Fontaine', email: 'derek@pilotagency.com', phone: '+1-555-0678', company: 'Pilot Agency', status: 'New', source: 'Email', value: 6000, notes: 'Cold outreach. Opened email twice.' },
  { name: 'Lena Müller', email: 'lena.m@databridge.eu', phone: '+49-555-0789', company: 'DataBridge GmbH', status: 'Qualified', source: 'Website', value: 18000, notes: 'Demo scheduled for Thursday.' },
  { name: 'Raj Krishnamurthy', email: 'raj.k@quantumops.in', phone: '+91-555-0890', company: 'QuantumOps', status: 'Contacted', source: 'Referral', value: 9000, notes: 'Sent case studies. Awaiting response.' },
  { name: 'Chloe Bergman', email: 'chloe@sproutmedia.ca', phone: '+1-555-0901', company: 'Sprout Media', status: 'New', source: 'Website', value: 3200, notes: 'Downloaded whitepaper.' },
  { name: 'Tomás Ruiz', email: 'tomas@constructivemx.com', phone: '+52-555-0012', company: 'Constructive MX', status: 'Converted', source: 'Cold Call', value: 22000, notes: 'Upsell opportunity in Q3.' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_db');
    console.log('Connected to MongoDB');
    await Lead.deleteMany({});
    console.log('Cleared existing leads');
    const created = await Lead.insertMany(sampleLeads);
    console.log(`✅ Seeded ${created.length} leads`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
