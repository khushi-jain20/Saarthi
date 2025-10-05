import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Use the shared api instance

const ConfirmRidePopUp = (props) => {
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();

    // --- This safely gets the user's name from either data structure ---
    const userName = props.ride?.user?.name || 
                   `${props.ride?.user?.fullname?.firstname || ''}`.trim() || 
                   'your passenger';

    // --- This safely gets the correct fare for the selected vehicle ---
    const displayFare = props.ride?.fare?.[props.ride?.vehicleType] || 'N/A';

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            // In demo mode, we can fake this part too, or just navigate
            console.log("[DEMO MODE] Captain submitted OTP. Navigating to riding screen.");
            
            // For a real app, you would call the API:
            // await api.get('/rides/start-ride', { params: { rideId: props.ride._id, otp: otp } });
            
            props.setConfirmRidePopupPanel(false);
            navigate('/captain-riding', { state: { ride: props.ride } });

        } catch (error) {
            console.error("Failed to start ride:", error);
            alert("Failed to start ride. Please check the OTP and try again.");
        }
    };

    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setConfirmRidePopupPanel(false); // Allow closing this panel
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-semibold mb-5'>Confirm this ride to Start</h3>
            <div className='flex items-center justify-between p-3 border-2 border-yellow-400 rounded-lg mt-4'>
                <div className='flex items-center gap-3 '>
                    <img className='h-12 rounded-full object-cover w-12' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="" />
                    {/* Use the safe userName variable here */}
                    <h2 className='text-lg font-medium capitalize'>{userName}</h2>
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
                            {/* Use the safe displayFare variable here */}
                            <h3 className='text-lg font-medium'>₹{displayFare}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash</p>
                        </div>
                    </div>
                </div>
                <div className='mt-6 w-full'>
                    <form onSubmit={submitHandler}>
                        <input 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            type="text" 
                            className='bg-[#eee] px-6 py-4 font-mono text-lg rounded-lg w-full mt-3' 
                            placeholder='Enter OTP' 
                            required 
                        />
                        <button type="submit" className='w-full mt-5 text-lg flex justify-center bg-green-600 text-white font-semibold p-3 rounded-lg'>Confirm & Start Ride</button>
                        <button type="button" onClick={() => {
                            props.setConfirmRidePopupPanel(false);
                        }} className='w-full mt-2 bg-red-600 text-lg text-white font-semibold p-3 rounded-lg'>Cancel</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConfirmRidePopUp;