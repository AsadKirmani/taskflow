import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {
  async copyLinkToClipboard(url: string = window.location.href): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (err) {
      console.error('Failed to copy link: ', err);
      return false;
    }
  }

  exportToJson(data: any, filename: string) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    this.downloadFile(blob, `${filename}.json`);
  }

  exportToCsv(data: any, filename: string) {
    const dataArray = Array.isArray(data) ? data : [data];
    if (dataArray.length === 0) return;

    const headers = Object.keys(dataArray[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of dataArray) {
      const values = headers.map((header) => {
        const val = row[header];

        const escaped = ('' + val).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    this.downloadFile(blob, `${filename}.csv`);
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
