import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // For making API calls

const RateRide = () => {
    const [rating, setRating] = useState(0);
    const { rideId } = useParams(); // <-- Get rideId from URL, e.g., "/rate-ride/12345"
    const navigate = useNavigate();
    
    const handleSubmit = async () => {
        if (rating === 0) return;
        try {
            // This is the API call to your backend to save the rating.
            // You will need to create this route and controller in your backend.
            await axios.post(`/api/rides/rate`, { rideId, rating });
            
            console.log(`Submitted rating of ${rating} stars for ride ${rideId}.`);
            navigate('/home'); // Go back to the user's home screen after rating
        } catch (error) {
            console.error("Failed to submit rating:", error);
            alert("Could not submit your rating. Please try again.");
        }
    };

    return (
        <div className="p-6">
            <h3 className="text-2xl font-semibold text-center mb-2">How was your trip?</h3>
            <p className="text-center text-gray-600 mb-6">Rate your experience.</p>
            
            <div className="flex justify-center items-center text-4xl text-gray-300 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i 
                        key={star}
                        className={`ri-star-fill cursor-pointer transition-colors ${rating >= star ? 'text-yellow-400' : 'hover:text-yellow-300'}`}
                        onClick={() => setRating(star)}
                    ></i>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="w-full bg-black text-white font-semibold p-3 rounded-lg disabled:bg-gray-300"
            >
                Submit Rating
            </button>
        </div>
    );
};

export default RateRide;