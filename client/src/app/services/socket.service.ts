// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { Notification } from '../models/Notification';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | null = null;
  private connectionStatus = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatus.asObservable();

  connect(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    if (!this.socket) {
      console.log('🔌 Creating new socket connection to:', environment.apiBaseUrl+ '/notifications');
      
      // More explicit configuration
      this.socket = io(environment.apiBaseUrl+ '/notifications', { 
        transports: ['websocket', 'polling'], // Allow both transports
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
        upgrade: true,
        rememberUpgrade: true
      });

      // Connection event handlers
      this.socket.on('connect', () => {
        console.log('✅ Socket connected successfully. Socket ID:', this.socket?.id);
        console.log('🔌 Transport:', this.socket?.io.engine.transport.name);
        console.log('🌐 Socket URL:', environment.apiBaseUrl + '/notifications');
        this.connectionStatus.next(true);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        this.connectionStatus.next(false);
      });

      this.socket.on('connect_error', (error) => {
        console.error('💥 Socket connection error:', error);
        console.error('Error details:', error.message, (error as any)?.description, (error as any)?.context);
        this.connectionStatus.next(false);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        this.connectionStatus.next(true);
      });

      // Debug: Log when socket tries to upgrade transport
      this.socket.io.engine.on('upgrade', () => {
        console.log('⬆️ Upgraded to transport:', this.socket?.io.engine.transport.name);
      });

      // Debug: Log all engine events
      this.socket.io.engine.on('upgradeError', (error) => {
        console.error('❌ Upgrade error:', error);
      });

    } else {
      // If socket exists but not connected, try to connect
      console.log('🔄 Reconnecting existing socket...');
      this.socket.connect();
    }
  }

  listenToNotifications(userId: number): Observable<Notification> {
    console.log('Setting up notification listener for user:', userId);
    this.connect();

    return new Observable<Notification>((observer) => {
      if (!this.socket) {
        console.error('Socket not initialized');
        observer.error('Socket not initialized');
        return;
      }

      // Wait for connection before joining room
      const handleConnection = () => {
        console.log('🏠 Joining room for user:', userId);
        this.socket?.emit('joinRoom', { userId });
        
        // Verify room joining
        this.socket?.on('roomJoined', (data) => {
          console.log('✅ Successfully joined room:', data);
        });
        
        // Listen for join confirmation (different possible event names)
        this.socket?.on('joined', (data) => {
          console.log('✅ Joined room confirmation:', data);
        });
        
        // Debug: Log what we're sending
        console.log('📤 Emitting joinRoom with payload:', { userId });
      };

      if (this.socket.connected) {
        handleConnection();
      } else {
        this.socket.on('connect', handleConnection);
      }

      // Listen for individual notifications
      const notificationHandler = (notification: Notification) => {
        console.log('🔔 Received notification via socket:', notification);
        observer.next(notification);
      };

      // Listen for multiple notifications
      const notificationsHandler = (notifications: Notification[]) => {
        console.log('🔔 Received notifications batch via socket:', notifications);
        notifications.forEach((notif) => observer.next(notif));
      };

      // Listen for ALL socket events to debug
      const originalEmit = this.socket.emit;
      const originalOn = this.socket.on;
      
      // Listen for ALL socket events to debug
      this.socket.onAny((eventName, ...args) => {
        console.log('📡 Socket received event:', eventName, 'with data:', args);
        
        // Special handling for notification-like events
        if (eventName.toLowerCase().includes('notification') || 
            eventName.toLowerCase().includes('message') ||
            eventName.toLowerCase().includes('update')) {
          console.log('🔔 Potential notification event detected:', eventName, args);
        }
      });

      this.socket.on('notification', notificationHandler);
      this.socket.on('notifications', notificationsHandler);
      
      // Also listen for other possible event names your backend might be using
      this.socket.on('newNotification', notificationHandler);
      this.socket.on('userNotification', notificationHandler);

      // Cleanup function
      return () => {
        console.log('Cleaning up socket listeners');
        this.socket?.off('notification', notificationHandler);
        this.socket?.off('notifications', notificationsHandler);
        this.socket?.off('newNotification', notificationHandler);
        this.socket?.off('userNotification', notificationHandler);
        this.socket?.off('connect', handleConnection);
        this.socket?.off('roomJoined');
        this.socket?.offAny();
      };
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.connectionStatus.next(false);
    }
  }

  // Method to check connection status
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Method to manually emit joinRoom (useful for debugging)
  joinRoom(userId: number): void {
    if (this.socket?.connected) {
      console.log('Manually joining room for user:', userId);
      this.socket.emit('joinRoom', { userId });
    } else {
      console.warn('Socket not connected, cannot join room');
    }
  }

  // Comprehensive test method
  comprehensiveTest(userId: number): void {
    console.log('🧪 Starting comprehensive socket test...');
    
    if (!this.socket) {
      console.error('❌ No socket instance');
      return;
    }

    console.log('🔍 Socket state:', {
      connected: this.socket.connected,
      id: this.socket.id,
      transport: this.socket.io.engine?.transport?.name,
      // uri: this.socket.io.uri, // Removed due to private access
      opts: this.socket.io.opts
    });

    if (this.socket.connected) {
      console.log('✅ Socket is connected, testing events...');
      
      // Test basic echo
      this.socket.emit('echo', { test: 'hello', timestamp: Date.now() });
      
      // Test different joinRoom variations
      const joinPayloads = [
        { userId: userId },
        { user_id: userId },
        { id: userId },
        userId,
        `user_${userId}`,
        { userId: userId.toString() }
      ];
      
      joinPayloads.forEach((payload, index) => {
        console.log(`🧪 Testing joinRoom #${index + 1}:`, payload);
        this.socket!.emit('joinRoom', payload);
        this.socket!.emit('join', payload);
        this.socket!.emit('subscribe', payload);
      });

      // Set up temporary listeners for any response
      const tempListeners = [
        'joined', 'roomJoined', 'subscribed', 'echo', 'test', 'error',
        'notification', 'notifications', 'newNotification', 'message'
      ];

      tempListeners.forEach(event => {
        this.socket!.once(event, (data) => {
          console.log(`🎯 Received ${event}:`, data);
        });
      });

      // Request server info
      this.socket.emit('serverInfo');
      this.socket.emit('ping');
      
      setTimeout(() => {
        console.log('🕐 Test timeout - checking for any received events...');
      }, 3000);
      
    } else {
      console.error('❌ Socket not connected, cannot test');
    }
  }
}