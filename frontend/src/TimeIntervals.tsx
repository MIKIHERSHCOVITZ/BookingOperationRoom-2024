import React from 'react';
import './TimeIntervals.css';
import { TimeIntervalsProps } from './interfaces';


/// this component manage the time intervals in the scrolling
/// as part of the ui to make it simpler and nice to see I am showing only the hours from 06:00 am to 22:00 pm in 30 minutes intervals
const TimeIntervals: React.FC<TimeIntervalsProps> = ({ schedule, date, selectedTime, selectedBooking, onSelectTime }) => {

    /// rendering the time intervals
    const renderTimeIntervals = () => {
        if (!Array.isArray(schedule)) {
            console.error("Schedule is not an array:", schedule);
            return null;
        }

        /// start and end times for the intervals - of course it can be changed
        const intervals = [];
        const start = new Date();
        start.setHours(6, 0, 0, 0);
        const end = new Date();
        end.setHours(22, 0, 0, 0);

        /// we loop over the time from  to 200 increasing 30 minutes every time
        let current = start;
        while (current <= end) {
            /// extracting the tine string in HH:MM format
            const timeString = current.toTimeString().slice(0, 5);
            /// here we try to check if there is a booking fot that time - to decide how the interval would look and to enable booking / cancelling
            const booking = schedule.find(
                (booking) => {
                    const bookingDate = new Date(booking.date);
                    /// changing booking to the same format
                    const bookingTime = booking.time.slice(0, 5);
                    return bookingDate.toDateString() === date.toDateString() && bookingTime === timeString;
                }
            );

            /// check if the slot is available
            const isAvailable = !booking;
            /// push the intervals to the array while customize the class
            intervals.push(
                <div
                    key={timeString}
                    className={`hour ${isAvailable ? 'available' : 'unavailable'} ${selectedTime === timeString ? 'selected' : ''} ${selectedBooking && selectedBooking.time.slice(0, 5) === timeString ? 'selected-booking' : ''}`}
                    onClick={() => onSelectTime(timeString, booking || null)}
                >
                    {timeString}
                </div>
            );

            /// increase time by 30 minutes
            current = new Date(current.getTime() + 30 * 60000); // Increment by 30 minutes
        }
        return intervals;
    };

    return (
        <div className="schedule-container">
            {renderTimeIntervals()}
        </div>
    );
};

export default TimeIntervals;
