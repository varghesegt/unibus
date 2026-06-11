import { cn } from "@/lib/utils";
import Seat from "./Seat";
import { type SeatRows } from "@/lib/utils";

interface SeatsRowProps {
  seatRow: SeatRows;
  maxSeatsInRow: number;
  reversed: boolean;
}

export default function SeatsRow({
  seatRow,
  maxSeatsInRow,
  reversed = false,
}: SeatsRowProps) {
  return (
    <div
      className={cn(
        "flex flex-row justify-between w-full",
        reversed ? "flex-row-reverse" : "",
      )}
    >
      {Array.from({ length: maxSeatsInRow }).map((_, index) => {
        if (seatRow[index]) {
          return <Seat key={index} {...seatRow[index]} />;
        } else {
          return (
            <Seat key={index} id={`empty-${index}`} seatStatus="unavailable" />
          );
        }
      })}
    </div>
  );
}
