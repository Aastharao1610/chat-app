// import { useEffect, useState, useRef } from "react";
// import {
//   addIceCandidateToPeer,
//   closeCall,
//   flushIceQuese,
//   toggleMute,
// } from "@/features/calls/webrtc/audio";
// import {
//   createPeerConnection,
//   getMicroPhone,
//   addLocalTracks,
//   getPeerConnection,
// } from "@/features/calls/webrtc/audio";

// export const useAudioCall = (selectedUser) => {
//   const [incomingCall, setIncomingCall] = useState(null);
//   const [activeCall, setActiveCall] = useState(false);
//   const [calling, setCalling] = useState(false);
//   const [callduration, setCallduration] = useState(0);
//   const [callEndedMessage, setCallEndedMessage] = useState("");
//   const [isMuted, setIsMuted] = useState(false);

//   const dialingAudio = useRef(null);
//   const ringtoneAudio = useRef(null);
//   const durationRef = useRef(0);
//   const callTimeOutRef = useRef(null);
//   const activeRemoteRef = useRef(null);

//   const handleToggle = () => {
//     const muted = toggleMute();
//     setIsMuted(muted);
//   };
//   const playSound = (type) => {
//     if (typeof window === "undefined") return;
//     if (type === "dialing") {
//       dialingAudio.current = new Audio("sounds/dialing.mp3");
//       dialingAudio.current.loop = true;
//       dialingAudio.current
//         .play()
//         .catch((e) => console.log("Sound play blocked"));
//     } else if (type === "ringtone") {
//       ringtoneAudio.current = new Audio("/sounds/ringing.mp3");
//       ringtoneAudio.current.loop = true;
//       ringtoneAudio.current
//         .play()
//         .catch((e) => console.log("Sound play blocked"));
//     }
//   };
//   const stopSounds = () => {
//     if (dialingAudio.current) {
//       dialingAudio.current.pause();
//       dialingAudio.current.currentTime = 0;
//       dialingAudio.current = null;
//     }
//     if (ringtoneAudio.current) {
//       ringtoneAudio.current.pause();
//       ringtoneAudio.current.currentTime = 0;
//       ringtoneAudio.current = null;
//     }
//   };
//   const formatTime = (seconds) => {
//     const hours = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;

//     const paddedMins = mins.toString().padStart(2, "0");
//     const paddedSecs = secs.toString().padStart(2, "0");

//     if (hours > 0) {
//       return `${hours.toString().padStart(2, "0")}:${paddedMins}:${paddedSecs}`;
//     }
//     return `${paddedMins}:${paddedSecs}`;
//   };
//   const startCall = async () => {
//     const socket = window.socket;
//     if (!socket || !selectedUser?.id) return;

//     activeRemoteRef.current = selectedUser.id;

//     //plays the dialing sound when call starts
//     setCalling(true);
//     playSound("dialing");

//     callTimeOutRef.current = setTimeout(() => {
//       console.log("Call timeout :No answer");
//       const socket = window.socket;
//       if (socket && activeRemoteRef.current) {
//         socket.emit("call-timeout", { receiverId: activeRemoteRef.current });
//       }

//       handleLocalCleanup();
//     }, 30000);
//     // create peer connection  on sender side
//     const pc = createPeerConnection(socket, selectedUser.id);
//     // gets the mic
//     await getMicroPhone();
//     addLocalTracks();

//     // Creates an offer (saying hey i want to call you)
//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);

//     // sends that offer  through the socket  to the other user
//     socket.emit("call-user", {
//       receiverId: selectedUser.id,
//       offer,
//       type: "AUDIO",
//     });

//     console.log("offer sent");
//   };
//   const acceptCall = async () => {
//     const socket = window.socket;
//     if (!incomingCall) return;
//     // when call is accepted souds stops
//     stopSounds();
//     const { callerId, offer } = incomingCall;
//     //set up the peer connection on peer side
//     const pc = createPeerConnection(socket, callerId);
//     console.log("Creating peer connection");
//     console.log(pc);
//     // get  microphone of recevier
//     await getMicroPhone();
//     addLocalTracks();

//     await pc.setRemoteDescription(new RTCSessionDescription(offer));
//     await flushIceQuese();
//     // create an answer for the offer
//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(answer);

//     // sends that back so that pipe is connected from the both end
//     socket.emit("answer-call", { callerId, answer, type: "AUDIO" });
//     setIncomingCall(null);
//     setActiveCall(true);

//     console.log("Answer Sent");
//   };
//   const rejectCall = async () => {
//     const socket = window.socket;
//     if (incomingCall) {
//       socket.emit("reject-call", { callerId: incomingCall.callerId });
//     }
//     handleLocalCleanup();
//   };

