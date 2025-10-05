// Filename: src/pages/CaptainRiding.jsx (The Final Branded Version)

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CaptainRiding = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const ride = location.state?.ride;


    useEffect(() => {
        if (!socket || !currentRide) return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                socket.emit('captain:location', {
                    rideId: currentRide._id,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            },
            (err) => console.error("Geolocation Error:", err),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [socket, currentRide]);

    if (!ride) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p>No active ride data found.</p>
                <button onClick={() => navigate('/captain/dashboard')} className="mt-4 bg-black text-white p-2 rounded-lg">
                    Go to Dashboard
                </button>
            </div>
        );
    }

    const userName = ride.user?.name || `${ride.user?.fullname?.firstname || ''}`.trim() || 'Passenger';

    const handleEndRide = async () => {
        console.log("[DEMO MODE] Captain clicked End Ride.");
        navigate('/captain/dashboard');
    };

    return (
        <div className='h-screen bg-gray-200'>
            {/* Top Map Section */}
            <div className='h-3/5 relative'>
                <img className='h-full w-full object-cover' src="/jaipur-map.png" alt="Jaipur Map" />
                
                {/* --- THE FINAL FIX IS HERE --- */}
                {/* Replaced the Uber logo with your new "Saarthi" brand name */}
                <div className='absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg'>
                    <h1 className="text-3xl font-bold text-black">Saarthi</h1>
                </div>
            </div>

            {/* Bottom Info Panel */}
            <div className='h-2/5 bg-white rounded-t-2xl -mt-4 relative p-6 flex flex-col justify-between shadow-lg'>
                <div>
                    <div className="flex items-center justify-between pb-4 border-b">
                        <div>
                            <p className="text-sm text-gray-500">Dropping off</p>
                            <h2 className="text-2xl font-bold">{userName}</h2>
                        </div>
                        <img className='h-16 w-16 rounded-full object-cover' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="User" />
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4">
                        <i className="ri-map-pin-2-fill text-2xl text-red-500"></i>
                        <div>
                            <p className="text-sm text-gray-500">Destination</p>
                            <p className="text-lg font-semibold">{ride.destination}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleEndRide}
                    className='w-full bg-red-600 text-white font-bold py-4 rounded-lg text-lg hover:bg-red-700 transition-colors'
                >
                    Complete Ride
                </button>
            </div>
        </div>
    );
};

export default CaptainRiding;