/**
 * Export an array of objects as a CSV file download.
 * @param {Object[]} data - Array of flat objects
 * @param {string} filename - Download filename (without extension)
 * @param {string[]} [columns] - Optional ordered column keys. If omitted, uses all keys from first row.
 */
export function exportToCsv(data, filename, columns) {
  if (!data || data.length === 0) return;

  const cols = columns || Object.keys(data[0]);
  const header = cols.map(escCsv).join(',');
  const rows = data.map((row) =>
    cols.map((col) => escCsv(row[col] ?? '')).join(',')
  );

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function escCsv(val) {
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
