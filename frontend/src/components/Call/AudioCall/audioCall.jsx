"use client";
import { Mic } from "lucide-react";
import { MicOff } from "lucide-react";

export default function AudioCallUI({
  calling,
  activeCall,
  endCall,
  incomingCall,
  acceptCall,
  callduration,
  callEndedMessage,
  toggleMute,
  isMuted,
}) {
  return (
    <>
      {/* 1. Outgoing Call UI */}
      {calling && !activeCall && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-4 rounded-xl shadow-xl z-50 animate-bounce">
          <p className="mb-2">Calling...</p>
          <button
            onClick={endCall}
            className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      )}

      {/* 2. Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center border">
            <p className="text-lg font-semibold mb-4 text-gray-800">
              Incoming Call...
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={acceptCall}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={endCall}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Active Call Status */}
      {activeCall && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-xl z-50 border border-gray-700">
          <p className="mb-1 text-gray-400 text-xs">Call Connected</p>
          <p className="text-2xl font-mono font-bold mb-3">{callduration}</p>
          <button
            onClick={toggleMute}
            className="bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition"
          >
            {isMuted ? (
              <MicOff className="text-red-400" />
            ) : (
              <Mic className="text-green-400" />
            )}
          </button>

          <button
            onClick={endCall}
            className="bg-red-600 w-full py-2 rounded-lg hover:bg-red-700"
          >
            End Call
          </button>
        </div>
      )}

      {/* 4. Call Ended Notification */}
      {callEndedMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg border border-gray-600 animate-fade-in">
          {callEndedMessage}
        </div>
      )}
    </>
  );
}
