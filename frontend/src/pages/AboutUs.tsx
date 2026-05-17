import React, { useEffect } from 'react';
import BackgroundandMissions from '../components/BackgroundandMissions';
import Lenis from 'lenis';

export default function AboutUs() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
            <BackgroundandMissions />
        </div>
    );
}
