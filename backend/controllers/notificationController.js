import notificationModel from "../model/notificationModel.js";

// Create a new notification
export const createNotification = async (recipient, recipientType, sender, senderType, type, title, message, priority = 'medium', relatedId = null) => {
  try {
    const notification = new notificationModel({
      recipient,
      recipientType,
      sender,
      senderType,
      type,
      title,
      message,
      priority,
      relatedId
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    
    const notifications = await notificationModel.find({
      recipient: userId,
      recipientType: userType
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, notifications });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await notificationModel.findByIdAndUpdate(notificationId, { read: true });
    
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const { userType } = req.params;
    
    await notificationModel.updateMany(
      { recipientType: userType, read: false },
      { read: true }
    );
    
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await notificationModel.findByIdAndDelete(notificationId);
    
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};