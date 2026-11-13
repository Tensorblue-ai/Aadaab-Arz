import { EventsPage } from '@/components/ForeignSite';
import { getEvents } from '@/lib/events';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('Lucknow Heritage Walks & Cultural Events', 'Find published heritage walks, music evenings and cultural gatherings from Aadaab Arz Lucknow Abroad.', '/events');
export default async function Page() { return <EventsPage events={await getEvents()} />; }
