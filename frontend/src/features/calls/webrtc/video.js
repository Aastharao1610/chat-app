export const createVideoPeerConnection = (socket, remoteSocketId) => {
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", {
        to: remoteSocketId,
        candidate: event.candidate,
      });
    }
  };

  return peerConnection;
};

export const addLocalVideoTracks = (peerConnection, stream) => {
  if (!peerConnection || !stream) return;
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });
};

export const closeVideoCall = (peerConnection, stream) => {
  if (peerConnection) {
    peerConnection.close();
  }
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};

export const getCameraStream = async () => {
  return await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
};

export const toggleMute = (stream) => {
  if (!stream) return false;
  const audioTrack = stream.getAudioTracks()[0];
  if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
  console.log("Mic Muted:", !audioTrack.enabled);
  return !audioTrack.enabled;
};

export const toggleVideo = (stream) => {
  if (!stream) return false;
  const videoTrack = stream.getVideoTracks()[0];

  if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
  console.log("Video Off:", !videoTrack.enabled);

  return !videoTrack.enabled;
};
