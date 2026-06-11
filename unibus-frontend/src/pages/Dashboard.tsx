import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, MapPin, Clock, ArrowRight, LogOut, User as UserIcon, Calendar, Star, ChevronRight, Upload, Download, Bell, FileText, MessageSquare, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';

interface BoardingPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface BusData {
  id: string;
  busNumber: string;
  routeName: string;
  driverName: string;
  driverPhone: string;
  arrivalTime?: string;
  seats?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [boardingPoints, setBoardingPoints] = useState<BoardingPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<string>('');
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [semesterPass, setSemesterPass] = useState<any>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [circulars, setCirculars] = useState<any[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState<File | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      setUser(parsed);
      fetchUserProfile(parsed.id);
    }
    fetchBoardingPoints();
    fetchMySeat();
    fetchCirculars();
    
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchCirculars = async () => {
    try {
      const res = await api.get('/circulars');
      setCirculars(res.data);
    } catch (err) {
      console.error('Failed to fetch circulars', err);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const res = await api.get('/user/dashboard');
      setUser(res.data);
      const photo = localStorage.getItem(`profile_photo_${res.data.id || userId}`);
      if (photo) {
        setPhotoPreview(photo);
      }
    } catch (err) {
      console.error('Failed to fetch user profile', err);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Photo must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          const currentUserId = user?.id || JSON.parse(localStorage.getItem('user') || '{}').id;
          if (currentUserId) {
            localStorage.setItem(`profile_photo_${currentUserId}`, compressedBase64);
          }
          setPhotoPreview(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const downloadPDF = () => {
    if (!user || !semesterPass) return;
    const currentUserId = user.id || JSON.parse(localStorage.getItem('user') || '{}').id;
    const profilePhoto = localStorage.getItem(`profile_photo_${currentUserId}`);
    if (!profilePhoto) {
      alert("Please upload a profile photo first.");
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Outer frame/background
    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(15, 15, 180, 267, 4, 4, 'FD');

    // College Name at the top
    const collegeName = user.college || 'K. RAMAKRISHNAN COLLEGE OF ENGINEERING';
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text(collegeName.toUpperCase(), 105, 30, { align: "center" });

    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text("Approved by AICTE & Affiliated to Anna University", 105, 36, { align: "center" });

    // Accent line
    doc.setDrawColor(14, 165, 233); // Cyan
    doc.setLineWidth(0.8);
    doc.line(25, 42, 185, 42);

    // Document Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55);
    doc.text("SEMESTER BUS PASS", 105, 52, { align: "center" });

    // Student Photo (directly under college name/title)
    const photoWidth = 35;
    const photoHeight = 45;
    const photoX = 105 - (photoWidth / 2);
    const photoY = 60;

    // Draw border for the photo
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.rect(photoX - 1, photoY - 1, photoWidth + 2, photoHeight + 2);
    
    // Add image
    try {
      doc.addImage(profilePhoto, 'JPEG', photoX, photoY, photoWidth, photoHeight);
    } catch (err) {
      console.error("Failed to add image to PDF", err);
    }

    // Grid layout for credentials
    const startY = 120;
    const rowHeight = 11;
    
    const drawGridRow = (label: string, value: string, y: number) => {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text(label, 30, y);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.text(value, 80, y);

      // Line separator
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(30, y + 3, 180, y + 3);
    };

    let currentY = startY;
    drawGridRow("Student Name", (user.name || '').toUpperCase(), currentY); currentY += rowHeight;
    drawGridRow("Roll Number", (user.rollNo || '').toUpperCase(), currentY); currentY += rowHeight;
    drawGridRow("Department", ((user.degree ? user.degree + ' - ' : '') + (user.department || 'N/A')).toUpperCase(), currentY); currentY += rowHeight;
    drawGridRow("Semester / Year", ((user.semester ? 'Sem ' + user.semester + ' / ' : '') + (user.year || 'N/A')).toUpperCase(), currentY); currentY += rowHeight;
    drawGridRow("Bus Number", (semesterPass.bus.busNumber || '').toUpperCase(), currentY); currentY += rowHeight;
    drawGridRow("Route Name", (semesterPass.bus.routeName || '').toUpperCase(), currentY); currentY += rowHeight;
    drawGridRow("Seat Number", (semesterPass.seat.seatId || '').toUpperCase(), currentY); currentY += rowHeight;
    drawGridRow("Date Booked", new Date(semesterPass.seat.createdAt).toLocaleDateString(), currentY); currentY += rowHeight;
    drawGridRow("Validity", "ACTIVE - FULL SEMESTER", currentY); currentY += rowHeight;

    // Signature/Verification Area
    const sigY = 245;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text("TRANSPORT IN-CHARGE", 30, sigY);
    doc.text("PRINCIPAL SIGNATURE", 180, sigY, { align: "right" });

    // Official Stamp Placeholder
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.rect(85, sigY - 15, 40, 20);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("COLLEGE SEAL", 105, sigY - 5, { align: "center" });

    // Footer note
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("This is a computer-generated bus pass. No physical signature is required unless requested.", 105, 272, { align: "center" });

    // Save PDF
    doc.save(`BusPass_${user.rollNo || 'student'}.pdf`);
  };

  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel your seat booking?")) {
      return;
    }
    try {
      await api.post('/booking/cancelSeat');
      setSemesterPass(null);
      setPhotoPreview('');
      setSelectedPoint('');
      setBuses([]);
      alert("Booking cancelled successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  const submitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmittingReview(true);
    setReviewMessage("");

    try {
      const formData = new FormData();
      formData.append("review", reviewText);
      if (reviewPhoto) formData.append("photo", reviewPhoto);

      await api.post("/grievances", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setReviewMessage("Review submitted successfully. Thank you for your feedback!");
      setReviewText("");
      setReviewPhoto(null);
      setTimeout(() => setReviewMessage(""), 5000);
    } catch (err) {
      setReviewMessage("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const fetchMySeat = async () => {
    try {
      const res = await api.get('/booking/mySeat');
      if (res.data && res.data.seat) {
        setSemesterPass(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch my seat', err);
    }
  };

  const fetchBoardingPoints = async () => {
    try {
      const res = await api.get('/bus/boardingPoints');
      setBoardingPoints(res.data);
    } catch (err) {
      console.error('Failed to fetch boarding points', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async (pointId: string) => {
    if (!pointId) {
      setBuses([]);
      return;
    }
    try {
      const res = await api.get(`/bus/byBoardingPoint/${pointId}`);
      setBuses(res.data);
    } catch (err) {
      console.error('Failed to fetch buses', err);
    }
  };

  const handlePointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pointId = e.target.value;
    setSelectedPoint(pointId);
    fetchBuses(pointId);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-all">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bus className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-300 bg-clip-text text-transparent tracking-tight">
              Unibus
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || <UserIcon className="w-4 h-4" />}
              </div>
              <span className="font-medium text-sm text-slate-700 dark:text-slate-200">{user?.name}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-6xl relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
              Ready for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">journey?</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </motion.div>

        {semesterPass ? (
          <>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-indigo-600 to-cyan-600 p-1 rounded-3xl shadow-2xl mb-10 relative overflow-hidden group"
          >
            <div className="bg-slate-900 rounded-[22px] p-8 md:p-12 relative overflow-hidden h-full flex flex-col md:flex-row items-center gap-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              {/* Photo Area */}
              <div className="flex flex-col items-center justify-center z-10 flex-shrink-0">
                {photoPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-32 h-40 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-lg relative group bg-slate-950">
                      <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                    </div>
                    <label className="text-xs text-cyan-300 hover:text-cyan-200 cursor-pointer transition-colors underline">
                      Change Photo
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="w-32 h-40 rounded-2xl border-2 border-dashed border-slate-600 hover:border-cyan-400 bg-slate-800/50 hover:bg-slate-800 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all p-4 text-center">
                    <Upload className="w-8 h-8 text-slate-400 hover:text-cyan-300" />
                    <span className="text-[10px] font-semibold text-slate-300">Upload Photo to Download Pass</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left z-10 flex flex-col justify-between">
                <div>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full mb-4 border ${semesterPass.seat.approvalStatus === 'PENDING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'}`}>
                    <Star className="w-3 h-3" /> {semesterPass.seat.approvalStatus === 'PENDING' ? 'VERIFICATION PENDING' : 'ACTIVE SEMESTER PASS'}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Seat {semesterPass.seat.seatId}</h2>
                  <p className="text-slate-300 text-lg">{semesterPass.bus.busNumber} • {semesterPass.bus.routeName}</p>
                  
                  {/* Student Credentials */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 sm:gap-y-2 text-sm text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 max-w-md text-left">
                    <div>
                      <span className="text-slate-500 text-xs block">Name</span>
                      <span className="font-semibold text-white">{user?.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">Roll No</span>
                      <span className="font-semibold text-white">{user?.rollNo || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">Department</span>
                      <span className="font-semibold text-white">{(user?.degree ? user?.degree + ' ' : '') + (user?.department || 'N/A')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">Semester / Year</span>
                      <span className="font-semibold text-white">{(user?.semester ? `Sem ${user.semester} / ` : '') + (user?.year || 'N/A')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/60 pt-6">
                  <div className="flex flex-col md:flex-row items-center gap-6 text-slate-400 text-sm w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-indigo-400" /> Driver: <span className="text-white font-medium">{semesterPass.bus.driverName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-400" /> Booked On: <span className="text-white font-medium">{new Date(semesterPass.seat.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={handleCancelBooking}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                    >
                      Cancel Booking
                    </button>
                    <button
                      onClick={downloadPDF}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                    >
                      <Download className="w-5 h-5" /> Download Pass PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl mb-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                <MessageSquare className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bus Review & Grievances</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Share your feedback or report an issue regarding the bus.</p>
              </div>
            </div>

            {reviewMessage && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 font-medium">
                {reviewMessage}
              </div>
            )}

            <form onSubmit={submitGrievance} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Review / Grievance <span className="text-red-500">*</span></label>
                  <textarea
                    rows={4}
                    required
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Describe your experience or the issue in detail..."
                    className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 py-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Photo Proof (Optional)</label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors h-[124px] cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReviewPhoto(e.target.files ? e.target.files[0] : null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {reviewPhoto ? (
                      <div className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" /> {reviewPhoto.name}
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Click to upload or drag and drop</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-8 py-4 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </motion.div>
          </>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200/60 dark:border-slate-700/60 mb-10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 dark:bg-cyan-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-400/20 transition-all duration-700" />
              
              <label className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" /> 
                Where are you boarding from?
              </label>
              
              {loading ? (
                <div className="animate-pulse h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full md:w-2/3"></div>
              ) : (
                <div className="relative w-full md:w-2/3">
                  <select
                    className="w-full pl-4 pr-12 py-4 rounded-2xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-lg font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
                    value={selectedPoint}
                    onChange={handlePointChange}
                  >
                    <option value="" disabled>Select a boarding point to see buses</option>
                    {boardingPoints.map(point => (
                      <option key={point.id} value={point.id}>{point.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronRight className="w-6 h-6 text-slate-400 rotate-90" />
                  </div>
                </div>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {selectedPoint && (
                <motion.div
                  key="bus-list"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                        <Bus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Available Routes
                    </h2>
                    <div className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                      {buses.length} Buses Found
                    </div>
                  </div>
                  
                  {buses.length === 0 ? (
                    <motion.div 
                      variants={itemVariants}
                      className="p-12 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl"
                    >
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bus className="w-10 h-10 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Buses Scheduled</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        There are currently no buses scheduled for the selected boarding point. Please try another point or check back later.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {buses.map(bus => (
                        <motion.div 
                          variants={itemVariants}
                          key={bus.id} 
                          className="bg-white dark:bg-slate-900 rounded-3xl p-1 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group"
                        >
                          <div className="bg-slate-50 dark:bg-slate-950 rounded-[22px] p-6 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full mb-3 border border-indigo-500/20">
                                  <Star className="w-3 h-3" />
                                  {bus.busNumber}
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{bus.routeName}</h3>
                              </div>
                              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-300">
                                <Bus className="w-6 h-6 text-indigo-500" />
                              </div>
                            </div>
                            
                            <div className="space-y-3 mb-8 flex-1">
                              <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                  <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                </div>
                                <div>
                                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Captain</p>
                                  <p className="text-slate-900 dark:text-slate-200 font-semibold">{bus.driverName}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                                  <Bus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Available Seats</p>
                                  <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                                    {bus.seats ? Object.values(JSON.parse(bus.seats)).filter(s => s === 'available').length : 0} Seats Left
                                  </p>
                                </div>
                              </div>
                            </div>

                            <button 
                              onClick={() => navigate(`/dashboard/booking?busId=${bus.id}`)}
                              className="w-full py-4 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-indigo-500/25 relative overflow-hidden"
                            >
                              <span className="relative z-10 flex items-center gap-2">
                                Select Seats <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>


          </>
        )}

        {/* Circulars / Notice Board - ALWAYS VISIBLE */}
        {circulars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Notice Board</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {circulars.map((circular) => (
                <div key={circular.id} className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {circular.title}
                      </h3>
                      <span className="text-[0.65rem] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-md uppercase tracking-wider whitespace-nowrap">
                        {new Date(circular.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {circular.content && (
                      <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                        {circular.content}
                      </p>
                    )}
                  </div>
                  
                  {circular.attachmentUrl && (
                    <div className="shrink-0 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                      <a
                        href={`http://localhost:8080${circular.attachmentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                      >
                        <FileText size={16} className="text-amber-500" /> View Attachment
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
