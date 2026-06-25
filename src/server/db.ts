import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Project,
  Lead,
  FollowUp,
  SiteVisit,
  Booking,
  Payment,
  AuditLog,
  CRMNotification
} from '../types.js';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

interface Schema {
  users: User[];
  projects: Project[];
  leads: Lead[];
  followUps: FollowUp[];
  siteVisits: SiteVisit[];
  bookings: Booking[];
  payments: Payment[];
  auditLogs: AuditLog[];
  notifications: CRMNotification[];
  passwords: Record<string, string>; // userId -> hashedPassword
}

// Default Seed Data
const defaultProjects: Project[] = [
  {
    id: 'proj_1',
    name: 'VIP Orchid Greens',
    location: 'Airport Road, Nagpur',
    type: 'Plot',
    description: 'A premium gated township development with modular plot sizes, complete with asphalt roads, state-of-the-art drainage, underground cabling, and landscaped gardens.',
    priceRange: '₹35 Lakhs - ₹75 Lakhs',
    plotSizes: '1200 - 2400 sq.ft.',
    amenities: ['Gated Community', '24/7 Security', 'Kids Play Area', 'Jogging Track', 'Clubhouse'],
    gallery: [
      'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'Ongoing',
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj_2',
    name: 'VIP Royal Enclave',
    location: 'Besa, Nagpur',
    type: 'Residential',
    description: 'High-end luxury row houses and duplexes designed with contemporary architecture, private garden space, and high-efficiency smart-home automation.',
    priceRange: '₹85 Lakhs - ₹1.5 Crores',
    plotSizes: '1800 - 3200 sq.ft.',
    amenities: ['Private Garden', 'Swimming Pool', 'Smart Home Tech', 'Solar Power', 'Gymnasium'],
    gallery: [
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'Ongoing',
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj_3',
    name: 'VIP Golden Meadows',
    location: 'Wardha Road, Nagpur',
    type: 'Investment',
    description: 'Strategically located investment-grade farming plots and farmhouses experiencing high capital appreciation, ideal for leisure weekends and long-term asset security.',
    priceRange: '₹20 Lakhs - ₹45 Lakhs',
    plotSizes: '5000 - 10000 sq.ft.',
    amenities: ['Organic Farm Space', 'Clubhouse', 'Water Reservoir', 'Internal WBM Roads', 'Tree Plantations'],
    gallery: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'Upcoming',
    createdAt: new Date().toISOString()
  }
];

const defaultUsers: User[] = [
  { id: 'user_1', username: 'superadmin', name: 'Rajesh Sharma', email: 'rajesh.sharma@vipproject.com', role: 'Super Admin', status: 'Active', createdAt: new Date().toISOString() },
  { id: 'user_2', username: 'admin', name: 'Amit Verma', email: 'amit.verma@vipproject.com', role: 'Admin', status: 'Active', createdAt: new Date().toISOString() },
  { id: 'user_3', username: 'manager', name: 'Vikram Singh', email: 'vikram.singh@vipproject.com', role: 'Sales Manager', status: 'Active', createdAt: new Date().toISOString() },
  { id: 'user_4', username: 'telecaller', name: 'Sneha Patel', email: 'sneha.patel@vipproject.com', role: 'Telecaller', status: 'Active', createdAt: new Date().toISOString() },
  { id: 'user_5', username: 'executive', name: 'Rohan Mehta', email: 'rohan.mehta@vipproject.com', role: 'Sales Executive', status: 'Active', createdAt: new Date().toISOString() }
];

const defaultLeads: Lead[] = [
  {
    id: 'lead_1',
    name: 'Anil Deshmukh',
    mobile: '9876543210',
    email: 'anil.deshmukh@gmail.com',
    city: 'Nagpur',
    state: 'Maharashtra',
    budget: '₹40 Lakhs - ₹50 Lakhs',
    projectInterest: 'VIP Orchid Greens',
    source: '99acres',
    status: 'New',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    notes: 'Inquired through 99acres listing for 1500 sqft plot. Prefers east-facing. Needs details about EMI options.'
  },
  {
    id: 'lead_2',
    name: 'Pooja Kulkarni',
    mobile: '9812345678',
    email: 'pooja.kulkarni@yahoo.com',
    city: 'Pune',
    state: 'Maharashtra',
    budget: '₹90 Lakhs - ₹1.2 Crores',
    projectInterest: 'VIP Royal Enclave',
    source: 'Website Form',
    status: 'Assigned',
    assignedExecutiveId: 'user_5',
    assignedExecutiveName: 'Rohan Mehta',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    notes: 'Interested in premium 3BHK Duplex row house. Relocating to Nagpur next month. Requires site layout and pricing sheet.'
  },
  {
    id: 'lead_3',
    name: 'Dr. Sandeep Jaiswal',
    mobile: '9765432109',
    email: 'sandeep.j@healthplus.org',
    city: 'Nagpur',
    state: 'Maharashtra',
    budget: '₹30 Lakhs - ₹40 Lakhs',
    projectInterest: 'VIP Golden Meadows',
    source: 'Facebook Ads',
    status: 'Contacted',
    assignedExecutiveId: 'user_5',
    assignedExecutiveName: 'Rohan Mehta',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    notes: 'Inquired for weekend farmhouse plot. Called him on 24th June. He requested details about plantation maintenance program.'
  },
  {
    id: 'lead_4',
    name: 'Ketan Shah',
    mobile: '9123456789',
    email: 'ketan.shah@outlook.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    budget: '₹60 Lakhs - ₹80 Lakhs',
    projectInterest: 'VIP Orchid Greens',
    source: 'Landing Page',
    status: 'Site Visit Scheduled',
    assignedExecutiveId: 'user_5',
    assignedExecutiveName: 'Rohan Mehta',
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(), // 5 days ago
    notes: 'Site visit confirmed for this weekend. Coming with family. Needs cab arrangement if possible.'
  },
  {
    id: 'lead_5',
    name: 'Sunita Sharma',
    mobile: '9345678901',
    email: 'sunita.sharma@gmail.com',
    city: 'Nagpur',
    state: 'Maharashtra',
    budget: '₹40 Lakhs - ₹50 Lakhs',
    projectInterest: 'VIP Orchid Greens',
    source: 'WhatsApp',
    status: 'Booked',
    assignedExecutiveId: 'user_5',
    assignedExecutiveName: 'Rohan Mehta',
    createdAt: new Date(Date.now() - 3600000 * 240).toISOString(), // 10 days ago
    notes: 'Plot booked. Plot Number G-12. Paid advance booking amount of ₹2,00,000. Agreement draft sent.'
  },
  {
    id: 'lead_6',
    name: 'Manish Patil',
    mobile: '9988776655',
    email: 'manish.patil@gmail.com',
    city: 'Nagpur',
    state: 'Maharashtra',
    budget: '₹50 Lakhs - ₹70 Lakhs',
    projectInterest: 'VIP Orchid Greens',
    source: '99acres',
    status: 'Follow Up',
    assignedExecutiveId: 'user_4',
    assignedExecutiveName: 'Sneha Patel',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
    notes: 'Called regarding Orchard project. He requested site layout drawing and layout approvals copy. Set reminder to send details.'
  },
  {
    id: 'lead_7',
    name: 'Harish Rao',
    mobile: '9822110033',
    email: 'harish.rao@techcorp.com',
    city: 'Hyderabad',
    state: 'Telangana',
    budget: '₹80 Lakhs - ₹1.1 Crores',
    projectInterest: 'VIP Royal Enclave',
    source: 'Manual Entry',
    status: 'Negotiation',
    assignedExecutiveId: 'user_5',
    assignedExecutiveName: 'Rohan Mehta',
    createdAt: new Date(Date.now() - 3600000 * 150).toISOString(),
    notes: 'Interested in row house. Demanding ₹5 Lakhs discount on the total layout cost. Waiting for Manager approval on discounted quote.'
  }
];

const defaultFollowUps: FollowUp[] = [
  {
    id: 'follow_1',
    leadId: 'lead_3',
    leadName: 'Dr. Sandeep Jaiswal',
    executiveId: 'user_5',
    executiveName: 'Rohan Mehta',
    remark: 'Called and discussed farming plots. Explained the organic development. He seemed very positive.',
    followUpDate: new Date(Date.now() - 3600000 * 24).toISOString().split('T')[0],
    nextFollowUpDate: new Date(Date.now() + 3600000 * 24).toISOString().split('T')[0],
    type: 'Call',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'follow_2',
    leadId: 'lead_6',
    leadName: 'Manish Patil',
    executiveId: 'user_4',
    executiveName: 'Sneha Patel',
    remark: 'Sent detailed project PDF brochure and approval masterplan on WhatsApp. He read it and said he will discuss with his partner.',
    followUpDate: new Date(Date.now() - 3600000 * 12).toISOString().split('T')[0],
    nextFollowUpDate: new Date(Date.now() + 3600000 * 48).toISOString().split('T')[0],
    type: 'WhatsApp',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

const defaultSiteVisits: SiteVisit[] = [
  {
    id: 'visit_1',
    leadId: 'lead_4',
    leadName: 'Ketan Shah',
    projectId: 'proj_1',
    projectName: 'VIP Orchid Greens',
    visitDate: new Date(Date.now() + 3600000 * 24).toISOString().split('T')[0],
    visitTime: '11:30 AM',
    executiveId: 'user_5',
    executiveName: 'Rohan Mehta',
    status: 'Scheduled',
    createdAt: new Date().toISOString()
  }
];

const defaultBookings: Booking[] = [
  {
    id: 'book_1',
    customerName: 'Sunita Sharma',
    projectId: 'proj_1',
    projectName: 'VIP Orchid Greens',
    plotNumber: 'G-12',
    bookingAmount: 200000,
    agreementValue: 4500000,
    bookingDate: new Date(Date.now() - 3600000 * 240).toISOString().split('T')[0],
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 240).toISOString()
  }
];

const defaultPayments: Payment[] = [
  {
    id: 'pay_1',
    bookingId: 'book_1',
    customerName: 'Sunita Sharma',
    projectName: 'VIP Orchid Greens',
    plotNumber: 'G-12',
    amount: 200000,
    mode: 'UPI',
    receiptNumber: 'VIP/2026/0612',
    paymentDate: new Date(Date.now() - 3600000 * 240).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 3600000 * 240).toISOString()
  },
  {
    id: 'pay_2',
    bookingId: 'book_1',
    customerName: 'Sunita Sharma',
    projectName: 'VIP Orchid Greens',
    plotNumber: 'G-12',
    amount: 1500000,
    mode: 'Bank Transfer',
    receiptNumber: 'VIP/2026/0615',
    paymentDate: new Date(Date.now() - 3600000 * 120).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString()
  }
];

const defaultAuditLogs: AuditLog[] = [
  {
    id: 'log_1',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    userId: 'user_1',
    userName: 'Rajesh Sharma',
    action: 'Login',
    entity: 'User',
    details: 'Super Admin logged in successfully.'
  },
  {
    id: 'log_2',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    userId: 'user_1',
    userName: 'Rajesh Sharma',
    action: 'Assign Lead',
    entity: 'Lead',
    details: 'Assigned lead Dr. Sandeep Jaiswal to Rohan Mehta.'
  }
];

const defaultNotifications: CRMNotification[] = [
  {
    id: 'not_1',
    title: 'New Lead Synced',
    message: 'Lead Anil Deshmukh has been pulled automatically from 99acres.',
    type: 'Lead Assignment',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    leadId: 'lead_1'
  },
  {
    id: 'not_2',
    title: 'Site Visit Scheduled',
    message: 'Site visit for Ketan Shah on VIP Orchid Greens is tomorrow at 11:30 AM.',
    type: 'Site Visit',
    timestamp: new Date().toISOString(),
    read: false,
    leadId: 'lead_4'
  }
];

// Helper to write to local DB file
function writeDB(data: Schema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file', err);
  }
}

// Initializer
export function initDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  let dbData: Schema;
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbData = JSON.parse(content);
    } catch (err) {
      console.error('Error parsing database. Creating new.', err);
      dbData = generateDefaultDB();
    }
  } else {
    dbData = generateDefaultDB();
  }

  // Ensure default accounts exist with their correct hashed passwords
  let updated = false;
  for (const user of defaultUsers) {
    const existingUser = dbData.users.find(u => u.username === user.username);
    if (!existingUser) {
      dbData.users.push(user);
      updated = true;
    }
    const uid = user.id;
    if (!dbData.passwords[uid]) {
      dbData.passwords[uid] = bcrypt.hashSync('password123', 10);
      updated = true;
    }
  }

  // Ensure initial data exists
  if (dbData.projects.length === 0) {
    dbData.projects = defaultProjects;
    updated = true;
  }
  if (dbData.leads.length === 0) {
    dbData.leads = defaultLeads;
    updated = true;
  }
  if (dbData.followUps.length === 0) {
    dbData.followUps = defaultFollowUps;
    updated = true;
  }
  if (dbData.siteVisits.length === 0) {
    dbData.siteVisits = defaultSiteVisits;
    updated = true;
  }
  if (dbData.bookings.length === 0) {
    dbData.bookings = defaultBookings;
    updated = true;
  }
  if (dbData.payments.length === 0) {
    dbData.payments = defaultPayments;
    updated = true;
  }
  if (dbData.notifications.length === 0) {
    dbData.notifications = defaultNotifications;
    updated = true;
  }
  if (dbData.auditLogs.length === 0) {
    dbData.auditLogs = defaultAuditLogs;
    updated = true;
  }

  if (updated || !fs.existsSync(DB_FILE)) {
    writeDB(dbData);
  }
}

