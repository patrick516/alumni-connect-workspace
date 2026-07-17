import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import {
  getConversationsApi,
  getMessagesApi,
  sendMessageApi,
} from "../api/messageApi";
import { getPeerUserApi } from "../api/userApi";
import type { Conversation, Message } from "../types";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Skeleton loader strips */
const SkeletonList = () => (
  <div className="p-4 space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
    ))}
  </div>
);

/** Single conversation row */
const ConversationItem = ({
  conv,
  isSelected,
  onClick,
}: {
  conv: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${
      isSelected ? "bg-blue-50/50" : ""
    }`}
  >
    <div className="w-9 h-9 rounded-full bg-[#1e3a6e] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
      {conv.user.name.charAt(0).toUpperCase()}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-900 text-sm truncate">
          {conv.user.name}
        </p>
        {conv.unreadCount > 0 && (
          <span className="bg-[#d2621a] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 ml-1">
            {conv.unreadCount}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
    </div>
  </button>
);

/** Left panel: conversation list */
const ConversationPanel = ({
  conversations,
  selected,
  loading,
  error,
  onSelect,
  // onBack, // mobile: not used here but kept for layout awareness
  mobileOpen,
}: {
  conversations: Conversation[];
  selected: Conversation | null;
  loading: boolean;
  error: string | null;
  onSelect: (conv: Conversation) => void;
  onBack?: () => void;
  mobileOpen: boolean;
}) => (
  <div
    className={`
      ${mobileOpen ? "flex" : "hidden"} md:flex
      w-full md:w-72 border-r border-gray-100 flex-col flex-shrink-0
      absolute md:relative inset-0 z-10 bg-white md:z-auto
    `}
  >
    <div className="p-4 border-b border-gray-100">
      <h3 className="font-semibold text-gray-900 text-sm">Conversations</h3>
      <p className="text-xs text-gray-400 mt-1">
        Student ↔ alumni chats need an accepted connection.
      </p>
    </div>
    <div className="flex-1 overflow-y-auto">
      {loading ? (
        <SkeletonList />
      ) : error ? (
        <div className="p-6 text-center">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-sm">
          No conversations yet.
        </div>
      ) : (
        conversations.map((conv) => (
          <ConversationItem
            key={conv.user._id}
            conv={conv}
            isSelected={selected?.user._id === conv.user._id}
            onClick={() => onSelect(conv)}
          />
        ))
      )}
    </div>
  </div>
);

/** Chat header */
const ChatHeader = ({
  conversation,
  onBack,
}: {
  conversation: Conversation;
  onBack: () => void;
}) => (
  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
    {/* Back button — mobile only */}
    <button
      type="button"
      onClick={onBack}
      className="md:hidden p-1 -ml-1 text-gray-500 hover:text-gray-700"
      aria-label="Back to conversations"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>
    <div className="w-8 h-8 rounded-full bg-[#1e3a6e] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
      {conversation.user.name.charAt(0).toUpperCase()}
    </div>
    <div>
      <p className="font-semibold text-gray-900 text-sm">
        {conversation.user.name}
      </p>
      <p className="text-xs text-gray-400 capitalize">
        {conversation.user.role}
      </p>
    </div>
  </div>
);

/** Message bubble */
const MessageBubble = ({ msg, isMe }: { msg: Message; isMe: boolean }) => (
  <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-[75%] sm:max-w-xs lg:max-w-sm px-4 py-2.5 rounded-xl text-sm ${
        isMe
          ? "bg-[#1e3a6e] text-white rounded-br-sm"
          : "bg-gray-100 text-gray-800 rounded-bl-sm"
      }`}
    >
      <p className="break-words">{msg.message}</p>
      <p className={`text-xs mt-1 ${isMe ? "text-blue-200" : "text-gray-400"}`}>
        {new Date(msg.timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  </div>
);

/** Message input bar */
const MessageInputBar = ({
  value,
  sending,
  error,
  onChange,
  onKeyDown,
  onSend,
}: {
  value: string;
  sending: boolean;
  error: string | null;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
}) => (
  <div className="p-3 sm:p-4 border-t border-gray-100">
    {error && <p className="text-xs text-red-500 mb-2 px-1">{error}</p>}
    <div className="flex items-center gap-2 sm:gap-3">
      <input
        type="text"
        placeholder="Type a message..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={!value.trim() || sending}
        className="bg-[#1e3a6e] hover:bg-[#162d57] text-white p-2.5 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
      >
        {sending ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        )}
      </button>
    </div>
  </div>
);

/** Empty state when no conversation selected */
const EmptyChat = () => (
  <div className="flex-1 hidden md:flex items-center justify-center text-gray-400 text-sm">
    <div className="text-center">
      <svg
        className="w-12 h-12 mx-auto mb-3 text-gray-200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <p>Select a conversation to start messaging</p>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const MessagingPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [text, setText] = useState("");

  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const [convError, setConvError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  /** Mobile: true = show conversation list, false = show chat window */
  const [showList, setShowList] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Performance: stable refreshConversations via useCallback ──────────────
  const refreshConversations = useCallback(() => {
    getConversationsApi().then(setConversations).catch(console.error);
  }, []);

  // ── Load conversations ────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingConvs(true);
    setConvError(null);
    getConversationsApi()
      .then(setConversations)
      .catch(() =>
        setConvError("Failed to load conversations. Please refresh."),
      )
      .finally(() => setLoadingConvs(false));
  }, []);

  // ── Load messages for selected conversation ───────────────────────────────
  useEffect(() => {
    if (!selected) return;
    setLoadingMsgs(true);
    getMessagesApi(selected.user._id)
      .then(setMessages)
      .catch(() => setMessages([])) // silently fail; chat area stays visible
      .finally(() => setLoadingMsgs(false));
  }, [selected]);

  // ── Open thread from ?with=<userId> ──────────────────────────────────────
  useEffect(() => {
    const withId = searchParams.get("with");
    if (!withId || loadingConvs) return;

    const match = conversations.find((c) => c.user._id === withId);
    if (match) {
      setSelected(match);
      setShowList(false);
      setSearchParams({}, { replace: true });
      return;
    }

    getPeerUserApi(withId)
      .then((peer) => {
        setSelected({
          user: peer,
          lastMessage: "",
          lastTimestamp: new Date().toISOString(),
          unreadCount: 0,
        });
        setShowList(false);
        setSearchParams({}, { replace: true });
      })
      .catch(() => {
        /* invalid ?with= or not allowed to message */
      });
  }, [searchParams, conversations, loadingConvs, setSearchParams]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Real-time via Socket.IO ───────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const onNew = (msg: Message) => {
      refreshConversations();
      if (!selected) return;
      const partner = selected.user._id;
      const involves =
        (msg.senderId === partner && msg.receiverId === user?._id) ||
        (msg.receiverId === partner && msg.senderId === user?._id);
      if (!involves) return;
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg],
      );
    };
    socket.on("message:new", onNew);
    return () => {
      socket.off("message:new", onNew);
    };
  }, [socket, selected?.user._id, user?._id, refreshConversations]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!text.trim() || !selected) return;
    setSending(true);
    setSendError(null);
    try {
      const msg = await sendMessageApi(selected.user._id, text.trim());
      setMessages((prev) => [...prev, msg]);
      refreshConversations();
      setText("");
    } catch {
      setSendError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelected(conv);
    setShowList(false); // mobile: switch to chat view
    setSendError(null);
  };

  const handleBack = () => {
    setShowList(true); // mobile: go back to list
  };

  return (
    <PageContainer title="Messages">
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative"
        style={{ height: "calc(100vh - 120px)" }}
      >
        <div className="flex h-full">
          {/* Conversation list */}
          <ConversationPanel
            conversations={conversations}
            selected={selected}
            loading={loadingConvs}
            error={convError}
            onSelect={handleSelectConversation}
            onBack={handleBack}
            mobileOpen={showList}
          />

          {/* Chat window */}
          {selected ? (
            <div
              className={`
                ${!showList ? "flex" : "hidden"} md:flex
                flex-1 flex-col
                absolute md:relative inset-0 z-10 bg-white md:z-auto
              `}
            >
              <ChatHeader conversation={selected} onBack={handleBack} />

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                {loadingMsgs ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-10 w-48 bg-gray-100 rounded-xl animate-pulse ${
                          i % 2 === 0 ? "ml-auto" : ""
                        }`}
                      />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm pt-8">
                    Start a conversation with {selected.user.name}
                  </p>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble
                      key={msg._id}
                      msg={msg}
                      isMe={msg.senderId === user?._id}
                    />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <MessageInputBar
                value={text}
                sending={sending}
                error={sendError}
                onChange={setText}
                onKeyDown={handleKey}
                onSend={handleSend}
              />
            </div>
          ) : (
            <EmptyChat />
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default MessagingPage;
