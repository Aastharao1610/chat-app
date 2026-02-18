// import { useEffect, useState, useRef } from "react";
// import { closeVideoCall } from "@/webrtc/video";
// export const useVideoCall = (selectedUser) => {
//   const [incomingCall, setIncomingCall] = useState(null);
//   const [activeCall, setActiveCall] = useState(false);
//   const [calling, setCalling] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);
//   const [callEndedMessage, setCallEndedMessage] = useState("");

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);

//   const peerRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const activeRemoteRef = useRef(null);
//   const callTimeoutRef = useRef(null);
//   const durationRef = useRef(0);
//   const isActiveCallRef = useRef(false);
//   const remoteStreamRef = useRef(null);

//   useEffect(() => {
//     isActiveCallRef.current = activeCall;
//   }, [activeCall]);

//   const socket = window.socket;

//   const createPeer = (remoteId) => {
//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     pc.ontrack = (event) => {
//       console.log("Remote track received", event.streams[0]);
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//         remoteVideoRef.current.play().catch((err) => {
//           console.error("ERROR PLAYING REMOTE VIDEO", err);
//         });
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         console.log("ICE Candidate", event.candidate);
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
//     return `${mins.toString().padStart(2, "0")}:${secs
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   const getCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });

//       localStreamRef.current = stream;

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
//       console.error("Error accessing camera and microphone:", error);
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

//     const handleEnded = (type) => {
//       if (type === "VIDEO") handleCleanup();
//     };

//     // MOVE THIS INSIDE AND REMOVE THE IMMEDIATE .off()
//     const handleICEcandidate = async ({ candidate }) => {
//       try {
//         if (peerRef.current && peerRef.current.remoteDescription && candidate) {
//           await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         } else if (candidate) {
//           console.log(
//             "Remote description not ready, candidate ignored or queued",
//           );
//         }
//       } catch (error) {
//         console.error("Error adding received ICE candidate", error);
//       }
//     };
//     // const handleICEcandidate = async ({ candidate }) => {
//     //   try {
//     //     if (peerRef.current && candidate) {
//     //       await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//     //     }
//     //   } catch (error) {
//     //     console.error("Error adding received ICE candidate", error);
//     //   }
//     // };

//     socket.on("incoming-call", handleIncoming);
//     socket.on("call-answered", handleAnswered);
//     socket.on("call-rejected", handleRejected);
//     socket.on("call-ended", handleEnded);
//     socket.on("ice-candidate", handleICEcandidate); // REGISTER HERE

//     return () => {
//       socket.off("incoming-call", handleIncoming);
//       socket.off("call-answered", handleAnswered);
//       socket.off("call-rejected", handleRejected);
//       socket.off("call-ended", handleEnded);
//       socket.off("ice-candidate", handleICEcandidate); // UNREGISTER HERE
//     };
//   }, []);

//   // START CALL
//   // const startCall = async () => {
//   //   if (!socket || !selectedUser?.id) return;

//   //   setCalling(true);
//   //   activeRemoteRef.current = selectedUser.id;

//   //   callTimeoutRef.current = setTimeout(() => {
//   //     socket.emit("call-timeout", {
//   //       receiverId: activeRemoteRef.current,
//   //       type: "VIDEO",
//   //     });
//   //     handleCleanup();
//   //   }, 30000);

//   //   const pc = createPeer(selectedUser.id);
//   //   const stream = await getCamera();

//   //   stream.getTracks().forEach((track) => {
//   //     pc.addTrack(track, stream);
//   //   });
//   //   if (stream) {
//   //     stream.getTracks().forEach((track) => {
//   //       console.log("Adding track to PC:", track.kind);
//   //       pc.addTrack(track, stream);
//   //     });
//   //   } else {
//   //     console.error("No local stream found to attach!");
//   //   }

//   //   const offer = await pc.createOffer();
//   //   await pc.setLocalDescription(offer);

//   //   console.log("📤 Emitting video-call-user");

//   //   socket.emit("call-user", {
//   //     receiverId: selectedUser.id,
//   //     offer,
//   //     type: "VIDEO",
//   //   });
//   //   console.log("📞 STARTING VIDEO CALL to:", selectedUser.id);
//   // };

//   // // ACCEPT CALL
//   // const acceptCall = async () => {
//   //   if (!incomingCall) return;

//   //   const { callerId, offer } = incomingCall;

