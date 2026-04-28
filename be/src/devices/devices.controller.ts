import { Controller, Get, Post, Param, Req, UseGuards, Delete, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
    constructor(private devicesService: DevicesService) {}

    @Post('session')
    async createSession(@Body() body: { device_key: string }) {
        return await this.devicesService.createStreamSession(body.device_key);
    }

    @UseGuards(AuthGuard('jwt'))  
    @Post()
    async create(@Req() req,@Body() body: { device_name: string, description?: string }) {
        try {
            console.log("hehe");
            return await this.devicesService.createDevice(req.user.userId, body.device_name, body.description);
        } catch(e) {
            console.log("Error: ",e);
        }
    }

    @UseGuards(AuthGuard('jwt'))  
    @Get()
    findAll(@Req() req) {
        return this.devicesService.getDevicesByUser(req.user.id);
    }

    @UseGuards(AuthGuard('jwt'))  
    @Delete(':id')
    remove(@Req() req, @Param('id') id: string) {
        return this.devicesService.deleteDevice(+id, req.user.id);
    }
}