//   const endCall = () => {
//     const socket = window.socket;
//     if (!socket) return;

//     const targetId = activeRemoteRef.current;
//     console.log("Attempting to end call ,Target:", targetId);
//     console.log(`call ended by `);
//     if (targetId) {
//       console.log("Sending end-call to:", targetId);
//       socket.emit("end-call", { targetId, type: "AUDIO" });
//     } else {
//       console.warn("No active remote user to send end-call signal");
//     }

//     // Run the local cleanup
//     handleLocalCleanup();
//   };
//   const handleLocalCleanup = () => {
//     if (callTimeOutRef.current) {
//       clearTimeout(callTimeOutRef.current);
//       callTimeOutRef.current = null;
//     }
//     stopSounds();
//     closeCall();

//     setCallEndedMessage(`Call Ended • ${formatTime(callduration)}`);
//     setTimeout(() => setCallEndedMessage(""), 3000);

//     setActiveCall(false);
//     setCalling(false);
//     setIncomingCall(null);
//     setCallduration(0);
//     setIsMuted(false);
//     activeRemoteRef.current = null;
//   };
//   useEffect(() => {
//     const socket = window.socket;
//     if (!socket) return;

//     socket.on("incoming-call", ({ callerId, offer, type }) => {
//       if (type !== "AUDIO") return;
//       if (activeCall) {
//         socket.emit("user-busy", { callerId });
//         return;
//       }
//       activeRemoteRef.current = callerId;
//       setIncomingCall({ callerId, offer });
//       playSound("ringtone");
//     });

//     socket.on("call-answered", async ({ answer, type }) => {
//       if (type !== "AUDIO") return;
//       console.log(type);
//       if (callTimeOutRef.current) {
//         clearTimeout(callTimeOutRef.current);
//         callTimeOutRef.current = null;
//       }
//       const pc = getPeerConnection();
//       if (pc) {
//         await pc.setRemoteDescription(new RTCSessionDescription(answer));
//         await flushIceQuese();
//       }
//       setActiveCall(true);
//       setCalling(false);
//       stopSounds();
//     });
//     socket.on("user-busy", () => {
//       clearTimeout(callTimeOutRef.current);
//       stopSounds();
//       setCalling(false);
//       setCallEndedMessage("User is Busy");
//     });
//     socket.on("call-rejected", ({ type }) => {
//       if (type !== "AUDIO") return;

//       console.log("Audio call rejected");
//       setCallEndedMessage("Call Rejected");
//       handleCleanup();
//     });

//     socket.on("call-ended", () => {
//       console.log("Received call-ended signal from peer");
//       handleLocalCleanup();
//     });

//     socket.on("ice-candidate", async ({ candidate }) => {
//       await addIceCandidateToPeer(candidate);
//     });
//     return () => {
//       socket.off("incoming-call");
//       socket.off("call-answered");
//       socket.off("call-ended");
//       socket.off("ice-candidate");
//       socket.off("call-rejected");
//     };
//   }, []);
//   useEffect(() => {
//     let interval;
//     if (activeCall) {
//       setCallduration(0);
//       durationRef.current = 0;

//       interval = setInterval(() => {
//         setCallduration((prev) => {
//           const newTime = prev + 1;
//           durationRef.current = newTime;
//           return newTime;
//         });
//       }, 1000);
//     }
//     return () => {
//       clearInterval(interval);
//     };
//   }, [activeCall]);

//   return {
//     startCall,
//     acceptCall,
//     endCall,
//     incomingCall,
//     activeCall,
//     calling,
//     callEndedMessage,
//     callduration: formatTime(callduration),
//     isMuted,
//     toggleMute: handleToggle,
//     rejectCall,
//   };
// };

import { useEffect, useState, useRef } from "react";
import {
  addIceCandidateToPeer,
  closeCall,
  flushIceQuese,
  toggleMute,
  createPeerConnection,
  getMicroPhone,
  addLocalTracks,
  getPeerConnection,
} from "@/features/calls/webrtc/audio";

