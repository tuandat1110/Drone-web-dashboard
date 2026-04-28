import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DevicesService {
    private sessionMap = new Map<string, number>();
   
    constructor(private readonly prisma: PrismaService) {}


    private generateDeviceKey(): string {
        const suffix = randomBytes(8).toString('hex').toUpperCase(); 
        return `JETSON_${suffix}`;
    }

    async createDevice(userId: number, deviceName: string, description?: string) {
        try {
            console.log("hihi");
            console.log("userid: ", userId);
            const device_key = this.generateDeviceKey();
            const newDevice = await this.prisma.device.create({
                data: {
                    device_key,
                    device_name: deviceName,
                    description,
                    user_id: userId,
                }
            })
            return newDevice;
        } catch(e) {
            console.log("Error: ", e);
        }
    } 

    async getDevicesByUser(userId: number) {
        return this.prisma.device.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                device_name: true,
                description: true,
                status: true,
                last_ip: true,
                last_seen: true,
                created_at: true,
            },
        });
    }

    async deleteDevice(deviceId: number, userId: number) {
        const device = await this.prisma.device.findFirst({
            where: { id: deviceId, user_id: userId },
        });
        if (!device) throw new Error('Device not found');

        return this.prisma.device.delete({ where: { id: deviceId } });
    }

    async createStreamSession(deviceKey: string) {
        const device = await this.prisma.device.findFirst({
            where: { device_key: deviceKey },
        });

        if (!device) throw new UnauthorizedException('Invalid device key');

        const sessionToken = randomBytes(16).toString('hex');

        this.sessionMap.set(sessionToken, device.id);

        await this.prisma.device.update({
            where: { id: device.id },
            data: { status: 'online', last_seen: new Date() },
        });
        
        return { session_token: sessionToken };
    }

    getDeviceIdBySession(token: string): number | undefined {
        return this.sessionMap.get(token);
    }

    async findDeviceOfUser(deviceId: number, userId: number) {
        return this.prisma.device.findFirst({
            where: { id: deviceId, user_id: userId },
        });
    }

    async setDeviceOffline(deviceId: number) {
        await this.prisma.device.update({
            where: { id: deviceId },
            data: { status: 'offline' },
        });
    }
}
