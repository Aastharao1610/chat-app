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

export const toggleMute = () => {
  if (!localStream) return false;

  const audioTrack = localStream
    .getTracks()
    .find((track) => track.kind === "audio");

  if (!audioTrack) return false;

  audioTrack.enabled = !audioTrack.enabled;

  console.log("Mic Muted:", !audioTrack.enabled);

  return !audioTrack.enabled;
};

export const toggleVideo = () => {
  if (!localStream) return false;

  const videoTrack = localStream
    .getTracks()
    .find((track) => track.kind === "video");

  if (!videoTrack) return false;

  videoTrack.enabled = !videoTrack.enabled;
  console.log("Video Off:", !videoTrack.enabled);

  return !videoTrack.enabled;
};
