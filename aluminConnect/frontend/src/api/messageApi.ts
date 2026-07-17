import type { Conversation, Message } from "../types";
import { api, getErrorMessage } from "./client";

export async function getConversationsApi(): Promise<Conversation[]> {
  try {
    const { data } = await api.get<{
      success: boolean;
      conversations: Conversation[];
    }>("/messages/conversations");
    return data.conversations;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch conversations"));
  }
}

export async function getMessagesApi(userId: string): Promise<Message[]> {
  try {
    const { data } = await api.get<{ success: boolean; messages: Message[] }>(
      `/messages/${userId}`,
    );
    return data.messages;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch messages"));
  }
}

export async function sendMessageApi(
  receiverId: string,
  message: string,
): Promise<Message> {
  try {
    const { data } = await api.post<{ success: boolean; message: Message }>(
      "/messages",
      { receiverId, message },
    );
    return data.message;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to send message"));
  }
}
