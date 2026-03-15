import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaVolumeUp, FaMicrophone, FaMobileAlt, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import RadarScanner from '../components/RadarScanner';
import FeatureCard from '../components/FeatureCard';
import CameraDetection from '../components/CameraDetection';
import VoiceAssistant, { speak } from '../components/VoiceAssistant';

const Home = () => {
  const navigate = useNavigate();
  const [navigating, setNavigating] = useState(false);
  const [statusText, setStatusText] = useState("System standby - Ready to assist");

  const startNavigation = () => {
    speak("Starting navigation mode. Scanning environment.");
    setNavigating(true);
    setStatusText("Initializing camera access...");
  };

  const stopNavigation = () => {
    speak("Navigation stopped.");
    setNavigating(false);
    setStatusText("System standby - Ready to assist");
  };

  const handleCommand = (cmd) => {
    console.log("Voice Command Triggered:", cmd);
    if (cmd === "START" && !navigating) {
      startNavigation();
    } else if (cmd === "STOP" && navigating) {
      stopNavigation();
    } else if (cmd === "STATUS") {
      speak("You are currently using the Spatial Audio Navigator. " + statusText);
    } else if (cmd === "REPEAT") {
      speak(statusText);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-10">
      <VoiceAssistant onCommand={handleCommand} />
      
      {/* Top Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8 flex flex-col items-center text-center gap-4"
      >
        {!navigating ? <RadarScanner /> : <div className="h-8"></div>}

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-widest neon-text mb-2">
          SPATIAL AUDIO NAVIGATOR
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl font-light">
          "AI-powered navigation assistant for visually impaired individuals."
        </p>

        {navigating && (
           <div className="text-xl font-mono text-[var(--color-neon)] bg-[rgba(0,224,255,0.05)] p-4 rounded-xl border border-[rgba(0,224,255,0.2)] mt-4">
             {statusText}
           </div>
        )}
      </motion.div>

      {/* Navigation Feature (Core Function) */}
      {navigating && (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
          <CameraDetection isActive={navigating} onStatusChange={(msg) => setStatusText(msg)} />
          <button 
            onClick={stopNavigation}
            className="neon-button px-8 py-4 rounded-full text-xl font-bold tracking-widest w-full md:w-auto"
          >
            STOP NAVIGATION
          </button>
        </div>
      )}

      {/* Feature Cards Section */}
      {!navigating && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          <FeatureCard 
            icon={FaCamera} 
            title="Camera Detection" 
            description="Detect obstacles and objects using real-time computer vision."
            delay={0.1}
          />
          <FeatureCard 
            icon={FaVolumeUp} 
            title="Spatial Audio" 
            description="Provide directional audio guidance to help users move safely."
            delay={0.2}
          />
          <FeatureCard 
            icon={FaMicrophone} 
            title="Voice Commands" 
            description="Navigate using simple voice instructions."
            delay={0.3}
          />
          <FeatureCard 
            icon={FaMobileAlt} 
            title="Haptic Alerts" 
            description="Phone vibration feedback when obstacles are detected."
            delay={0.4}
          />
        </div>
      )}

      {/* Action Buttons Section */}
      {!navigating && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col md:flex-row gap-6 justify-center mt-8 pb-12"
        >
          <button 
            onClick={startNavigation}
            className="neon-button-solid px-12 py-5 rounded-full text-xl font-bold tracking-widest hover:scale-105"
          >
            START NAVIGATION
          </button>
          
          <button 
            onClick={() => navigate('/settings')}
            className="neon-button px-8 py-5 rounded-full text-xl font-bold tracking-widest flex items-center justify-center gap-3 hover:scale-105"
          >
            <FaCog /> SETTINGS
          </button>
        </motion.div>
      )}

    </div>
  );
};

export default Home;
