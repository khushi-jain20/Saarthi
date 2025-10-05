import React from 'react';

const LocationSearchPanel = ({ suggestions, setPickup, setDestination, activeField, setPanelOpen }) => {

    // --- THIS IS THE FIX ---
    const handleSuggestionClick = (suggestionText) => {
        // The suggestion text is often very long, like "Raja Park, ... , India"
        // We will take the first 3 parts to create a cleaner address.
        const cleanAddress = suggestionText.split(',').slice(0, 3).join(', ');

        if (activeField === 'pickup') {
            setPickup(cleanAddress);
        } else if (activeField === 'destination') {
            setDestination(cleanAddress);
        }
        // Close the panel after a selection is made
        setPanelOpen(false);
    };

    return (
        <div className="h-full px-4 pt-4"> 
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setPanelOpen(false)} className="text-2xl">
                    <i className="ri-arrow-left-line"></i>
                </button>
                <h3 className="text-xl font-semibold">
                    {activeField === 'pickup' ? 'Set Pickup Location' : 'Set Destination'}
                </h3>
            </div>
            
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>

            {Array.isArray(suggestions) && suggestions.map((suggestionObject, idx) => (
                <div 
                    key={suggestionObject.description + idx} 
                    // This now calls the corrected handler
                    onClick={() => handleSuggestionClick(suggestionObject.description)} 
                    className='flex gap-4 items-center py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50'
                >
                    <div className='bg-gray-200 h-10 w-10 flex items-center justify-center rounded-full'>
                        <i className="ri-map-pin-line text-xl text-gray-600"></i>
                    </div>
                    <h4 className='font-medium text-base'>{suggestionObject.description}</h4>
                </div>
            ))}

            {(!suggestions || suggestions.length === 0) && (
                <div className="text-center text-gray-500 pt-10">
                    <p>Start typing to see address suggestions.</p>
                </div>
            )}
        </div>
    );
};

export default LocationSearchPanel;