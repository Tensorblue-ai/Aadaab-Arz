import Image from 'next/image';
import { sitePath } from '@/lib/site-path';

import type { ContentBlock, EventDetails } from '@/lib/events';

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
  if (block.type === 'image') return <figure className="event-content-image"><img loading="lazy" decoding="async" src={sitePath(block.url)} alt={block.caption || ''} />{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
  if (block.type === 'video') {
    const embed = videoEmbedUrl(block.url);
    return embed ? <div className="event-content-video"><iframe src={embed} title="Event video" allowFullScreen /></div> : /\.(mp4|webm|ogg)(?:[?#]|$)/i.test(block.url || '') ? <video className="event-content-video" src={sitePath(block.url)} controls preload="metadata" /> : <a className="event-content-video-link" href={block.url} target="_blank" rel="noreferrer">Watch event video ↗</a>;
  }
  if (block.type === 'quote') return <blockquote className="event-content-quote"><p>{block.text}</p>{block.attribution && <cite>— {block.attribution}</cite>}</blockquote>;
  if (block.type === 'callout') return <aside className="event-content-callout"><h3>{block.title}</h3><p>{block.text}</p></aside>;
  if (block.type === 'list') return <ul className="event-content-list">{block.items?.map((item) => <li key={item}>{item}</li>)}</ul>;
  return <hr className="event-content-divider" />;
}

export default function ManagedEventPage({ event }: { event: EventDetails }) {
  const paragraphs = (event.fullDescription || event.description).split(/\n+/).filter(Boolean);
  return (
    <div className="managed-event-page">
      <header className="managed-event-header">
        <a className="managed-event-brand" href={sitePath('/')}><img loading="lazy" decoding="async" className="brand-logo" src={sitePath('/images/aadaab-arz-logo.png')} alt="" />Aadaab Arz Lucknow</a>
        <nav aria-label="Event page navigation">
          <a href={sitePath('/#heritage')}>Explore</a>
          <a href={sitePath('/#events')}>Events</a>
          <a href={sitePath('/#stories')}>Stories</a>
          <a href={sitePath('/#community')}>Community</a>
          <a href={sitePath('/#members')}>Members</a>
          <a href={sitePath('/#contact')}>Contact</a>
        </nav>
        <a className="managed-event-back" href={sitePath('/#events')}>All gatherings</a>
      </header>
      <main>
        <section className="managed-event-hero">
          {event.imageUrl && <Image priority sizes="(max-width: 760px) 100vw, 60vw" width={1200} height={800} src={sitePath(event.imageUrl)} alt={event.title} />}
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
            {event.qrImageUrl ? <img loading="lazy" decoding="async" src={sitePath(event.qrImageUrl)} alt="UPI payment QR code" /> : <div className="managed-payment-placeholder">QR code<br />coming soon</div>}
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
          <div>{event.gallery.map((image, index) => <img loading="lazy" decoding="async" key={image} src={sitePath(image)} alt={`${event.title} gallery ${index + 1}`} />)}</div>
        </section>}
      </main>
      <footer className="managed-event-footer"><img loading="lazy" decoding="async" className="footer-logo" src={sitePath('/images/aadaab-arz-logo.png')} alt="" /><p>Aadaab Arz Lucknow · People · Places · Stories</p></footer>
    </div>
  );
}
