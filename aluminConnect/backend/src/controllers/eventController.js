const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");
const notificationService = require("../services/notification.service");

const formatEvent = (e) => {
  if (!e) return null;
  const ev = e.toObject ? e.toObject() : { ...e };
  ev._id = String(ev._id);
  if (ev.organizer && typeof ev.organizer === "object") {
    ev.organizer = { _id: String(ev.organizer._id), name: ev.organizer.name };
  }
  ev.participants = (ev.participants || []).map((id) => String(id));
  if (ev.eventDate)
    ev.eventDate =
      ev.eventDate.toISOString?.() || new Date(ev.eventDate).toISOString();
  if (ev.createdAt) ev.createdAt = ev.createdAt.toISOString?.() || ev.createdAt;
  return ev;
};

exports.listEvents = async (req, res) => {
  const events = await Event.find()
    .populate("organizer", "name")
    .sort({ eventDate: 1 })
    .lean();
  res.json({ success: true, events: events.map(formatEvent) });
};

exports.createEvent = async (req, res) => {
  const { title, description, eventDate, location, imageUrl } = req.body;

  const event = await Event.create({
    title: title.trim(),
    description: description?.trim() || "",
    eventDate: new Date(eventDate),
    location: location?.trim() || "",
    organizer: req.user.userId,
    imageUrl: imageUrl || "",
  });
  const populated = await Event.findById(event._id)
    .populate("organizer", "name")
    .lean();

  // Notify admin about new event (if creator is not admin)
  if (req.user.role !== "admin") {
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await notificationService.createNotification({
        userId: admin._id,
        type: "event_rsvp",
        title: "New Event Created",
        message: `${req.user.name} created a new event: "${title}"`,
        data: {
          eventId: event._id,
          eventTitle: title,
          createdBy: req.user.userId,
        },
        actionUrl: `/admin/events`,
        sendEmail: true,
        emailRecipient: admin.email,
      });
    }
  }

  res.status(201).json({ success: true, event: formatEvent(populated) });
};

exports.joinEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event)
    return res.status(404).json({ success: false, message: "Event not found" });
  const uid = new mongoose.Types.ObjectId(req.user.userId);
  if (event.participants.some((p) => String(p) === req.user.userId)) {
    return res.json({ success: true, message: "Already registered" });
  }
  event.participants.push(uid);
  await event.save();

  // Send notification to event organizer
  const user = await User.findById(req.user.userId);
  const organizer = await User.findById(event.organizer);

  if (organizer && String(organizer._id) !== req.user.userId) {
    await notificationService.createNotification({
      userId: organizer._id,
      type: "event_rsvp",
      title: `New RSVP: ${event.title}`,
      message: `${user.name} has registered for your event "${event.title}"`,
      data: {
        eventId: event._id,
        eventTitle: event.title,
        participantId: user._id,
        participantName: user.name,
      },
      actionUrl: `/events/${event._id}/participants`,
      sendEmail: true,
      emailRecipient: organizer.email,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${String(organizer._id)}`).emit("notification:new", {
        type: "event_rsvp",
        title: "New Event Registration",
        message: `${user.name} joined ${event.title}`,
      });
    }
  }

  res.json({ success: true, message: "Joined event" });
};

exports.deleteEvent = async (req, res) => {
  await Event.deleteOne({ _id: req.params.id });
  res.json({ success: true, message: "Event deleted" });
};

// Participants list (admin only)
exports.getParticipants = async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate(
      "participants",
      "name email role phone profilePhoto graduationYear university company position",
    )
    .lean();

  if (!event)
    return res.status(404).json({ success: false, message: "Event not found" });

  const participants = (event.participants || []).map((u) => ({
    _id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone || "",
    profilePhoto: u.profilePhoto || "",
    graduationYear: u.graduationYear || "",
    university: u.university || "",
    company: u.company || "",
    position: u.position || "",
  }));

  res.json({
    eventId: String(event._id),
    title: event.title,
    eventDate: event.eventDate,
    location: event.location || "",
    total: participants.length,
    participants,
  });
};

// Add this function to the existing eventController.js
exports.sendEventReminders = async (req, res) => {
  // Verify cron secret for security
  const cronSecret = req.headers["x-cron-secret"];
  if (cronSecret !== process.env.CRON_SECRET && req.user?.role !== "admin") {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const upcomingEvents = await Event.find({
      eventDate: {
        $gte: tomorrow,
        $lt: dayAfter,
      },
    });

    console.log(
      `[EventReminders] Found ${upcomingEvents.length} events for tomorrow`,
    );

    let remindersSent = 0;

    for (const event of upcomingEvents) {
      const participants = await User.find({
        _id: { $in: event.participants },
      });

      console.log(
        `[EventReminders] Sending reminders for "${event.title}" to ${participants.length} participants`,
      );

      for (const participant of participants) {
        await notificationService.notifyEventReminder(participant, event);
        remindersSent++;
      }
    }

    res.json({
      success: true,
      message: `Reminders sent for ${upcomingEvents.length} events (${remindersSent} total notifications)`,
    });
  } catch (error) {
    console.error("Send event reminders error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
