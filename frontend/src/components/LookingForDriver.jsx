import React from 'react';

const LookingForDriver = ({ fare, vehicleType, pickup, destination }) => {

    // --- THIS IS THE FIX ---
    // Access the fare for the selected vehicleType directly from the 'fare' object.
    const displayFare = fare && vehicleType && fare[vehicleType] ? fare[vehicleType] : 'N/A';

    // Simplified vehicle image logic
    const vehicleImages = {
        go: "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg",
        moto: "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png",
        auto: "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png"
    };
    const vehicleImage = vehicleImages[vehicleType] || vehicleImages.go;

    return (
        <div className="p-6">
            <h3 className='text-2xl font-semibold mb-5 text-center'>Looking for a Driver...</h3>

            <div className='flex flex-col items-center gap-2'>
                <img className='h-20 animate-pulse' src={vehicleImage} alt={vehicleType || "Selected Vehicle"} />
                
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-user-fill"></i>
                        <h3 className='text-base font-medium'>{pickup || "Pickup Location"}</h3>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <h3 className='text-base font-medium'>{destination || "Destination"}</h3>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="text-lg ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{displayFare}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LookingForDriver;