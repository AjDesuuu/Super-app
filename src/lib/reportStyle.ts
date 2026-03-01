// report-utils.ts
import { mockStations, mockWeeklyData } from "@/data/operator-data";

// --- Types ---

export type ReportType = "daily" | "weekly" | "analytics" | "incidents";
export type ExportFormat = "pdf" | "csv";

export interface Incident {
  id: string;
  type: string;
  location: string;
  line: string;
  severity: "high" | "medium" | "low";
  status: "active" | "resolved";
  time: string;
  description: string;
}

// Mock incidents data (Internal to utils or could be imported)
const mockIncidents: Incident[] = [
  { id: "inc-001", type: "Delay", location: "Cubao Station", line: "LRT-2", severity: "medium", status: "active", time: "10:45 AM", description: "Signal system maintenance causing 5-minute delays" },
  { id: "inc-002", type: "Overcrowding", location: "Ayala Station", line: "MRT-3", severity: "high", status: "active", time: "11:20 AM", description: "Platform capacity at 95% during rush hour" },
  { id: "inc-003", type: "Technical", location: "Doroteo Jose", line: "LRT-1", severity: "low", status: "resolved", time: "09:15 AM", description: "Ticketing machine temporarily offline - resolved" }
];

// --- HTML/CSS Templates ---

const PDF_STYLES = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1f2937; }
  h2 { color: #000000; border-bottom: 3px solid #000000; padding-bottom: 10px; }
  h3 { color: #374151; margin-top: 25px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  th { background-color: #000000; color: white; padding: 12px; text-align: left; font-weight: 600; }
  td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) { background-color: #f9fafb; }
  tr:hover { background-color: #f3f4f6; }
  p { line-height: 1.6; }
  .summary-box { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
  .card { padding: 15px; border-radius: 8px; }
`;

// --- Logic Functions ---

export const generateCSV = (type: ReportType): string => {
  let csv = "";
  switch (type) {
    case "daily":
      csv = "Station,Line,Status\n";
      mockStations.forEach(s => csv += `"${s.name}","${s.line}","${s.status}"\n`);
      break;
    case "weekly":
      csv = "Day,Passengers,Change\n";
      mockWeeklyData.forEach((day, i) => {
        const change = i > 0 ? ((day.passengers - mockWeeklyData[i - 1].passengers) / mockWeeklyData[i - 1].passengers * 100).toFixed(1) : "0.0";
        csv += `"${day.day}",${day.passengers},${change}%\n`;
      });
      break;
    case "analytics":
      const total = mockWeeklyData.reduce((sum, d) => sum + d.passengers, 0);
      csv = "Metric,Value\n";
      csv += `"Total Weekly Passengers",${total}\n"Total Stations",${mockStations.length}\n`;
      break;
    case "incidents":
      csv = "ID,Type,Location,Line,Severity,Status,Time,Description\n";
      mockIncidents.forEach(i => csv += `"${i.id}","${i.type}","${i.location}","${i.line}","${i.severity}","${i.status}","${i.time}","${i.description}"\n`);
      break;
  }
  return csv;
};

export const generatePDF = (type: ReportType): string => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  let content = "";

  if (type === "daily") {
    content = `
      <h2>Daily Station Report</h2>
      <p><strong>Generated:</strong> ${today}</p>
      <table>
        <thead><tr><th>Station</th><th>Line</th><th>Status</th></tr></thead>
        <tbody>
          ${mockStations.map(s => `<tr><td>${s.name}</td><td>${s.line}</td><td style="color: ${s.status === 'operational' ? '#22c55e' : '#ef4444'}; font-weight: bold;">${s.status}</td></tr>`).join('')}
        </tbody>
      </table>`;
  } else if (type === "weekly") {
    const total = mockWeeklyData.reduce((sum, d) => sum + d.passengers, 0);
    content = `
      <h2>Weekly Performance Report</h2>
      <div class="summary-box"><p><strong>Total Passengers:</strong> ${total.toLocaleString()}</p></div>
      <table>
        <thead><tr><th>Day</th><th>Passengers</th><th>Change</th></tr></thead>
        <tbody>
          ${mockWeeklyData.map((d, i) => {
            const chg = i > 0 ? ((d.passengers - mockWeeklyData[i - 1].passengers) / mockWeeklyData[i - 1].passengers * 100).toFixed(1) : "0.0";
            return `<tr><td>${d.day}</td><td>${d.passengers.toLocaleString()}</td><td style="color: ${Number(chg) >= 0 ? '#22c55e' : '#ef4444'}; font-weight: bold;">${chg}%</td></tr>`;
          }).join('')}
        </tbody>
      </table>`;
  } else if (type === "analytics") {
    content = `
      <h2>Analytics Summary Report</h2>
      <div class="grid">
        <div class="card" style="background: #dbeafe;"><h3>Total Weekly</h3><p>${mockWeeklyData.reduce((sum, d) => sum + d.passengers, 0).toLocaleString()}</p></div>
        <div class="card" style="background: #fee2e2;"><h3>Active Incidents</h3><p>${mockIncidents.filter(i => i.status === "active").length}</p></div>
      </div>`;
  } else if (type === "incidents") {
    content = `
      <h2>Incident Report</h2>
      <table>
        <thead><tr><th>Type</th><th>Location</th><th>Severity</th><th>Status</th></tr></thead>
        <tbody>
          ${mockIncidents.map(i => `<tr><td>${i.type}</td><td>${i.location}</td><td style="color: ${i.severity === 'high' ? '#ef4444' : '#f97316'}; font-weight: bold;">${i.severity.toUpperCase()}</td><td>${i.status}</td></tr>`).join('')}
        </tbody>
      </table>`;
  }

  return `
    <!DOCTYPE html><html><head><meta charset="UTF-8"><style>${PDF_STYLES}</style></head>
    <body>
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #000000;">NexStation Rail Operations</h1>
        <p style="color: #6b7280;">LRT/MRT Monitoring Dashboard</p>
      </div>
      ${content}
      <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        <p>© 2026 NexStation. All rights reserved.</p>
      </div>
    </body></html>`;
};

// --- Execution Helpers ---

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const handleExportLogic = async (type: ReportType, format: ExportFormat) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  const timestamp = new Date().toISOString().split('T')[0];

  if (format === "csv") {
    const csv = generateCSV(type);
    downloadFile(csv, `nexstation-${type}-${timestamp}.csv`, 'text/csv');
  } else {
    const html = generatePDF(type);
    downloadFile(html, `nexstation-${type}-${timestamp}.html`, 'text/html');
  }
};