import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { DevicesService } from "src/devices/devices.service";

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/signaling',
})
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // deviceId → socket của Jetson
    private deviceSockets = new Map<number, Socket>();

    constructor(
        private deviceService: DevicesService,
        private jwtService: JwtService,
    ) {}

    async handleConnection(client: Socket) {
        const token = client.handshake.auth?.token;
        const type  = client.handshake.auth?.type;
        console.log("connection");

        if (type === 'device') {
            // Jetson xác thực bằng session token
            console.log("device");
            const deviceId = this.deviceService.getDeviceIdBySession(token);
            if (!deviceId) {
                console.warn(`Device auth failed: invalid session token`);
                return client.disconnect();
            }

            client.data.deviceId = deviceId;
            client.data.type = 'device';
            this.deviceSockets.set(deviceId, client);

            // Thông báo cho các viewer đang chờ device này
            this.server.to(`viewer_${deviceId}`).emit('publisher-ready');
            console.log(`Device ${deviceId} connected [${client.id}]`);

        } else if (type === 'viewer') {
            console.log("viewer");
            try {
                const payload = this.jwtService.verify(token);
                const deviceId = +client.handshake.auth?.deviceId;

                if (!deviceId || isNaN(deviceId)) {
                    console.warn(`Viewer missing deviceId`);
                    return client.disconnect();
                }

                // await ở đây — thiếu cái này là bug cũ
                const device = await this.deviceService.findDeviceOfUser(deviceId, payload.sub);
                if (!device) {
                    console.warn(`User ${payload.sub} không có quyền xem device ${deviceId}`);
                    return client.disconnect();
                }

                client.data.userId   = payload.sub;
                client.data.deviceId = deviceId;
                client.data.type     = 'viewer';
                client.join(`viewer_${deviceId}`);

                // Thông báo ngay trạng thái device cho viewer vừa kết nối
                const deviceSocket = this.deviceSockets.get(deviceId);
                client.emit('publisher-status', { available: !!deviceSocket });

                console.log(`User ${payload.sub} viewing device ${deviceId} [${client.id}]`);
            } catch (e) {
                console.warn(`Viewer auth failed:`, e);
                client.disconnect();
            }

        } else {
            console.warn(`Unknown connection type: ${type}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const { type, deviceId } = client.data ?? {};

        if (type === 'device' && deviceId) {
            this.deviceSockets.delete(deviceId);
            // Báo cho tất cả viewer đang xem device này
            this.server.to(`viewer_${deviceId}`).emit('publisher-disconnected');
            // Cập nhật status offline trong DB
            this.deviceService.setDeviceOffline(deviceId);
            console.log(`Device ${deviceId} disconnected`);
        }

        console.log(`Client disconnected: ${client.id}`);
    }

    // Viewer hỏi device có online không (dùng khi vừa mở dashboard)
    @SubscribeMessage('check-publisher')
    handleCheckPublisher(@ConnectedSocket() client: Socket) {
        const deviceId = client.data?.deviceId;
        const available = deviceId ? this.deviceSockets.has(deviceId) : false;
        client.emit('publisher-status', { available });
        console.log(`Check publisher device ${deviceId}: ${available}`);
    }

    // Viewer gửi offer lên → forward đến Jetson tương ứng
    @SubscribeMessage('offer')
    handleOffer(
        @MessageBody() data: { sdp: RTCSessionDescriptionInit },
        @ConnectedSocket() client: Socket,
    ) {
        const deviceId = client.data?.deviceId;
        const deviceSocket = deviceId ? this.deviceSockets.get(deviceId) : null;

        if (!deviceSocket) {
            client.emit('error', { message: 'Device không online' });
            return;
        }

        deviceSocket.emit('offer', { sdp: data.sdp, viewerId: client.id });
    }

    // Jetson gửi answer về → forward đến đúng viewer
    @SubscribeMessage('answer')
    handleAnswer(@MessageBody() data: { sdp: RTCSessionDescriptionInit; viewerId: string }) {
        this.server.to(data.viewerId).emit('answer', { sdp: data.sdp });
    }

    // ICE candidates — forward 2 chiều
    @SubscribeMessage('ice-candidate')
    handleIceCandidate(
        @MessageBody() data: { candidate: RTCIceCandidateInit; targetId?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { type, deviceId } = client.data ?? {};

        if (type === 'device') {
            // Jetson gửi ICE → forward đến viewer cụ thể
            if (data.targetId) {
                this.server.to(data.targetId).emit('ice-candidate', {
                    candidate: data.candidate,
                    fromId: client.id,
                });
            }
        } else if (type === 'viewer') {
            // Viewer gửi ICE → forward đến Jetson của device đang xem
            const deviceSocket = deviceId ? this.deviceSockets.get(deviceId) : null;
            if (deviceSocket) {
                deviceSocket.emit('ice-candidate', {
                    candidate: data.candidate,
                    fromId: client.id,
                });
            }
        }
    }
}