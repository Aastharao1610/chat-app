"use client";
import {
  Mic,
  PhoneOff,
  Speaker,
  Video,
  VideoOff,
  VideoOffIcon,
} from "lucide-react";

export default function VideoCallUI({
  calling,
  activeCall,
  incomingCall,
  acceptCall,
  rejectCall,
  endCall,
  callDuration,
  localVideoRef,
  remoteVideoRef,
  callEndedMessage,
  isMuted,
  toggleMute,
  toggleVideo,
  isVideoOff,
}) {
  return (
    <>
      {/* 1️⃣ Outgoing Calling UI */}
      {calling && !activeCall && (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-50">
          <Video size={48} className="mb-4 animate-pulse" />
          <p className="text-xl mb-6">Calling...</p>

          <button
            onClick={endCall}
            className="bg-red-600 p-4 rounded-full hover:bg-red-700 transition"
          >
            <PhoneOff />
          </button>
        </div>
      )}

      {/* 2 Incoming Call UI */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl text-center shadow-xl w-80">
            <p className="text-lg font-semibold mb-6 text-gray-800">
              Incoming Video Call
            </p>

            <div className="flex justify-center gap-6">
              <button
                onClick={acceptCall}
                className="bg-green-500 text-white p-4 rounded-full hover:bg-green-600"
              >
                <Video size={20} />
              </button>

              <button
                onClick={rejectCall}
                className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3️⃣ Active Call Screen */}
      {activeCall && (
        <div className="fixed inset-0 bg-black z-50">
          {/* Remote Video Full Screen */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ border: "2px solid blue" }}
          />

          {/* Local Small Preview */}
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-24 right-4 w-32 sm:w-40 rounded-xl border-2 border-white shadow-lg"
          />

          {/* Duration */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-1 rounded-full">
            {callDuration}
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 bg-black/40 p-4 rounded-sm left-1/2 -translate-x-1/2 flex gap-6">
            <button
              onClick={endCall}
              className="bg-red-600 p-2 rounded-full hover:bg-red-700 shadow-lg"
            >
              <PhoneOff size={20} className="text-white" />
            </button>
            <button
              onClick={toggleVideo}
              className="bg-red-600 p-2 rounded-full hover:bg-red-700 shadow-lg"
            >
              {isVideoOff ? (
                <VideoOffIcon size={20} className="text-red-400" />
              ) : (
                <Video size={20} className="text-white" />
              )}
            </button>
            <button
              onClick={toggleMute}
              className="bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition"
            >
              {isMuted ? (
                <MicOff size={20} className="text-red-400" />
              ) : (
                <Mic size={20} className="text-green-400" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* 4 Call Ended Message */}
      {callEndedMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          {callEndedMessage}
        </div>
      )}
    </>
  );
}
