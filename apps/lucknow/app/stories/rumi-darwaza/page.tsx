import StoryArticle from '@/components/StoryArticle';
import { STORIES } from '@/lib/stories';
import { pageMetadata, siteOrigin } from '@/lib/seo';
const story = STORIES[0];
const baseMetadata = pageMetadata(story.title, story.description, '/stories/rumi-darwaza', story.image, new URL('/stories/rumi-darwaza', siteOrigin).toString());
export const metadata = { ...baseMetadata, openGraph: { ...baseMetadata.openGraph, type: 'article' as const } };
export default function Page() { return <StoryArticle story={story} />; }
