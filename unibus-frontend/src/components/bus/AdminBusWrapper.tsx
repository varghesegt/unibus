"use client";
import type { BusModelProperties, SeatRows, Seat } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import AdminSeat from "@/components/bus/seats/AdminSeat";

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

type AdminBusWrapperProps = {
  busId: string;
  busSeats: BusModelProperties;
  seatBookings: SeatBookingInfo[];
  busSeatStatuses: Record<string, string>; // Add seat statuses from bus data
  className?: string;
} & HTMLMotionProps<"div">;

// Helper component to render seat groups with booking info
function AdminSeatGroup({
  seatGroups,
  maxSeatsInRow,
  height: _height,
  seatBookings,
  busSeatStatuses,
  reversed = false,
}: {
  seatGroups: SeatRows[] | undefined;
  maxSeatsInRow: number;
  height?: number;
  seatBookings: SeatBookingInfo[];
  busSeatStatuses: Record<string, string>;
  reversed?: boolean;
}) {

  if (!seatGroups) return null;

  return (
    <div
      className={cn("flex flex-grow flex-col justify-around w-full")}
      style={{ minHeight: _height }}
    >
      {/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */}
      {seatGroups.map((seatRow, rowIndex) => (
        <div
          key={rowIndex}
          className={cn("flex w-full", reversed ? "flex-row-reverse justify-between" : "flex-row justify-between")}
        >
          {Array.from({ length: maxSeatsInRow }).map((_, seatIndex) => {
            const seat = (seatRow as Seat[])[seatIndex];
            if (!seat) {
              return <div key={seatIndex} style={{ height: 48, width: 48 }} className="m-1 invisible" />;
            }

            // Get seat status from bus data and booking info
            const actualSeatStatus =
              busSeatStatuses[seat.id] ?? seat.seatStatus;
            const bookingInfo = seatBookings.find(
              (booking) => booking.seatId === seat.id,
            );

            return (
              <AdminSeat
                key={seat.id}
                id={seat.id}
                seatStatus={actualSeatStatus as Seat["seatStatus"]}
                bookingInfo={bookingInfo}
              />
            );
          })}
        </div>
      ))}
      {/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */}
    </div>
  );
}

export default function AdminBusWrapper({
  busId: _busId,
  busSeats,
  seatBookings,
  busSeatStatuses,
  className,
  ...props
}: AdminBusWrapperProps) {


  return (
    <Card
      id="admin-bus"
      className={cn("bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 inline-block min-w-max mx-auto relative", className)}
      {...props}
    >
      <div className="w-full flex flex-col items-center mb-10">
        <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[0.7rem] mb-3">
          Driver Section
        </span>
        <div className="w-[85%] border-b border-dashed border-slate-300"></div>
      </div>

      <div className="flex gap-[0.6rem] justify-center">
        <div id="left" className="flex flex-col gap-[0.6rem]">
          <AdminSeatGroup
            seatGroups={busSeats.leftTopSeatColumns?.seatsRows}
            maxSeatsInRow={busSeats.leftTopSeatColumns?.seatsPerRow || 2}
            height={busSeats?.leftTopSeatColumns?.height}
            seatBookings={seatBookings}
            busSeatStatuses={busSeatStatuses}
          />
          <div className="h-12 w-full invisible"></div>
          <AdminSeatGroup
            seatGroups={busSeats.leftSeatColumns?.seatsRows}
            maxSeatsInRow={busSeats.leftSeatColumns?.seatsPerRow || 2}
            height={busSeats?.leftSeatColumns?.height}
            seatBookings={seatBookings}
            busSeatStatuses={busSeatStatuses}
          />
        </div>
        
        <div id="middle" className="w-12 flex justify-center items-center h-full">
          {/* Empty aisle space */}
        </div>
        
        <div id="right" className="flex flex-col gap-[0.6rem]">
          <AdminSeatGroup
            seatGroups={busSeats.rightSeatColumns?.seatsRows}
            maxSeatsInRow={busSeats.rightSeatColumns?.seatsPerRow || 3}
            height={busSeats?.rightSeatColumns?.height}
            seatBookings={seatBookings}
            busSeatStatuses={busSeatStatuses}
            reversed={true}
          />
        </div>
      </div>
      <div className="mt-[0.6rem] flex justify-between w-full">
        <AdminSeatGroup
          seatGroups={busSeats.backSeats?.seatsRows}
          maxSeatsInRow={busSeats.backSeats?.seatsPerRow || 7}
          height={busSeats?.backSeats?.height}
          seatBookings={seatBookings}
          busSeatStatuses={busSeatStatuses}
        />
      </div>
    </Card>
  );
}
