import ImmersiveExperience from '@/components/ImmersiveExperience';
import { getEvents } from '@/lib/events';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('Lucknow Heritage, Culture & Events', 'Discover Lucknow and Awadh through heritage walks, music, chikankari, stories and the Aadaab Arz Lucknow community.', '/');

export default async function Home() {
  return <ImmersiveExperience events={await getEvents()} />;
}
