import { useState } from "react";
import { FileText, Download, Calendar, TrendingUp, CheckCircle2 } from "lucide-react";

import type { LucideIcon } from "lucide-react";
import { mockStations } from "@/data/operator-data";
import { handleExportLogic } from "@/lib/reportStyle";
import type { ReportType, ExportFormat } from "@/lib/reportStyle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the interface for our config to use LucideIcon correctly
interface ReportConfig {
  id: ReportType;
  title: string;
  description: string;
  icon: LucideIcon;
  color: "blue" | "purple" | "green" | "orange";
}

const REPORT_CONFIG: ReportConfig[] = [
  {
    id: "daily",
    title: "Daily Station Report",
    description: "Current crowd levels, capacity utilization",
    icon: FileText,
    color: "blue",
  },
  {
    id: "weekly",
    title: "Weekly Performance Report",
    description: "7-day passenger trends and statistics",
    icon: Calendar,
    color: "purple",
  },
  {
    id: "analytics",
    title: "Analytics Summary",
    description: "Key metrics and performance indicators",
    icon: TrendingUp,
    color: "green",
  },
  {
    id: "incidents",
    title: "Incident Report",
    description: "All incidents with status and severity",
    icon: FileText,
    color: "orange",
  },
];

export default function ReportsTab() {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (type: ReportType, format: ExportFormat) => {
    const exportKey = `${type}-${format}`;
    setExporting(exportKey);
    await handleExportLogic(type, format);
    setExporting(null);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Reports & Export</h2>
        <p className="text-xs text-muted-foreground">
          Generate and download operational reports
        </p>
      </div>

      <div className="space-y-3">
        {REPORT_CONFIG.map((report) => (
          <Card key={report.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  report.color === 'blue' ? 'bg-blue-500/10' :
                  report.color === 'purple' ? 'bg-purple-500/10' :
                  report.color === 'green' ? 'bg-green-500/10' : 'bg-orange-500/10'
                }`}>
                  <report.icon className={`h-5 w-5 ${
                    report.color === 'blue' ? 'text-blue-500' :
                    report.color === 'purple' ? 'text-purple-500' :
                    report.color === 'green' ? 'text-green-500' : 'text-orange-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{report.title}</p>
                  <p className="text-xs text-muted-foreground">{report.description}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className={`flex-1 ${
                    report.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                    report.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600 text-white' :
                    report.color === 'green' ? 'bg-green-500 hover:bg-green-600 text-white' :
                    'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                  disabled={exporting === `${report.id}-pdf`}
                  onClick={() => handleExport(report.id, "pdf")}
                >
                  {exporting === `${report.id}-pdf` ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3 mr-2" />
                      Export PDF
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`${
                    report.color === 'blue' ? 'border-blue-500 text-blue-500 hover:bg-blue-500/10' :
                    report.color === 'purple' ? 'border-purple-500 text-purple-500 hover:bg-purple-500/10' :
                    report.color === 'green' ? 'border-green-500 text-green-500 hover:bg-green-500/10' :
                    'border-orange-500 text-orange-500 hover:bg-orange-500/10'
                  }`}
                  disabled={exporting === `${report.id}-csv`}
                  onClick={() => handleExport(report.id, "csv")}
                >
                  {exporting === `${report.id}-csv` ? (
                    <>
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3 mr-2" />
                      CSV
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Report Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <SummaryRow label="Total Stations Monitored" value={mockStations.length} />
            <SummaryRow label="Data Accuracy" value="100%" color="text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryRow({ label, value, color = "" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}