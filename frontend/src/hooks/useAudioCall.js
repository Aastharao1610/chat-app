import { useEffect, useState, useRef } from "react";
import {
  addIceCandidateToPeer,
  closeCall,
  flushIceQuese,
  toggleMute,
} from "@/webrtc/audio";

import {
  createPeerConnection,
  getMicroPhone,
  addLocalTracks,
  getPeerConnection,
} from "@/webrtc/audio";

export const useAudioCall = (selectedUser) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(false);
  const [calling, setCalling] = useState(false);
  const [callduration, setCallduration] = useState(0);
  const [callEndedMessage, setCallEndedMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  const dialingAudio = useRef(null);
  const ringtoneAudio = useRef(null);
  const durationRef = useRef(0);

  const handleToggle = () => {
    const muted = toggleMute();
    setIsMuted(muted);
  };

  const playSound = (type) => {
    if (typeof window === "undefined") return;
    if (type === "dialing") {
      dialingAudio.current = new Audio("sounds/dialing.mp3");
      dialingAudio.current.loop = true;
      dialingAudio.current
        .play()
        .catch((e) => console.log("Sound play blocked"));
    } else if (type === "ringtone") {
      ringtoneAudio.current = new Audio("/sounds/ringing.mp3");
      dialingAudio.current.loop = true;
      ringtoneAudio.current
        .play()
        .catch((e) => console.log("Sound play blocked"));
    }
  };
  const stopSounds = () => {
    if (dialingAudio.current) {
      dialingAudio.current.pause();
      dialingAudio.current = null;
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const paddedMins = mins.toString().padStart(2, "0");
    const paddedSecs = secs.toString().padStart(2, "0");

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${paddedMins}:${paddedSecs}`;
    }
    return `${paddedMins}:${paddedSecs}`;
  };

  const startCall = async () => {
    playSound("dialing");
    const socket = window.socket;
    if (!socket || !selectedUser?.id) return;

    setCalling(true);
    const pc = createPeerConnection(socket, selectedUser.id);

    await getMicroPhone();
    addLocalTracks();

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call-user", {
      receiverId: selectedUser.id,
      offer,
    });

    console.log("offer sent");
  };

  useEffect(() => {
    const socket = window.socket;
    if (!socket) return;

    socket.on("incoming-call", ({ callerId, offer }) => {
      console.log("Incoming call from:", callerId);
      setIncomingCall({ callerId, offer });
      playSound("ringtone");
    });

    return () => socket.off("incoming-call");
  }, []);

  const acceptCall = async () => {
    stopSounds();
    const socket = window.socket;
    if (!incomingCall) return;

    const { callerId, offer } = incomingCall;

    const pc = createPeerConnection(socket, callerId);
    console.log("Creating peer connection");
    console.log(pc);
    await getMicroPhone();
    addLocalTracks();

    await pc.setRemoteDescription(
      new RTCSessionDescription(incomingCall.offer),
    );
    await flushIceQuese();

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer-call", {
      callerId: incomingCall.callerId,
      answer,
    });
    setIncomingCall(null);
    setActiveCall(true);

    console.log("Answer Sent");
  };

  useEffect(() => {
    const socket = window.socket;
    if (!socket) return;

    socket.on("call-answered", async ({ answer }) => {
      const pc = getPeerConnection();
      if (!pc) return;

      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      await flushIceQuese();
      setActiveCall(true);
      setCalling(false);
      stopSounds();

      console.log("🎉 Call fully connected");
    });

    return () => socket.off("call-answered");
  }, []);

  useEffect(() => {
    const socket = window.socket;
    if (!socket) return;

    socket.on("ice-candidate", async ({ candidate }) => {
      await addIceCandidateToPeer(candidate);
    });

    return () => socket.off("ice-candidate");
  }, []);

  useEffect(() => {
    const socket = window.socket;
    if (!socket) return;

    socket.on("call-ended", () => {
      const finalTime = durationRef.current;

      setCallEndedMessage(`Call Ended • ${formatTime(finalTime)}`);
      console.log(formatTime(finalTime), "call duration");

      closeCall();
      setActiveCall(false);
      setCalling(false);
      setCallduration(0);
    });

    return () => socket.off("call-ended");
  }, []);

  useEffect(() => {
    let interval;
    if (activeCall) {
      setCallduration(0);
      durationRef.current = 0;

      interval = setInterval(() => {
        setCallduration((prev) => {
          const newTime = prev + 1;
          durationRef.current = newTime;
          return newTime;
        });
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [activeCall]);

  const endCall = () => {
    const socket = window.socket;
    if (!socket) return;

    const targetId = activeCall ? selectedUser?.id : incomingCall?.callerId;

    if (targetId) {
      console.log("Sending end-call to:", targetId);
      socket.emit("end-call", { targetId });
    }

    // Run the local cleanup
    handleLocalCleanup();
  };

  const handleLocalCleanup = () => {
    const finalTime = durationRef.current;
    setCallEndedMessage(`Call Ended • ${formatTime(callduration)}`);

    setTimeout(() => setCallEndedMessage(""), 3000);

    closeCall();
    setActiveCall(false);
    setCalling(false);
    setIncomingCall(null);
    setCallduration(0);
    setIsMuted(false);
    stopSounds();
  };
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
  };
};
