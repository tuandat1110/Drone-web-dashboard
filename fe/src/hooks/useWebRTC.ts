import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

export type WebRTCState = 
    | 'idle'
    | 'connecting'
    | 'waiting-publisher'
    | 'negotiating'
    | 'live'
    | 'disconnected'
    | 'error';

interface UseWebRTCOptions {
    signalingUrl: string;
    autoConnect?: boolean;
}

interface UseWebRTCReturn {
    stream: MediaStream | null;
    status: WebRTCState;
    connect: () => void;
    disconnect: () => void;
}

export function useWebRTC({ signalingUrl, autoConnect = true }: UseWebRTCOptions): UseWebRTCReturn {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [status, setStatus] = useState<WebRTCState>('idle');
    const socketRef = useRef<Socket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    const cleanup = useCallback(() => {
        pcRef.current?.close();
        pcRef.current = null;
        setStream(null);
    }, []);

    const startNegotiation = useCallback(async (socket: Socket) => {
        setStatus('negotiating');
        cleanup();

        const pc = new RTCPeerConnection();  // LAN — không cần ICE server
        pcRef.current = pc;

        pc.ontrack = (event) => {
            console.log('[WebRTC] Got track!', event.streams);
            setStream(event.streams[0] ?? null);
            setStatus('live');
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('[WebRTC] Sending ICE candidate');
                socket.emit('ice-candidate', {
                    candidate: event.candidate.toJSON(),
                });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('[WebRTC] Connection state:', pc.connectionState);
            if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                setStatus('disconnected');
                cleanup();
            }
        };

        const offer = await pc.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: false });
        await pc.setLocalDescription(offer);
        console.log('[WebRTC] Sending offer');
        socket.emit('offer', { sdp: pc.localDescription });
    }, [cleanup]);

    const connect = useCallback(() => {
        if (socketRef.current?.connected) return;
        setStatus('connecting');
        console.log('[Socket] Connecting to', signalingUrl);

        // ← Dùng thẳng io() với full URL có namespace
        const socket: Socket = io(signalingUrl, {
            transports: ['websocket'],
            forceNew: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Socket] Connected! id=', socket.id);
            setStatus('waiting-publisher');
            socket.emit('check-publisher');
        });

        socket.on('connect_error', (e) => {
            console.error('[Socket] Connect error:', e.message);
            setStatus('error');
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
            setStatus('disconnected');
            cleanup();
        });

        socket.on('publisher-ready', () => {
            console.log('[Socket] Publisher ready → start negotiation');
            startNegotiation(socket);
        });

        socket.on('publisher-status', (data: { available: boolean }) => {
            console.log('[Socket] Publisher status:', data.available);
            if (data.available) {
                startNegotiation(socket);  // Publisher đã có sẵn → offer luôn
            }
        });

        socket.on('publisher-disconnected', () => {
            console.log('[Socket] Publisher disconnected');
            setStatus('waiting-publisher');
            cleanup();
        });

        socket.on('answer', async (data: { sdp: RTCSessionDescriptionInit }) => {
            console.log('[WebRTC] Got answer');
            const pc = pcRef.current;
            if (!pc) return;
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        });

        socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
            const pc = pcRef.current;
            if (!pc) return;
            try {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (e) {
                console.warn('[WebRTC] addIceCandidate error:', e);
            }
        });

    }, [signalingUrl, cleanup, startNegotiation]);

    const disconnect = useCallback(() => {
        socketRef.current?.disconnect();
        socketRef.current = null;
        cleanup();
        setStatus('idle');
    }, [cleanup]);

    useEffect(() => {
        if (autoConnect) connect();
        return () => {
            socketRef.current?.disconnect();
            cleanup();
        };
    }, []);

    return { stream, status, connect, disconnect };
}