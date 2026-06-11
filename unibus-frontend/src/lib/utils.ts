import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export interface Seat {
  id: string;
  seatStatus: "available" | "booked_female" | "booked_male" | "selected" | "bookedMale" | "bookedFemale" | "reserved" | "unavailable" | "deleted";
  user_id?: string;
  bus_id?: string;
}

export type SeatRows = Seat[];

export interface BusModelProperties {
  leftTopSeatColumns?: {
    height: number;
    seatsRows: SeatRows[];
    seatsPerRow: number;
  };
  door?: {
    height: number;
  };
  leftSeatColumns?: {
    height: number;
    seatsRows: SeatRows[];
    seatsPerRow: number;
  };
  rightSeatColumns?: {
    height: number;
    seatsRows: SeatRows[];
    seatsPerRow: number;
  };
  driver?: {
    height: number;
  };
  backSeats?: {
    height: number;
    seatsRows: SeatRows[];
    seatsPerRow: number;
  };
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function seatsArrayToMap(
  seats: Seat[],
): Record<string, Seat["seatStatus"]> {
  return seats.reduce(
    (acc, seat) => {
      acc[seat.id] = seat.seatStatus;
      return acc;
    },
    {} as Record<string, Seat["seatStatus"]>,
  );
}

export function flattenBusSeats(busSeats: BusModelProperties): Seat[] {
  const seats: Seat[] = [];
  const seatGroups = [
    busSeats.leftTopSeatColumns,
    busSeats.leftSeatColumns,
    busSeats.rightSeatColumns,
    busSeats.backSeats,
  ];
  for (const group of seatGroups) {
    if (group && Array.isArray(group.seatsRows)) {
      for (const row of group.seatsRows) {
        if (Array.isArray(row)) {
          seats.push(...row);
        } else {
          seats.push(row);
        }
      }
    }
  }
  return seats;
}

export function generateSeatColumns(
  columns: number,
  rows: number,
  startColumnLetter = "A",
  prefix = "-",
): SeatRows[] {
  const seatColumns: SeatRows[] = [];
  for (let c = 1; c <= columns; c++) {
    const colLetter = String.fromCharCode(
      startColumnLetter.charCodeAt(0) + c - 1,
    ); 
    const seatRow: Seat[] = [];
    for (let r = 1; r <= rows; r++) {
      seatRow.push({
        id: `${prefix}${colLetter}${r}`,
        seatStatus: "available",
      });
    }
    seatColumns.push(seatRow);
  }
  return seatColumns;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
