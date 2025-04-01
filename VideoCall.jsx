import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

const VideoCall = ({ socket }) => {
  const [stream, setStream] = useState(null);
  const myVideo = useRef();
  const peerVideo = useRef();
  const peerRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    });

    socket.on("callUser", (signal) => {
      peerRef.current = new Peer({ initiator: false, trickle: false, stream });
      peerRef.current.signal(signal);
      peerRef.current.on("stream", (peerStream) => {
        if (peerVideo.current) {
          peerVideo.current.srcObject = peerStream;
        }
      });
    });

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [socket]);

  const startCall = () => {
    peerRef.current = new Peer({ initiator: true, trickle: false, stream });
    peerRef.current.on("signal", (data) => {
      socket.emit("callUser", data);
    });
    peerRef.current.on("stream", (peerStream) => {
      if (peerVideo.current) {
        peerVideo.current.srcObject = peerStream;
      }
    });
  };

  return (
    <div>
      <video ref={myVideo} autoPlay muted />
      <video ref={peerVideo} autoPlay />
      <button onClick={startCall}>Start Call</button>
    </div>
  );
};

export default VideoCall;
