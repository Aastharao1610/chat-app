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
  const callTimeOutRef = useRef(null);
  const activeRemoteRef = useRef(null);

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
      ringtoneAudio.current.loop = true;
      ringtoneAudio.current
        .play()
        .catch((e) => console.log("Sound play blocked"));
    }
  };
  const stopSounds = () => {
    if (dialingAudio.current) {
      dialingAudio.current.pause();
      dialingAudio.current.currentTime = 0;
      dialingAudio.current = null;
    }
    if (ringtoneAudio.current) {
      ringtoneAudio.current.pause();
      ringtoneAudio.current.currentTime = 0;
      ringtoneAudio.current = null;
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
    const socket = window.socket;
    if (!socket || !selectedUser?.id) return;

    activeRemoteRef.current = selectedUser.id;

    //plays the dialing sound when call starts
    setCalling(true);
    playSound("dialing");

    callTimeOutRef.current = setTimeout(() => {
      console.log("Call timeout :No answer");
      const socket = window.socket;
      if (socket && activeRemoteRef.current) {
        socket.emit("call-timeout", { receiverId: activeRemoteRef.current });
      }

      handleLocalCleanup();
    }, 30000);
    // create peer connection  on sender side
    const pc = createPeerConnection(socket, selectedUser.id);
    // gets the mic
    await getMicroPhone();
    addLocalTracks();

    // Creates an offer (saying hey i want to call you)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // sends that offer  through the socket  to the other user
    socket.emit("call-user", {
      receiverId: selectedUser.id,
      offer,
      type: "AUDIO",
    });

    console.log("offer sent");
  };
  const acceptCall = async () => {
    const socket = window.socket;
    if (!incomingCall) return;
    // when call is accepted souds stops
    stopSounds();
    const { callerId, offer } = incomingCall;
    //set up the peer connection on peer side
    const pc = createPeerConnection(socket, callerId);
    console.log("Creating peer connection");
    console.log(pc);
    // get  microphone of recevier
    await getMicroPhone();
    addLocalTracks();

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    await flushIceQuese();
    // create an answer for the offer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // sends that back so that pipe is connected from the both end
    socket.emit("answer-call", { callerId, answer, type: "AUDIO" });
    setIncomingCall(null);
    setActiveCall(true);

    console.log("Answer Sent");
  };
  const rejectCall = async () => {
    const socket = window.socket;
    if (incomingCall) {
      socket.emit("reject-call", { callerId: incomingCall.callerId });
    }
    handleLocalCleanup();
  };

  const endCall = () => {
    const socket = window.socket;
    if (!socket) return;

    const targetId = activeRemoteRef.current;

    if (targetId) {
      console.log("Sending end-call to:", targetId);
      socket.emit("end-call", { targetId, type: "AUDIO" });
    }

    // Run the local cleanup
    handleLocalCleanup();
  };
  const handleLocalCleanup = () => {
    if (callTimeOutRef.current) {
      clearTimeout(callTimeOutRef.current);
      callTimeOutRef.current = null;
    }
    stopSounds();
    closeCall();

    setCallEndedMessage(`Call Ended • ${formatTime(callduration)}`);
    setTimeout(() => setCallEndedMessage(""), 3000);

    setActiveCall(false);
    setCalling(false);
    setIncomingCall(null);
    setCallduration(0);
    setIsMuted(false);
    activeRemoteRef.current = null;
  };
  useEffect(() => {
    const socket = window.socket;
    if (!socket) return;

    socket.on("incoming-call", ({ callerId, offer, type }) => {
      if (type !== "AUDIO") return;
      if (activeCall) {
        socket.emit("user-busy", { callerId });
        return;
      }
      activeRemoteRef.current = callerId;
      setIncomingCall({ callerId, offer });
      playSound("ringtone");
    });

    socket.on("call-answered", async ({ answer, type }) => {
      if (type !== "AUDIO") return;
      console.log(type);
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
    });
    socket.on("user-busy", () => {
      clearTimeout(callTimeOutRef.current);
      stopSounds();
      setCalling(false);
      setCallEndedMessage("User is Busy");
    });
    socket.on("call-rejected", ({ type }) => {
      if (type !== "AUDIO") return;

      console.log("Audio call rejected");
      setCallEndedMessage("Call Rejected");
      handleCleanup();
    });

    socket.on("call-ended", () => {
      console.log("Received call-ended signal from peer");
      handleLocalCleanup();
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      await addIceCandidateToPeer(candidate);
    });
    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("call-ended");
      socket.off("ice-candidate");
      socket.off("call-rejected");
    };
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
