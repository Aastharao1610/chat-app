// "use client";
// import {
//   Mic,
//   PhoneOff,
//   MicOff,
//   Speaker,
//   Video,
//   VideoOffIcon,
// } from "lucide-react";
// import { useSelector } from "react-redux";

// export default function VideoCallUI({
//   calling,
//   activeCall,
//   incomingCall,
//   acceptCall,
//   rejectCall,
//   endCall,
//   callDuration,
//   localVideoRef,
//   remoteVideoRef,
//   callEndedMessage,
//   isMuted,
//   toggleMute,
//   toggleVideo,
//   isVideoOff,
//   isRemoteVideoOff,
// }) {
//   const { user } = useSelector((state) => state.auth);
//   console.log(user.name, "Logging name of user");
//   const googleColors = [
//     "#1a73e8", // blue
//     "#ea4335", // red
//     "#fbbc04", // yellow
//     "#34a853", // green
//     "#9334e6", // purple
//     "#f4511e", // orange
//     "#00897b", // teal
//     "#5f6368", // grey
//   ];

//   const getAvatarData = (email) => {
//     let hash = 0;
//     for (let i = 0; i < email.length; i++) {
//       hash = email.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     const color = googleColors[Math.abs(hash) % googleColors.length];
//     const inital = email.charAt(0).toUpperCase();

//     return { color, inital };
//   };

//   return (
//     <>
//       {/* 1. Outgoing Calling UI */}
//       {/* {calling && !activeCall && (
//         <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-50">
//           <Video size={48} className="mb-4 animate-pulse" />
//           <p className="text-xl mb-6">Calling...</p>

//           <button
//             onClick={endCall}
//             className="bg-red-600 p-4 rounded-full hover:bg-red-700 transition"
//           >
//             <PhoneOff />
//           </button>
//         </div>
//       )} */}
//       {calling && !activeCall && (
//         <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center text-white z-[999]">
//           <div className="relative mb-8">
//             <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
//             <div className="relative bg-slate-800 p-8 rounded-full border border-slate-700">
//               <Video size={48} className="text-blue-400" />
//             </div>
//           </div>
//           <p className="text-2xl font-light tracking-widest mb-2">CALLING</p>
//           <p className="text-slate-400 mb-10">Waiting for response...</p>

//           <button
//             onClick={endCall}
//             className="bg-red-500 p-6 cursor-pointer rounded-full hover:bg-red-600 transition-all hover:scale-110 shadow-xl"
//           >
//             <PhoneOff size={28} fill="white" />
//           </button>
//         </div>
//       )}

//       {/* 2. Incoming Call UI */}
//       {/* {incomingCall && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-2xl text-center shadow-xl w-80">
//             <p className="text-lg font-semibold mb-6 text-gray-800">
//               Incoming Video Call
//             </p>

//             <div className="flex justify-center gap-6">
//               <button
//                 onClick={acceptCall}
//                 className="bg-green-500 text-white p-4 rounded-full hover:bg-green-600"
//               >
//                 <Video size={20} />
//               </button>

//               <button
//                 onClick={rejectCall}
//                 className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600"
//               >
//                 <PhoneOff size={20} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )} */}
//       {incomingCall && !activeCall && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[999] p-4">
//           <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl text-center shadow-2xl w-full max-w-sm">
//             <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce">
//               <Video size={36} className="text-white" />
//             </div>
//             <h3 className="text-xl font-bold text-white mb-2">
//               Incoming Video Call
//             </h3>
//             <p className="text-slate-400 mb-8">
//               User is inviting you to a video chat
//             </p>

//             <div className="flex justify-center gap-6">
//               <button
//                 onClick={acceptCall}
//                 className="bg-green-500 cursor-pointer text-white p-5 rounded-full hover:bg-green-600 transition-transform hover:scale-110 shadow-lg shadow-green-900/20"
//               >
//                 <Video size={28} />
//               </button>

