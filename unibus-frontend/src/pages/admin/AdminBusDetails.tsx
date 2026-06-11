import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';

interface SeatStatus {
  [key: string]: 'available' | 'bookedMale' | 'bookedFemale' | 'reserved' | 'unavailable';
}

export default function AdminBusDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [busData, setBusData] = useState<any>(null);
  const [modelData, setModelData] = useState<any>(null);
  const [seatStatuses, setSeatStatuses] = useState<SeatStatus>({});
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBusDetails();
  }, [id]);

  const fetchBusDetails = async () => {
    try {
      const res = await api.get(`/bus/${id}`);
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

  const blockSeat = async (status: string) => {
    if (!selectedSeat) return;
    try {
      await api.post(`/admin/blockStaffSeat?busId=${id}&seatId=${selectedSeat}&status=${status}`);
      setMessage(`Seat ${selectedSeat} marked as ${status}`);
      setSelectedSeat(null);
      fetchBusDetails();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error blocking seat');
    }
  };

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
      bgColor = 'bg-blue-500 border-blue-500 shadow-sm';
      textColor = 'text-white';
    } else if (status === 'bookedFemale') {
      bgColor = 'bg-pink-500 border-pink-500 shadow-sm';
      textColor = 'text-white';
    } else if (status === 'reserved') {
      bgColor = 'bg-emerald-500 border-emerald-500 shadow-sm';
      textColor = 'text-white';
    }

    if (selectedSeat === seatId) {
      bgColor = 'bg-emerald-500 border-emerald-600 shadow-md shadow-emerald-500/30';
      textColor = 'text-white';
    }

    return (
      <div 
        key={seatId} 
        onClick={() => setSelectedSeat(seatId)}
        className={`w-12 h-12 rounded-[10px] border-[1.5px] m-1 flex items-center justify-center transition-all ${bgColor}`}
        title={`Seat ${seatId} - ${status}`}
      >
        <span className={`text-[0.65rem] font-bold ${textColor}`}>{seatId}</span>
      </div>
    );
  };

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
    return <div className="p-8 text-center">Loading bus details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/buses')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bus Details</h1>
          <p className="text-slate-500">{busData?.busNumber} - {busData?.routeName}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 overflow-x-auto">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 inline-block min-w-max mx-auto relative">
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

        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" /> Admin Controls
            </h3>
            
            {message && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {message}
              </div>
            )}

            {selectedSeat ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Selected Seat: <strong className="text-lg text-indigo-500">{selectedSeat}</strong></p>
                <div className="space-y-2">
                  <button onClick={() => blockSeat('bookedMale')} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                    Reserve for Male Staff
                  </button>
                  <button onClick={() => blockSeat('bookedFemale')} className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium transition-colors">
                    Reserve for Female Staff
                  </button>
                  <button onClick={() => blockSeat('available')} className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-medium transition-colors">
                    Make Available
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Click any seat on the map to manage its status.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
