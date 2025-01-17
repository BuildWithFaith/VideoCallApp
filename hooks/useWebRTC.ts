import { useState, useEffect, useRef, useCallback } from 'react'
import { Peer, MediaConnection } from 'peerjs'

export function useWebRTC() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [peer, setPeer] = useState<Peer | null>(null)
  const [peerId, setPeerId] = useState<string>('')
  const [call, setCall] = useState<MediaConnection | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // Initialize media devices
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error)
        throw new Error('Failed to access camera/microphone. Please make sure they are connected and permissions are granted.')
      })

    return () => {
      localStream?.getTracks().forEach(track => track.stop())
      peer?.destroy()
    }
  }, [])

  // Initialize PeerJS
  const initializePeer = useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      try {
        const newPeer = new Peer({
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        })

        newPeer.on('open', (id) => {
          setPeerId(id)
          setPeer(newPeer)
          resolve(id)
        })

        newPeer.on('error', (error) => {
          console.error('PeerJS error:', error)
          reject(error)
        })

        newPeer.on('call', (incomingCall) => {
          if (localStream) {
            incomingCall.answer(localStream)
            setCall(incomingCall)

            incomingCall.on('stream', (remoteVideoStream) => {
              setRemoteStream(remoteVideoStream)
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteVideoStream
              }
            })

            incomingCall.on('close', () => {
              setRemoteStream(null)
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null
              }
            })

            incomingCall.on('error', (error) => {
              console.error('Call error:', error)
              setRemoteStream(null)
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null
              }
            })
          }
        })

        newPeer.on('disconnected', () => {
          console.log('Peer disconnected')
          setRemoteStream(null)
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null
          }
        })

      } catch (error) {
        console.error('Error initializing peer:', error)
        reject(error)
      }
    })
  }, [localStream])

  // Start a call (caller's perspective)
  const startCall = useCallback(async () => {
    setIsConnecting(true)
    try {
      const id = await initializePeer()
      return id
    } catch (error) {
      console.error('Error starting call:', error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }, [initializePeer])

  // Join a call (callee's perspective)
  const joinCall = useCallback(async (remotePeerId: string) => {
    if (!peer && !isConnecting) {
      await initializePeer()
    }

    if (!localStream || !peer) {
      throw new Error('Local stream or peer not initialized')
    }

    try {
      const outgoingCall = peer.call(remotePeerId, localStream)
      setCall(outgoingCall)

      outgoingCall.on('stream', (remoteVideoStream) => {
        setRemoteStream(remoteVideoStream)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteVideoStream
        }
      })

      outgoingCall.on('close', () => {
        setRemoteStream(null)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null
        }
      })

      outgoingCall.on('error', (error) => {
        console.error('Call error:', error)
        setRemoteStream(null)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null
        }
      })
    } catch (error) {
      console.error('Error joining call:', error)
      throw error
    }
  }, [peer, localStream, isConnecting, initializePeer])

  // End the call
  const endCall = useCallback(() => {
    call?.close()
    setCall(null)
    setRemoteStream(null)
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
  }, [call])

  return {
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    startCall,
    joinCall,
    endCall,
    peerId,
    isConnecting
  }
}