//               <button
//                 onClick={rejectCall}
//                 className="bg-red-500 text-white cursor-pointer p-5 rounded-full hover:bg-red-600 transition-transform hover:scale-110 shadow-lg shadow-red-900/20"
//               >
//                 <PhoneOff size={28} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 3. Active Call Screen */}
//       {activeCall && (
//         <div className="fixed inset-0 bg-[#202124] flex items-center justify-center z-50">
//           {/* Remote Video OR Avatar */}
//           <div className="relative w-full h-full flex items-center justify-center">
//             {isRemoteVideoOff ? (
//               /* Remote Avatar */
//               <div className="flex flex-col items-center justify-center">
//                 <div
//                   style={{
//                     backgroundColor: getAvatarData(
//                       selectedUser?.email || "remote",
//                     )?.color,
//                   }}
//                   className="w-40 h-40 rounded-full flex items-center justify-center text-white text-5xl font-semibold shadow-2xl"
//                 >
//                   {getAvatarData(selectedUser?.email || "R")?.inital}
//                 </div>
//                 <p className="text-white text-xl font-medium mt-6">
//                   {selectedUser?.name || "Remote User"}
//                 </p>
//               </div>
//             ) : (
//               /* Remote Video */
//               <video
//                 ref={remoteVideoRef}
//                 autoPlay
//                 playsInline
//                 className="absolute inset-0 w-full h-full object-cover"
//               />
//             )}
//           </div>

//           {/* Top Duration */}
//           {/* <div className="absolute top-6 text-gray-300 text-sm bg-black/40 backdrop-blur-md px-4 py-1 rounded-full">
//             {callDuration}
//           </div> */}
//           <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
//             <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
//               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
//               <span className="text-white text-sm font-mono tracking-tighter">
//                 {callDuration}
//               </span>
//             </div>
//           </div>

//           {/* Local Preview (Top Right like Meet) */}
//           <div className="absolute top-6 right-6 w-36 h-24   flex items-center justify-center aspect-video rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-[1000] bg-slate-800">
//             {isVideoOff ? (
//               <div
//                 style={{ backgroundColor: getAvatarData(user.email)?.color }}
//                 className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold"
//               >
//                 {getAvatarData(user.email)?.inital}
//               </div>
//             ) : (
//               <>
//                 {isMuted && (
//                   <div className="absolute top-1 right-1 bg-red-600 p-1 rounded-full z-10">
//                     <MicOff size={12} className="text-white" />
//                   </div>
//                 )}
//                 <div className="absolute bottom-2 left-2 bg-black/40 px-2 py-0.5 rounded text-[10px] text-white">
//                   You
//                 </div>

//                 <video
//                   ref={localVideoRef}
//                   autoPlay
//                   playsInline
//                   muted
//                   className="w-full h-full object-cover"
//                 />
//               </>
//             )}
//           </div>

//           {/* Bottom Controls - Meet Style */}
//           <div className="absolute bottom-10 flex items-center gap-6 bg-black/50 backdrop-blur-lg px-8 py-4 rounded-full shadow-2xl">
//             {/* Mic */}
//             <button
//               onClick={toggleMute}
//               className={`p-4 rounded-full transition ${
//                 isMuted ? "bg-red-600" : "bg-[#3c4043]"
//               }`}
//             >
//               {isMuted ? (
//                 <MicOff size={22} className="text-white" />
//               ) : (
//                 <Mic size={22} className="text-white" />
//               )}
//             </button>

//             {/* End Call */}
//             <button
//               onClick={endCall}
//               className="bg-red-600 p-5 rounded-full hover:bg-red-700 transition shadow-lg"
//             >
//               <PhoneOff size={22} className="text-white" />
//             </button>

//             {/* Video */}
//             <button
//               onClick={toggleVideo}
//               className={`p-4 rounded-full transition ${
//                 isVideoOff ? "bg-red-600" : "bg-[#3c4043]"
//               }`}
//             >
//               {isVideoOff ? (
//                 <VideoOffIcon size={22} className="text-white" />
//               ) : (
//                 <Video size={22} className="text-white" />
//               )}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* 4 Call Ended Message */}
//       {/* {callEndedMessage && (
//         <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg z-50">
//           {callEndedMessage}
//         </div>
//       )} */}
//       {callEndedMessage && (
//         <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md text-white px-8 py-4 rounded-2xl border border-slate-700 shadow-2xl z-[1001] animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-red-500/20 rounded-full">
//               <PhoneOff size={18} className="text-red-500" />
//             </div>
//             <span className="font-medium">{callEndedMessage}</span>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

