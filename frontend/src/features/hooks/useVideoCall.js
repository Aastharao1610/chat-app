// import { useEffect, useState, useRef } from "react";
// import {
//   closeVideoCall,
//   toggleMute,
//   toggleVideo,
// } from "@/features/calls/webrtc/video";

// export const useVideoCall = (selectedUser) => {
//   const [incomingCall, setIncomingCall] = useState(null);
//   const [activeCall, setActiveCall] = useState(false);
//   const [calling, setCalling] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);
//   const [callEndedMessage, setCallEndedMessage] = useState("");
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);
//   // Refs for UI elements
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);

//   // WebRTC Refs
//   const peerRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const remoteStreamRef = useRef(null);
//   const activeRemoteRef = useRef(null);

//   // Utility Refs
//   const callTimeoutRef = useRef(null);
//   const durationRef = useRef(0);
//   const isActiveCallRef = useRef(false);

//   useEffect(() => {
//     if (!isVideoOff && localVideoRef.current && localStreamRef.current) {
//       localVideoRef.current.srcObject = localStreamRef.current;
//       localVideoRef.current.play().catch(() => {});
//     }
//   }, [isVideoOff]);

//   const handleToggle = () => {
//     const muted = toggleMute(localStreamRef.current);
//     setIsMuted(muted);
//   };

//   const handleVideoToggle = () => {
//     const videoOff = toggleVideo(localStreamRef.current);
//     setIsVideoOff(videoOff);

//     if (activeRemoteRef.current) {
//       socket.emit("toggle-video", {
//         to: activeRemoteRef.current,
//         isVideoOff: videoOff,
//       });
//     }

//     if (!videoOff && localVideoRef.current && localStreamRef.current) {
//       localVideoRef.current.srcObject = localStreamRef.current;
//       localVideoRef.current.play().catch(() => {});
//     }
//   };

//   const socket = window.socket;

//   // Sync ref with state for the incoming call handler
//   useEffect(() => {
//     isActiveCallRef.current = activeCall;
//   }, [activeCall]);

//   useEffect(() => {
//     if (activeCall && remoteStreamRef.current && remoteVideoRef.current) {
//       console.log(" Syncing buffered remote stream to video element");
//       remoteVideoRef.current.srcObject = remoteStreamRef.current;

//       // Force play for browsers with strict autoplay policies
//       remoteVideoRef.current.play().catch((err) => {
//         console.warn("Autoplay/Play was interrupted:", err);
//       });
//     }
//   }, [activeCall]);

//   const createPeer = (remoteId) => {
//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     pc.ontrack = (event) => {
//       console.log("Remote track received", event.streams[0]);
//       const incomingStream = event.streams[0];

//       // 1. Save to buffer
//       remoteStreamRef.current = incomingStream;

//       // 2. Try to attach immediately if element exists
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = incomingStream;
//       } else {
//         setTimeout(() => {
//           if (remoteVideoRef.current) {
//             remoteVideoRef.current.srcObject = incomingStream;
//           }
//         }, 300);
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         console.log("Sending ICE Candidate");
//         socket.emit("ice-candidate", {
//           to: remoteId,
//           candidate: event.candidate,
//         });
//       }
//     };

//     peerRef.current = pc;
//     return pc;
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
//   };

//   const getCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });

//       localStreamRef.current = stream;

//       // Attach local stream with a retry interval in case ref isn't ready
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//       } else {
//         let retries = 0;
//         const interval = setInterval(() => {
//           if (localVideoRef.current) {
//             localVideoRef.current.srcObject = stream;
//             clearInterval(interval);
//           }
//           if (retries++ > 10) clearInterval(interval);
//         }, 100);
//       }
//       return stream;
//     } catch (error) {
//       console.error("Error accessing camera/mic:", error);
//     }
//   };

//   useEffect(() => {
//     if (!socket) return;

//     const handleIncoming = ({ callerId, offer, type }) => {
//       if (type !== "VIDEO" || isActiveCallRef.current) return;
//       activeRemoteRef.current = callerId;
//       setIncomingCall({ callerId, offer });
//     };

