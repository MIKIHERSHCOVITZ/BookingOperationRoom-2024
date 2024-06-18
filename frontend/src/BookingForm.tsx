import React, { useState, useEffect } from 'react';
import './BookingForm.css';
import FeedbackPopup from './FeedbackPopup';
import { fetchRooms, bookRoom } from './api';
import { BookingFormProps } from './interfaces';


/// This function component allows a user to select a date and time and book a random available room
const BookingForm: React.FC<BookingFormProps> = ({ onBookingSuccess }) => {
    /// initialize different states to manage the date, time, rooms, error, and feedback messages
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [rooms, setRooms] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    /// This effect responsible for fetching the rooms data when the component starts
    useEffect(() => {
        const fetchRoomsData = async () => {
            try {
                const roomsData = await fetchRooms();
                setRooms(roomsData);
            } catch (err: unknown) {
                console.error("Failed to fetch rooms:", err);
                err instanceof Error ? setFeedback(err.message) : setFeedback('Unknown error occurred');
            }
        };
        fetchRoomsData();
    }, []);

    /// this function responsible fot normalizing the date to a format that is easier to work with
    const normalizeDate = (date: string): string => {
        const dateObj = new Date(date);
        const offset = dateObj.getTimezoneOffset();
        const normalizedDate = new Date(dateObj.getTime() - offset * 60 * 1000);
        return normalizedDate.toISOString().split('T')[0];
    };

    /// this func handles the submission of the form for booking a room
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        /// In case user do not chose a date or hour, alert is raised
        if (!date || !time) {
            alert('Please select a date and time.');
            return;
        }

        const normalizedDate = normalizeDate(date);

        /// here we try to book a room, ether way a feedback is pop to the user
        try {
            const data = await bookRoom(normalizedDate, time, null);
            setFeedback(data.message || 'Room booked successfully.');
            onBookingSuccess();
        } catch (err: unknown) {
            console.error("Failed to book room:", err);
            err instanceof Error ? setFeedback(err.message) : setFeedback('Unknown error occurred');
        }
        /// clear feedback after 3 sec
        setTimeout(() => setFeedback(null), 3000);
    };

    /// This is the part of the form itself
    return (
        <div>
            <form className="booking-form" onSubmit={handleSubmit}>
                <h3>Book Available Room</h3>
                {error && <div className="error">{error}</div>}
                <label>
                    Date:
                    <input type="date" value={date} onChange={event => setDate(event.target.value)} required />
                </label>
                <label>
                    Time:
                    <input type="time" value={time} onChange={event => setTime(event.target.value)} required />
                </label>
                <button type="submit">Book</button>
            </form>
            {feedback && <FeedbackPopup message={feedback} onClose={() => setFeedback(null)} />}
        </div>
    );
};

export default BookingForm;
