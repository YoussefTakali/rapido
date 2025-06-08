import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayInit, 
  OnGatewayConnection, 
  OnGatewayDisconnect, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger, UsePipes, ValidationPipe, forwardRef } from '@nestjs/common';
import { JoinRoomDto } from './dto/join-room.dto';
import { NotificationService } from './notification.service';

@WebSocketGateway({ 
  cors: {
    origin: '*', // Specify your allowed origins in production
    methods: ['GET', 'POST'],
    credentials: true
  },
  namespace: '/notifications'
})
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private readonly activeConnections = new Map<string, number>();

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
    // Optional: Set up any server-wide event listeners here
  }

  async handleConnection(client: Socket) {
this.logger.log(`Client connected: ${client.id}`);
  console.log(`User connected to NotificationGateway with client id: ${client.id}`);
    
    // Optional: Add authentication middleware
    try {
      // You could verify a token here if using JWT
      // const user = await this.authService.verifyToken(client.handshake.auth.token);
      // this.activeConnections.set(client.id, user.id);
    } catch (error) {
      this.logger.warn(`Unauthorized connection attempt: ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.activeConnections.get(client.id);
    if (userId) {
      this.logger.log(`Client ${client.id} (user ${userId}) disconnected`);
      this.activeConnections.delete(client.id);
    } else {
      this.logger.log(`Client ${client.id} disconnected`);
    }
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { userId } = data;
      const roomName = `user_${userId}`;
      
      // Leave any previous rooms
      this.leaveOtherRooms(client);

      client.join(roomName);
      this.activeConnections.set(client.id, userId);
      this.logger.log(`Client ${client.id} joined room: ${roomName}`);
      
      await this.sendPendingNotifications(userId, client);
      
      return { 
        event: 'joinedRoom', 
        success: true, 
        room: roomName,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Join room error for client ${client.id}: ${error.message}`);
      return {
        event: 'error',
        message: 'Failed to join room'
      };
    }
  }

  private leaveOtherRooms(client: Socket) {
    const currentRooms = Array.from(client.rooms);
    currentRooms.forEach(room => {
      if (room !== client.id) {
        client.leave(room);
        this.logger.debug(`Client ${client.id} left room: ${room}`);
      }
    });
  }

  async sendPendingNotifications(userId: number, client: Socket) {
    try {
      const notifications = await this.notificationService.getUnreadNotifications(userId);
      if (notifications.length > 0) {
        this.logger.log(`Sending ${notifications.length} pending notifications to user ${userId}`);
        client.emit('notifications', notifications); // Changed to plural for batch
      }
    } catch (error) {
      this.logger.error(`Failed to send pending notifications: ${error.message}`);
    }
  }

  sendNotification(userId: number, notification: any) {
    try {
      const roomName = `user_${userId}`;
      this.server.to(roomName).emit('notification', {
        ...notification,
        sentAt: new Date().toISOString()
      });
      this.logger.log(`Notification sent to room: ${roomName}`);
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
    }
  }

  // Additional helper methods
  getActiveUsers(): number[] {
    return Array.from(new Set(this.activeConnections.values()));
  }

  disconnectUser(userId: number): void {
    this.activeConnections.forEach((storedUserId, clientId) => {
      if (storedUserId === userId) {
        this.server.sockets.sockets.get(clientId)?.disconnect();
        this.logger.log(`Disconnected client ${clientId} (user ${userId})`);
      }
    });
  }

  // New method for broadcasting to all connected users
  broadcastToAll(event: string, payload: any) {
    this.server.emit(event, payload);
    this.logger.log(`Broadcasted ${event} to all connected clients`);
  }
}