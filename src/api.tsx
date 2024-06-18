
/// This file is responsible for all api requests


/// basic url
const API_BASE_URL = 'http://127.0.0.1:8000/api';
const HEADERS = {'Content-Type': 'application/json',}

/// function to fetch all existing rooms
export const fetchRooms = async () => {
    const response = await fetch(`${API_BASE_URL}/rooms`);
    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
};

/// function to fetch a schedule of a specific room
export const fetchSchedule = async (roomId: number) => {
    const response = await fetch(`${API_BASE_URL}/room_schedule?room_id=${roomId}`);
    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
};


/// function to book a room - handles both cases of specific room and random room
export const bookRoom = async (date: string, time: string, roomId: number | null) => {
    const response = await fetch(`${API_BASE_URL}/book_room`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ room_id: roomId, date, time }),
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to book room');
    }
    return response.json();
};

/// function to cancel a booking for a specific room
export const cancelBooking = async (roomId: number, bookingId: number) => {
    const response = await fetch(`${API_BASE_URL}/cancel_booking?room_id=${roomId}&booking_id=${bookingId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel booking');
    }
    return response.json();
};

/// function to add a room
export const addRoom = async (name: string) => {
    const response = await fetch(`${API_BASE_URL}/add_room`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add room');
    }
    return response.json();
};

/// function to delete a room
export const deleteRoom = async (roomId: number) => {
    const response = await fetch(`${API_BASE_URL}/delete_room?room_id=${roomId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete room');
    }
    return response.json();
};
