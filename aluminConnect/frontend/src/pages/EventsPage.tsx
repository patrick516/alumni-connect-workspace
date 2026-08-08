import { useEffect, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import {
  getEventsApi,
  createEventApi,
  joinEventApi,
  getEventParticipantsApi,
  type EventParticipant,
  type EventParticipantsResponse,
} from "../api/eventApi";
import { useAuth } from "../context/AuthContext";
import { DatePicker } from "../components/ui/date-picker";
import type { Event } from "../types";
import {
  X,
  Users,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Briefcase,
} from "lucide-react";

const ParticipantsDrawer = ({
  eventId,
  onClose,
}: {
  eventId: string;
  onClose: () => void;
}) => {
  const [data, setData] = useState<EventParticipantsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getEventParticipantsApi(eventId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  const roleColor = (role: string) => {
    if (role === "alumni") return "bg-orange-100 text-orange-700";
    if (role === "admin") return "bg-purple-100 text-purple-700";
    return "bg-blue-100 text-[#1e3a6e]";
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Registrants</h3>
            {data && (
              <p className="text-xs text-gray-400 mt-0.5">{data.title}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {data && (
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <Users size={15} className="text-[#1e3a6e]" />
            <span className="text-sm font-semibold text-[#1e3a6e]">
              {data.total}
            </span>
            <span className="text-sm text-gray-500">
              {data.total === 1 ? "person registered" : "people registered"}
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-5 text-center text-red-500 text-sm">{error}</div>
          ) : !data || data.participants.length === 0 ? (
            <div className="p-8 text-center">
              <Users size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">
                No one has registered yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.participants.map((p: EventParticipant, idx: number) => (
                <div
                  key={p._id}
                  className="p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[#1e3a6e] flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                      {p.profilePhoto ? (
                        <img
                          src={p.profilePhoto}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        p.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {p.name}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          #{idx + 1}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${roleColor(p.role)}`}
                      >
                        {p.role}
                      </span>
                    </div>
                  </div>
                  <div className="pl-12 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail size={11} className="shrink-0 text-gray-400" />
                      <span className="truncate">{p.email}</span>
                    </div>
                    {p.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone size={11} className="shrink-0 text-gray-400" />
                        {p.phone}
                      </div>
                    )}
                    {p.graduationYear && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <GraduationCap
                          size={11}
                          className="shrink-0 text-gray-400"
                        />
                        Class of {p.graduationYear}
                      </div>
                    )}
                    {p.university && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Building2
                          size={11}
                          className="shrink-0 text-gray-400"
                        />
                        {p.university}
                      </div>
                    )}
                    {(p.position || p.company) && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Briefcase
                          size={11}
                          className="shrink-0 text-gray-400"
                        />
                        {[p.position, p.company].filter(Boolean).join(" at ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EventsPage = () => {
  const { user } = useAuth();
  const [drawerEventId, setDrawerEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
  });

  const fetchEvents = () => {
    setLoading(true);
    getEventsApi()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleJoin = async (id: string) => {
    try {
      await joinEventApi(id);
      setSuccess("You've registered for this event!");
      setEvents((prev) =>
        prev.map((ev) => {
          if (ev._id !== id || !user?._id) return ev;
          const already = (ev.participants || []).includes(user._id);
          return already
            ? ev
            : { ...ev, participants: [...(ev.participants || []), user._id] };
        }),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join event");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createEventApi(form as Partial<Event>);
      setSuccess("Event submitted for admin approval.");
      setShowModal(false);
      setForm({ title: "", description: "", eventDate: "", location: "" });
      fetchEvents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()),
  );

  const upcoming = filtered.filter((e) => new Date(e.eventDate) >= new Date());
  const past = filtered.filter((e) => new Date(e.eventDate) < new Date());

  const EventCard = ({ event }: { event: Event }) => {
    const isPast = new Date(event.eventDate) < new Date();
    const isOwner = user && event.organizer?._id === user._id;
    const isAdmin = user?.role === "admin";
    const isRegistered =
      !!user && (event.participants || []).includes(user._id);
    const count = event.participants?.length || 0;
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base">
              {event.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Organized by {event.organizer?.name || "University"}
            </p>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${
              event.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : event.status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : isPast
                    ? "bg-gray-100 text-gray-500"
                    : "bg-blue-100 text-[#1e3a6e]"
            }`}
          >
            {event.status === "pending"
              ? "Pending Approval"
              : event.status === "rejected"
                ? "Rejected"
                : isPast
                  ? "Past"
                  : "Upcoming"}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {event.description}
        </p>

        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
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
            {new Date(event.eventDate).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {event.location && (
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {event.location}
            </span>
          )}
          {event.participants && (
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              </svg>
              {event.participants.length} registered
            </span>
          )}
        </div>

        {isOwner || isAdmin ? (
          <button
            onClick={() => setDrawerEventId(event._id)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#1e3a6e]/5 hover:bg-[#1e3a6e]/10 text-[#1e3a6e] text-sm font-medium transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              {count === 0
                ? "No registrants yet"
                : `${count} ${count === 1 ? "registrant" : "registrants"}`}
            </span>
            <span className="text-[#1e3a6e]/60">View →</span>
          </button>
        ) : (
          !isPast && (
            <button
              onClick={() => handleJoin(event._id)}
              disabled={isRegistered}
              className="w-full bg-[#1e3a6e] hover:bg-[#162d57] text-white text-sm font-semibold py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRegistered ? "Already Registered" : "Register for Event"}
            </button>
          )
        )}
      </div>
    );
  };

  return (
    <PageContainer title="Events">
      {drawerEventId && (
        <ParticipantsDrawer
          eventId={drawerEventId}
          onClose={() => setDrawerEventId(null)}
        />
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">University Events</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {upcoming.length} upcoming events
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#1e3a6e] hover:bg-[#162d57] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Event
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          {success}
          <button onClick={() => setSuccess("")}>✕</button>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}>✕</button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Upcoming
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((e) => (
                  <EventCard key={e._id} event={e} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Past Events
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {past.map((e) => (
                  <EventCard key={e._id} event={e} />
                ))}
              </div>
            </div>
          )}
          {filtered.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-16">
              No events found.
            </p>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Create New Event</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Event Date
                </label>
                <DatePicker
                  value={form.eventDate}
                  onChange={(value) => setForm({ ...form, eventDate: value })}
                  placeholder="Select event date & time"
                  includeTime
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Location{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a6e]"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#1e3a6e] hover:bg-[#162d57] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit for Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default EventsPage;
