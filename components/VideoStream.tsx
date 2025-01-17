import { useRef, useEffect } from 'react';

interface VideoStreamProps {
  stream: MediaStream | null;
  muted?: boolean;
  label: string;
  className?: string;
}

export default function VideoStream({ stream, muted = false, label, className = '' }: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover rounded-lg shadow-lg"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-1 py-1 rounded text-sm">
        {label}
      </div>
    </div>
  );
}
