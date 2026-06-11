"use client";
import type { BusModelProperties } from "@/lib/utils";
import { Card } from "../ui/card";
import SeatGroup from "./busComponents/SeatGroup";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";


type BusWrapperProps = {
  busId: string;
  busSeats: BusModelProperties;
  className?: string;
} & HTMLMotionProps<"div">;

export default function BusWrapper({
  busId: _busId,
  busSeats,
  className,
  ...props
}: BusWrapperProps) {

  return (
    <Card
      id="bus"
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
          <SeatGroup
            seatGroups={busSeats.leftTopSeatColumns?.seatsRows}
            maxSeatsInRow={busSeats.leftTopSeatColumns?.seatsPerRow || 2}
            height={busSeats?.leftTopSeatColumns?.height}
          />
          <div className="h-12 w-full invisible"></div>
          <SeatGroup
            seatGroups={busSeats.leftSeatColumns?.seatsRows}
            maxSeatsInRow={busSeats.leftSeatColumns?.seatsPerRow || 2}
            height={busSeats?.leftSeatColumns?.height}
          />
        </div>
        
        <div id="middle" className="w-12 flex justify-center items-center h-full">
          {/* Empty aisle space */}
        </div>
        
        <div id="right" className="flex flex-col gap-[0.6rem]">
          <SeatGroup
            seatGroups={busSeats.rightSeatColumns?.seatsRows}
            maxSeatsInRow={busSeats.rightSeatColumns?.seatsPerRow || 3}
            height={busSeats?.rightSeatColumns?.height}
            reversed={true}
          />
        </div>
      </div>
      <div className="mt-[0.6rem] flex justify-between w-full">
        <SeatGroup
          seatGroups={busSeats.backSeats?.seatsRows}
          maxSeatsInRow={busSeats.backSeats?.seatsPerRow || 7}
          height={busSeats?.backSeats?.height}
        />
      </div>
    </Card>
  );
}
