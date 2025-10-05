// Filename: frontend/src/components/LiveRidePanel.jsx

import React from 'react';

const LiveRidePanel = ({ ride, onEndRide }) => {
  const userName = ride?.user?.fullname?.firstname || 'the user';

  return (
    <div className="p-4 h-full flex flex-col justify-between">
      <div>
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-green-600">Ride in Progress</h2>
        </div>
        
        <div className="p-3 bg-gray-100 rounded-lg">
          <p className="text-sm font-medium">DROPOFF</p>
          <p className="text-lg font-semibold">{ride.destinationLocation.address}</p>
        </div>
        
        <div className="mt-3 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm font-medium">PASSENGER</p>
          <p className="text-lg font-semibold">{userName}</p>
        </div>
      </div>
      
      {/* Action Button */}
      <div className="mt-4">
        <button 
          onClick={onEndRide}
          className="w-full p-4 bg-red-500 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-red-600 transition-colors"
        >
          End Ride
        </button>
      </div>
    </div>
  );
};

export default LiveRidePanel;