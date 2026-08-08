import type { Event } from "../types";
import { api, getErrorMessage } from "./client";
export async function getEventsApi(): Promise<Event[]> {
  try {
    const { data } = await api.get("/events");
    return Array.isArray(data) ? data : (data.events ?? []);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch events"));
  }
}

export async function createEventApi(data: Partial<Event>): Promise<Event> {
  try {
    const { data: ev } = await api.post<Event>("/events", data);
    return ev;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to create event"));
  }
}

export async function deleteEventApi(id: string): Promise<void> {
  try {
    await api.delete(`/events/${id}`);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to delete event"));
  }
}

export async function approveEventApi(id: string): Promise<void> {
  try {
    await api.put(`/events/${id}/approve`);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to approve event"));
  }
}

export async function joinEventApi(id: string): Promise<void> {
  try {
    await api.post(`/events/${id}/join`);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to join event"));
  }
}

// ── Participants details (admin) ──────────────────────────────────────────────
export interface EventParticipant {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  profilePhoto: string;
  graduationYear: string;
  university: string;
  company: string;
  position: string;
}

export interface EventParticipantsResponse {
  eventId: string;
  title: string;
  eventDate: string;
  location: string;
  total: number;
  participants: EventParticipant[];
}

export async function getEventParticipantsApi(
  id: string,
): Promise<EventParticipantsResponse> {
  try {
    const { data } = await api.get<EventParticipantsResponse>(
      `/events/${id}/participants`,
    );
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch participants"));
  }
}
