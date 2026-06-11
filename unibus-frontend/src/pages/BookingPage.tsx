import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../lib/axios';

interface SeatStatus {
  [key: string]: 'available' | 'bookedMale' | 'bookedFemale' | 'reserved' | 'unavailable';
}

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const busId = new URLSearchParams(location.search).get('busId');

  const [busData, setBusData] = useState<any>(null);
  const [modelData, setModelData] = useState<any>(null);
  const [seatStatuses, setSeatStatuses] = useState<SeatStatus>({});
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!busId) {
      navigate('/dashboard');
      return;
    }
    fetchBusDetails();
    
    // WebSocket Setup
    // WebSocket Setup
    // Hardcoded production URL to prevent any Vercel environment variable misconfigurations during demo
    const socket = new SockJS('https://unibus-backend-6tm1.onrender.com/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('Connected to WebSocket');
        stompClient.subscribe(`/topic/bus/${busId}`, (msg) => {
          if (msg.body === 'UPDATE') {
            fetchBusDetails();
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });
    
    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [busId]);

  const fetchBusDetails = async () => {
    try {
      const res = await api.get(`/bus/${busId}`);
      setBusData(res.data.bus);
      
      const modelRawData = res.data.model.data;
      const parsedModelData = typeof modelRawData === 'string' ? JSON.parse(modelRawData) : modelRawData;
      setModelData(parsedModelData);
      
      const busSeatsRaw = res.data.bus.seats;
      const parsedSeatStatuses = typeof busSeatsRaw === 'string' ? JSON.parse(busSeatsRaw) : busSeatsRaw;
      setSeatStatuses(parsedSeatStatuses);
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch bus details', err);
      setLoading(false);
    }
  };

  const handleSeatClick = (seatId: string) => {
    const status = seatStatuses[seatId] || 'available';
    if (status !== 'available') return;
    
    if (selectedSeat === seatId) setSelectedSeat(null);
    else setSelectedSeat(seatId);
  };

  const handleBook = async () => {
    if (!selectedSeat) return;

    setBooking(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('busId', busId as string);
      formData.append('seatId', selectedSeat);

      await api.post('/booking/bookSeat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessage('Seat booked successfully for the entire semester!');
      setSelectedSeat(null);
      fetchBusDetails();
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error booking seat');
    } finally {
      setBooking(false);
    }
  };

  // Helper to render seats
  const renderSeat = (seatId: string) => {
    const status = seatStatuses[seatId] || 'available';
    if (status === 'unavailable') {
      return (
        <div 
          key={seatId} 
          className="w-12 h-12 invisible m-1" 
        />
      );
    }

    let bgColor = 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer shadow-sm';
    let textColor = 'text-slate-700';

    if (status === 'bookedMale') {
      bgColor = 'bg-blue-500 border-blue-500 cursor-not-allowed shadow-sm';
      textColor = 'text-white';
    } else if (status === 'bookedFemale') {
      bgColor = 'bg-pink-500 border-pink-500 cursor-not-allowed shadow-sm';
      textColor = 'text-white';
    } else if (status === 'reserved') {
      bgColor = 'bg-emerald-500 border-emerald-500 cursor-not-allowed shadow-sm';
      textColor = 'text-white';
    }

    if (selectedSeat === seatId) {
      bgColor = 'bg-emerald-500 border-emerald-600 shadow-md shadow-emerald-500/30';
      textColor = 'text-white';
    }

    return (
      <div 
        key={seatId} 
        onClick={() => handleSeatClick(seatId)}
        className={`w-12 h-12 rounded-[10px] border-[1.5px] m-1 flex items-center justify-center transition-all ${bgColor}`}
        title={`Seat ${seatId} - ${status}`}
      >
        <span className={`text-[0.65rem] font-bold ${textColor}`}>{seatId}</span>
      </div>
    );
  };

  // Helper to render a group of seats (rows x cols) based on BusModelProperties
  const renderSeatGroup = (group: any, reversed = false) => {
    if (!group || !group.seatsRows) return null;
    return (
      <div className="flex flex-grow flex-col justify-around w-full">
        {group.seatsRows.map((row: any, i: number) => (
          <div key={i} className={`flex w-full justify-between ${reversed ? 'flex-row-reverse' : 'flex-row'}`}>
            {row.map((seat: any) => seat && seat.id ? renderSeat(seat.id) : <div key={Math.random()} className="w-12 h-12 invisible m-1" />)}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <div className="flex flex-col items-center">
            <div className="font-bold text-lg text-slate-800">
              {busData?.busNumber} - {busData?.routeName}
            </div>
            <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full mt-1 border border-emerald-200">
              {Object.values(seatStatuses).filter(s => s === 'available').length} Seats Available
            </div>
          </div>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 max-w-5xl flex flex-col lg:flex-row gap-12">
        {/* Seat Map */}
        <div className="flex-1 w-full overflow-x-auto pb-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 inline-block min-w-max mx-auto relative left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 md:relative">
            <div className="w-full flex flex-col items-center mb-10">
              <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[0.7rem] mb-3">
                Driver Section
              </span>
              <div className="w-[85%] border-b border-dashed border-slate-300"></div>
            </div>

            <div className="flex gap-[0.6rem] justify-center">
              {/* Left Side */}
              <div className="flex flex-col gap-[0.6rem]">
                {modelData?.leftTopSeatColumns && renderSeatGroup(modelData.leftTopSeatColumns)}
                <div className="h-12 w-full invisible"></div>
                {modelData?.leftSeatColumns && renderSeatGroup(modelData.leftSeatColumns)}
              </div>

              {/* Aisle */}
              <div className="w-12 flex justify-center items-center h-full">
                {/* Empty aisle space */}
              </div>

              {/* Right Side */}
              <div className="flex flex-col gap-[0.6rem]">
                {modelData?.rightSeatColumns && renderSeatGroup(modelData.rightSeatColumns, true)}
              </div>
            </div>

            {/* Back Seats */}
            {modelData?.backSeats && (
              <div className="mt-[0.6rem] flex justify-between w-full">
                {renderSeatGroup(modelData.backSeats)}
              </div>
            )}
          </div>
        </div>

        {/* Legend and Booking Panel */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Legend
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-slate-100 border-2 border-slate-300"></div>
                <span className="text-slate-600 text-sm">Available</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-emerald-500 border-2 border-emerald-600"></div>
                <span className="text-slate-600 text-sm font-medium">Selected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-blue-500 border-2 border-blue-600 opacity-70"></div>
                <span className="text-slate-600 text-sm">Booked (Male / Staff)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-pink-500 border-2 border-pink-600 opacity-70"></div>
                <span className="text-slate-600 text-sm">Booked (Female / Staff)</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong>Important:</strong> Females must select seats in the front half. Males must select seats in the back half. You cannot book a seat adjacent to the opposite gender.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Semester Booking</h3>
            <p className="text-slate-600 text-sm mb-6 pb-4 border-b border-slate-100">
              Your selected seat will be locked for the entire 6-month semester.
            </p>

            <div className="mb-6 flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-600 font-medium">Selected Seat</span>
              <span className="text-xl font-bold text-emerald-600">
                {selectedSeat ? selectedSeat : '--'}
              </span>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {message.includes('success') && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                <span>{message}</span>
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={!selectedSeat || booking}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-lg shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2"
            >
              {booking ? 'Processing...' : 'Confirm Semester Seat'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
