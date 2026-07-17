const Notification = require("../models/Notification");
const { sendTransactionalEmail, frontendBaseUrl } = require("./email.service");

class NotificationService {
  /**
   * Create in-app notification and optionally send email
   */
  async createNotification({
    userId,
    type,
    title,
    message,
    data = {},
    actionUrl = null,
    imageUrl = null,
    sendEmail = true,
    emailRecipient = null,
  }) {
    try {
      // Create in-app notification
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
        actionUrl,
        imageUrl,
      });

      // Send email if requested
      if (sendEmail && emailRecipient) {
        await this.sendEmailNotification({
          email: emailRecipient,
          title,
          message,
          type,
          actionUrl: actionUrl || frontendBaseUrl(),
        });
      }

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  }

  /**
   * Send email notification using Brevo
   */
  async sendEmailNotification({ email, title, message, type, actionUrl }) {
    const emailTemplates = {
      mentorship_request: {
        subject: "🔔 New Mentorship Request on Alumni Connect",
        buttonText: "View Request",
        icon: "👥",
      },
      mentorship_accepted: {
        subject: "🎉 Mentorship Request Accepted!",
        buttonText: "Start Messaging",
        icon: "✅",
      },
      mentorship_rejected: {
        subject: "📝 Mentorship Request Update",
        buttonText: "Find Another Mentor",
        icon: "📌",
      },
      mentorship_completed: {
        subject: "⭐ Mentorship Completed",
        buttonText: "Leave Feedback",
        icon: "🎓",
      },
      new_message: {
        subject: "💬 New Message on Alumni Connect",
        buttonText: "Reply Now",
        icon: "✉️",
      },
      job_application: {
        subject: "📋 New Job Application",
        buttonText: "View Application",
        icon: "💼",
      },
      job_approved: {
        subject: "✅ Job Posting Approved",
        buttonText: "View Job",
        icon: "🎯",
      },
      event_reminder: {
        subject: "📅 Event Reminder: Upcoming Event",
        buttonText: "View Event",
        icon: "🗓️",
      },
      event_rsvp: {
        subject: "🎟️ New Event Registration",
        buttonText: "View Attendees",
        icon: "🎫",
      },
      alumni_approved: {
        subject: "🎓 Alumni Account Approved",
        buttonText: "Login Now",
        icon: "✨",
      },
      system: {
        subject: "📢 Alumni Connect Notification",
        buttonText: "View Details",
        icon: "🔔",
      },
    };

    const template = emailTemplates[type] || emailTemplates.system;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
          }
          .container {
            max-width: 580px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .header {
            background: linear-gradient(135deg, #1e3a6e 0%, #27155f 100%);
            padding: 32px 24px;
            text-align: center;
            border-radius: 16px 16px 0 0;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .header-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .content {
            padding: 32px 28px;
          }
          .message-box {
            background-color: #f9fafb;
            border-left: 4px solid #1e3a6e;
            padding: 16px 20px;
            margin: 24px 0;
            border-radius: 8px;
          }
          .message-box p {
            margin: 0;
            color: #374151;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #1e3a6e 0%, #27155f 100%);
            color: #ffffff;
            padding: 12px 32px;
            text-decoration: none;
            border-radius: 8px;
            margin: 24px 0 16px;
            font-weight: 600;
            font-size: 15px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          }
          .button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .footer {
            text-align: center;
            padding: 24px 28px;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            background-color: #f9fafb;
            border-radius: 0 0 16px 16px;
          }
          .footer a {
            color: #1e3a6e;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
          .badge {
            display: inline-block;
            background-color: #e40d0a;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 16px;
            letter-spacing: 0.5px;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, #e5e7eb, #d1d5db, #e5e7eb);
            margin: 20px 0;
          }
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 12px;
            }
            .content {
              padding: 24px 20px;
            }
            .button {
              display: block;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <div style="padding: 20px 0;">
          <div class="container">
            <div class="header">
              <div class="header-icon">${template.icon}</div>
              <h1>Alumni Connect</h1>
            </div>
            <div class="content">
              <div class="badge">${type.replace(/_/g, " ").toUpperCase()}</div>
              <h2 style="margin-top: 0; font-size: 22px; font-weight: 600; color: #111827;">${title}</h2>
              <div class="message-box">
                <p style="margin: 0;">${message}</p>
              </div>
              
              ${
                data.matchScore
                  ? `
                <div style="background-color: #eff6ff; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">🎯</span>
                    <span style="font-weight: 600; color: #1e3a6e;">Match Score: ${data.matchScore}%</span>
                  </div>
                  ${
                    data.skillMatches && data.skillMatches.length > 0
                      ? `
                    <div style="margin-top: 8px; font-size: 13px; color: #4b5563;">
                      <strong>Matching Skills:</strong> ${data.skillMatches.join(", ")}
                    </div>
                  `
                      : ""
                  }
                </div>
              `
                  : ""
              }
              
              ${
                data.messagePreview
                  ? `
                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">
                  <p style="margin: 0; font-size: 13px; color: #6b7280; font-style: italic;">"${data.messagePreview.substring(0, 200)}${data.messagePreview.length > 200 ? "..." : ""}"</p>
                </div>
              `
                  : ""
              }
              
              <div style="text-align: center;">
                <a href="${actionUrl}" class="button">${template.buttonText}</a>
              </div>
              
              <div class="divider"></div>
              
              <p style="font-size: 13px; color: #6b7280; margin: 16px 0 0 0;">
                💡 <strong>Quick Tip:</strong> You can manage your notification preferences in your account settings.
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0 0 8px 0;">
                <strong>Alumni Connect</strong> — Connecting generations of excellence
              </p>
              <p style="margin: 0;">
                <a href="${frontendBaseUrl()}/settings/notifications">Notification Settings</a> • 
                <a href="${frontendBaseUrl()}/help">Help Center</a>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px;">
                You're receiving this because you have an account on Alumni Connect.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendTransactionalEmail({
        to: email,
        subject: template.subject,
        html,
      });
      return true;
    } catch (error) {
      console.error("Error sending email notification:", error);
      return false;
    }
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    return await Notification.countDocuments({ userId, read: false });
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId, limit = 20, skip = 0) {
    return await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true, readAt: new Date() },
      { new: true },
    );
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    return await Notification.findOneAndDelete({ _id: notificationId, userId });
  }

  /**
   * Create notification for mentorship request
   */
  async notifyMentorshipRequest(student, alumni, matchScore, message) {
    const title = `New Mentorship Request from ${student.name}`;
    const notificationMessage = `${student.name} (${student.department || "Student"}) has requested you as a mentor. Match score: ${matchScore}%`;

    return await this.createNotification({
      userId: alumni._id,
      type: "mentorship_request",
      title,
      message: notificationMessage,
      data: {
        studentId: student._id,
        studentName: student.name,
        studentDepartment: student.department,
        matchScore,
        skillMatches: [],
        requestMessage: message,
      },
      actionUrl: `${frontendBaseUrl()}/dashboard?tab=mentorship`,
      sendEmail: true,
      emailRecipient: alumni.email,
    });
  }

  /**
   * Create notification for mentorship response
   */
  async notifyMentorshipResponse(student, alumni, status, responseMessage) {
    const isAccepted = status === "accepted";
    const title = isAccepted
      ? "Mentorship Request Accepted!"
      : "Mentorship Request Update";
    const notificationMessage = isAccepted
      ? `${alumni.name} has accepted your mentorship request! Start messaging now.`
      : `${alumni.name} has declined your mentorship request. ${responseMessage ? `Message: ${responseMessage}` : "You can try requesting another mentor."}`;

    return await this.createNotification({
      userId: student._id,
      type: isAccepted ? "mentorship_accepted" : "mentorship_rejected",
      title,
      message: notificationMessage,
      data: {
        alumniId: alumni._id,
        alumniName: alumni.name,
        status,
        responseMessage,
      },
      actionUrl: `${frontendBaseUrl()}/messaging?userId=${alumni._id}`,
      sendEmail: true,
      emailRecipient: student.email,
    });
  }

  /**
   * Create notification for new message
   */
  async notifyNewMessage(sender, receiver, messagePreview) {
    const title = `New Message from ${sender.name}`;
    const notificationMessage = `${sender.name}: "${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? "..." : ""}"`;

    return await this.createNotification({
      userId: receiver._id,
      type: "new_message",
      title,
      message: notificationMessage,
      data: {
        senderId: sender._id,
        senderName: sender.name,
        messagePreview,
      },
      actionUrl: `${frontendBaseUrl()}/messages?userId=${sender._id}`,
      sendEmail: true,
      emailRecipient: receiver.email,
    });
  }

  /**
   * Create notification for job application
   */
  async notifyJobApplication(job, student, alumni) {
    const title = `New Job Application for ${job.title}`;
    const notificationMessage = `${student.name} has applied for ${job.title} at ${job.company}`;

    return await this.createNotification({
      userId: alumni._id,
      type: "job_application",
      title,
      message: notificationMessage,
      data: {
        jobId: job._id,
        jobTitle: job.title,
        company: job.company,
        studentId: student._id,
        studentName: student.name,
      },
      actionUrl: `${frontendBaseUrl()}/jobs/${job._id}/applications`,
      sendEmail: true,
      emailRecipient: alumni.email,
    });
  }

  /**
   * Create notification for event reminder
   */
  async notifyEventReminder(user, event) {
    const eventDate = new Date(event.eventDate);
    const title = `Reminder: ${event.title}`;
    const notificationMessage = `Your event "${event.title}" is happening on ${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString()}`;

    return await this.createNotification({
      userId: user._id,
      type: "event_reminder",
      title,
      message: notificationMessage,
      data: {
        eventId: event._id,
        eventTitle: event.title,
        eventDate: event.eventDate,
        location: event.location,
      },
      actionUrl: `${frontendBaseUrl()}/events/${event._id}`,
      sendEmail: true,
      emailRecipient: user.email,
    });
  }

  /**
   * Create notification for alumni approval
   */
  async notifyAlumniApproved(alumni) {
    const title = "Welcome to Alumni Connect!";
    const notificationMessage =
      "Your alumni account has been approved. You can now post jobs and mentor students.";

    return await this.createNotification({
      userId: alumni._id,
      type: "alumni_approved",
      title,
      message: notificationMessage,
      data: {
        alumniId: alumni._id,
        alumniName: alumni.name,
      },
      actionUrl: `${frontendBaseUrl()}/dashboard`,
      sendEmail: true,
      emailRecipient: alumni.email,
    });
  }
}

module.exports = new NotificationService();