//     const handleAnswered = async ({ answer, type }) => {
//       if (type !== "VIDEO") return;
//       clearTimeout(callTimeoutRef.current);
//       if (peerRef.current) {
//         await peerRef.current.setRemoteDescription(
//           new RTCSessionDescription(answer),
//         );
//       }
//       setActiveCall(true);
//       setCalling(false);
//     };

//     const handleRejected = ({ type }) => {
//       if (type === "VIDEO") {
//         setCallEndedMessage("User rejected the call");
//         handleCleanup();
//       }
//     };

//     const handleEnded = () => {
//       console.log("videocall ended");
//       handleCleanup();
//     };

//     const handleICEcandidate = async ({ candidate }) => {
//       try {
//         if (peerRef.current && peerRef.current.remoteDescription && candidate) {
//           await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       } catch (error) {
//         console.error("Error adding received ICE candidate", error);
//       }
//     };

//     const handleRemoteVideoToggle = ({ isVideoOff }) => {
//       setIsRemoteVideoOff(isVideoOff);
//     };

//     socket.on("incoming-call", handleIncoming);
//     socket.on("call-answered", handleAnswered);
//     socket.on("call-rejected", handleRejected);
//     socket.on("call-ended", handleEnded);
//     socket.on("ice-candidate", handleICEcandidate);
//     socket.on("toggle-video", handleRemoteVideoToggle);

//     return () => {
//       socket.off("incoming-call", handleIncoming);
//       socket.off("call-answered", handleAnswered);
//       socket.off("call-rejected", handleRejected);
//       socket.off("call-ended", handleEnded);
//       socket.off("ice-candidate", handleICEcandidate);
//       socket.off("toggle-video", handleRemoteVideoToggle);
//     };
//   }, [socket]);

//   // Sync streams when video is toggled back ON
//   useEffect(() => {
//     if (activeCall) {
//       // Re-sync Remote Video
//       if (
//         !isRemoteVideoOff &&
//         remoteVideoRef.current &&
//         remoteStreamRef.current
//       ) {
//         remoteVideoRef.current.srcObject = remoteStreamRef.current;
//       }
//       // Re-sync Local Video
//       if (!isVideoOff && localVideoRef.current && localStreamRef.current) {
//         localVideoRef.current.srcObject = localStreamRef.current;
//       }
//     }
//   }, [isRemoteVideoOff, isVideoOff, activeCall]);

//   const startCall = async () => {
//     if (!socket || !selectedUser?.id) return;

//     setCalling(true);
//     activeRemoteRef.current = selectedUser.id;

//     callTimeoutRef.current = setTimeout(() => {
//       socket.emit("call-timeout", {
//         receiverId: activeRemoteRef.current,
//         type: "VIDEO",
//       });
//       console.log("Timout happend and we are ending this video call");
//       handleCleanup();
//     }, 30000);

//     const pc = createPeer(selectedUser.id);
//     const stream = await getCamera();

//     if (stream) {
//       stream.getTracks().forEach((track) => {
//         console.log(`Sender: Adding ${track.kind} track`);
//         pc.addTrack(track, stream);
//       });
//     }

//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);

//     socket.emit("call-user", {
//       receiverId: selectedUser.id,
//       offer,
//       type: "VIDEO",
//     });
//     console.log("user is calling vc");
//   };

//   const acceptCall = async () => {
//     if (!incomingCall) return;

//     const { callerId, offer } = incomingCall;
//     activeRemoteRef.current = callerId;

//     const pc = createPeer(callerId);
//     const stream = await getCamera();

//     if (stream) {
//       stream.getTracks().forEach((track) => {
//         console.log(`Receiver: Adding ${track.kind} track`);
//         pc.addTrack(track, stream);
//       });
//     }

//     await pc.setRemoteDescription(new RTCSessionDescription(offer));
//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(answer);

//     socket.emit("answer-call", { callerId, answer, type: "VIDEO" });

//     setIncomingCall(null);
//     setActiveCall(true);
//     setCalling(false);
//   };

//   const rejectCall = () => {
//     if (incomingCall) {
//       socket.emit("reject-call", {
//         callerId: incomingCall.callerId,
//         type: "VIDEO",
//       });
//     }
//     handleCleanup();
//   };

