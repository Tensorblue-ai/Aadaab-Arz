import { notFound } from 'next/navigation';
import ManagedEventDetail from '@/components/ManagedEventDetail';
import { getEvent } from '@/lib/events';
import { pageMetadata } from '@/lib/seo';
import { EventSchema, eventCanonical, Breadcrumbs } from '@/components/Seo';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  return pageMetadata(event.title, event.description || event.fullDescription.slice(0, 160) || `${event.title} at ${event.place} on ${event.dateLabel}.`, `/events/${slug}`, event.imageUrl || undefined, eventCanonical(event));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  return <><div className="seo-event-breadcrumb"><Breadcrumbs title={event.title} path={`/events/${slug}`} /></div><EventSchema event={event} /><ManagedEventDetail event={event} /></>;
}
