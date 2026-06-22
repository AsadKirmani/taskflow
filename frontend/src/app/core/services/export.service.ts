import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {

  // 🚀 1. Copy to Clipboard
  async copyLinkToClipboard(url: string = window.location.href): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (err) {
      console.error('Failed to copy link: ', err);
      return false;
    }
  }

  // 🚀 2. Export as JSON
  exportToJson(data: any, filename: string) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    this.downloadFile(blob, `${filename}.json`);
  }

  // 🚀 3. Export as CSV (Excel)
  exportToCsv(data: any, filename: string) {
    // Agar single object hai toh usko array bana lo
    const dataArray = Array.isArray(data) ? data : [data];
    if (dataArray.length === 0) return;

    // Keys ko CSV headers banao
    const headers = Object.keys(dataArray[0]);
    const csvRows = [];
    csvRows.push(headers.join(',')); // Header row

    // Values ko rows mein dalo
    for (const row of dataArray) {
      const values = headers.map(header => {
        const val = row[header];
        // Agar value string hai aur usme comma hai, toh double quotes mein wrap karo
        const escaped = ('' + val).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    this.downloadFile(blob, `${filename}.csv`);
  }

  // Internal Helper Function to trigger download
  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url); // Memory clean up
  }
}