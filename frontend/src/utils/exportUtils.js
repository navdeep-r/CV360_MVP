import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// Export complaints to CSV
export const exportToCSV = (complaints, filename = 'complaints') => {
  if (!complaints || complaints.length === 0) {
    alert('No complaints to export');
    return;
  }

  // Prepare data for CSV
  const csvData = complaints.map(complaint => ({
    'Complaint ID': complaint._id,
    'Title': complaint.title,
    'Description': complaint.description,
    'Category': complaint.category,
    'Severity': complaint.severity,
    'Status': complaint.status,
    'Location': complaint.location?.address || '',
    'Zone': complaint.location?.zone || '',
    'Created Date': new Date(complaint.createdAt).toLocaleDateString(),
    'Days Open': getDaysOpen(complaint.createdAt),
    'Citizen Name': complaint.citizenId?.name || 'Anonymous',
    'Citizen Email': complaint.citizenId?.email || '',
    'Upvotes': complaint.upvotes || 0,
    'Updated Date': complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleDateString() : ''
  }));

  // Convert to CSV string
  const headers = Object.keys(csvData[0]);
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes in CSV
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
};

// Export complaints to Excel
export const exportToExcel = (complaints, filename = 'complaints') => {
  if (!complaints || complaints.length === 0) {
    alert('No complaints to export');
    return;
  }

  // Prepare data for Excel
  const excelData = complaints.map(complaint => ({
    'Complaint ID': complaint._id,
    'Title': complaint.title,
    'Description': complaint.description,
    'Category': complaint.category,
    'Severity': complaint.severity,
    'Status': complaint.status,
    'Location': complaint.location?.address || '',
    'Zone': complaint.location?.zone || '',
    'Created Date': new Date(complaint.createdAt).toLocaleDateString(),
    'Days Open': getDaysOpen(complaint.createdAt),
    'Citizen Name': complaint.citizenId?.name || 'Anonymous',
    'Citizen Email': complaint.citizenId?.email || '',
    'Upvotes': complaint.upvotes || 0,
    'Updated Date': complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleDateString() : ''
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Complaints');

  // Generate Excel file and download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export complaints to JSON
export const exportToJSON = (complaints, filename = 'complaints') => {
  if (!complaints || complaints.length === 0) {
    alert('No complaints to export');
    return;
  }

  // Prepare data for JSON
  const jsonData = {
    exportDate: new Date().toISOString(),
    totalComplaints: complaints.length,
    complaints: complaints.map(complaint => ({
      id: complaint._id,
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      severity: complaint.severity,
      status: complaint.status,
      location: complaint.location,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      citizen: complaint.citizenId,
      upvotes: complaint.upvotes || 0,
      timeline: complaint.timeline || []
    }))
  };

  // Create and download file
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.json`);
};

// Export filtered complaints
export const exportFilteredComplaints = (complaints, filters, format = 'excel') => {
  let filteredComplaints = [...complaints];

  // Apply filters
  if (filters.severity) {
    filteredComplaints = filteredComplaints.filter(c => c.severity === filters.severity);
  }
  if (filters.status) {
    filteredComplaints = filteredComplaints.filter(c => c.status === filters.status);
  }
  if (filters.zone) {
    filteredComplaints = filteredComplaints.filter(c => c.location?.zone === filters.zone);
  }
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredComplaints = filteredComplaints.filter(c => 
      c.title.toLowerCase().includes(searchTerm) ||
      c.description.toLowerCase().includes(searchTerm) ||
      c._id.toLowerCase().includes(searchTerm)
    );
  }

  // Generate filename with filters
  const filterParts = [];
  if (filters.severity) filterParts.push(`severity_${filters.severity}`);
  if (filters.status) filterParts.push(`status_${filters.status}`);
  if (filters.zone) filterParts.push(`zone_${filters.zone}`);
  
  const filename = filterParts.length > 0 
    ? `complaints_${filterParts.join('_')}` 
    : 'complaints';

  // Export based on format
  switch (format) {
    case 'csv':
      exportToCSV(filteredComplaints, filename);
      break;
    case 'json':
      exportToJSON(filteredComplaints, filename);
      break;
    case 'excel':
    default:
      exportToExcel(filteredComplaints, filename);
      break;
  }
};

// Export squad assignments
export const exportSquadAssignments = (complaints, squads) => {
  const squadData = squads.map(squad => {
    const squadComplaints = complaints.filter(c => c.location?.zone === squad.zone);
    return {
      'Squad Name': squad.name,
      'Zone': squad.zone,
      'Total Complaints': squadComplaints.length,
      'Pending': squadComplaints.filter(c => c.status === 'pending').length,
      'In Progress': squadComplaints.filter(c => c.status === 'in_progress').length,
      'Resolved': squadComplaints.filter(c => c.status === 'resolved').length,
      'Supervisor': squad.supervisor,
      'Vehicle': squad.vehicle,
      'Status': squad.status
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(squadData);
  XLSX.utils.book_append_sheet(wb, ws, 'Squad Assignments');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `squad_assignments_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Helper function to calculate days open
const getDaysOpen = (createdAt) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}; 