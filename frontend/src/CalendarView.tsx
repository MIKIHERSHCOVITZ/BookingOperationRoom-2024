import React, { useState, useEffect } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';
import BookingForm from './BookingForm';
import RoomManagement from './RoomManagement';
import FeedbackPopup from './FeedbackPopup';
import RoomList from './RoomList';
import TimeIntervals from './TimeIntervals';
import { fetchRooms, fetchSchedule, bookRoom, cancelBooking } from './api';
import { Room, Booking } from './interfaces';

type LooseValue = Date | [Date, Date] | null;


/// this is my main component it holds all the others and organize them
const CalendarView = () => {
    /// initialize different states to manage the date, selectedRoom, schedule, rooms, error, selectedTime, selectedBooking and feedback messages
    const [date, setDate] = useState<LooseValue>(new Date());
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [schedule, setSchedule] = useState<Booking[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    /// This effect responsible for fetching the rooms data when the component starts
    useEffect(() => {
        const fetchRoomsData = async () => {
            try {
                const roomsData = await fetchRooms();
                setRooms(roomsData);
            } catch (err) {
                err instanceof Error ? setError(err.message) : setError('Unknown error occurred');
            }
        };
        fetchRoomsData();
    }, []);

    // This effect responsible for fetching the schedule data when a room is selected or the date changes
    useEffect(() => {
        if (selectedRoom) {
            const fetchScheduleData = async () => {
                try {
                    const scheduleData = await fetchSchedule(selectedRoom.id);
                    setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
                } catch (err) {
                    err instanceof Error ? setError(err.message) : setError('Unknown error occurred');
                }
            };

            fetchScheduleData();
        }
    }, [date, selectedRoom]);

    /// function to handle the states when the date changes from the calendar
    const handleDateChange: CalendarProps['onChange'] = (value) => {
        setDate(value as LooseValue);
        setSelectedRoom(null);
        setSelectedTime(null);
        setSelectedBooking(null);
    };

    /// function to handle room click event when user selects a room
    const handleRoomClick = (room: Room) => {
        setSelectedRoom(room);
        setSelectedTime(null);
        setSelectedBooking(null);
    };

    /// this function responsible for normalizing the date to a format that is easier to work with
    const normalizeDate = (date: Date): string => {
        const offset = date.getTimezoneOffset();
        const normalizedDate = new Date(date.getTime() - offset * 60 * 1000);
        return normalizedDate.toISOString().split('T')[0];
    };

    /// this function responsible for handel booking a specific room for a specific time
    const handleBookClick = async () => {
        if (date instanceof Date) {
            if (selectedRoom && selectedTime) {
                const normalizedDate = normalizeDate(date);
                await bookRoom(normalizedDate, selectedTime, selectedRoom.id);
                setFeedback('Room booked successfully');
                const updatedSchedule = await fetchSchedule(selectedRoom.id);
                setSchedule(Array.isArray(updatedSchedule) ? updatedSchedule : []);
            }
        }
    };

    /// this function responsible for handel cancel booking of a specific room for a specific time
    const handleCancelClick = async () => {
        if (selectedRoom && selectedBooking) {
            await cancelBooking(selectedRoom.id, selectedBooking.id);
            setFeedback('Booking canceled successfully');
            setSelectedBooking(null); // Clear the selected booking
            const updatedSchedule = await fetchSchedule(selectedRoom.id);
            setSchedule(Array.isArray(updatedSchedule) ? updatedSchedule : []);
        }
    };

    /// this function handles the change of states when we chose a time interval
    const handleSelectTime = (timeString: string, booking: Booking | null) => {
        if (booking) {
            setSelectedBooking(booking);
            setSelectedTime(null);
        } else {
            setSelectedTime(timeString);
            setSelectedBooking(null);
        }
    };

    /// this function responsible for handel a change in the room that was selected
    const handleRoomChange = () => {
        fetchRooms().then((roomsData) => {
            setRooms(roomsData);
            // Clear selected room and schedule if the selected room is deleted
            if (selectedRoom && !roomsData.some((room: Room) => room.id === selectedRoom.id)) {
                setSelectedRoom(null);
                setSchedule([]);
            }
        });
    };

    /// this is the main div for all components
    return (
        <div className="main-container">
            {/* the left container holds the booking form and room management components */}
            <div className="left-container">
                <BookingForm onBookingSuccess={() => {
                    if (selectedRoom) {
                        fetchSchedule(selectedRoom.id).then(schedule => {
                            setSchedule(Array.isArray(schedule) ? schedule : []);
                        });
                    }
                }} />
                <RoomManagement onRoomChange={handleRoomChange} />
            </div>
            {/* this dic holds the calendar and schedule containers including the RoomList component*/}
            <div className="calendar-and-schedule">
                <div className="calendar-container">
                    <Calendar onChange={handleDateChange} value={date} locale="en-US" />
                    {error && <div className="error">{error}</div>}
                    <RoomList rooms={rooms} selectedRoom={selectedRoom} onRoomClick={handleRoomClick} />
                </div>
                {selectedRoom && (
                    <div>
                        <h3>Available hours for {selectedRoom.name}</h3>
                        <TimeIntervals
                            schedule={schedule}
                            date={date instanceof Date ? date : new Date()}
                            selectedTime={selectedTime}
                            selectedBooking={selectedBooking}
                            onSelectTime={handleSelectTime}
                        />
                    </div>
                )}
            </div>
            {/* here are the buttons to book and cancel */}
            <button className="button" onClick={handleBookClick} disabled={!selectedTime}>
                Book Room
            </button>
            <button className="button cancel" onClick={handleCancelClick} disabled={!selectedBooking}>
                Cancel Booking
            </button>
            {/* here is the feedback component for display the msg to the user */}
            <FeedbackPopup message={feedback} onClose={() => setFeedback(null)} />
        </div>
    );
};

export default CalendarView;
