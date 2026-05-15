import React from 'react';
import Navbar from '../components/navbar';
import BackgroundandMissions from '../components/BackgroundandMissions';

export default function AboutUs() {
    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <Navbar />
            <BackgroundandMissions />
        </div>
    );
}
