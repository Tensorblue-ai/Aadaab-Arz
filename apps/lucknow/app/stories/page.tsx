import { STORIES } from '@/lib/stories';
import { absoluteUrl, pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('Stories of Lucknow', 'Explore the architecture, music and craft traditions of Lucknow and Awadh.', '/stories');
export default function Page() { return <main className="seo-story"><a href={absoluteUrl('/')}>Home</a><h1>Stories of Lucknow</h1>{STORIES.map((story) => <article key={story.slug}><h2><a href={absoluteUrl(`/stories/${story.slug}`)}>{story.title}</a></h2><p>{story.description}</p></article>)}</main>; }
