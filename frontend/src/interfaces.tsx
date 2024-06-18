
/// This file holds all my interfaces

export interface Booking {
    id: number;
    date: string;
    time: string;
}

export interface Room {
    id: number;
    name: string;
    bookings: Booking[];
}

export interface RoomListProps {
    rooms: Room[];
    selectedRoom: Room | null;
    onRoomClick: (room: Room) => void;
}

export interface TimeIntervalsProps {
    schedule: Booking[];
    date: Date;
    selectedTime: string | null;
    selectedBooking: Booking | null;
    onSelectTime: (timeString: string, booking: Booking | null) => void;
}

export interface FeedbackPopupProps {
    message: string | null;
    onClose: () => void;
}

export interface BookingFormProps {
    onBookingSuccess: () => void;
}

export interface RoomManagementProps {
    onRoomChange: () => void;
}
