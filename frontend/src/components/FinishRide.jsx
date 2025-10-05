import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const FinishRide = (props) => {
    const navigate = useNavigate();

    // This safely gets the user's name from either data structure
    const userName = props.ride?.user?.name || 
                   `${props.ride?.user?.fullname?.firstname || ''}`.trim() || 
                   'your passenger';

    // This safely gets the correct fare for the selected vehicle
    const displayFare = props.ride?.fare?.[props.ride?.vehicleType] || 'N/A';


    async function endRide() {
        try {
            console.log("[DEMO MODE] Captain clicked End Ride.");
            // In demo mode, we can just navigate back to the dashboard.
            navigate('/captain/dashboard');
        } catch (error) {
            console.error("Failed to end ride:", error);
            alert("Could not end ride.");
        }
    }

    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                if(props.setFinishRidePanel) props.setFinishRidePanel(false); 
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-semibold mb-5'>Finish this Ride</h3>
            <div className='flex items-center justify-between p-4 border-2 border-yellow-400 rounded-lg mt-4'>
                <div className='flex items-center gap-3 '>
                    <img className='h-12 rounded-full object-cover w-12' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="User" />
                    <h2 className='text-lg font-medium'>{userName}</h2>
                </div>
                <h5 className='text-lg font-semibold'>~2-3 KM</h5>
            </div>
            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Pickup</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.pickup}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Destination</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.destination}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{displayFare}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash</p>
                        </div>
                    </div>
                </div>
                <div className='mt-10 w-full'>
                    <button
                        onClick={endRide}
                        className='w-full mt-5 flex text-lg justify-center bg-red-600 text-white font-semibold p-3 rounded-lg'>End Ride</button>
                </div>
            </div>
        </div>
    );
};

// This is now the only, correct export statement
export default FinishRide;