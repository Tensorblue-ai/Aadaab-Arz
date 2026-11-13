import { absoluteUrl, siteName, siteOrigin } from '@/lib/seo';
import type { EventDetails } from '@/lib/events';

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

export function OrganizationSchema() {
  return <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Organization', '@id': `${absoluteUrl('/')}#organization`, name: siteName, url: absoluteUrl('/'), logo: absoluteUrl('/images/aadaab-arz-logo.png') }} />;
}

export function Breadcrumbs({ title, path }: { title: string; path: string }) {
  return <><nav aria-label="Breadcrumb"><a href={absoluteUrl('/')}>Home</a><span> / {title}</span></nav><JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: siteName, item: absoluteUrl('/') }, { '@type': 'ListItem', position: 2, name: title, item: absoluteUrl(path) }] }} /></>;
}

export function eventCanonical(event: EventDetails) {
  return event.site === 'both' ? new URL(`/events/${event.slug}`, siteOrigin).toString() : absoluteUrl(`/events/${event.slug}`);
}

function eventDateTime(date: string, time: string, timeZone: string) {
  if (!/^\d{2}:\d{2}$/.test(time) || !timeZone) return date;
  try {
    const local = `${date}T${time}:00`;
    let instant = Date.parse(`${local}Z`);
    let offset = '+00:00';
    for (let i = 0; i < 3; i++) {
      const label = new Intl.DateTimeFormat('en', { timeZone, timeZoneName: 'longOffset' }).formatToParts(instant).find((part) => part.type === 'timeZoneName')?.value;
      offset = label === 'GMT' ? '+00:00' : label?.replace('GMT', '') || '+00:00';
      instant = Date.parse(`${local}${offset}`);
    }
    return `${local}${offset}`;
  } catch { return date; }
}

export function EventSchema({ event }: { event: EventDetails }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.eventDate)) return null;
  const nextDate = new Date(`${event.eventDate}T00:00:00Z`);
  if (event.endTime && event.startTime && event.endTime < event.startTime) nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  return <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Event', name: event.title, description: event.description || event.fullDescription, url: eventCanonical(event), startDate: eventDateTime(event.eventDate, event.startTime, event.timeZone), endDate: event.endTime ? eventDateTime(nextDate.toISOString().slice(0, 10), event.endTime, event.timeZone) : undefined, eventStatus: event.eventStatus ? `https://schema.org/${event.eventStatus}` : undefined, location: { '@type': 'Place', name: event.place, address: event.venueAddress ? { '@type': 'PostalAddress', streetAddress: event.venueAddress } : undefined }, image: event.imageUrl ? [absoluteUrl(event.imageUrl)] : undefined, organizer: { '@type': 'Organization', name: siteName, url: absoluteUrl('/') }, offers: event.offerPrice !== '' && event.offerCurrency && event.registrationUrl ? { '@type': 'Offer', url: event.registrationUrl, price: event.offerPrice, priceCurrency: event.offerCurrency } : undefined }} />;
}