function generateDefaultDB(): Schema {
  const passwords: Record<string, string> = {};
  for (const user of defaultUsers) {
    passwords[user.id] = bcrypt.hashSync('password123', 10);
  }
  return {
    users: defaultUsers,
    projects: defaultProjects,
    leads: defaultLeads,
    followUps: defaultFollowUps,
    siteVisits: defaultSiteVisits,
    bookings: defaultBookings,
    payments: defaultPayments,
    auditLogs: defaultAuditLogs,
    notifications: defaultNotifications,
    passwords
  };
}

export function readDB(): Schema {
  if (!fs.existsSync(DB_FILE)) {
    initDB();
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading DB, returning blank database', err);
    return generateDefaultDB();
  }
}

export function saveDB(data: Schema) {
  writeDB(data);
}

// Simple query helpers
export const db = {
  getUsers: () => readDB().users,
  getProjects: () => readDB().projects,
  getLeads: () => readDB().leads,
  getFollowUps: () => readDB().followUps,
  getSiteVisits: () => readDB().siteVisits,
  getBookings: () => readDB().bookings,
  getPayments: () => readDB().payments,
  getAuditLogs: () => readDB().auditLogs,
  getNotifications: () => readDB().notifications,

  getUserById: (id: string) => readDB().users.find(u => u.id === id),
  getUserByUsername: (username: string) => readDB().users.find(u => u.username === username),

  createUser: (user: Omit<User, 'id' | 'createdAt'>, passwordPlain: string) => {
    const data = readDB();
    const id = 'user_' + (data.users.length + 1) + '_' + Math.floor(Math.random() * 1000);
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    data.passwords[id] = bcrypt.hashSync(passwordPlain, 10);
    saveDB(data);
    return newUser;
  },

  updateUser: (id: string, updates: Partial<User>, newPasswordPlain?: string) => {
    const data = readDB();
    const idx = data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    data.users[idx] = { ...data.users[idx], ...updates };
    if (newPasswordPlain) {
      data.passwords[id] = bcrypt.hashSync(newPasswordPlain, 10);
    }
    saveDB(data);
    return data.users[idx];
  },

  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => {
    const data = readDB();
    const id = 'proj_' + (data.projects.length + 1) + '_' + Math.floor(Math.random() * 1000);
    const newProj: Project = {
      ...project,
      id,
      createdAt: new Date().toISOString()
    };
    data.projects.push(newProj);
    saveDB(data);
    return newProj;
  },

  updateProject: (id: string, updates: Partial<Project>) => {
    const data = readDB();
    const idx = data.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    data.projects[idx] = { ...data.projects[idx], ...updates };
    saveDB(data);
    return data.projects[idx];
  },

  createLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    const data = readDB();
    const id = 'lead_' + (data.leads.length + 1) + '_' + Math.floor(Math.random() * 1000);
    const newLead: Lead = {
      ...lead,
      id,
      createdAt: new Date().toISOString()
    };
    data.leads.push(newLead);
    saveDB(data);
    return newLead;
  },

  updateLead: (id: string, updates: Partial<Lead>) => {
    const data = readDB();
    const idx = data.leads.findIndex(l => l.id === id);
    if (idx === -1) return null;
    data.leads[idx] = { ...data.leads[idx], ...updates };
    saveDB(data);
    return data.leads[idx];
  },

  createFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => {
    const data = readDB();
    const id = 'follow_' + (data.followUps.length + 1) + '_' + Math.floor(Math.random() * 1000);
    const newFollow: FollowUp = {
      ...followUp,
      id,
      createdAt: new Date().toISOString()
    };
    data.followUps.push(newFollow);

    // Auto transition lead status to 'Follow Up' if they are New/Assigned/Contacted
    const leadIdx = data.leads.findIndex(l => l.id === followUp.leadId);
    if (leadIdx !== -1) {
      data.leads[leadIdx].status = 'Follow Up';
    }

    saveDB(data);
    return newFollow;
  },

  createSiteVisit: (siteVisit: Omit<SiteVisit, 'id' | 'createdAt'>) => {
    const data = readDB();
    const id = 'visit_' + (data.siteVisits.length + 1) + '_' + Math.floor(Math.random() * 1000);
    const newVisit: SiteVisit = {
      ...siteVisit,
      id,
      createdAt: new Date().toISOString()
    };
    data.siteVisits.push(newVisit);

    // Auto transition lead status to 'Site Visit Scheduled'
    const leadIdx = data.leads.findIndex(l => l.id === siteVisit.leadId);
    if (leadIdx !== -1) {
      data.leads[leadIdx].status = 'Site Visit Scheduled';
    }

    saveDB(data);
    return newVisit;
  },

  updateSiteVisitStatus: (id: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => {
    const data = readDB();
    const idx = data.siteVisits.findIndex(v => v.id === id);
    if (idx === -1) return null;
    data.siteVisits[idx].status = status;

    if (status === 'Completed') {
      const leadIdx = data.leads.findIndex(l => l.id === data.siteVisits[idx].leadId);
      if (leadIdx !== -1) {
        data.leads[leadIdx].status = 'Negotiation';
      }
    }
    saveDB(data);
    return data.siteVisits[idx];
  },

  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    const data = readDB();
    const id = 'book_' + (data.bookings.length + 1) + '_' + Math.floor(Math.random() * 1000);
    const newBooking: Booking = {
      ...booking,
      id,
      createdAt: new Date().toISOString()
    };
    data.bookings.push(newBooking);

    // Find lead matching customerName or email to set status to 'Booked'
    const leadIdx = data.leads.findIndex(l => l.name.toLowerCase() === booking.customerName.toLowerCase() || l.projectInterest === booking.projectName);
    if (leadIdx !== -1) {
      data.leads[leadIdx].status = 'Booked';
    }

    saveDB(data);
    return newBooking;
  },

  updateBookingStatus: (id: string, status: 'Pending' | 'Confirmed' | 'Cancelled') => {
    const data = readDB();
    const idx = data.bookings.findIndex(b => b.id === id);
    if (idx === -1) return null;
    data.bookings[idx].status = status;
    saveDB(data);
    return data.bookings[idx];
  },

  createPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    const data = readDB();
    const id = 'pay_' + (data.payments.length + 1) + '_' + Math.floor(Math.random() * 1000);
    const newPayment: Payment = {
      ...payment,
      id,
      createdAt: new Date().toISOString()
    };
    data.payments.push(newPayment);
    saveDB(data);
    return newPayment;
  },

  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const data = readDB();
    const id = 'log_' + (data.auditLogs.length + 1) + '_' + Math.floor(Math.random() * 1000);
    const newLog: AuditLog = {
      ...log,
      id,
      timestamp: new Date().toISOString()
    };
    data.auditLogs.push(newLog);
    // Trim logs size to avoid ballooning
    if (data.auditLogs.length > 500) {
      data.auditLogs.shift();
    }
    saveDB(data);
    return newLog;
  },

  addNotification: (notification: Omit<CRMNotification, 'id' | 'timestamp' | 'read'>) => {
    const data = readDB();
    const id = 'not_' + (data.notifications.length + 1) + '_' + Math.floor(Math.random() * 1000);
    const newNot: CRMNotification = {
      ...notification,
      id,
      timestamp: new Date().toISOString(),
      read: false
    };
    data.notifications.unshift(newNot);
    if (data.notifications.length > 100) {
      data.notifications.pop();
    }
    saveDB(data);
    return newNot;
  },

  markNotificationsRead: () => {
    const data = readDB();
    data.notifications.forEach(n => n.read = true);
    saveDB(data);
  },

  verifyPassword: (userId: string, plain: string): boolean => {
    const data = readDB();
    const hashed = data.passwords[userId];
    if (!hashed) return false;
    return bcrypt.compareSync(plain, hashed);
  }
};
