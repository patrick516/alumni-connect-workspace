import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import PageContainer from "../components/layout/PageContainer";
import {
  getNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
  deleteNotificationApi,
} from "../api/notificationApi";
// import { useAuth } from "../context/AuthContext";
// import { useSocket } from "../context/SocketContext";
import type { Notification } from "../types";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const navigate = useNavigate();
  //   const { user } = useAuth();
  //   const { socket } = useSocket();

  const limit = 20;

  // Fetch notifications
  const fetchNotifications = async (reset = true) => {
    if (reset) {
      setPage(0);
      setNotifications([]);
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = reset ? 0 : page;
      const response = await getNotificationsApi(limit, currentPage * limit);

      if (reset) {
        setNotifications(response.notifications);
      } else {
        setNotifications((prev) => [...prev, ...response.notifications]);
      }

      setHasMore(response.pagination.hasMore);
      if (!reset) {
        setPage((prev) => prev + 1);
      } else if (response.notifications.length === limit) {
        setPage(1);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load notifications",
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (_event: CustomEvent) => {
      //   const data = event.detail;
      // Refresh notifications when new one arrives
      fetchNotifications(true);
    };

    window.addEventListener("notification:new" as any, handleNewNotification);

    return () => {
      window.removeEventListener(
        "notification:new" as any,
        handleNewNotification,
      );
    };
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsReadApi(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteNotificationApi(notificationId);
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId),
        );
      } catch (error) {
        console.error("Failed to delete notification:", error);
      }
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await handleMarkAsRead(notification._id);
    }

    // Navigate based on notification type and action URL
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else {
      // Default navigation based on type
      switch (notification.type) {
        case "mentorship_request":
        case "mentorship_accepted":
        case "mentorship_rejected":
          navigate("/dashboard?tab=mentorship");
          break;
        case "new_message":
          if (notification.data?.senderId) {
            navigate(`/messages?userId=${notification.data.senderId}`);
          } else {
            navigate("/messages");
          }
          break;
        case "job_application":
          if (notification.data?.jobId) {
            navigate(`/jobs/${notification.data.jobId}/applications`);
          } else {
            navigate("/jobs");
          }
          break;
        case "event_reminder":
          if (notification.data?.eventId) {
            navigate(`/events/${notification.data.eventId}`);
          } else {
            navigate("/events");
          }
          break;
        default:
          break;
      }
    }
  };

  const getNotificationIcon = (type: string, read: boolean) => {
    // const baseColor = read ? "text-gray-400" : "text-white";
    // const bgColor = read ? "bg-gray-100" : "bg-gradient-to-r";

    switch (type) {
      case "mentorship_request":
        return (
          <div
            className={`w-10 h-10 rounded-full ${read ? "bg-gray-100" : "bg-gradient-to-r from-blue-500 to-blue-600"} flex items-center justify-center`}
          >
            <svg
              className={`w-5 h-5 ${read ? "text-gray-500" : "text-white"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        );
      case "mentorship_accepted":
        return (
          <div
            className={`w-10 h-10 rounded-full ${read ? "bg-gray-100" : "bg-gradient-to-r from-green-500 to-green-600"} flex items-center justify-center`}
          >
            <svg
              className={`w-5 h-5 ${read ? "text-gray-500" : "text-white"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        );
      case "mentorship_rejected":
        return (
          <div
            className={`w-10 h-10 rounded-full ${read ? "bg-gray-100" : "bg-gradient-to-r from-red-500 to-red-600"} flex items-center justify-center`}
          >
            <svg
              className={`w-5 h-5 ${read ? "text-gray-500" : "text-white"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
        );
      case "new_message":
        return (
          <div
            className={`w-10 h-10 rounded-full ${read ? "bg-gray-100" : "bg-gradient-to-r from-purple-500 to-purple-600"} flex items-center justify-center`}
          >
            <svg
              className={`w-5 h-5 ${read ? "text-gray-500" : "text-white"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        );
      case "job_application":
        return (
          <div
            className={`w-10 h-10 rounded-full ${read ? "bg-gray-100" : "bg-gradient-to-r from-amber-500 to-amber-600"} flex items-center justify-center`}
          >
            <svg
              className={`w-5 h-5 ${read ? "text-gray-500" : "text-white"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </div>
        );
      case "event_reminder":
        return (
          <div
            className={`w-10 h-10 rounded-full ${read ? "bg-gray-100" : "bg-gradient-to-r from-emerald-500 to-emerald-600"} flex items-center justify-center`}
          >
            <svg
              className={`w-5 h-5 ${read ? "text-gray-500" : "text-white"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        );
      default:
        return (
          <div
            className={`w-10 h-10 rounded-full ${read ? "bg-gray-100" : "bg-gradient-to-r from-gray-500 to-gray-600"} flex items-center justify-center`}
          >
            <svg
              className={`w-5 h-5 ${read ? "text-gray-500" : "text-white"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "mentorship_request":
        return "Mentorship Request";
      case "mentorship_accepted":
        return "Mentorship Accepted";
      case "mentorship_rejected":
        return "Mentorship Declined";
      case "mentorship_completed":
        return "Mentorship Completed";
      case "new_message":
        return "New Message";
      case "job_application":
        return "Job Application";
      case "job_approved":
        return "Job Approved";
      case "event_reminder":
        return "Event Reminder";
      case "event_rsvp":
        return "Event RSVP";
      case "alumni_approved":
        return "Account Approved";
      default:
        return "Notification";
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "mentorship_request", label: "Mentorship" },
    { value: "new_message", label: "Messages" },
    { value: "job_application", label: "Jobs" },
    { value: "event_reminder", label: "Events" },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <PageContainer title="Notifications">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-[#1e3a6e] border-t-transparent rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Notifications">
      {/* Header with stats */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500 mt-1">
              Stay updated with your mentorship requests, messages, and
              activities
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-sm font-medium text-[#1e3a6e] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {notifications.length}
            </p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
            <p className="text-xs text-blue-600">Unread</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {notifications.filter((n) => n.type === "new_message").length}
            </p>
            <p className="text-xs text-purple-600">Messages</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {
                notifications.filter((n) => n.type === "mentorship_request")
                  .length
              }
            </p>
            <p className="text-xs text-amber-600">Requests</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === option.value
                  ? "bg-[#1e3a6e] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications list */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No notifications
          </h3>
          <p className="text-sm text-gray-500">
            {filter !== "all"
              ? `No ${filter.replace("_", " ")} notifications found.`
              : "You're all caught up! New notifications will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                !notification.read
                  ? "border-l-4 border-l-[#1e3a6e] shadow-sm"
                  : "border-gray-100"
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="p-5 flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type, notification.read)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-semibold ${!notification.read ? "text-gray-900" : "text-gray-600"}`}
                        >
                          {notification.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {getTypeLabel(notification.type)}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-[#1e3a6e]" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>

                      {/* Additional data based on type */}
                      {notification.type === "mentorship_request" &&
                        notification.data?.matchScore && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full">
                            <svg
                              className="w-3 h-3 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span className="text-xs text-blue-600">
                              Match Score: {notification.data.matchScore}%
                            </span>
                          </div>
                        )}

                      {notification.type === "new_message" &&
                        notification.data?.messagePreview && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 italic">
                              "
                              {notification.data.messagePreview.substring(
                                0,
                                150,
                              )}
                              "
                            </p>
                          </div>
                        )}

                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                        <span>
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            },
                          )}
                        </span>
                        {notification.data?.studentName && (
                          <span>• From: {notification.data.studentName}</span>
                        )}
                        {notification.data?.alumniName && (
                          <span>• From: {notification.data.alumniName}</span>
                        )}
                        {notification.data?.senderName && (
                          <span>• From: {notification.data.senderName}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-[#1e3a6e] transition-colors"
                          title="Mark as read"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20 12.5V7.5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h5.5" />
                            <polyline points="16 22 22 16 16 16" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification._id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Load more button */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => fetchNotifications(false)}
                disabled={loadingMore}
                className="px-6 py-2 text-sm font-medium text-[#1e3a6e] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#1e3a6e] border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : (
                  "Load more"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default NotificationsPage;
