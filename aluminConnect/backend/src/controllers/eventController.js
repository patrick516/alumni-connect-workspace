const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");
const notificationService = require("../services/notification.service");

const formatEvent = (e) => {
  if (!e) return null;
  const ev = e.toObject ? e.toObject() : { ...e };
  ev._id = String(ev._id);
  if (ev.organizer && typeof ev.organizer === "object") {
    ev.organizer = {
      _id: String(ev.organizer._id),
      name: ev.organizer.name,
      profilePhoto: ev.organizer.profilePhoto || "",
    };
  }
  ev.participants = (ev.participants || []).map((id) => String(id));
  if (ev.eventDate)
    ev.eventDate =
      ev.eventDate.toISOString?.() || new Date(ev.eventDate).toISOString();
  if (ev.createdAt) ev.createdAt = ev.createdAt.toISOString?.() || ev.createdAt;
  if (ev.updatedAt) ev.updatedAt = ev.updatedAt.toISOString?.() || ev.updatedAt;
  return ev;
};

const buildListQuery = (role, userId) => {
  if (role === "admin") return {};
  if (role === "student" || role === "alumni") {
    return {
      $or: [
        { status: "approved" },
        { organizer: new mongoose.Types.ObjectId(userId) },
      ],
    };
  }
  return { status: "approved" };
};

exports.listEvents = async (req, res) => {
  const { search, location } = req.query;
  const query = buildListQuery(req.user.role, req.user.userId);

  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (location && location !== "all") {
    query.location = { $regex: location, $options: "i" };
  }

  const events = await Event.find(query)
    .populate("organizer", "name profilePhoto")
    .sort({ eventDate: 1 })
    .lean();
  res.json({ success: true, events: events.map(formatEvent) });
};

exports.createEvent = async (req, res) => {
  const { title, description, eventDate, location, imageUrl } = req.body;

  const status = req.user.role === "admin" ? "approved" : "pending";

  const event = await Event.create({
    title: title.trim(),
    description: description?.trim() || "",
    eventDate: new Date(eventDate),
    location: location?.trim() || "",
    organizer: req.user.userId,
    imageUrl: imageUrl || "",
    status,
  });
  const populated = await Event.findById(event._id)
    .populate("organizer", "name profilePhoto")
    .lean();

  // Notify admin about new event (if creator is not admin)
  if (req.user.role !== "admin") {
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await notificationService.createNotification({
        userId: admin._id,
        type: "event_pending",
        title: "New Event Pending Approval",
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

exports.updateEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  const owner = String(event.organizer) === req.user.userId;
  if (!owner && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not allowed" });
  }

  const { title, description, eventDate, location, imageUrl } = req.body;

  if (title !== undefined) event.title = title.trim();
  if (description !== undefined) event.description = description.trim();
  if (eventDate !== undefined) event.eventDate = new Date(eventDate);
  if (location !== undefined) event.location = location.trim();
  if (imageUrl !== undefined) event.imageUrl = imageUrl;

  // Non-admin edits go back to pending re-approval; admin edits stay approved
  if (req.user.role !== "admin") {
    event.status = "pending";
  }

  await event.save();

  const populated = await Event.findById(event._id)
    .populate("organizer", "name profilePhoto")
    .lean();
  res.json({ success: true, event: formatEvent(populated) });
};

exports.deleteEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }
  const owner = String(event.organizer) === req.user.userId;
  if (!owner && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not allowed" });
  }
  await Event.deleteOne({ _id: event._id });
  res.json({ success: true, message: "Event deleted" });
};

exports.joinEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event || event.status !== "approved") {
    return res
      .status(404)
      .json({ success: false, message: "Event not found or not open" });
  }
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

exports.approveEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true },
  )
    .populate("organizer", "name profilePhoto")
    .lean();
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // Send notification to event organizer
  const organizer = await User.findById(event.organizer._id);
  if (organizer) {
    await notificationService.createNotification({
      userId: organizer._id,
      type: "event_approved",
      title: "Your Event is Approved!",
      message: `Your event "${event.title}" has been approved and is now visible.`,
      data: {
        eventId: event._id,
        eventTitle: event.title,
      },
      actionUrl: `/events/${event._id}`,
      sendEmail: true,
      emailRecipient: organizer.email,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${String(organizer._id)}`).emit("notification:new", {
        type: "event_approved",
        title: "Event Approved!",
        message: `Your event "${event.title}" is now live.`,
      });
    }
  }

  res.json({ success: true, event: formatEvent(event) });
};

exports.getEventStats = async (req, res) => {
  const totalAvailable = await Event.countDocuments({ status: "approved" });
  const joinedCount = await Event.countDocuments({
    status: "approved",
    participants: new mongoose.Types.ObjectId(req.user.userId),
  });
  const remaining = totalAvailable - joinedCount;

  res.json({
    success: true,
    stats: {
      totalAvailable,
      joined: joinedCount,
      remaining: remaining < 0 ? 0 : remaining,
    },
  });
};

exports.getEventFilters = async (req, res) => {
  const events = await Event.find({ status: "approved" }).lean();

  const locations = [...new Set(events.map((e) => e.location).filter(Boolean))];

  res.json({
    success: true,
    filters: { locations },
  });
};

// Participants list (admin or organizer only)
exports.getParticipants = async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate(
      "participants",
      "name email role phone profilePhoto graduationYear university company position",
    )
    .lean();

  if (!event)
    return res.status(404).json({ success: false, message: "Event not found" });

  // Only organizer or admin can view participants
  const owner = String(event.organizer) === req.user.userId;
  if (!owner && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not allowed" });
  }

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

exports.sendEventReminders = async (req, res) => {
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
