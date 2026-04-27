import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/signaling',
})
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // Lưu publisher (Jetson) socket id
    private publisherSocketId: string | null = null;

    handleDisconnect(client: Socket) {
        if (this.publisherSocketId === client.id) {
            this.publisherSocketId = null;
            this.server.emit('publisher-disconnected');
            console.log('Publisher disconnected');
        }
        console.log(`Client disconnected: ${client.id}`);
    }
    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    @SubscribeMessage('register-publisher')
    handleRegisterPublisher(@ConnectedSocket() client: Socket) {
        this.publisherSocketId = client.id;
        client.emit('registed', { role: 'publisher' });
        this.server.emit('publisher-ready');
        console.log(`Publisher registered: ${client.id}`);
    }


    @SubscribeMessage('check-publisher')
    handleCheckPublisher(@ConnectedSocket() client: Socket) {
        console.log(`Check publisher: available=${this.publisherSocketId !== null}`);
        client.emit('publisher-status', {
            available: this.publisherSocketId !== null,
        });
    }

    @SubscribeMessage('offer')
    handleOffer(@MessageBody() data: { sdp: RTCSessionDescriptionInit, viewerId: string }, @ConnectedSocket() client: Socket) {
        if(!this.publisherSocketId) {
            client.emit('error', { message: 'No publisher available' });
            return;
        }

        this.server.to(this.publisherSocketId).emit('offer', {
            sdp: data.sdp,
            viewerId: client.id,
        });
    }


    @SubscribeMessage('answer')
    handleAnswer(@MessageBody() data: { sdp: RTCSessionDescriptionInit; viewerId: string }) {
        this.server.to(data.viewerId).emit('answer', { sdp: data.sdp });
    }

    @SubscribeMessage('ice-candidate')
    handleIceCandidate(@MessageBody() data: { candidate: RTCIceCandidateInit; targetId: string }, @ConnectedSocket() client: Socket) {
        const isPublisher = this.publisherSocketId === client.id;
        if (isPublisher) {
            if (data.targetId) {
                this.server.to(data.targetId).emit('ice-candidate', {
                    candidate: data.candidate,
                    fromId: client.id
                })
            }
        } else {
            this.server.to(String(this.publisherSocketId)).emit('ice-candidate', {
                candidate: data.candidate,
                fromId: client.id
            });
        }
    }

}