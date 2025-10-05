import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { SocketContext } from '../context/SocketContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// This is a common fix for a known issue with React-Leaflet and Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// We create custom icons for clarity!
const captainIcon = new L.Icon({
    iconUrl: '/car-icon.png', // Make sure you have a car icon in your /public folder
    iconSize: [35, 35],
});

const destinationIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});


const LiveTracking = ({ rideDetails }) => {
    const socket = useContext(SocketContext);
    const [captainPosition, setCaptainPosition] = useState(null);
    const [route, setRoute] = useState([]);

    const destinationPosition = [rideDetails.destinationLocation.coordinates[1], rideDetails.destinationLocation.coordinates[0]];

    useEffect(() => {
        // Listen for the location updates we created in server.js
        if (socket) {
            socket.on('captain:locationUpdate', (location) => {
                const newPos = [location.lat, location.lng];
                setCaptainPosition(newPos);
            });
        }
        return () => socket?.off('captain:locationUpdate');
    }, [socket]);

    // This effect runs once to get the driving route
    useEffect(() => {
        const fetchRoute = async () => {
            const captainStartPos = [rideDetails.captain.location.coordinates[1], rideDetails.captain.location.coordinates[0]];
            const response = await fetch(`http://router.project-osrm.org/route/v1/driving/${captainStartPos[1]},${captainStartPos[0]};${destinationPosition[1]},${destinationPosition[0]}?overview=full&geometries=geojson`);
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
                const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                setRoute(routeCoords);
            }
        };
        fetchRoute();
    }, [rideDetails]); // Only run when rideDetails are available

    // Don't render the map until we have the first position for the captain
    if (!captainPosition) {
        return <div>Initializing map... Waiting for captain's location.</div>;
    }

    return (
        <MapContainer center={captainPosition} zoom={15} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={captainPosition} icon={captainIcon}>
                <Popup>Your Captain</Popup>
            </Marker>
            <Marker position={destinationPosition} icon={destinationIcon}>
                <Popup>Your Destination</Popup>
            </Marker>
            {route.length > 0 && <Polyline positions={route} color="blue" weight={5} />}
        </MapContainer>
    );
};

export default LiveTracking;