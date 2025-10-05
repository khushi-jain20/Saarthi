import OngoingRidePanel from '../components/OngoingRidePanel';
import MapComponent from '../components/MapComponent';
import React, { useRef, useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CaptainContext } from '../context/CaptainContext';
import { SocketContext } from '../context/SocketContext';
import api from '../api';
import LiveRidePanel from '../components/LiveRidePanel';

// Import necessary components
import CaptainDetails from '../components/CaptainDetails';
import RidePopUp from '../components/RidePopUp'; // This is the component that should appear

const CaptainHome = () => {
    // State
    const [isOnline, setIsOnline] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rideRequest, setRideRequest] = useState(null);
    const [isRidePopupVisible, setIsRidePopupVisible] = useState(false);
    const [acceptedRide, setAcceptedRide] = useState(null);
    const [isRideInProgress, setIsRideInProgress] = useState(false);

    // Refs
    const ridePopupPanelRef = useRef(null);
    const { captain } = useContext(CaptainContext);
    const socket = useContext(SocketContext);

    // Effect for WebSocket logic
    
    useEffect(() => {
    // This effect runs whenever the 'socket' object changes.
        if (socket && captain?._id) {
            // --- THIS IS THE FINAL FIX ---
            // The moment we have a live socket, tell the server to save its ID.
            console.log(`[FRONTEND] Socket is connected. Emitting update-socket-id with userId: ${captain._id}`);
            
            const handleNewRide = (data) => {
                console.log('--- CAPTAIN RECEIVED NEW RIDE REQUEST ---', data);
                setRideRequest(data);
                setIsRidePopupVisible(true);
            };
            socket.on('new-ride', handleNewRide);

            socket.emit('update-socket-id', { userId: captain._id });

            return () => {
                socket.off('new-ride', handleNewRide);
            };
        }
    }, [socket, captain]); // Only depends on socket and captain

    // Effect for real-time location updates
    useEffect(() => {
        if (!isOnline && socket && captain?._id) return;

        let locationWatcher = navigator.geolocation.watchPosition(
            (position) => {
                socket.emit('update-location', {
                    userId: captain._id,
                    location: { lat: position.coords.latitude, lng: position.coords.longitude },
                });
            },
            (error) => console.error("Geolocation Error:", error),
            { enableHighAccuracy: true }
        );

        return () => {
            if (locationWatcher) navigator.geolocation.clearWatch(locationWatcher);
        };
    }, [isOnline, socket, captain]);

    // Handler for toggling online status
   // In frontend/src/pages/CaptainHome.jsx

    const toggleOnlineStatus = async () => {
        if (isLoading) return;
        setIsLoading(true);

         try {
            const newStatus = !isOnline;
            await api.patch('/captains/status', { isAvailable: newStatus });
            setIsOnline(newStatus);
            
            // --- THIS IS THE FIX ---
            // If the captain is going ONLINE, get their current position immediately
            // and send it to the backend to ensure their location is not [0, 0].
            if (newStatus && socket) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        console.log("Got initial position, sending to server...");
                        socket.emit('update-location', {
                            userId: captain._id,
                            location: {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            }
                        });
                    },
                    (error) => {
                        console.error("Could not get initial location:", error);
                        alert("Could not get your location. Please enable location services to go online.");
                        // If we can't get location, force them back offline.
                        setIsOnline(false); 
                    }
                );
            }
            // --- END OF FIX ---

            console.log(`Captain status updated successfully on the frontend.`);

        } catch (error) {
            console.error('Error toggling online status:', error);
            alert('Could not update your status. Please try again.');
            // Revert state if the API call fails
            setIsOnline(isOnline);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for when the captain confirms the ride from the popup
    const handleConfirmRide = async () => {
        if (!rideRequest?._id) return;
        try {
            const confirmedRide = await api.post('/rides/confirm', { rideId: rideRequest._id });
            setAcceptedRide(confirmedRide);
            setIsRidePopupVisible(false); // Hide popup
            // Here you would navigate to an "ongoing ride" screen
        } catch (error) {
            alert(error.message || "Failed to confirm ride.");
        }
    };


    
    

    const handleStartRide = async (rideId) => {
        // 1. Ask the captain to enter the OTP
        const enteredOtp = window.prompt("Please ask the user for the 6-digit OTP and enter it below:");

        // 2. Check if the captain entered anything
        if (!enteredOtp) {
            alert("OTP is required to start the ride.");
            return;
        }
         

        // 3. Send the entered OTP to the backend
        try {
           
            const startedRide = await api.get('/rides/start-ride', { params: { rideId, otp: enteredOtp } });
            // Now, let's save this new, updated ride object to our state
            setRideRequest(startedRide); // This updates our main ride object
            
            // 4. Update the UI to show the ride has started
            alert(`Ride Started! You are taking ${startedRide.user.fullname.firstname} to their destination.`);
            setIsRideInProgress(true);
            
            // Hide the "Ongoing Ride" panel and go back to the default view
            setAcceptedRide(null); 

        } catch (error) {
            alert(error.message || 'Failed to start ride. Please check the OTP and try again.');
        }
    };


    // In CaptainHome.jsx, add this with your other handler functions

        const handleEndRide = async () => {
            // We can get the ride ID from the 'rideRequest' state, as it holds the initial ride data.
            if (!rideRequest?._id) {
                alert("Cannot end ride: Ride ID is missing.");
                return;
            }

            try {
                await api.post('/rides/end-ride', { rideId: rideRequest._id });
                alert("Ride Ended Successfully!");

                // --- UI Transition ---
                // We will now use your FinishRide component. Let's add a new state for it.
                // For now, let's just reset the state.
                setIsRideInProgress(false);
                setRideRequest(null); // Clear out the old ride data
                
            } catch (error) {
                alert(error.message || 'Failed to end ride.');
            }
        };
        

    // GSAP animation for the ride popup
    useGSAP(() => {
        gsap.to(ridePopupPanelRef.current, { y: isRidePopupVisible ? '0%' : '100%' });
    }, [isRidePopupVisible]);

    const demoStats = { trips: 12, hours: 8.5, earnings: 2950.20 };


    const OngoingRidePanel = ({ ride ,onStartRide }) => (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-600">Ride Accepted!</h2>
            <p className="mt-2">You are now heading to pick up <span className="font-bold">{ride.user.fullname.firstname}</span>.</p>
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p><strong>From:</strong> {ride.pickupLocation.address}</p>
                <p><strong>To:</strong> {ride.destinationLocation.address}</p>
            </div>
            <button 
            onClick={() => onStartRide(ride._id)}
            className="w-full mt-4 p-3 bg-green-500 text-white font-bold rounded-lg shadow-lg">
                Start Ride (OTP: {ride.otp})
            </button>
        </div>
    );

    return (
        <div className='h-screen bg-gray-100'>
            {/* ... Your header and map JSX ... */}
            <div className='h-3/5 relative'>
                <MapComponent />
                {/*<img className='h-full w-full object-cover' src="/jaipur-map.png" alt="Jaipur Map" />*/}
                <button
                    onClick={toggleOnlineStatus}
                    disabled={isLoading}
                    className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg transition-colors ${isOnline ? 'bg-red-500' : 'bg-green-500'} ${isLoading ? 'opacity-50' : ''}`}
                >
                    {isLoading ? 'Updating...' : (isOnline ? 'Go Offline' : 'Go Online')}
                </button>
            </div>
            <div className='h-2/5 p-4 bg-white rounded-t-2xl -mt-4 relative shadow-lg'>
                    {isRideInProgress ? (
                        // State 3: Ride is live
                        <LiveRidePanel ride={rideRequest} onEndRide={handleEndRide => { /* We will build this next */ }} />
                    ) : acceptedRide ? (
                        // State 2: Ride has been accepted
                         <OngoingRidePanel ride={acceptedRide} onStartRide={() => 
                            handleStartRide(acceptedRide._id)} />
                    ) : (
                            // State 1: Default view
                            captain && <CaptainDetails captain={captain} stats={demoStats} />
                    )}
                    
            </div>

            {/* The RidePopUp panel that appears when a new ride comes in */}
            <div ref={ridePopupPanelRef} className='fixed w-full z-30 bottom-0 translate-y-full bg-white p-6 rounded-t-3xl shadow-2xl'>
                {rideRequest && (
                    <RidePopUp
                        ride={rideRequest}
                        onConfirm={handleConfirmRide}
                        onReject={() => setIsRidePopupVisible(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default CaptainHome;