//   //   activeRemoteRef.current = callerId;

//   //   const pc = createPeer(callerId);
//   //   const stream = await getCamera();

//   //   stream.getTracks().forEach((track) => {
//   //     pc.addTrack(track, stream);
//   //   });

//   //   await pc.setRemoteDescription(new RTCSessionDescription(offer));

//   //   const answer = await pc.createAnswer();
//   //   await pc.setLocalDescription(answer);

//   //   socket.emit("answer-call", { callerId, answer, type: "VIDEO" });

//   //   setIncomingCall(null);
//   //   setActiveCall(true);
//   //   setCalling(false);

//   //   console.log("Checking is incoming call hitting on receiver end or not ");
//   //   callTimeoutRef.current = setTimeout(() => {
//   //     endCall();
//   //   }, 30000);
//   // };

//   // START CALL
//   const startCall = async () => {
//     if (!socket || !selectedUser?.id) return;

//     setCalling(true);
//     activeRemoteRef.current = selectedUser.id;

//     callTimeoutRef.current = setTimeout(() => {
//       socket.emit("call-timeout", {
//         receiverId: activeRemoteRef.current,
//         type: "VIDEO",
//       });
//       handleCleanup();
//     }, 30000);

//     const pc = createPeer(selectedUser.id);
//     const stream = await getCamera();

//     if (stream) {
//       stream.getTracks().forEach((track) => {
//         console.log(`✅ Sender: Adding ${track.kind} track to PC`);
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
//   };

//   // ACCEPT CALL
//   const acceptCall = async () => {
//     if (!incomingCall) return;

//     const { callerId, offer } = incomingCall;
//     activeRemoteRef.current = callerId;

//     const pc = createPeer(callerId);
//     const stream = await getCamera();

//     if (stream) {
//       stream.getTracks().forEach((track) => {
//         console.log(`✅ Receiver: Adding ${track.kind} track to PC`);
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

//   // REJECT
//   const rejectCall = () => {
//     if (incomingCall) {
//       socket.emit("reject-call", {
//         callerId: incomingCall.callerId,
//         type: "VIDEO",
//       });
//     }
//     handleCleanup();
//   };

//   // END
//   const endCall = () => {
//     if (activeRemoteRef.current) {
//       socket.emit("end-call", {
//         targetId: activeRemoteRef.current,
//         type: "VIDEO",
//       });
//     }
//     handleCleanup();
//   };

//   // socket.on("ice-candidate", handleICEcandidate);

//   const handleCleanup = () => {
//     if (callTimeoutRef.current) {
//       clearTimeout(callTimeoutRef.current);
//       callTimeoutRef.current = null;
//     }
//     closeVideoCall();

//     peerRef.current?.close();
//     peerRef.current = null;

//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//     }
//     localStreamRef.current = null;

//     if (localVideoRef.current) {
//       localVideoRef.current.srcObject = null;
//     }

//     if (remoteVideoRef.current) {
//       remoteVideoRef.current.srcObject = null;
//     }
//     if (peerRef.current) {
//       peerRef.current.ontrack = null;
//       peerRef.current.onicecandidate = null;
//       peerRef.current.close();
//       peerRef.current = null;
//     }

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

//   // DURATION
//   useEffect(() => {
//     let interval;
//     if (activeCall) {
//       interval = setInterval(() => {
//         setCallDuration((prev) => {
//           const newTime = prev + 1;
//           durationRef.current = newTime;
//           return newTime;
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
//   };
// };

import { useEffect, useState, useRef } from "react";
import { closeVideoCall, toggleMute, toggleVideo } from "@/webrtc/video";

