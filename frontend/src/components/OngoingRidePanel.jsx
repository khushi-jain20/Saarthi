// Filename: frontend/src/components/OngoingRidePanel.jsx

import React from 'react';

const OngoingRidePanel = ({ ride, onStartRide }) => {
  // Safely get user's first name to display
  const userName = ride?.user?.fullname?.firstname || 'the user';

  return (
    <div className="p-4 h-full flex flex-col justify-between">
      <div>
        <div className="text-center mb-4">
            <h2 className="text-xl font-bold">Ride Accepted</h2>
            <p className="text-gray-600">Proceed to pickup location.</p>
        </div>
        
        <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-sm font-medium">PICKUP</p>
            <p className="text-lg font-semibold">{ride.pickupLocation.address}</p>
        </div>
        
        <div className="mt-3 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm font-medium">PASSENGER</p>
            <p className="text-lg font-semibold">{userName}</p>
        </div>
      </div>
      
      {/* Action Button */}
      <div className="mt-4">
        <button 
          onClick={onStartRide}
          className="w-full p-4 bg-green-500 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-green-600 transition-colors"
        >
          Start Ride (OTP: {ride.otp})
        </button>
      </div>
    </div>
  );
};

export default OngoingRidePanel;