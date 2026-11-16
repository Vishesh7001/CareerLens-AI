const Notification = require('../models/Notification');

/**
 * Helper to safely create an in-app notification for a user
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.type
 * @param {string} params.title
 * @param {string} params.message
 * @param {string} [params.link]
 * @param {object} [params.metadata]
 * @returns {Promise<Notification|null>}
 */
const createNotification = async ({ userId, type = 'system', title, message, link = null, metadata = {} }) => {
  try {
    if (!userId || !title || !message) return null;
    return await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      metadata,
    });
  } catch (error) {
    // Non-blocking: log warning without breaking caller flow
    console.warn('[NotificationService] Failed to create notification:', error.message);
    return null;
  }
};

module.exports = {
  createNotification,
};
