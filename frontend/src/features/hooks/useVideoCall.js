import { useEffect, useState, useRef } from "react";
import {
  addLocalVideoTracks,
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
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Refs for UI
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // WebRTC Refs
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const activeRemoteRef = useRef(null);
  const iceQueueRef = useRef([]);
  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  // Utility Refs
  const callTimeoutRef = useRef(null);
  const durationRef = useRef(0);
  const isActiveCallRef = useRef(false);

  const socket = window.socket;

  const handleCleanup = (msg) => {
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsScreenSharing(false);

    peerRef.current = null;
    localStreamRef.current = null;
    cameraStreamRef.current = null;
    screenStreamRef.current = null;
    remoteStreamRef.current = null;
    iceQueueRef.current = [];

    setCallEndedMessage(
      msg ||
        (durationRef.current > 0
          ? `Call Ended • ${formatTime(durationRef.current)}`
          : "Call Ended"),
    );
    setActiveCall(false);
    setCalling(false);
    setIncomingCall(null);
    setCallDuration(0);
    durationRef.current = 0;
    setIsMuted(false);
    setIsVideoOff(false);

    setTimeout(() => {
      setCallEndedMessage("");
    }, 3000);
  };
  useEffect(() => {
    if (!socket) return;
  });

  useEffect(() => {
    if (localStreamRef.current && localVideoRef.current && !isVideoOff) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    if (
      remoteStreamRef.current &&
      remoteVideoRef.current &&
      !isRemoteVideoOff
    ) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [activeCall, isVideoOff, isRemoteVideoOff]);

  const createPeer = (remoteId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;

      if (state === "disconnected" || state === "failed") {
        handleCleanup("Connection lost");
      }

      if (state === "closed") {
        handleCleanup();
      }
    };
    pc.ontrack = (event) => {
      console.log("Remote track:", event.track.kind);

      remoteStreamRef.current = event.streams[0];

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
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

  // HELPER FUNCTIONS
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
      // if (localStreamRef.current) return localStreamRef.current;
      if (cameraStreamRef.current) return cameraStreamRef.current;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      cameraStreamRef.current = stream;
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  //  SOCKET LISTENERS
  useEffect(() => {
    if (!socket) return;
    isActiveCallRef.current = activeCall;

    const handleIncoming = ({ callerId, offer, type, name, email }) => {
      if (type !== "VIDEO" || isActiveCallRef.current) return;
      activeRemoteRef.current = callerId;
      setIncomingCall({
        callerId,
        offer,
        name: name,
        email: email,
      });
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

    socket.on("call-timeout", () => {
      handleCleanup("Call Missed");
    });
    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("toggle-video");
      socket.off("call-timeout");
    };
  }, [socket, activeCall]);
  console.log(selectedUser, "testing of slelcted user");
  console.log(selectedUser.name, "selected user name");
  // --- 5. CALL ACTIONS ---
  const startCall = async () => {
    if (!selectedUser?.id) return;
    setCalling(true);
    activeRemoteRef.current = selectedUser.id;

    const pc = createPeer(selectedUser.id);
    const stream = await getCamera();
    if (pc && stream) {
      addLocalVideoTracks(pc, stream);
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

  const formatCallDuration = (seconds) => {
    if (!seconds || seconds <= 0) {
      return "00:00";
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };
  const formatTime = (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  console.log("TESTTT");

  // const screenShare = async () => {
  //   try {
  //     if (isScreenSharing) return;

  //     const screenStream = await navigator.mediaDevices.getDisplayMedia({
  //       video: true,
  //     });

  //     const screenTrack = screenStream.getVideoTracks()[0];
  //     const pc = peerRef.current;

  //     if (pc) {
  //       const sender = pc
  //         .getSenders()
  //         .find((s) => s.track && s.track.kind === "video");

  //       if (sender) {
  //         await sender.replaceTrack(screenTrack);
  //       }
  //     }

  //     setIsScreenSharing(true);

  //     screenTrack.onended = async () => {
  //       const cameraTrack = localStreamRef.current?.getVideoTracks()[0];

  //       if (pc) {
  //         const sender = pc
  //           .getSenders()
  //           .find((s) => s.track && s.track.kind === "video");

  //         if (sender && cameraTrack) {
  //           await sender.replaceTrack(cameraTrack);
  //         }
  //       }

  //       // stop screen stream properly
  //       screenStream.getTracks().forEach((track) => track.stop());

  //       setIsScreenSharing(false);
  //     };
  //   } catch (err) {
  //     console.error("Screen share error:", err);
  //   }
  // };

  const screenShare = async () => {
    try {
      if (!cameraStreamRef.current) return;
      const pc = peerRef.current;
      if (!pc) return;

      if (isScreenSharing) {
        stopScreenShare();
        return;
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      screenStreamRef.current = screenStream;

      const sender = pc
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");

      if (sender) {
        await sender.replaceTrack(screenTrack);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      setIsScreenSharing(true);

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const stopScreenShare = async () => {
    const pc = peerRef.current;
    const cameraStream = cameraStreamRef.current;
    const screenStream = screenStreamRef.current;

    if (!pc || !cameraStream) return;

    const cameraTrack = cameraStream.getVideoTracks()[0];

    const sender = pc
      .getSenders()
      .find((s) => s.track && s.track.kind === "video");

    if (sender && cameraTrack) {
      await sender.replaceTrack(cameraTrack);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = cameraStream;
    }

    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    setIsScreenSharing(false);
  };

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
    screenShare,
    setIsScreenSharing,
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
