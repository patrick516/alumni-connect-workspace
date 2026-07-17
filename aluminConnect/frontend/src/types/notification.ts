export interface Notification {
  _id: string;
  userId: string;
  type:
    | "mentorship_request"
    | "mentorship_accepted"
    | "mentorship_rejected"
    | "mentorship_completed"
    | "new_message"
    | "job_application"
    | "job_approved"
    | "event_reminder"
    | "event_rsvp"
    | "alumni_approved"
    | "system";
  title: string;
  message: string;
  data?: {
    studentId?: string;
    studentName?: string;
    studentDepartment?: string;
    alumniId?: string;
    alumniName?: string;
    matchScore?: number;
    requestMessage?: string;
    senderId?: string;
    senderName?: string;
    messagePreview?: string;
    jobId?: string;
    jobTitle?: string;
    eventId?: string;
    eventTitle?: string;
    eventDate?: string;
    status?: string;
    responseMessage?: string;
    [key: string]: any;
  };
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}
