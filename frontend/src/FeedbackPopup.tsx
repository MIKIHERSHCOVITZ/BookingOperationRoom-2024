import React from 'react';
import './FeedbackPopup.css';
import { FeedbackPopupProps } from './interfaces';

/// the component is responsible for the popup messages to the user
const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ message, onClose }) => {

    /// if there is no message, don't do anything
    if (!message) return null;

    /// if there is a message return div
    return (
        <div className="feedback-popup">
            <div className="feedback-popup-content">
                {/* show msg to the user */}
                <span className="feedback-popup-message">{message}</span>
                {/* button to close popup */}
                <button className="feedback-popup-close" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default FeedbackPopup;
