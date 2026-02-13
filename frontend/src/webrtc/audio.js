let iceQueue = [];
let peerConnection = null;
let localStream = null;
let activeSocket = null;
let activeTarget = null;

//connecting local comp to peer
export const createPeerConnection = (socket, targetUserId) => {
  activeSocket = socket;
  activeTarget = targetUserId;

  peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
  peerConnection.onicecandidate = (event) => {
    if (event.candidate && activeSocket) {
      activeSocket.emit("ice-candidate", {
        targetUserId: activeTarget,
        candidate: event.candidate,
      });
    }
  };

  peerConnection.ontrack = (event) => {
    console.log("Remote audio recevied");
    const remoteAudio = new Audio();
    remoteAudio.srcObject = event.streams[0];
    remoteAudio.play();
  };
  return peerConnection;
};

//get microhpone
export const getMicroPhone = async () => {
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

//add local tracks
export const addLocalTracks = () => {
  if (!peerConnection || !localStream) return;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
};
//connecting one peer to another
export const getPeerConnection = () => peerConnection;

export const addIceCandidateToPeer = async (candidate) => {
  if (!peerConnection) return;
  if (peerConnection.remoteDescription) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } else {
    console.log("Remote Description not set , queueing ICE");
    iceQueue.push(candidate);
  }
};

export const flushIceQuese = async () => {
  if (!peerConnection) return;

  console.log("Flushing ice Queue ", iceQueue.length);

  for (const candidate of iceQueue) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
  iceQueue = [];
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

//clise the call
export const closeCall = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }
};
