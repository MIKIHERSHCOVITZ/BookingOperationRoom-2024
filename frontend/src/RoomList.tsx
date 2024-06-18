import React from 'react';
import './RoomList.css';
import { RoomListProps } from './interfaces';


/// the component takes care of the room list
const RoomList: React.FC<RoomListProps> = ({ rooms, selectedRoom, onRoomClick }) => {
    return (
        <div className="rooms-container">
            {/* create div to each room */}
            {rooms.map((room) => (
                <div
                    key={room.id}
                    className={`room ${room.id === selectedRoom?.id ? 'selected' : ''}`}
                    /// call onRoomClick when room is chosen
                    onClick={() => onRoomClick(room)}
                >
                    {room.name}
                </div>
            ))}
        </div>
    );
};

export default RoomList;
