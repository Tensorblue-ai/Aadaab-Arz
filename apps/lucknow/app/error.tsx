'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="seo-story"><h1>Content is temporarily unavailable</h1><p>Please try again shortly.</p><button type="button" onClick={reset}>Try again</button></main>;
}
