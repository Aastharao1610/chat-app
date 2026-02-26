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

    socket.on("call-timeout", () => {
      setCallEndedMessage("Call Missed");
      handleLocalCleanup();
    });
    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("user-busy");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("ice-candidate");
      socket.off("call-timeout");
    };
  }, []); // Re-attach if socket instance changes

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
