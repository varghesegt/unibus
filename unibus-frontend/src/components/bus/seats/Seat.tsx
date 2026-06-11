import type { Seat } from "@/lib/utils";
import { useSeat } from "@/contexts/BusPropsContext";
import { useSeatsData } from "@/contexts/seatsDataContext";

type SeatProps = Seat;

export default function Seat({ id, seatStatus }: SeatProps) {
  const { selectedSeat, setSelectedSeat } = useSeat();
  const seatStatusFromContext = useSeatsData()[id];
  const isSelected = selectedSeat?.id === id;
  const { scale, enabled: disabled } = useSeat();

  let colorClass = "bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 shadow-sm cursor-pointer";

  if (seatStatusFromContext === "bookedMale") {
    colorClass = "bg-blue-500 border-blue-500 text-white shadow-sm";
  } else if (seatStatusFromContext === "bookedFemale") {
    colorClass = "bg-pink-500 border-pink-500 text-white shadow-sm";
  } else if (seatStatusFromContext === "reserved") {
    colorClass = "bg-emerald-500 border-emerald-500 text-white shadow-sm";
  } else if (seatStatus === "unavailable") {
    return (
      <div
        style={{ height: 48 * scale, width: 48 * scale, margin: `${4 * scale}px` }}
        className={`invisible`}
      ></div>
    );
  } else if (seatStatus === "deleted") {
    colorClass = "bg-red-50 border-red-200 text-red-400 line-through cursor-not-allowed";
  } else if (isSelected) {
    colorClass = "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/30";
  }
  
  return (
    <div
      onClick={() => {
        if (!disabled && (colorClass.includes("bg-slate-50") || seatStatus === "deleted")) {
          setSelectedSeat({ id, seatStatus });
        }
      }}
      style={{ height: 48 * scale, width: 48 * scale, fontSize: 10.5 * scale }}
      className={`rounded-[10px] border-[1.5px] font-bold tracking-tight m-1 flex flex-col items-center justify-center text-center transition-all ${colorClass}`}
    >
      {id.slice(-3)}
    </div>
  );
}
