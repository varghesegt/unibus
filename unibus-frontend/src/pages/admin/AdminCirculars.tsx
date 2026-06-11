import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Trash2, FileText, Loader2, Plus, X } from "lucide-react";
import api from "../../lib/axios";

export default function AdminCirculars() {
  const [circulars, setCirculars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCirculars();
  }, []);

  const fetchCirculars = async () => {
    try {
      const res = await api.get("/circulars");
      setCirculars(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch circulars", err);
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      if (content.trim()) formData.append("content", content);
      if (attachment) formData.append("attachment", attachment);

      await api.post("/admin/circulars", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setShowModal(false);
      setTitle("");
      setContent("");
      setAttachment(null);
      fetchCirculars();
    } catch (err) {
      alert("Failed to post circular.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this circular?")) return;
    
    try {
      await api.delete(`/admin/circulars/${id}`);
      setCirculars((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete circular.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Circulars & Announcements
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Post and manage notices for all students to see.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus size={18} /> New Circular
        </Button>
      </div>

      <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-slate-800/80 p-6">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : circulars.length === 0 ? (
          <div className="text-center p-8 text-slate-500">
            No circulars posted yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {circulars.map((circular) => (
              <div
                key={circular.id}
                className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{circular.title}</h3>
                    <span className="text-[0.65rem] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-md uppercase tracking-wider whitespace-nowrap">
                      {new Date(circular.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {circular.content && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap mb-4 leading-relaxed">
                      {circular.content}
                    </p>
                  )}
                  {circular.attachmentUrl && (
                    <a
                      href={`http://localhost:8080${circular.attachmentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors mb-4"
                    >
                      <FileText size={16} className="text-amber-500" /> View Attachment
                    </a>
                  )}
                </div>
                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                  <Button
                    onClick={() => handleDelete(circular.id)}
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Post New Circular</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Holiday on Monday"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content (Optional)</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Provide additional details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Attachment (Optional)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-300"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 min-w-[100px]">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Post"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
