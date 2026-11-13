import type { MetadataRoute } from 'next';
import { getEvents } from '@/lib/events';
import { MEMBERS } from '@/components/MembersExperience';
import { absoluteUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEvents();
  const paths = ['/', '/events', '/members', '/stories',  ...MEMBERS.map((member) => `/members/${member.slug}`), ...events.filter((event) => event.site !== 'both').map((event) => `/events/${event.slug}`)];
  const entries: MetadataRoute.Sitemap = paths.map((path) => ({ url: absoluteUrl(path) }));
  return entries;
}
