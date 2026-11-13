import { HomePage } from '@/components/ForeignSite';
import { getEvents } from '@/lib/events';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('Lucknow Heritage & Global Community', 'Explore Lucknow’s heritage, craft, music and stories with the Aadaab Arz Lucknow Abroad community.', '/');
export default async function Page() { return <HomePage events={await getEvents()} />; }