export const useVideoCall = (selectedUser) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(false);
  const [calling, setCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callEndedMessage, setCallEndedMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  // Refs for UI elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // WebRTC Refs
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const activeRemoteRef = useRef(null);

  // Utility Refs
  const callTimeoutRef = useRef(null);
  const durationRef = useRef(0);
  const isActiveCallRef = useRef(false);

  const handleToggle = () => {
    const muted = toggleMute();
    setIsMuted(muted);
  };

  const handleVideoToggle = () => {
    const videoOff = toggleVideo();
    setIsVideoOff(videoOff);
  };

  const socket = window.socket;

  // Sync ref with state for the incoming call handler
  useEffect(() => {
    isActiveCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    if (activeCall && remoteStreamRef.current && remoteVideoRef.current) {
      console.log(" Syncing buffered remote stream to video element");
      remoteVideoRef.current.srcObject = remoteStreamRef.current;

      // Force play for browsers with strict autoplay policies
      remoteVideoRef.current.play().catch((err) => {
        console.warn("Autoplay/Play was interrupted:", err);
      });
    }
  }, [activeCall]);

  const createPeer = (remoteId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.ontrack = (event) => {
      console.log("Remote track received", event.streams[0]);
      const incomingStream = event.streams[0];

      // 1. Save to buffer
      remoteStreamRef.current = incomingStream;

      // 2. Try to attach immediately if element exists
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = incomingStream;
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE Candidate");
        socket.emit("ice-candidate", {
          to: remoteId,
          candidate: event.candidate,
        });
      }
    };

    peerRef.current = pc;
    return pc;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      // Attach local stream with a retry interval in case ref isn't ready
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      } else {
        let retries = 0;
        const interval = setInterval(() => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            clearInterval(interval);
          }
          if (retries++ > 10) clearInterval(interval);
        }, 100);
      }
      return stream;
    } catch (error) {
      console.error("Error accessing camera/mic:", error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = ({ callerId, offer, type }) => {
      if (type !== "VIDEO" || isActiveCallRef.current) return;
      activeRemoteRef.current = callerId;
      setIncomingCall({ callerId, offer });
    };

    const handleAnswered = async ({ answer, type }) => {
      if (type !== "VIDEO") return;
      clearTimeout(callTimeoutRef.current);
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
      }
      setActiveCall(true);
      setCalling(false);
    };

    const handleRejected = ({ type }) => {
      if (type === "VIDEO") {
        setCallEndedMessage("User rejected the call");
        handleCleanup();
      }
    };

    const handleEnded = (type) => {
      if (type === "VIDEO") handleCleanup();
    };

    const handleICEcandidate = async ({ candidate }) => {
      try {
        if (peerRef.current && peerRef.current.remoteDescription && candidate) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error("Error adding received ICE candidate", error);
      }
    };

    socket.on("incoming-call", handleIncoming);
    socket.on("call-answered", handleAnswered);
    socket.on("call-rejected", handleRejected);
    socket.on("call-ended", handleEnded);
    socket.on("ice-candidate", handleICEcandidate);

    return () => {
      socket.off("incoming-call", handleIncoming);
      socket.off("call-answered", handleAnswered);
      socket.off("call-rejected", handleRejected);
      socket.off("call-ended", handleEnded);
      socket.off("ice-candidate", handleICEcandidate);
    };
  }, [socket]);

  const startCall = async () => {
    if (!socket || !selectedUser?.id) return;

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

    if (stream) {
      stream.getTracks().forEach((track) => {
        console.log(`Sender: Adding ${track.kind} track`);
        pc.addTrack(track, stream);
      });
    }

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
    activeRemoteRef.current = callerId;

    const pc = createPeer(callerId);
    const stream = await getCamera();

    if (stream) {
      stream.getTracks().forEach((track) => {
        console.log(`Receiver: Adding ${track.kind} track`);
        pc.addTrack(track, stream);
      });
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer-call", { callerId, answer, type: "VIDEO" });

    setIncomingCall(null);
    setActiveCall(true);
    setCalling(false);
  };

  const rejectCall = () => {
    if (incomingCall) {
      socket.emit("reject-call", {
        callerId: incomingCall.callerId,
        type: "VIDEO",
      });
    }
    handleCleanup();
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

  const handleCleanup = () => {
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    closeVideoCall();

    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    remoteStreamRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setCallEndedMessage(
      durationRef.current > 0
        ? `Call Ended • ${formatTime(durationRef.current)}`
        : "Call Ended",
    );
    setTimeout(() => setCallEndedMessage(""), 3000);

    setActiveCall(false);
    setCalling(false);
    setIncomingCall(null);
    setCallDuration(0);
    durationRef.current = 0;
    activeRemoteRef.current = null;
  };

  useEffect(() => {
    let interval;
    if (activeCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => {
          durationRef.current = prev + 1;
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  return {
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    incomingCall,
    activeCall,
    calling,
    callDuration: formatTime(callDuration),
    callEndedMessage,
    localVideoRef,
    remoteVideoRef,
    toggleMute: handleToggle,
    toggleVideo: handleVideoToggle,
    isMuted,
    isVideoOff,
  };
};
