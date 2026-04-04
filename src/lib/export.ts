/**
 * Exports data to a CSV file.
 * @param data Array of objects to export
 * @param filename Name of the file (without extension)
 * @param headers Mapping of object keys to human-readable headers
 */
export const exportToCSV = (
  data: any[],
  filename: string,
  headers: Record<string, string>
) => {
  if (!data || data.length === 0) return;

  const headerKeys = Object.keys(headers);
  const headerLabels = Object.values(headers);

  const csvRows = [];
  
  // Add headers
  csvRows.push(headerLabels.join(','));

  // Add data rows
  for (const row of data) {
    const values = headerKeys.map(key => {
      const val = row[key];
      // Escape commas and wrap in quotes if it's a string
      const escaped = ('' + (val ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
