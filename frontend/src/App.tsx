import React from 'react';
import CalendarView from './CalendarView';

/// main App component - title for the app and calls the CalenderView component
const App = () => {
    return (
        <div>
            <h1>Operation Room Booking System</h1>
            <CalendarView />
        </div>
    );
};

export default App;
