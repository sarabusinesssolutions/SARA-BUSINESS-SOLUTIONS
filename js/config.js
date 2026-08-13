/*******************************************************
 * File: config.js
 * IMPORTANT: After deploying the Apps Script Web App,
 * paste the deployment URL below (ends with /exec).
 *******************************************************/
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbxGq4MzRirGkxWZXY_pGAF4BBxcNpmJ2kowhjKI0XCyJEBVx9KxfDSyk36AwdICMf_x/exec',
  APP_NAME: 'SARA Business Solutions',
  SESSION_KEY: 'sara_crm_session',

  LEAD_SOURCES: ['Website', 'Facebook', 'Instagram', 'WhatsApp', 'Google Ads', 'Walk-in'],
  LEAD_STATUSES: ['New', 'Contacted', 'Interested', 'Converted', 'Not Interested', 'Lost'],

  SERVICE_CATEGORIES: ['Government', 'RTO Services', 'GST', 'MSME', 'PF', 'ESIC', 'FSSAI',
    'Passport Services', 'IT Services', 'Website Development', 'Digital Marketing',
    'Software Development', 'Manpower Services', 'Other'],

  TASK_PRIORITIES: ['Low', 'Medium', 'High', 'Urgent'],
  TASK_STATUSES: ['Pending', 'In Progress', 'Completed', 'On Hold'],

  PAYMENT_MODES: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card', 'Other'],
  PAYMENT_STATUSES: ['Paid', 'Partially Paid', 'Unpaid', 'Overdue'],

  COMPLIANCE_CATEGORIES: [
    'MSME Certificate', 'GST Certificate', 'PAN', 'TAN', 'PF Registration Certificate',
    'ESIC Registration Certificate', 'Professional Tax Registration', 'FSSAI License',
    'Shop and Establishment License', 'UDYAM Registration', 'DSC Certificate',
    'Trademark Document', 'Insurance Policy', 'Rental Agreement', 'Vendor Agreement',
    'Employee Document', 'Bank Account Detail', 'Cheque Copy', 'Legal Document',
    'Client Agreement', 'Property Document', 'Other'
  ],

  ROLES: ['SuperAdmin', 'Admin', 'Manager', 'Staff', 'Viewer']
};
