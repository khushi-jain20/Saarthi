import React from 'react';

const VehiclePanel = ({ fare, selectVehicle, setConfirmRidePanel, setVehiclePanel }) => {

    // If the fare object is not yet available, show the loading state.
    if (!fare) {
        return (
            <div className="p-6">
                <h3 className='text-2xl font-semibold mb-5'>Choose a Vehicle</h3>
                <p className="text-gray-500">Calculating fares...</p>
            </div>
        );
    }

    // --- THIS IS THE FIX ---
    // Access the fare values directly from the 'fare' prop.
    const goFare = fare.go ?? 'N/A';
    const motoFare = fare.moto ?? 'N/A';
    const autoFare = fare.auto ?? 'N/A';

    // This handler simplifies the onClick logic for each button.
    const handleVehicleSelection = (vehicleName) => {
        selectVehicle(vehicleName); // Set the vehicle type in the parent
        setConfirmRidePanel(true); // Show the next panel
        setVehiclePanel(false);    // Hide this panel
    };

    return (
        <div className="p-6">
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"
                 onClick={() => setVehiclePanel(false)}>
            </div>
            <h3 className='text-2xl font-semibold mb-5'>Choose a Vehicle</h3>

            {/* UberGo Option */}
            <div onClick={() => handleVehicleSelection('go')} className='flex items-center justify-between w-full p-3 mb-2 border-2 rounded-xl cursor-pointer hover:border-black active:border-black'>
                <img className='h-10' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="UberGo" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>UberGo <span><i className="ri-user-3-fill"></i>4</span></h4>
                    <h5 className='font-medium text-sm'>2 mins away</h5>
                    <p className='font-normal text-xs text-gray-600'>Affordable, compact rides</p>
                </div>
                <h2 className='text-lg font-semibold'>₹{goFare}</h2>
            </div>

            {/* Moto Option */}
            <div onClick={() => handleVehicleSelection('moto')} className='flex items-center justify-between w-full p-3 mb-2 border-2 rounded-xl cursor-pointer hover:border-black active:border-black'>
                <img className='h-10' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png" alt="Moto" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>Moto <span><i className="ri-user-3-fill"></i>1</span></h4>
                    <h5 className='font-medium text-sm'>3 mins away</h5>
                    <p className='font-normal text-xs text-gray-600'>Affordable motorcycle rides</p>
                </div>
                <h2 className='text-lg font-semibold'>₹{motoFare}</h2>
            </div>

            {/* Auto Option */}
            <div onClick={() => handleVehicleSelection('auto')} className='flex items-center justify-between w-full p-3 mb-2 border-2 rounded-xl cursor-pointer hover:border-black active:border-black'>
                <img className='h-10' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png" alt="Auto" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>UberAuto <span><i className="ri-user-3-fill"></i>3</span></h4>
                    <h5 className='font-medium text-sm'>3 mins away</h5>
                    <p className='font-normal text-xs text-gray-600'>Affordable Auto rides</p>
                </div>
                <h2 className='text-lg font-semibold'>₹{autoFare}</h2>
            </div>
        </div>
    );
};

export default VehiclePanel;