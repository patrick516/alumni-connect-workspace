import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { getSocketBaseUrl } from "../lib/socketUrl";

type SocketContextValue = { socket: Socket | null };

const SocketContext = createContext<SocketContextValue>({ socket: null });

/** Fired on connection-related socket events so sidebars can refetch counts. */
export const AC_SOCKET_EVENT = "ac-socket";

// NEW: Notification event types
export type NotificationEventType =
  | "notification:new"
  | "notification:read"
  | "notification:deleted";

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user?.token) {
      setSocket(null);
      return;
    }

    const s = io(getSocketBaseUrl(), {
      auth: { token: user.token },
      transports: ["websocket", "polling"],
    });

    setSocket(s);

    const notify = () => window.dispatchEvent(new Event(AC_SOCKET_EVENT));

    // Connection events
    s.on("connection:incoming", notify);
    s.on("connection:accepted", notify);
    s.on("connection:rejected", notify);

    // NEW: Notification events
    s.on("notification:new", (data) => {
      // Dispatch a custom event for notification updates
      window.dispatchEvent(
        new CustomEvent("notification:new", { detail: data }),
      );
    });

    s.on("notification:read", (data) => {
      window.dispatchEvent(
        new CustomEvent("notification:read", { detail: data }),
      );
    });

    return () => {
      s.off("connection:incoming", notify);
      s.off("connection:accepted", notify);
      s.off("connection:rejected", notify);
      s.off("notification:new");
      s.off("notification:read");
      s.disconnect();
      setSocket(null);
    };
  }, [user?.token]);

  const value = useMemo(() => ({ socket }), [socket]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
