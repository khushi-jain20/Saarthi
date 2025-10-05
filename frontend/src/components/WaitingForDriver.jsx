// Filename: frontend/src/components/WaitingForDriver.jsx
// This is the final, fully functional version with correct data binding.

import React from 'react';

const WaitingForDriver = ({ ride }) => {
  // --- Safely get all the data at the top ---
  // This is cleaner and prevents errors if any data is missing.
  const captainName = `${ride?.captain?.fullname?.firstname || ''} ${ride?.captain?.fullname?.lastname || ''}`.trim() || 'Your Captain';
  const captainVehiclePlate = ride?.captain?.vehicle?.plate || 'N/A';
  const otp = ride?.otp || '...';
  const pickupAddress = ride?.pickupLocation?.address || 'Loading...';
  const destinationAddress = ride?.destinationLocation?.address || 'Loading...';
  const finalFare = ride?.finalFare || 'N/A';

  return (
    <div className="p-6">
        <h1 className="text-center text-2xl font-bold text-green-600 p-4 bg-green-100 rounded-lg">
             SUCCESS! WAITING FOR DRIVER!
        </h1>
        <div className='flex items-center justify-between mb-4'>
            <img 
                className='h-12 w-12 rounded-full object-cover border-2 border-gray-300' 
                src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" 
                alt="Captain" 
            />
            <div className='text-right'>
                <h2 className='text-lg font-medium capitalize'>{captainName}</h2>
                <h4 className='text-xl font-semibold -mt-1 -mb-1 font-mono'>{captainVehiclePlate}</h4>
                <p className='text-sm text-gray-600'>is arriving</p>
            </div>
        </div>

        <div className='text-center my-4 py-2 bg-blue-100 rounded-lg'>
            <p className='text-sm text-blue-700'>Your One-Time Password (OTP) is</p>
            <h1 className='text-4xl font-bold tracking-widest text-blue-900'>{otp}</h1>
        </div>

        <div className='w-full mt-2'>
            <div className='flex items-center gap-5 p-3 border-b-2'>
                <i className="ri-map-pin-user-fill text-xl text-green-600"></i>
                <div>
                    {/* --- FIX: Use the correct data path --- */}
                    <h3 className='text-base font-medium'>{pickupAddress}</h3>
                    <p className='text-sm -mt-1 text-gray-600'>Pickup Location</p>
                </div>
            </div>
            <div className='flex items-center gap-5 p-3 border-b-2'>
                <i className="text-lg ri-map-pin-2-fill text-xl text-red-600"></i>
                <div>
                    {/* --- FIX: Use the correct data path --- */}
                    <h3 className='text-base font-medium'>{destinationAddress}</h3>
                    <p className='text-sm -mt-1 text-gray-600'>Destination</p>
                </div>
            </div>
            <div className='flex items-center gap-5 p-3'>
                <i className="ri-currency-line text-xl"></i>
                <div>
                    {/* --- FIX: Use the correct data path --- */}
                    <h3 className='text-lg font-medium'>₹{finalFare}</h3>
                    <p className='text-sm -mt-1 text-gray-600'>Cash</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default WaitingForDriver;