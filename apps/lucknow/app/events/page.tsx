import { getEvents } from '@/lib/events';
import { absoluteUrl, pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('Heritage Walks & Cultural Events', 'Explore published Lucknow heritage walks, music evenings and cultural gatherings.', '/events');
export default async function Page() {
  const events = await getEvents();
  return <main className="seo-story"><a href={absoluteUrl('/')}>Home</a><h1>Events in Lucknow</h1>{events.length ? events.map((event) => <article key={event.slug}><p>{event.isPast ? 'Past event' : 'Gathering'} · {event.dateLabel}</p><h2><a href={absoluteUrl(`/events/${event.slug}`)}>{event.title}</a></h2><p>{event.description}</p><p>{event.place} · {event.time}</p></article>) : <p>No published events yet.</p>}</main>;
}
