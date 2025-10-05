import React from 'react';

// This component now receives all the data it needs as props.
const CaptainDetails = ({ captain, stats }) => {

    // Safely get the captain's name, providing a fallback.
    const captainName = `${captain?.fullname?.firstname || ''} ${captain?.fullname?.lastname || ''}`.trim() || 'Captain';

    return (
        <div>
            {/* Top section with name and profile picture */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-2xl font-bold'>{captainName}</h2>
                    <p className='text-sm text-green-600 font-semibold'>You are Online</p>
                </div>
                <img className='h-16 w-16 rounded-full object-cover shadow-md' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdlMd7stpWUCmjpfRjUsQ72xSWikidbgaI1w&s" alt="Captain Profile" />
            </div>

            {/* Stats section with the new, meaningful data */}
            <div className='flex p-4 mt-6 bg-gray-50 rounded-xl justify-around items-center'>
                
                {/* Today's Trips Stat */}
                <div className='text-center'>
                    <p className='text-2xl font-bold text-gray-800'>{stats?.trips || 0}</p>
                    <p className='text-xs text-gray-500 font-medium'>Today's Trips</p>
                </div>
                
                {/* A vertical divider for better visual separation */}
                <div className="w-px h-10 bg-gray-200"></div>

                {/* Hours Online Stat */}
                <div className='text-center'>
                    <p className='text-2xl font-bold text-gray-800'>{stats?.hours || 0}</p>
                    <p className='text-xs text-gray-500 font-medium'>Hours Online</p>
                </div>

                <div className="w-px h-10 bg-gray-200"></div>

                {/* Total Earned Stat */}
                <div className='text-center'>
                    <p className='text-2xl font-bold text-gray-800'>₹{stats?.earnings?.toFixed(2) || '0.00'}</p>
                    <p className='text-xs text-gray-500 font-medium'>Total Earned</p>
                </div>
            </div>
        </div>
    );
};

export default CaptainDetails;