//   const endCall = () => {
//     if (activeRemoteRef.current) {
//       socket.emit("end-call", {
//         targetId: activeRemoteRef.current,
//         type: "VIDEO",
//       });
//     }
//     handleCleanup();
//   };

//   const handleCleanup = () => {
//     if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
//     closeVideoCall();

//     if (peerRef.current) {
//       peerRef.current.ontrack = null;
//       peerRef.current.onicecandidate = null;
//       peerRef.current.close();
//       peerRef.current = null;
//     }

//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//       localStreamRef.current = null;
//     }

//     remoteStreamRef.current = null;

//     if (localVideoRef.current) localVideoRef.current.srcObject = null;
//     if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

//     setCallEndedMessage(
//       durationRef.current > 0
//         ? `Call Ended • ${formatTime(durationRef.current)}`
//         : "Call Ended",
//     );
//     setTimeout(() => setCallEndedMessage(""), 3000);

//     setActiveCall(false);
//     setCalling(false);
//     setIncomingCall(null);
//     setCallDuration(0);
//     durationRef.current = 0;
//     activeRemoteRef.current = null;
//   };

//   useEffect(() => {
//     let interval;
//     if (activeCall) {
//       interval = setInterval(() => {
//         setCallDuration((prev) => {
//           durationRef.current = prev + 1;
//           return prev + 1;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [activeCall]);

//   return {
//     startCall,
//     acceptCall,
//     rejectCall,
//     endCall,
//     incomingCall,
//     activeCall,
//     calling,
//     callDuration: formatTime(callDuration),
//     callEndedMessage,
//     localVideoRef,
//     remoteVideoRef,
//     toggleMute: handleToggle,
//     toggleVideo: handleVideoToggle,
//     isMuted,
//     isVideoOff,
//     isRemoteVideoOff,
//   };
// };

import { useEffect, useState, useRef } from "react";
import {
  closeVideoCall,
  toggleMute,
  toggleVideo,
} from "@/features/calls/webrtc/video";

