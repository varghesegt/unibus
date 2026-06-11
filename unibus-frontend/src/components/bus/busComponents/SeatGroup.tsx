import { cn } from "@/lib/utils";
import { type SeatRows } from "@/lib/utils";
import SeatsRow from "../seats/SeatsRow";

export default function SeatGroup({
  seatGroups,
  maxSeatsInRow,
  height: _height,
  reversed = false,
}: {
  seatGroups: SeatRows[] | undefined;
  maxSeatsInRow: number;
  height?: number;
  reversed?: boolean;
}) {
  if (!seatGroups) return null;

  return (
    <div
      className={cn("flex flex-grow flex-col justify-around w-full")}
      style={{ minHeight: _height }}
    >
      {seatGroups.map((seatRow: SeatRows, rowIndex: number) => (
        <div key={rowIndex} className="flex w-full">
          <SeatsRow
            seatRow={seatRow}
            reversed={reversed}
            maxSeatsInRow={maxSeatsInRow}
          />
        </div>
      ))}
    </div>
  );
}
