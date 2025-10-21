import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  created_at: string;
  report_data: any;
  report_url: string;
}

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const downloadReport = (report: Report) => {
    if (report.report_url) {
      window.open(report.report_url, "_blank");
    } else {
      toast({
        title: "Error",
        description: "Report URL not available",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Medical Reports</h1>
        <p className="text-muted-foreground">View and download your diagnosis reports</p>
      </div>

      {reports.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-muted rounded-full mb-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Complete a diagnosis to generate your first report. Reports will appear here once created.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Diagnosis Report</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(report.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.report_data?.patient && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{report.report_data.patient.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Age: {report.report_data.patient.age}</span>
                      <span>•</span>
                      <span>{report.report_data.patient.sex}</span>
                    </div>
                  </div>
                )}

                {report.report_data?.diagnosis && (
                  <div>
                    <Badge
                      variant={report.report_data.diagnosis.has_cancer ? "destructive" : "default"}
                      className="mb-2"
                    >
                      {report.report_data.diagnosis.has_cancer
                        ? "Abnormality Detected"
                        : "No Cancer Detected"}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Top Finding: {report.report_data.diagnosis.top_prediction}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {report.report_data.diagnosis.confidence_score}%
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => downloadReport(report)}
                  className="w-full"
                  variant="default"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;