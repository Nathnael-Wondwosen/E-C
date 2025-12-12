// Utility functions for CSV import/export

// Convert array of objects to CSV format
export const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  // Convert each object to a CSV row
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape commas and wrap in quotes if needed
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
};

// Parse CSV string to array of objects
export const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  // Parse headers
  const headers = lines[0].split(',').map(header => header.trim().replace(/^"(.*)"$/, '$1'));
  
  // Parse rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => {
      // Remove surrounding quotes and unescape double quotes
      return value.trim().replace(/^"(.*)"$/, (_, p1) => p1.replace(/""/g, '"'));
    });
    
    // Create object with headers as keys
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
};

// Download CSV file
export const downloadCSV = (data, filename) => {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Read CSV file
export const readCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = parseCSV(event.target.result);
        resolve(csvData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

export default {
  convertToCSV,
  parseCSV,
  downloadCSV,
  readCSVFile
};