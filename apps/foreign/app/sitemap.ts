import type { MetadataRoute } from 'next';
import { getEvents } from '@/lib/events';
import { FOREIGN_MEMBERS } from '@/lib/members';
import { STORIES } from '@/lib/stories';
import { absoluteUrl, siteOrigin } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEvents();
  const paths = ['/', '/events', '/stories', '/community', '/community/archive', '/community/guidelines', '/community/join', ...STORIES.map((story) => `/stories/${story.slug}`), ...FOREIGN_MEMBERS.map((member) => `/members/${member.slug}`), ...events.map((event) => `/events/${event.slug}`)];
  const entries: MetadataRoute.Sitemap = paths.map((path) => ({ url: absoluteUrl(path) }));
  const lucknowEvents = await getEvents('lucknow');
  const homePaths = ['/home', '/home/events', '/home/members', '/home/stories', ...['iffat', 'sheikh-tariq', 'murad', 'tariq-durrani'].map((slug) => `/home/members/${slug}`), ...lucknowEvents.filter((event) => event.site !== 'both').map((event) => `/home/events/${event.slug}`)];
  entries.push(...homePaths.map((path) => ({ url: new URL(path, siteOrigin).toString() })));

  return entries;
}
