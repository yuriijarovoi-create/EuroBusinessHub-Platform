/** Messaging feature — prepared for in-platform communication */
export interface MessageThread {
  id: string;
  participants: string[];
  lastMessage: string;
  updatedAt: string;
}

export const mockThreads: MessageThread[] = [];
