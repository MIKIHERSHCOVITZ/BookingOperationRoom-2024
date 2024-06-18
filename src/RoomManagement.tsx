import React, { useState, useEffect } from 'react';
import './RoomManagement.css';
import { fetchRooms, addRoom, deleteRoom } from './api';
import { RoomManagementProps } from './interfaces';


/// this component responsible for managing the room process including add and delete
const RoomManagement: React.FC<RoomManagementProps> = ({ onRoomChange }) => {
    const [name, setName] = useState('');
    const [rooms, setRooms] = useState<any[]>([]);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);

    /// here we take the list of rooms when the component starts
    useEffect(() => {
        const fetchRoomsData = async () => {
            try {
                const roomsData = await fetchRooms();
                setRooms(roomsData);
            } catch (err: unknown) {
                console.error("Failed to fetch rooms:", err);
                err instanceof Error ? setFeedback(err.message) : setFeedback('Unknown error occurred');
                setFeedbackType('error');
            }
        };
        fetchRoomsData();
    }, []);


    /// function to handle adding a room including feedback and update of existing rooms
    const handleAddRoom = async () => {
        try {
            const data = await addRoom(name);
            setFeedback(data.message || 'Room added successfully');
            setFeedbackType('success');
            setRooms([...rooms, { id: data.id, name }]);
            onRoomChange();
        } catch (err: unknown) {
            console.error("Failed to add room:", err);
            err instanceof Error ? setFeedback(err.message) : setFeedback('Unknown error occurred');
            setFeedbackType('error');
        } finally {
            setTimeout(() => {
                setFeedback(null);
                setFeedbackType(null);
            }, 3000);
        }
    };

    /// function to handle deleting a room including feedback and update of existing rooms
    const handleDeleteRoom = async (roomId: number, roomName: string) => {
        try {
            const data = await deleteRoom(roomId);
            setFeedback(`Room with name ${roomName} deleted successfully.`);
            setFeedbackType('success');
            setRooms(rooms.filter(room => room.id !== roomId));
            onRoomChange();  // Call the callback to update rooms in CalendarView
        } catch (err: unknown) {
            console.error("Failed to delete room:", err);
            err instanceof Error ? setFeedback(err.message) : setFeedback('Unknown error occurred');
            setFeedbackType('error');
        } finally {
            setTimeout(() => {
                setFeedback(null);
                setFeedbackType(null);
            }, 3000);
        }
    };

    /// main div of the component that includes the buttons and the feedback for those actions
    return (
        <div className="room-management">
            <h3>Room Management</h3>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Room name"
            />
            <button onClick={handleAddRoom}>Add Room</button>
            <ul>
                {rooms.map(room => (
                    <li key={room.id}>
                        {room.name}
                        <button onClick={() => handleDeleteRoom(room.id, room.name)}>Delete</button>
                    </li>
                ))}
            </ul>
            {feedback && <div className={`feedback ${feedbackType}`}>{feedback}</div>}
        </div>
    );
};

export default RoomManagement;
