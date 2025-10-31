import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationStatus, NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(userId: string, createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        metadata: createNotificationDto.metadata,
        status: NotificationStatus.PENDING,
      },
    });

    // In a real application, you would trigger email/SMS sending here
    // For now, we'll just mark it as sent
    await this.markAsSent(notification.id);

    return notification;
  }

  async getNotifications(
    userId: string,
    filters?: {
      type?: NotificationType;
      unreadOnly?: boolean;
      limit?: number;
    },
  ) {
    const where: any = { userId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.unreadOnly) {
      where.readAt = null;
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
    });

    return notifications;
  }

  async getNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        readAt: new Date(),
        status: NotificationStatus.READ,
      },
    });

    return updated;
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
        status: NotificationStatus.READ,
      },
    });

    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });

    return { unreadCount: count };
  }

  // Helper method to mark notification as sent
  private async markAsSent(notificationId: string) {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      },
    });
  }

  // Method to send system notifications (can be called from other services)
  async sendSystemNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.IN_APP,
    metadata?: any,
  ) {
    return this.createNotification(userId, {
      type,
      title,
      message,
      metadata,
    });
  }
}

