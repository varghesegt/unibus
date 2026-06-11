import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Loader2, MessageSquare, Image as ImageIcon } from "lucide-react";
import api from "../../lib/axios";

export default function AdminGrievances() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const res = await api.get("/admin/grievances");
      setGrievances(res.data);
    } catch (err) {
      console.error("Failed to fetch grievances", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-amber-500" /> Reviews & Grievances
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Feedback and reports submitted by students from the bus.
        </p>
      </div>

      <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-slate-800/80 p-6">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : grievances.length === 0 ? (
          <div className="text-center p-12 text-slate-500">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-lg font-medium">No grievances reported yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {grievances.map((item) => (
              <div
                key={item.grievance.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {item.user.name}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        Roll: {item.user.rollNo} • Dept: {item.user.department}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Year: {item.user.year || 'N/A'} • Sem: {item.user.semester || 'N/A'}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full whitespace-nowrap">
                      {new Date(item.grievance.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mb-4 bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20">
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-medium">
                      "{item.grievance.review}"
                    </p>
                  </div>
                </div>

                {item.grievance.photoProofUrl && (
                  <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <a
                      href={`http://localhost:8080${item.grievance.photoProofUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors"
                    >
                      <ImageIcon size={16} className="text-amber-500" /> View Photo Proof
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
