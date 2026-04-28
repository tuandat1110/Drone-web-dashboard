import { Module } from "@nestjs/common";
import { SignalingGateway } from "./signaling.gateway";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DevicesModule } from "src/devices/devices.module";

@Module({
    imports: [
        DevicesModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('JWT_SECRET'),
                signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') },
            }),
        }),
    ],
    providers: [SignalingGateway],
})
export class SignalingModule {}