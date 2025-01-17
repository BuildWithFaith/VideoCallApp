import { useState } from 'react';
import { PhoneIcon, PhoneXMarkIcon, MicrophoneIcon, VideoCameraIcon } from '@heroicons/react/24/solid';

interface CallControlsProps {
  startCall: (remotePeerId: string) => void;
  endCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  isAudioMuted: boolean;
  isVideoDisabled: boolean;
  callStatus: 'idle' | 'calling' | 'connected';
  peerId: string;
}

export default function CallControls({
  startCall,
  endCall,
  toggleAudio,
  toggleVideo,
  isAudioMuted,
  isVideoDisabled,
  callStatus,
  peerId,
}: CallControlsProps) {
  const [remotePeerId, setRemotePeerId] = useState('');

  const handleStartCall = () => {
    if (remotePeerId) {
      startCall(remotePeerId);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0 sm:space-x-4">
      {callStatus === 'idle' && (
        <>
          <div className="text-white text-sm text-center sm:text-left">Your Peer ID: {peerId}</div>
          <div className="flex items-center space-x-2 w-full max-w-md">
            <input
              type="text"
              value={remotePeerId}
              onChange={(e) => setRemotePeerId(e.target.value)}
              placeholder="Enter remote Peer ID"
              className="flex-grow px-3 py-2 text-sm bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            />
            <button
              onClick={handleStartCall}
              className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-all"
            >
              <PhoneIcon className="w-6 h-6" />
            </button>
          </div>
        </>
      )}
      {callStatus === 'calling' && (
        <div className="text-lg font-semibold text-white text-center">Calling...</div>
      )}
      {callStatus === 'connected' && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors duration-300 ${
              isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <MicrophoneIcon className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors duration-300 ${
              isVideoDisabled ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <VideoCameraIcon className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={endCall}
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-all"
          >
            <PhoneXMarkIcon className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