"use client";
import { Mic, PhoneOff, MicOff, Video, VideoOffIcon } from "lucide-react";
import { useSelector } from "react-redux";

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
  isRemoteVideoOff,
  selectedUser, // ADDED THIS PROP
}) {
  const { user } = useSelector((state) => state.auth);

  const googleColors = [
    "#1a73e8",
    "#ea4335",
    "#fbbc04",
    "#34a853",
    "#9334e6",
    "#f4511e",
    "#00897b",
    "#5f6368",
  ];

  const getAvatarData = (email) => {
    if (!email) return { color: "#5f6368", inital: "?" };
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = googleColors[Math.abs(hash) % googleColors.length];
    const inital = email.charAt(0).toUpperCase();
    return { color, inital };
  };

  return (
    <>
      {/* 1. Outgoing Calling UI */}
      {calling && !activeCall && (
        <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center text-white z-[999]">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
            <div className="relative bg-slate-800 p-8 rounded-full border border-slate-700">
              <Video size={48} className="text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-light tracking-widest mb-2 uppercase">
            Calling {selectedUser?.name}
          </p>
          <p className="text-slate-400 mb-10">Waiting for response...</p>
          <button
            onClick={endCall}
            className="bg-red-500 p-6 cursor-pointer rounded-full hover:bg-red-600 transition-all hover:scale-110 shadow-xl"
          >
            <PhoneOff size={28} fill="white" />
          </button>
        </div>
      )}

      {/* 2. Incoming Call UI */}
      {incomingCall && !activeCall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[999] p-4">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl text-center shadow-2xl w-full max-w-sm">
            <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce">
              <Video size={36} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Incoming Video Call
            </h3>
            <p className="text-slate-400 mb-8">
              Someone is inviting you to a video chat
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={acceptCall}
                className="bg-green-500 cursor-pointer text-white p-5 rounded-full hover:bg-green-600 transition-transform hover:scale-110 shadow-lg"
              >
                <Video size={28} />
              </button>
              <button
                onClick={rejectCall}
                className="bg-red-500 text-white cursor-pointer p-5 rounded-full hover:bg-red-600 transition-transform hover:scale-110 shadow-lg"
              >
                <PhoneOff size={28} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Active Call Screen */}
      {activeCall && (
        <div className="fixed inset-0 bg-[#202124] flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            {isRemoteVideoOff ? (
              <div className="flex flex-col items-center justify-center">
                <div
                  style={{
                    backgroundColor: getAvatarData(
                      selectedUser?.email || "remote",
                    )?.color,
                  }}
                  className="w-40 h-40 rounded-full flex items-center justify-center text-white text-5xl font-semibold shadow-2xl"
                >
                  {getAvatarData(selectedUser?.email || "R")?.inital}
                </div>
                <p className="text-white text-xl font-medium mt-6">
                  {selectedUser?.name || "Remote User"}
                </p>
              </div>
            ) : (
              /* REMOTE VIDEO: Ensure ref is attached and playsInline is present */
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>

          {/* Top Duration */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-sm font-mono tracking-tighter">
                {callDuration}
              </span>
            </div>
          </div>

          {/* Local Preview (Top Right) */}
          <div className="absolute top-6 right-6 w-36 h-24 flex items-center justify-center aspect-video rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-[1000] bg-slate-800">
            {isVideoOff ? (
              <div
                style={{ backgroundColor: getAvatarData(user?.email)?.color }}
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold"
              >
                {getAvatarData(user?.email)?.inital}
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]" // Mirrored for natural look
              />
            )}
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-10 flex items-center gap-6 bg-black/50 backdrop-blur-lg px-8 py-4 rounded-full shadow-2xl">
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition ${isMuted ? "bg-red-600" : "bg-[#3c4043]"}`}
            >
              {isMuted ? (
                <MicOff size={22} className="text-white" />
              ) : (
                <Mic size={22} className="text-white" />
              )}
            </button>
            <button
              onClick={endCall}
              className="bg-red-600 p-5 rounded-full hover:bg-red-700 transition shadow-lg"
            >
              <PhoneOff size={22} className="text-white" />
            </button>
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition ${isVideoOff ? "bg-red-600" : "bg-[#3c4043]"}`}
            >
              {isVideoOff ? (
                <VideoOffIcon size={22} className="text-white" />
              ) : (
                <Video size={22} className="text-white" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* 4. Call Ended Message */}
      {callEndedMessage && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md text-white px-8 py-4 rounded-2xl border border-slate-700 shadow-2xl z-[1001] animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-full">
              <PhoneOff size={18} className="text-red-500" />
            </div>
            <span className="font-medium">{callEndedMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}
