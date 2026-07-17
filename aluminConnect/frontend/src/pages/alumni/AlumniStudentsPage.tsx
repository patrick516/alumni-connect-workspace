import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PageContainer from "../../components/layout/PageContainer";
import { useAuth } from "../../context/AuthContext";
import { AC_SOCKET_EVENT } from "../../context/SocketContext";
import {
  acceptConnectionApi,
  getAlumniConnectionsApi,
  rejectConnectionApi,
} from "../../api/connectionApi";
import type { AlumniConnectionsResponse } from "../../types";

const AlumniStudentsPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AlumniConnectionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const d = await getAlumniConnectionsApi();
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const h = () => load();
    window.addEventListener(AC_SOCKET_EVENT, h);
    return () => window.removeEventListener(AC_SOCKET_EVENT, h);
  }, [load]);

  if (user?.role !== "alumni") {
    return <Navigate to="/dashboard" replace />;
  }

  const accept = async (id: string) => {
    setBusyId(id);
    try {
      await acceptConnectionApi(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: string) => {
    setBusyId(id);
    try {
      await rejectConnectionApi(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageContainer title="Students & requests">
      <p className="text-sm text-gray-500 mb-6 max-w-2xl">
        Incoming connection requests appear below. Accept to allow messaging
        with that student. Decline removes the request (they may send again
        later).
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading || !data ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              Notifications
              {data.pending.length > 0 && (
                <span className="rounded-full bg-[#d2621a] px-2 py-0.5 text-xs font-bold text-white">
                  {data.pending.length}
                </span>
              )}
            </h2>
            {data.pending.length === 0 ? (
              <p className="text-sm text-gray-400">No pending requests.</p>
            ) : (
              <ul className="space-y-3">
                {data.pending.map((row) => (
                  <li
                    key={row._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1e3a6e] text-sm font-bold text-white">
                        {row.student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {row.student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Wants to connect · {row.student.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busyId === row._id}
                        onClick={() => accept(row._id)}
                        className="rounded-lg bg-[#1e3a6e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#162d57] disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={busyId === row._id}
                        onClick={() => reject(row._id)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Connected students
            </h2>
            {data.accepted.length === 0 ? (
              <p className="text-sm text-gray-400">
                No accepted connections yet.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {data.accepted.map((row) => (
                  <li
                    key={row._id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700">
                        {row.student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {row.student.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {row.student.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/messages?with=${row.student._id}`}
                      className="shrink-0 rounded-lg bg-[#1e3a6e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#162d57]"
                    >
                      Chat
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </PageContainer>
  );
};

export default AlumniStudentsPage;
