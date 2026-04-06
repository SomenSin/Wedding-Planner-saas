export const exportToCSV = (
  data: any[],
  filename: string,
  headers: Record<string, string>
) => {
  if (!data || data.length === 0) return;

  const headerKeys = Object.keys(headers);
  const headerLabels = Object.values(headers).map(h => `"${h.replace(/"/g, '""')}"`);

  const csvRows = [];
  
  // Add headers
  csvRows.push(headerLabels.join(','));

  // Add data rows
  for (const row of data) {
    const values = headerKeys.map(key => {
      const val = row[key];
      // Escape quotes and wrap in quotes
      const escaped = ('' + (val ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  // Prepend \uFEFF BOM for Excel UTF-8 compatibility
  const csvContent = "\uFEFF" + csvRows.join('\n');
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
