export type UserRole = 'Super Admin' | 'Admin' | 'Sales Manager' | 'Telecaller' | 'Sales Executive';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export type ProjectStatus = 'Upcoming' | 'Ongoing' | 'Completed';
export type ProjectType = 'Plot' | 'Residential' | 'Investment';

export interface Project {
  id: string;
  name: string;
  location: string;
  type: ProjectType;
  description: string;
  priceRange: string;
  plotSizes: string; // e.g. "1200 - 2400 sq.ft."
  amenities: string[];
  gallery: string[];
  status: ProjectStatus;
  createdAt: string;
}

export type LeadStatus =
  | 'New'
  | 'Assigned'
  | 'Contacted'
  | 'Follow Up'
  | 'Interested'
  | 'Site Visit Scheduled'
  | 'Negotiation'
  | 'Booked'
  | 'Lost';

export type LeadSource =
  | '99acres'
  | 'Website Form'
  | 'Landing Page'
  | 'WhatsApp'
  | 'Facebook Ads'
  | 'Manual Entry';

export interface Lead {
  id: string;
  name: string;
  mobile: string;
  email: string;
  city: string;
  state: string;
  budget: string;
  projectInterest: string; // Project Name or ID
  source: LeadSource;
  status: LeadStatus;
  assignedExecutiveId?: string; // User ID of Sales Executive / Telecaller
  assignedExecutiveName?: string;
  notes: string;
  createdAt: string;
}

export type FollowUpType = 'Call' | 'WhatsApp' | 'Meeting' | 'Email';

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  executiveId: string;
  executiveName: string;
  remark: string;
  followUpDate: string;
  nextFollowUpDate: string;
  type: FollowUpType;
  createdAt: string;
}

export type SiteVisitStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface SiteVisit {
  id: string;
  leadId: string;
  leadName: string;
  projectId: string;
  projectName: string;
  visitDate: string;
  visitTime: string;
  executiveId: string;
  executiveName: string;
  status: SiteVisitStatus;
  createdAt: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export interface Booking {
  id: string;
  customerName: string;
  projectId: string;
  projectName: string;
  plotNumber: string;
  bookingAmount: number;
  agreementValue: number;
  bookingDate: string;
  status: BookingStatus;
  createdAt: string;
}

export type PaymentMode = 'Cash' | 'Cheque' | 'Bank Transfer' | 'UPI';

export interface Payment {
  id: string;
  bookingId: string;
  customerName: string;
  projectName: string;
  plotNumber: string;
  amount: number;
  mode: PaymentMode;
  receiptNumber: string;
  paymentDate: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string; // e.g. "Create Lead", "Update Status", "Assign Lead"
  entity: string; // e.g. "Lead", "Booking", "Project"
  details: string; // e.g. "Changed status of lead John Doe from New to Assigned"
}

export interface CRMNotification {
  id: string;
  title: string;
  message: string;
  type: 'Follow-Up' | 'Site Visit' | 'Lead Assignment' | 'Booking' | 'System';
  timestamp: string;
  read: boolean;
  leadId?: string;
}
