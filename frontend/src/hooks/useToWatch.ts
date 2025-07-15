import { useState } from "react";

export default function useToWatch() {
    const [isPlaying, setIsPlaying] = useState(false);
    
    const handleWatchNow = () => {
        // First scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Then play video after scroll completes
        setTimeout(() => {
            setIsPlaying(true);
        }, 800); // 800ms delay to allow smooth scroll to complete
    };

    return {
        isPlaying,
        setIsPlaying,
        handleWatchNow
    };
}