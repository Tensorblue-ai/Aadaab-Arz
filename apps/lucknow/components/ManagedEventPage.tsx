'use client';

import { useEffect, useState } from 'react';

const CONTENT_API_BASE = process.env.NEXT_PUBLIC_CONTENT_API_BASE ?? 'https://supplier-reporting-scott-violations.trycloudflare.com';

type ContentBlock = { id: string; type: 'heading' | 'text' | 'image' | 'video' | 'quote' | 'callout' | 'list' | 'divider'; level?: 'h2' | 'h3'; title?: string; text?: string; url?: string; caption?: string; attribution?: string; items?: string[] };

type EventDetails = {
  title: string;
  dateLabel: string;
  place: string;
  time: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  qrImageUrl: string;
  gallery: string[];
  registrationUrl: string;
  upiId: string;
  paymentAmount: string;
  contentBlocks: ContentBlock[];
};

function videoEmbedUrl(url = '') {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  return vimeo ? `https://player.vimeo.com/video/${vimeo[1]}` : '';
}

function EventContentBlock({ block }: { block: ContentBlock }) {
  if (block.type === 'heading') {
    const Heading = block.level === 'h3' ? 'h3' : 'h2';
    return <Heading className="event-content-heading">{block.text}</Heading>;
  }
  if (block.type === 'text') return <div className="event-content-text">{block.text?.split(/\n+/).filter(Boolean).map((text) => <p key={text}>{text}</p>)}</div>;
  if (block.type === 'image') return <figure className="event-content-image"><img src={block.url} alt={block.caption || ''} />{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
  if (block.type === 'video') {
    const embed = videoEmbedUrl(block.url);
    return embed ? <div className="event-content-video"><iframe src={embed} title="Event video" allowFullScreen /></div> : <a className="event-content-video-link" href={block.url} target="_blank" rel="noreferrer">Watch event video ↗</a>;
  }
  if (block.type === 'quote') return <blockquote className="event-content-quote"><p>{block.text}</p>{block.attribution && <cite>— {block.attribution}</cite>}</blockquote>;
  if (block.type === 'callout') return <aside className="event-content-callout"><h3>{block.title}</h3><p>{block.text}</p></aside>;
  if (block.type === 'list') return <ul className="event-content-list">{block.items?.map((item) => <li key={item}>{item}</li>)}</ul>;
  return <hr className="event-content-divider" />;
}

export default function ManagedEventPage() {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const slug = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop() ?? '');
    fetch(`${CONTENT_API_BASE}/api/public/events/${encodeURIComponent(slug)}?site=lucknow`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setEvent)
      .catch(() => setMissing(true));
  }, []);

  if (missing) return <main className="managed-event-state"><a href="/#events">← Back to events</a><h1>Event not found.</h1></main>;
  if (!event) return <main className="managed-event-state"><p>Loading event…</p></main>;

  const paragraphs = (event.fullDescription || event.description).split(/\n+/).filter(Boolean);
  return (
    <div className="managed-event-page">
      <header className="managed-event-header">
        <a className="managed-event-brand" href="/"><img className="brand-logo" src="/images/aadaab-arz-logo.png" alt="" />Aadaab Arz Lucknow</a>
        <nav aria-label="Event page navigation">
          <a href="/#heritage">Explore</a>
          <a href="/#events">Events</a>
          <a href="/#stories">Stories</a>
          <a href="/#community">Community</a>
          <a href="/#members">Members</a>
          <a href="/#contact">Contact</a>
        </nav>
        <a className="managed-event-back" href="/#events">All gatherings</a>
      </header>
      <main>
        <section className="managed-event-hero">
          <img src={event.imageUrl} alt={event.title} />
          <div>
            <p className="managed-event-eyebrow">Aadaab Arz · Gathering</p>
            <h1>{event.title}</h1>
            <p>{event.description}</p>
            <dl><div><dt>Date</dt><dd>{event.dateLabel}</dd></div><div><dt>Time</dt><dd>{event.time}</dd></div><div><dt>Venue</dt><dd>{event.place}</dd></div></dl>
            {event.registrationUrl ? <a className="managed-event-action" href={event.registrationUrl} target="_blank" rel="noreferrer">Register for this event <span>↗</span></a> : <span className="managed-event-action is-placeholder" aria-disabled="true">Registration opening soon</span>}
          </div>
        </section>

        <section className="managed-event-body">
          <article>
            <p className="managed-event-eyebrow">About the gathering</p>
            <h2>Everything you need to know.</h2>
            {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
          <aside className="managed-event-payment">
            <p className="managed-event-eyebrow">Registration payment</p>
            <h2>Pay by UPI</h2>
            {event.qrImageUrl ? <img src={event.qrImageUrl} alt="UPI payment QR code" /> : <div className="managed-payment-placeholder">QR code<br />coming soon</div>}
            <p><strong>Fee</strong><span>{event.paymentAmount || 'To be announced'}</span></p>
            <p><strong>UPI ID</strong><span>{event.upiId || 'Coming soon'}</span></p>
          </aside>
        </section>

        {event.contentBlocks?.length > 0 && <section className="managed-event-content">
          {event.contentBlocks.map((block) => <EventContentBlock key={block.id} block={block} />)}
        </section>}

        {event.gallery.length > 0 && <section className="managed-event-gallery">
          <p className="managed-event-eyebrow">Event gallery</p>
          <h2>A glimpse of the experience.</h2>
          <div>{event.gallery.map((image, index) => <img key={image} src={image} alt={`${event.title} gallery ${index + 1}`} />)}</div>
        </section>}
      </main>
      <footer className="managed-event-footer"><img className="footer-logo" src="/images/aadaab-arz-logo.png" alt="" /><p>Aadaab Arz Lucknow · People · Places · Stories</p></footer>
    </div>
  );
}
