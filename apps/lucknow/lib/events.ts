import { cache } from 'react';
import { headers } from 'next/headers';

export type ContentBlock = { id: string; type: 'heading' | 'text' | 'image' | 'video' | 'quote' | 'callout' | 'list' | 'divider'; level?: 'h2' | 'h3'; title?: string; text?: string; url?: string; caption?: string; attribution?: string; items?: string[] };
export type EventDetails = {
  site: 'lucknow' | 'foreign' | 'both'; id: string; slug: string; title: string; dateLabel: string; eventDate: string;
  startTime: string; endTime: string; place: string; time: string;
  timeZone: string; venueAddress: string; eventStatus: string; offerPrice: string; offerCurrency: string; isPast?: boolean;
  description: string; fullDescription: string; imageUrl: string; qrImageUrl: string;
  gallery: string[]; registrationUrl: string; upiId: string; paymentAmount: string;
  contentBlocks: ContentBlock[];
};

function optimizedImage(url: string) {
  const match = url.match(/^(?:https:\/\/aadaabarzlucknowabroad\.com)?(\/images\/events\/(?:heritage-walk|music-evening|craft-baithak|dastangoi-under-stars)-v2)\.png$/);
  return match ? `${match[1]}.webp` : url;
}

async function apiOrigin() {
  const configured = process.env.CONTENT_API_ORIGIN || process.env.NEXT_PUBLIC_CONTENT_API_BASE;
  if (configured && /^https?:\/\//.test(configured)) return configured.replace(/\/$/, '');
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
  if (!host) throw new Error('CONTENT_API_ORIGIN is required');
  const protocol = requestHeaders.get('x-forwarded-proto')?.split(',')[0].trim() || (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${protocol}://${host}`;
}

export const getEvents = cache(async (site: 'lucknow' | 'foreign' = 'lucknow'): Promise<EventDetails[]> => {
  const response = await fetch(`${await apiOrigin()}/api/public/events?site=${site}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Events API returned ${response.status}`);
  const items: EventDetails[] = await response.json();
  const today = new Date().toISOString().slice(0, 10);
  return items.map((event) => ({ ...event, imageUrl: optimizedImage(event.imageUrl), isPast: Boolean(event.eventDate && event.eventDate < today) })).sort((a, b) => Number(a.isPast) - Number(b.isPast));
});

export const getEvent = cache(async (slug: string): Promise<EventDetails | null> => {
  const response = await fetch(`${await apiOrigin()}/api/public/events/${encodeURIComponent(slug)}?site=lucknow`, { cache: 'no-store' });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Events API returned ${response.status}`);
  const event: EventDetails = await response.json();
  return { ...event, imageUrl: optimizedImage(event.imageUrl) };
});
