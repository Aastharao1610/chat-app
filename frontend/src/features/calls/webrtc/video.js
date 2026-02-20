let peerConnection = null;
let localStream = null;

export const createVideoPeerConnection = (socket, remoteSocketId) => {
  peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("video:ice-candidate", {
        to: remoteSocketId,
        candidate: event.candidate,
      });
    }
  };

  return peerConnection;
};
export const getmicrophone = async () => {
  if (typeof window === "undefined") {
    return null;
  }
  if (!navigator?.mediaDevices?.getUserMedia) {
    throw new Error("getUserMedia not available");
  }
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  console.log(localStream);
  return localStream;
};

export const getCameraStream = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  return localStream;
};

export const addLocalVideoTracks = (stream) => {
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });
};

export const closeVideoCall = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }
};

export const toggleMute = (stream) => {
  if (!stream) return false;

  const audioTrack = stream.getTracks().find((track) => track.kind === "audio");

  if (!audioTrack) return false;

  audioTrack.enabled = !audioTrack.enabled;

  console.log("Mic Muted:", !audioTrack.enabled);

  return !audioTrack.enabled;
};

export const toggleVideo = (stream) => {
  if (!stream) return false;

  const videoTrack = stream.getTracks().find((track) => track.kind === "video");

  if (!videoTrack) return false;

  videoTrack.enabled = !videoTrack.enabled;
  console.log("Video Off:", !videoTrack.enabled);

  return !videoTrack.enabled;
};
