const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const { canExchangeMessages } = require("../services/connection.service");
const notificationService = require("../services/notification.service");

const formatMessage = (m) => ({
  _id: String(m._id),
  senderId: String(m.senderId._id || m.senderId),
  receiverId: String(m.receiverId._id || m.receiverId),
  message: m.message,
  timestamp: (m.createdAt || m.timestamp)?.toISOString?.() || m.createdAt,
  read: !!m.read,
});

exports.getConversations = async (req, res) => {
  const me = new mongoose.Types.ObjectId(req.user.userId);
  const messages = await Message.find({
    $or: [{ senderId: me }, { receiverId: me }],
  })
    .sort({ createdAt: -1 })
    .populate("senderId", "name profilePhoto role")
    .populate("receiverId", "name profilePhoto role")
    .lean();

  const seen = new Map();
  for (const m of messages) {
    const senderId = String(m.senderId._id);
    const receiverId = String(m.receiverId._id);
    const otherId = senderId === req.user.userId ? receiverId : senderId;

    const allowed = await canExchangeMessages(req.user.userId, otherId);
    if (!allowed) continue;
    if (seen.has(otherId)) continue;

    const other = senderId === req.user.userId ? m.receiverId : m.senderId;
    const unread = await Message.countDocuments({
      senderId: otherId,
      receiverId: req.user.userId,
      read: false,
    });

    seen.set(otherId, {
      user: {
        _id: otherId,
        name: other.name,
        profilePhoto: other.profilePhoto || "",
        role: other.role,
      },
      lastMessage: m.message,
      lastTimestamp: m.createdAt.toISOString(),
      unreadCount: unread,
    });
  }

  res.json({ success: true, conversations: [...seen.values()] });
};

exports.getThread = async (req, res) => {
  const me = req.user.userId;
  const other = req.params.userId;

  const allowed = await canExchangeMessages(me, other);
  if (!allowed) {
    return res.status(403).json({
      success: false,
      message:
        "You can only message this person after a connection is accepted (students ↔ alumni), or if you are both alumni.",
    });
  }

  const list = await Message.find({
    $or: [
      { senderId: me, receiverId: other },
      { senderId: other, receiverId: me },
    ],
  })
    .sort({ createdAt: 1 })
    .lean();

  await Message.updateMany(
    { senderId: other, receiverId: me, read: false },
    { read: true },
  );

  res.json({
    success: true,
    messages: list.map((m) =>
      formatMessage({
        ...m,
        senderId: { _id: m.senderId },
        receiverId: { _id: m.receiverId },
      }),
    ),
  });
};

exports.sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;

  const allowed = await canExchangeMessages(req.user.userId, receiverId);
  if (!allowed) {
    return res.status(403).json({
      success: false,
      message:
        "Messaging not allowed until this connection is accepted, or you are not permitted to message this user.",
    });
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return res
      .status(404)
      .json({ success: false, message: "Receiver not found" });
  }

  const doc = await Message.create({
    senderId: req.user.userId,
    receiverId,
    message: message.trim(),
  });
  const plain = doc.toObject();
  const payload = formatMessage({
    ...plain,
    senderId: { _id: plain.senderId },
    receiverId: { _id: plain.receiverId },
  });

  const io = req.app.get("io");
  if (io) {
    io.to(`user:${receiverId}`).emit("message:new", payload);
  }

  // Send notification for new message
  if (receiverId !== req.user.userId) {
    const sender = await User.findById(req.user.userId);
    await notificationService.notifyNewMessage(
      sender,
      receiver,
      message.trim(),
    );

    if (io) {
      const unreadCount = await notificationService.getUnreadCount(receiverId);
      io.to(`user:${receiverId}`).emit("notification:new", {
        type: "new_message",
        title: `New Message from ${sender.name}`,
        message: message.trim().substring(0, 100),
        unreadCount,
      });
    }
  }

  res.status(201).json({ success: true, message: payload });
};
