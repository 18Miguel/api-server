import { Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export default class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(SocketGateway.name);

    @WebSocketServer()
    private server: Server;

    handleConnection(client: Socket): void {
        this.logger.log(`Client ${client.id} connected to the Web Socket`);
    }

    handleDisconnect(client: Socket): void {
        this.logger.log(`Client ${client.id} disconnected from the Web Socket`);
    }

    streamDataToClients(event: string, data: any): void {
        this.server.emit(event, data);
    }
}
