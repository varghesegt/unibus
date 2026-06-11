import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { CheckCircle2, XCircle, FileText, Loader2, AlertCircle } from "lucide-react";
import api from "../../lib/axios";

export default function AdminBookings() {
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      const res = await api.get("/admin/bookings/pending");
      setPendingBookings(res.data);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to fetch pending bookings");
      setIsLoading(false);
    }
  };

  const handleAction = async (seatId: number, action: "approve" | "reject") => {
    setActionLoading(seatId);
    try {
      await api.post(`/admin/bookings/${seatId}/${action}`);
      setPendingBookings((prev) => prev.filter((b) => b.seat.id !== seatId));
    } catch (err) {
      alert(`Failed to ${action} booking.`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pending Verifications
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Review uploaded receipts and approve or reject seat bookings.
        </p>
      </div>

      <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-slate-800/80 p-6">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : error ? (
          <div className="text-red-500 flex items-center gap-2 p-4">
            <AlertCircle /> {error}
          </div>
        ) : pendingBookings.length === 0 ? (
          <div className="text-center p-8 text-slate-500">
            No pending bookings to verify!
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pendingBookings.map((booking) => (
              <div
                key={booking.seat.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="mb-4 border-b border-slate-100 pb-4 dark:border-slate-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{booking.user.name}</h3>
                      <p className="text-sm text-slate-500">{booking.user.rollNo}</p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                      Pending
                    </span>
                  </div>
                </div>

                <div className="mb-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p><span className="font-medium text-slate-900 dark:text-slate-100">Bus:</span> {booking.bus.busNumber}</p>
                  <p><span className="font-medium text-slate-900 dark:text-slate-100">Seat ID:</span> {booking.seat.seatId}</p>
                  <p><span className="font-medium text-slate-900 dark:text-slate-100">Gender:</span> {booking.user.gender}</p>
                </div>

                {booking.seat.receiptUrl && (
                  <div className="mb-6">
                    <a
                      href={`http://localhost:8080${booking.seat.receiptUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      <FileText size={18} />
                      View Receipt
                    </a>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAction(booking.seat.id, "approve")}
                    disabled={actionLoading === booking.seat.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === booking.seat.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 className="mr-2" size={18} />}
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleAction(booking.seat.id, "reject")}
                    disabled={actionLoading === booking.seat.id}
                    variant="destructive"
                    className="flex-1"
                  >
                    {actionLoading === booking.seat.id ? <Loader2 className="animate-spin" size={18} /> : <XCircle className="mr-2" size={18} />}
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