export const useAudioCall = (selectedUser) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(false);
  const [calling, setCalling] = useState(false);
  const [callduration, setCallduration] = useState(0);
  const [callEndedMessage, setCallEndedMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  // Refs for logic and persistence
  const dialingAudio = useRef(null);
  const ringtoneAudio = useRef(null);
  const durationRef = useRef(0);
  const callTimeOutRef = useRef(null);
  const activeRemoteRef = useRef(null);

  // CRITICAL: Ref to track active call state inside socket listeners
  const activeCallRef = useRef(false);

  // Sync the ref with the state
  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  const handleToggle = () => {
    const muted = toggleMute();
    setIsMuted(muted);
  };

  const playSound = (type) => {
    if (typeof window === "undefined") return;
    stopSounds(); // Clean up existing sounds before playing new ones

    try {
      if (type === "dialing") {
        dialingAudio.current = new Audio("/sounds/dialing.mp3");
        dialingAudio.current.loop = true;
        dialingAudio.current
          .play()
          .catch(() => console.log("Dialing play blocked"));
      } else if (type === "ringtone") {
        ringtoneAudio.current = new Audio("/sounds/ringing.mp3");
        ringtoneAudio.current.loop = true;
        ringtoneAudio.current
          .play()
          .catch(() => console.log("Ringtone play blocked"));
      }
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  };

  const stopSounds = () => {
    [dialingAudio, ringtoneAudio].forEach((ref) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
        ref.current = null;
      }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleLocalCleanup = () => {
    if (callTimeOutRef.current) {
      clearTimeout(callTimeOutRef.current);
      callTimeOutRef.current = null;
    }
    stopSounds();
    closeCall();

    setCallEndedMessage(`Call Ended • ${formatTime(durationRef.current)}`);
    setTimeout(() => setCallEndedMessage(""), 3000);

    setActiveCall(false);
    setCalling(false);
    setIncomingCall(null);
    setCallduration(0);
    durationRef.current = 0;
    setIsMuted(false);
    activeRemoteRef.current = null;
  };

  const startCall = async () => {
    const socket = window.socket;
    if (!socket || !selectedUser?.id) return;

    activeRemoteRef.current = selectedUser.id;
    setCalling(true);
    playSound("dialing");

    callTimeOutRef.current = setTimeout(() => {
      if (window.socket && activeRemoteRef.current) {
        window.socket.emit("call-timeout", {
          receiverId: activeRemoteRef.current,
          type: "AUDIO",
        });
      }
      handleLocalCleanup();
    }, 30000);

    const pc = createPeerConnection(socket, selectedUser.id);
    await getMicroPhone();
    addLocalTracks();

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call-user", {
      receiverId: String(selectedUser.id),
      offer,
      type: "AUDIO",
    });
  };

  const acceptCall = async () => {
    const socket = window.socket;
    if (!incomingCall) return;

    stopSounds();
    const { callerId, offer } = incomingCall;
    const pc = createPeerConnection(socket, callerId);

    await getMicroPhone();
    addLocalTracks();

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    await flushIceQuese();

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer-call", { callerId, answer, type: "AUDIO" });
    setIncomingCall(null);
    setActiveCall(true);
  };

  const rejectCall = async () => {
    if (incomingCall) {
      window.socket?.emit("reject-call", {
        callerId: incomingCall.callerId,
        type: "AUDIO",
      });
    }
    handleLocalCleanup();
  };

  const endCall = () => {
    const targetId = activeRemoteRef.current;
    if (window.socket && targetId) {
      window.socket.emit("end-call", { targetId, type: "AUDIO" });
    }
    handleLocalCleanup();
  };

  useEffect(() => {
    const socket = window.socket;
    if (!socket) return;

    const onIncomingCall = ({ callerId, offer, type }) => {
      console.log("Incoming signal hit frontend:", type);
      if (type !== "AUDIO") return;

      // Using Ref ensures we aren't using a stale 'false' value from first mount
      if (activeCallRef.current) {
        socket.emit("user-busy", { callerId });
        return;
      }

      activeRemoteRef.current = callerId;
      setIncomingCall({ callerId, offer });
      playSound("ringtone");
    };

    const onCallAnswered = async ({ answer, type }) => {
      if (type !== "AUDIO") return;
      if (callTimeOutRef.current) {
        clearTimeout(callTimeOutRef.current);
        callTimeOutRef.current = null;
      }
      const pc = getPeerConnection();
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushIceQuese();
      }
      setActiveCall(true);
      setCalling(false);
      stopSounds();
    };

    socket.on("incoming-call", onIncomingCall);
    socket.on("call-answered", onCallAnswered);
    socket.on("user-busy", () => {
      setCallEndedMessage("User is Busy");
      handleLocalCleanup();
    });
    socket.on("call-rejected", () => {
      setCallEndedMessage("Call Rejected");
      handleLocalCleanup();
    });
    socket.on("call-ended", () => handleLocalCleanup());
    socket.on("ice-candidate", async ({ candidate }) => {
      await addIceCandidateToPeer(candidate);
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("user-busy");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("ice-candidate");
    };
  }, [window.socket]); // Re-attach if socket instance changes

  useEffect(() => {
    let interval;
    if (activeCall) {
      interval = setInterval(() => {
        setCallduration((prev) => {
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
    endCall,
    incomingCall,
    activeCall,
    calling,
    callEndedMessage,
    callduration: formatTime(callduration),
    isMuted,
    toggleMute: handleToggle,
    rejectCall,
  };
};
