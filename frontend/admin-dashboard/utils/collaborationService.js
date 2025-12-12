// Mock Collaboration Service for Real-Time Team Features
// In a real implementation, this would connect to WebSocket or similar real-time service

class CollaborationService {
  constructor() {
    this.collaborators = [];
    this.activeEdits = new Map();
    this.comments = new Map();
    this.notifications = [];
    this.listeners = [];
  }

  // Subscribe to collaboration events
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all subscribers of an event
  notify(event) {
    this.listeners.forEach(callback => callback(event));
  }

  // Add a collaborator
  addCollaborator(user) {
    const collaborator = {
      id: user.id,
      name: user.name,
      avatar: user.avatar || '👤',
      lastActive: new Date(),
      status: 'online'
    };
    
    this.collaborators.push(collaborator);
    this.notify({
      type: 'COLLABORATOR_ADDED',
      payload: collaborator
    });
    
    return collaborator;
  }

  // Remove a collaborator
  removeCollaborator(userId) {
    this.collaborators = this.collaborators.filter(c => c.id !== userId);
    this.notify({
      type: 'COLLABORATOR_REMOVED',
      payload: { id: userId }
      });
  }

  // Update collaborator status
  updateCollaboratorStatus(userId, status) {
    const collaborator = this.collaborators.find(c => c.id === userId);
    if (collaborator) {
      collaborator.status = status;
      collaborator.lastActive = new Date();
      this.notify({
        type: 'COLLABORATOR_STATUS_CHANGED',
        payload: collaborator
      });
    }
  }

  // Track active editing
  startEditing(productId, userId, userName) {
    const editInfo = {
      productId,
      userId,
      userName,
      startTime: new Date(),
      lastUpdate: new Date()
    };
    
    this.activeEdits.set(productId, editInfo);
    this.notify({
      type: 'EDIT_STARTED',
      payload: editInfo
    });
    
    return editInfo;
  }

  // Stop tracking editing
  stopEditing(productId, userId) {
    const editInfo = this.activeEdits.get(productId);
    if (editInfo && editInfo.userId === userId) {
      this.activeEdits.delete(productId);
      this.notify({
        type: 'EDIT_STOPPED',
        payload: { productId, userId }
      });
    }
  }

  // Add a comment
  addComment(productId, userId, userName, text) {
    const comment = {
      id: Date.now(),
      productId,
      userId,
      userName,
      text,
      timestamp: new Date()
    };
    
    if (!this.comments.has(productId)) {
      this.comments.set(productId, []);
    }
    
    this.comments.get(productId).push(comment);
    this.notify({
      type: 'COMMENT_ADDED',
      payload: comment
    });
    
    return comment;
  }

  // Get comments for a product
  getComments(productId) {
    return this.comments.get(productId) || [];
  }

  // Add a notification
  addNotification(userId, type, message, relatedId = null) {
    const notification = {
      id: Date.now(),
      userId,
      type,
      message,
      relatedId,
      timestamp: new Date(),
      read: false
    };
    
    this.notifications.push(notification);
    this.notify({
      type: 'NOTIFICATION_ADDED',
      payload: notification
    });
    
    return notification;
  }

  // Mark notification as read
  markNotificationAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notify({
        type: 'NOTIFICATION_UPDATED',
        payload: notification
      });
    }
  }

  // Get unread notifications for a user
  getUnreadNotifications(userId) {
    return this.notifications.filter(n => n.userId === userId && !n.read);
  }

  // Simulate real-time updates (in a real app, this would come from WebSocket)
  simulateRealTimeUpdates() {
    // Periodically send simulated events
    setInterval(() => {
      // Randomly update collaborator statuses
      if (this.collaborators.length > 0 && Math.random() > 0.7) {
        const randomCollaborator = this.collaborators[Math.floor(Math.random() * this.collaborators.length)];
        this.updateCollaboratorStatus(randomCollaborator.id, 
          Math.random() > 0.5 ? 'online' : 'away');
      }
      
      // Randomly add notifications
      if (this.collaborators.length > 0 && Math.random() > 0.8) {
        const randomCollaborator = this.collaborators[Math.floor(Math.random() * this.collaborators.length)];
        this.addNotification(
          randomCollaborator.id,
          'info',
          'New product suggestion received',
          'product_' + Math.floor(Math.random() * 100)
        );
      }
    }, 5000);
  }
}

// Create a singleton instance
const collaborationService = new CollaborationService();

// Simulate real-time updates for demo purposes
if (typeof window !== 'undefined') {
  // Only run in browser environment
  collaborationService.simulateRealTimeUpdates();
}

export default collaborationService;