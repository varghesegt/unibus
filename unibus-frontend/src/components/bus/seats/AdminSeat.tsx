"use client";
import type { Seat } from "@/lib/utils";
import { useSeat } from "@/contexts/BusPropsContext";
import { useState } from "react";

type SeatBookingInfo = {
  seatId: string;
  status: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  userRollNo: string | null;
  userGender: string | null;
  userCollege: string | null;
  createdAt: Date | null;
};

type AdminSeatProps = Seat & {
  bookingInfo?: SeatBookingInfo;
};

export default function AdminSeat({
  id,
  seatStatus,
  bookingInfo,
}: AdminSeatProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  useSeat();

  let colorClass = "bg-available";

  // Use the actual seat status to determine color
  if (seatStatus === "bookedMale") {
    colorClass = "bg-maleBooked";
  } else if (seatStatus === "bookedFemale") {
    colorClass = "bg-femaleBooked";
  } else if (seatStatus === "reserved") {
    colorClass = "bg-reserved";
  } else if (seatStatus === "unavailable") {
    return <div style={{ height: 48, width: 48 }} className="m-1 invisible" />;
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        style={{ height: 48, width: 48, fontSize: 10.5 }}
        className={`rounded-[10px] border-[1.5px] border-slate-200 font-bold tracking-tight m-1 flex flex-col items-center justify-center text-center transition-all cursor-default ${colorClass}`}
      >
        {id.slice(-3)}
      </div>

      {/* Compact Tooltip */}
      {showTooltip && bookingInfo?.userId && (
        <div className="bg-card border-border absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 transform rounded border p-2 text-xs shadow-lg">
          <div className="space-y-1">
            <div className="text-card-foreground font-semibold">
              {bookingInfo.userName} ({bookingInfo.seatId})
            </div>
            <div className="text-muted-foreground">
              Roll: {bookingInfo.userRollNo} | {bookingInfo.userGender}
            </div>
            <div className="text-muted-foreground">
              College: {bookingInfo.userCollege}
            </div>
            <div className="text-muted-foreground truncate">
              {bookingInfo.userPhone}
            </div>
          </div>
          <div className="border-t-card absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-4 border-l-4 border-r-transparent border-l-transparent"></div>
        </div>
      )}

      {/* Simple Available Tooltip */}
      {showTooltip && !bookingInfo?.userId && (
        <div className="bg-card border-border absolute bottom-full left-1/2 z-10 mb-2 w-24 -translate-x-1/2 transform rounded border p-1 text-center text-xs shadow-lg">
          <div className="text-card-foreground">{id} - Available</div>
          <div className="border-t-card absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-4 border-l-4 border-r-transparent border-l-transparent"></div>
        </div>
      )}
    </div>
  );
}
