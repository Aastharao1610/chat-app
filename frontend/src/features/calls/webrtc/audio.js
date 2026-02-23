let iceQueue = [];
let peerConnection = null;
let localStream = null;
let activeSocket = null;
let activeTarget = null;

//connecting local comp to peer
export const createPeerConnection = (socket, targetUserId) => {
  activeSocket = socket;
  activeTarget = targetUserId;

  // iceServer it uses a google "STUN" server ,Its like a mirror that tells our computer  its own public IP address  so the other  person can find it.
  peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
  //this send our "ADDRESS" to the other person via the socket
  peerConnection.onicecandidate = (event) => {
    if (event.candidate && activeSocket) {
      activeSocket.emit("ice-candidate", {
        to: activeTarget,
        candidate: event.candidate,
      });
    }
  };
  // when other person's audio arrives , ontrack created an invisible audio player and plays their voice
  peerConnection.ontrack = (event) => {
    console.log("Remote audio recevied");
    const remoteAudio = new Audio();
    remoteAudio.srcObject = event.streams[0];
    remoteAudio.play();
  };
  return peerConnection;
};

//Asks the user for permission for mic, it returns the stream
export const getMicroPhone = async () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!navigator?.mediaDevices?.getUserMedia) {
    throw new Error("getUserMedia not available");
  }

  localStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
  console.log(localStream);

  return localStream;
};

//Take that mic and plugs it into the peer Connection  pipe so other person can hear me
export const addLocalTracks = () => {
  if (!peerConnection || !localStream) return;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
};
//connecting one peer to another
export const getPeerConnection = () => peerConnection;

// If the connection is ready, add the neighbor's address immediately. If not, put it in the iceQueue
export const addIceCandidateToPeer = async (candidate) => {
  if (!peerConnection) return;
  if (peerConnection.remoteDescription) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } else {
    console.log("Remote Description not set , queueing ICE");
    iceQueue.push(candidate);
  }
};
// once the connection is ready  this empties the waiting room and process all stored address
export const flushIceQuese = async () => {
  if (!peerConnection) return;

  console.log("Flushing ice Queue ", iceQueue.length);

  for (const candidate of iceQueue) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
  iceQueue = [];
};

//function for mute and unmute
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

//close the call
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
