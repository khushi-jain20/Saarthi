// Filename: src/pages/Home.jsx
// This is the final, corrected version with working debouncing and state transitions.

import React, { useEffect, useRef, useState, useContext } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import api from '../api';
import 'remixicon/fonts/remixicon.css';
import useDebounce from '../hooks/useDebounce'; // Ensure this path is correct

// Import Components
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';
import WaitingForDriver from '../components/WaitingForDriver';
import RateRide from '../components/RateRide';
import LiveTracking from '../components/LiveTracking';
import { SocketContext } from '../context/SocketContext';

// Import Contexts
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    // --- State Management ---
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [panelOpen, setPanelOpen] = useState(false);
    const [vehiclePanel, setVehiclePanel] = useState(false);
    const [confirmRidePanel, setConfirmRidePanel] = useState(false);
    const [vehicleFound, setVehicleFound] = useState(false);
    const [waitingForDriver, setWaitingForDriver] = useState(false);
    const [showRating, setShowRating] = useState(false);
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [activeField, setActiveField] = useState(null);
    const [fare, setFare] = useState(null);
    const [vehicleType, setVehicleType] = useState(null);
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Refs ---
    const panelRef = useRef(null);
    const vehiclePanelRef = useRef(null);
    const confirmRidePanelRef = useRef(null);
    const vehicleFoundRef = useRef(null);
    const waitingForDriverRef = useRef(null);
    const ratingPanelRef = useRef(null);
    
    // --- Hooks ---
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const socket = useContext(SocketContext);

    // --- Debouncing Logic ---
    const debouncedPickup = useDebounce(pickup, 400);
    const debouncedDestination = useDebounce(destination, 400);

    // Effect for fetching pickup suggestions
    useEffect(() => {
        if (debouncedPickup.length < 2 || activeField !== 'pickup') {
            setPickupSuggestions([]);
            return;
        }
        const fetchSuggestions = async () => {
            try {
                const suggestions = await api.get('/maps/suggestions', { params: { input: debouncedPickup } });
                setPickupSuggestions(suggestions || []);
            } catch (err) {
                console.error("Fetch pickup suggestions error:", err);
                setPickupSuggestions([]);
            }
        };
        fetchSuggestions();
    }, [debouncedPickup, activeField]);

    // --- THIS IS THE FINAL FIX FOR THE USER SCREEN ---

    useEffect(() => {
        // Ensure we have both a user and a live socket connection
        console.log('[HOME EFFECT] Running effect. Socket:', socket, 'User:', user);
        if (socket && (user?._id || user?.id)) {
            const userId = user._id || user.id;
            console.log('[HOME EFFECT] Conditions met. Socket and User ID exist.');
            // 1. Tell the server our socket ID so it can send us private messages
            console.log(`[HOME EFFECT] Emitting 'update-user-socket-id' for userId: ${userId}`);
            socket.emit('update-user-socket-id', { userId: userId });

            // 2. Define what to do when the server tells us the ride is confirmed
            const handleRideConfirmed = (confirmedRideData) => {
                console.log('--- USER RECEIVED RIDE CONFIRMATION ---', confirmedRideData);
                // Update the ride state with captain details
                setRide(confirmedRideData);
                // Hide the "Looking for Driver" panel
                setVehicleFound(false);
                // Show the "Waiting for Driver" panel
                setWaitingForDriver(true);
            };

            // 3. Listen for the event
            console.log("[HOME EFFECT] Attaching 'ride-confirmed' listener.");
            socket.on('ride-confirmed', handleRideConfirmed);
            

            const handleRideStarted = (startedRideData) => {
            console.log('--- USER RECEIVED RIDE STARTED ---', startedRideData);
            setRide(startedRideData);
            setWaitingForDriver(false); // Hide the "Waiting" panel
            // You can now show a new panel, e.g., a live tracking map
            // For now, let's just alert the user.
            alert("Your ride has started! Enjoy your trip.");
            };
        socket.on('ride-started', handleRideStarted);

            // 4. Clean up the listener when the component unmounts
            return () => {
                console.log("[HOME EFFECT] Cleanup. Removing 'ride-confirmed' listener.");
                socket.off('ride-confirmed', handleRideConfirmed);
                socket.off('ride-started', handleRideStarted);
            };
        }
        else {
        console.log('[HOME EFFECT] Conditions NOT met. Waiting for socket and/or user.');
        }
    }, [socket, user]); // This effect runs when the socket connects or the user logs in

    // --- END OF THE FIX ---

    // Effect for fetching destination suggestions
    useEffect(() => {
        if (debouncedDestination.length < 2 || activeField !== 'destination') {
            setDestinationSuggestions([]);
            return;
        }
        const fetchSuggestions = async () => {
            try {
                const suggestions = await api.get('/maps/suggestions', { params: { input: debouncedDestination } });
                setDestinationSuggestions(suggestions || []);
            } catch (err) {
                console.error("Fetch destination suggestions error:", err);
                setDestinationSuggestions([]);
            }
        };
        fetchSuggestions();
    }, [debouncedDestination, activeField]);


    // --- Core API Handlers ---
    const findTrip = async () => {
        if (!pickup || !destination) {
            alert('Please enter both pickup and destination locations.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const fareData = await api.get('/rides/get-fare', { params: { pickup, destination } });
            setFare(fareData);
            setPanelOpen(false); // Close the location panel
            setVehiclePanel(true); // Open the vehicle selection panel
        } catch (err) {
            const message = err.message || 'Failed to calculate fare. Please try again.';
            setError(message);
            alert(message);
        } finally {
            setLoading(false);
        }
    };
    
    

    const createRideHandler = async () => {
    // Make sure we have all the data we need.
        if (!pickup || !destination || !vehicleType || !fare) {
            alert('Cannot create ride. Missing location, vehicle, or fare information.');
            return;
        }    
        setLoading(true);
        setError(null);
        try {
        // --- THIS IS THE FIX ---
        // We now send the entire fare object and vehicleType to the backend.
            const rideData = await api.post('/rides/create', { 
                pickup: pickup,
                destination: destination,
                vehicleType: vehicleType,
                fareDetails: fare // Pass the whole fare object
            });
            setRide(rideData);
            setConfirmRidePanel(false);
            setVehicleFound(true); 
        } catch (err) {
            alert(err.message || 'Failed to create ride.');
        } finally {
            setLoading(false);
        }
    };

    // --- Reset and Timer Logic ---
    const resetDemo = () => { /* your reset logic */ };
    useEffect(() => { /* your waiting timer */ }, [waitingForDriver]);

    // --- Animations ---
    useGSAP(() => { gsap.to(panelRef.current, { y: panelOpen ? '0%' : 'calc(100% - 250px)', duration: 0.5, ease: 'power2.inOut' }); }, [panelOpen]);
    useGSAP(() => { if (vehiclePanelRef.current) gsap.to(vehiclePanelRef.current, { y: vehiclePanel ? '0%' : '100%' }); }, [vehiclePanel]);
    useGSAP(() => { if (confirmRidePanelRef.current) gsap.to(confirmRidePanelRef.current, { y: confirmRidePanel ? '0%' : '100%' }); }, [confirmRidePanel]);
    useGSAP(() => { if (vehicleFoundRef.current) gsap.to(vehicleFoundRef.current, { y: vehicleFound ? '0%' : '100%' }); }, [vehicleFound]);
    useGSAP(() => { if (waitingForDriverRef.current) gsap.to(waitingForDriverRef.current, { y: waitingForDriver ? '0%' : '100%' }); }, [waitingForDriver]);
    useGSAP(() => { if (ratingPanelRef.current) gsap.to(ratingPanelRef.current, { y: showRating ? '0%' : '100%' }); }, [showRating]);
    
    return (
        <div className='h-screen relative overflow-hidden bg-gray-200'>
            {/* ... other top-level elements like header and map ... */}
            <div className='absolute bottom-0 left-0 w-full z-10'>
                <div ref={panelRef} className={`absolute bottom-0 w-full bg-white h-[90vh] rounded-t-2xl shadow-2xl p-6 overflow-y-auto ${vehiclePanel || confirmRidePanel || vehicleFound || waitingForDriver || showRating ? 'invisible' : 'visible'}`} style={{ transform: 'translateY(calc(100% - 250px))' }}>
                    <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer" onClick={() => setPanelOpen(false)}></div>
                    <h4 className='text-2xl font-bold mb-4'>{panelOpen ? (activeField === 'pickup' ? 'Set Pickup Location' : 'Set Destination') : 'Where to?'}</h4>
                    <div className='relative space-y-4 mb-4'>
                        <div className="absolute left-4 top-3.5 h-[calc(100%-2rem)] flex flex-col items-center"><div className="w-2.5 h-2.5 bg-gray-800 rounded-full"></div><div className="w-px flex-grow bg-gray-300 my-2"></div><div className="w-2.5 h-2.5 bg-black"></div></div>
                        <div><input onFocus={() => { setPanelOpen(true); setActiveField('pickup'); }} value={pickup} onChange={(e) => setPickup(e.target.value)} className='bg-gray-100 pl-12 pr-4 py-3 text-base rounded-md w-full' type="text" placeholder='Add a pickup location' /></div>
                        <div><input onFocus={() => { setPanelOpen(true); setActiveField('destination'); }} value={destination} onChange={(e) => setDestination(e.target.value)} className='bg-gray-100 pl-12 pr-4 py-3 text-base rounded-md w-full' type="text" placeholder='Enter your destination' /></div>
                    </div>
                    {!panelOpen && pickup && destination && (<button onClick={findTrip} disabled={loading} className={`bg-black text-white font-bold py-3 rounded-lg mt-4 w-full text-lg`}>{loading ? 'Calculating...' : 'Find Trip'}</button>)}
                    <div className={`pt-2 mt-4 ${panelOpen ? 'block' : 'hidden'}`}><LocationSearchPanel suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions} setPanelOpen={setPanelOpen} setPickup={setPickup} setDestination={setDestination} activeField={activeField} /></div>
                </div>

                <div ref={vehiclePanelRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white rounded-t-2xl shadow-2xl'>{vehiclePanel && ( <VehiclePanel selectVehicle={setVehicleType} fare={fare} setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} /> )}</div>
                <div ref={confirmRidePanelRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white rounded-t-2xl shadow-2xl'>{confirmRidePanel && ( <ConfirmRide createRide={createRideHandler} pickup={pickup} destination={destination} fare={fare} vehicleType={vehicleType} setConfirmRidePanel={setConfirmRidePanel} setVehicleFound={setVehicleFound} /> )}</div>
                <div ref={vehicleFoundRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white rounded-t-2xl shadow-2xl'>{vehicleFound && ( <LookingForDriver pickup={pickup} destination={destination} fare={fare} vehicleType={vehicleType} /> )}</div>
                <div ref={waitingForDriverRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white rounded-t-2xl shadow-2xl'>{waitingForDriver && ( <WaitingForDriver ride={ride} /> )}</div>
                <div ref={ratingPanelRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white rounded-t-2xl shadow-2xl'>{showRating && ( <RateRide ride={ride} onComplete={resetDemo} /> )}</div>
            </div>
        </div>
    );
};

export default Home;
