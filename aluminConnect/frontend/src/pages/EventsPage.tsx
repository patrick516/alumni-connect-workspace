import { useEffect, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import { getEventsApi, joinEventApi } from "../api/eventApi";
import type { Event } from "../types";

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getEventsApi()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (id: string) => {
    try {
      await joinEventApi(id);
      setSuccess("You've registered for this event!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join event");
    }
  };

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()),
  );

  const upcoming = filtered.filter((e) => new Date(e.eventDate) >= new Date());
  const past = filtered.filter((e) => new Date(e.eventDate) < new Date());

  const EventCard = ({ event }: { event: Event }) => {
    const isPast = new Date(event.eventDate) < new Date();
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
              isPast
                ? "bg-gray-100 text-gray-500"
                : "bg-blue-100 text-[#1e3a6e]"
            }`}
          >
            {isPast ? "Past" : "Upcoming"}
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

        {!isPast && (
          <button
            onClick={() => handleJoin(event._id)}
            className="w-full bg-[#1e3a6e] hover:bg-[#162d57] text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            Register for Event
          </button>
        )}
      </div>
    );
  };

  return (
    <PageContainer title="Events">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">University Events</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {upcoming.length} upcoming events
          </p>
        </div>
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
    </PageContainer>
  );
};

export default EventsPage;
