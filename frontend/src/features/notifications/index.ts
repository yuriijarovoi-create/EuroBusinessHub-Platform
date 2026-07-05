/** Notifications feature — prepared for real-time alerts */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'message';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'info',
    title: 'Neue Transportanfrage',
    body: 'Frankfurt → Amsterdam · 12t Fracht',
    read: false,
    createdAt: '2026-07-05T10:00:00Z',
  },
  {
    id: 'n2',
    type: 'success',
    title: 'Marktplatz-Deal',
    body: 'Bestellung #4821 bestätigt',
    read: false,
    createdAt: '2026-07-05T09:30:00Z',
  },
  {
    id: 'n3',
    type: 'message',
    title: 'KI-Empfehlung',
    body: '3 neue Partner-Matches für Ihr Profil',
    read: true,
    createdAt: '2026-07-04T16:00:00Z',
  },
];
