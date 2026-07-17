export interface Event {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  location?: string;
  organizer: {
    _id: string;
    name: string;
  };
  participants?: string[];
  imageUrl?: string;
  createdAt: string;
}
