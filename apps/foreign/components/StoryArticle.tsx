import { STORIES } from '@/lib/stories';
import { absoluteUrl, siteName, siteOrigin } from '@/lib/seo';
import { Breadcrumbs, JsonLd } from '@/components/Seo';

export default function StoryArticle({ story }: { story: typeof STORIES[number] }) {
  const path = `/stories/${story.slug}`;
  const canonical = new URL(path, siteOrigin).toString();
  return <main className="seo-story"><Breadcrumbs title={story.title} path={path} /><article><h1>{story.title}</h1><p>{story.description}</p><img src={absoluteUrl(story.image)} alt={story.title} width="1200" height="800" style={{ width: '100%', height: 'auto' }} /><h2>Explore the tradition</h2>{story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<p>Further reading: <a href={story.source}>{story.title}</a></p><h2>Related stories</h2><ul>{STORIES.filter((item) => item.slug !== story.slug).map((item) => <li key={item.slug}><a href={absoluteUrl(`/stories/${item.slug}`)}>{item.title}</a></li>)}</ul><a href={absoluteUrl('/stories')}>All stories</a></article><JsonLd data={{ '@context': 'https://schema.org', '@type': 'Article', headline: story.title, description: story.description, image: absoluteUrl(story.image), mainEntityOfPage: canonical, publisher: { '@type': 'Organization', name: siteName, url: absoluteUrl('/') } }} /></main>;
}