export const useVideoCall = (selectedUser) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(false);
  const [calling, setCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callEndedMessage, setCallEndedMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);

  // Refs for UI
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // WebRTC Refs
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const activeRemoteRef = useRef(null);
  const iceQueueRef = useRef([]);

  // Utility Refs
  const callTimeoutRef = useRef(null);
  const durationRef = useRef(0);
  const isActiveCallRef = useRef(false);

  const socket = window.socket;

  // --- 1. UNIFIED STREAM SYNC (The Fix for Local/Remote visibility) ---
  useEffect(() => {
    const syncStreams = () => {
      // Sync Local Stream
      if (localStreamRef.current && localVideoRef.current && !isVideoOff) {
        if (localVideoRef.current.srcObject !== localStreamRef.current) {
          console.log("🎥 Syncing local stream to UI");
          localVideoRef.current.srcObject = localStreamRef.current;
          localVideoRef.current.play().catch(() => {});
        }
      }

      // Sync Remote Stream
      if (
        remoteStreamRef.current &&
        remoteVideoRef.current &&
        !isRemoteVideoOff
      ) {
        if (remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
          console.log("🎬 Syncing remote stream to UI");
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
          remoteVideoRef.current.play().catch(() => {});
        }
      }
    };

    // Run immediately when state changes
    syncStreams();

    // Heartbeat to catch any late renders or tab switches
    const interval = setInterval(syncStreams, 1000);
    return () => clearInterval(interval);
  }, [activeCall, calling, isVideoOff, isRemoteVideoOff]);

  // --- 2. PEER CREATION ---
  const createPeer = (remoteId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.ontrack = (event) => {
      console.log("🛰️ Remote track received");
      remoteStreamRef.current = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", {
          to: String(remoteId),
          candidate: event.candidate,
        });
      }
    };

    peerRef.current = pc;
    return pc;
  };

  // --- 3. HELPER FUNCTIONS ---
  const processIceQueue = async (pc) => {
    while (iceQueueRef.current.length > 0) {
      const candidate = iceQueueRef.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("ICE Queue error:", e);
      }
    }
  };

  const getCamera = async () => {
    try {
      if (localStreamRef.current) return localStreamRef.current;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  // --- 4. SOCKET LISTENERS ---
  useEffect(() => {
    if (!socket) return;
    isActiveCallRef.current = activeCall;

    const handleIncoming = ({ callerId, offer, type }) => {
      if (type !== "VIDEO" || isActiveCallRef.current) return;
      activeRemoteRef.current = callerId;
      setIncomingCall({ callerId, offer });
    };

    const handleAnswered = async ({ answer, type }) => {
      if (type !== "VIDEO" || !peerRef.current) return;
      clearTimeout(callTimeoutRef.current);
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
      await processIceQueue(peerRef.current);
      setActiveCall(true);
      setCalling(false);
    };

    const handleICE = async ({ candidate }) => {
      if (!candidate) return;
      if (peerRef.current?.remoteDescription) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error(e);
        }
      } else {
        iceQueueRef.current.push(candidate);
      }
    };

    socket.on("incoming-call", handleIncoming);
    socket.on("call-answered", handleAnswered);
    socket.on("ice-candidate", handleICE);
    socket.on("call-rejected", () => handleCleanup("User rejected the call"));
    socket.on("call-ended", () => handleCleanup());
    socket.on("toggle-video", ({ isVideoOff }) =>
      setIsRemoteVideoOff(isVideoOff),
    );

    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("toggle-video");
    };
  }, [socket, activeCall]);

  // --- 5. CALL ACTIONS ---
  const startCall = async () => {
    if (!selectedUser?.id) return;
    setCalling(true);
    activeRemoteRef.current = selectedUser.id;

    callTimeoutRef.current = setTimeout(() => {
      socket.emit("call-timeout", {
        receiverId: activeRemoteRef.current,
        type: "VIDEO",
      });
      handleCleanup();
    }, 30000);

    const pc = createPeer(selectedUser.id);
    const stream = await getCamera();
    if (stream) stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("call-user", {
      receiverId: selectedUser.id,
      offer,
      type: "VIDEO",
    });
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    const { callerId, offer } = incomingCall;
    const pc = createPeer(callerId);
    const stream = await getCamera();
    if (stream) stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    await processIceQueue(pc);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer-call", { callerId, answer, type: "VIDEO" });
    setIncomingCall(null);
    setActiveCall(true);
  };

  const endCall = () => {
    if (activeRemoteRef.current) {
      socket.emit("end-call", {
        targetId: activeRemoteRef.current,
        type: "VIDEO",
      });
    }
    handleCleanup();
  };

  const handleCleanup = (msg) => {
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    if (peerRef.current) peerRef.current.close();
    if (localStreamRef.current)
      localStreamRef.current.getTracks().forEach((t) => t.stop());

    peerRef.current = null;
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    iceQueueRef.current = [];

    setCallEndedMessage(
      msg ||
        (durationRef.current > 0
          ? `Call Ended • ${formatTime(durationRef.current)}`
          : "Call Ended"),
    );
    setTimeout(() => setCallEndedMessage(""), 3000);
    setActiveCall(false);
    setCalling(false);
    setIncomingCall(null);
    setCallDuration(0);
    durationRef.current = 0;
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  useEffect(() => {
    let interval;
    if (activeCall)
      interval = setInterval(
        () =>
          setCallDuration((p) => {
            durationRef.current = p + 1;
            return p + 1;
          }),
        1000,
      );
    return () => clearInterval(interval);
  }, [activeCall]);

  return {
    startCall,
    acceptCall,
    rejectCall: () => {
      socket.emit("reject-call", {
        callerId: incomingCall?.callerId,
        type: "VIDEO",
      });
      handleCleanup();
    },
    endCall,
    incomingCall,
    activeCall,
    calling,
    callDuration: formatTime(callDuration),
    callEndedMessage,
    localVideoRef,
    remoteVideoRef,
    isMuted,
    isVideoOff,
    isRemoteVideoOff,
    toggleMute: () => setIsMuted(toggleMute(localStreamRef.current)),
    toggleVideo: () => {
      const off = toggleVideo(localStreamRef.current);
      setIsVideoOff(off);
      socket.emit("toggle-video", {
        to: activeRemoteRef.current,
        isVideoOff: off,
      });
    },
  };
};
