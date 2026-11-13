import Image from 'next/image';
import type { ContentBlock, EventDetails } from '@/lib/events';
import { Shell } from './ForeignSite';

function videoEmbedUrl(url = '') {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  return vimeo ? `https://player.vimeo.com/video/${vimeo[1]}` : '';
}

function EventContentBlock({ block }: { block: ContentBlock }) {
  if (block.type === 'heading') { const Heading = block.level === 'h3' ? 'h3' : 'h2'; return <Heading className="event-content-heading">{block.text}</Heading>; }
  if (block.type === 'text') return <div className="event-content-text">{block.text?.split(/\n+/).filter(Boolean).map((text) => <p key={text}>{text}</p>)}</div>;
  if (block.type === 'image') return <figure className="event-content-image"><img loading="lazy" decoding="async" src={block.url} alt={block.caption || ''} />{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
  if (block.type === 'video') { const embed = videoEmbedUrl(block.url); return embed ? <div className="event-content-video"><iframe src={embed} title="Event video" allowFullScreen /></div> : /\.(mp4|webm|ogg)(?:[?#]|$)/i.test(block.url || '') ? <video className="event-content-video" src={block.url} controls preload="metadata" /> : <a className="event-content-video-link" href={block.url} target="_blank" rel="noreferrer">Watch event video ↗</a>; }
  if (block.type === 'quote') return <blockquote className="event-content-quote"><p>{block.text}</p>{block.attribution && <cite>— {block.attribution}</cite>}</blockquote>;
  if (block.type === 'callout') return <aside className="event-content-callout"><h3>{block.title}</h3><p>{block.text}</p></aside>;
  if (block.type === 'list') return <ul className="event-content-list">{block.items?.map((item) => <li key={item}>{item}</li>)}</ul>;
  return <hr className="event-content-divider" />;
}

export default function ManagedEventDetail({ event }: { event: EventDetails }) {
  const paragraphs = (event.fullDescription || event.description).split(/\n+/).filter(Boolean);
  return <Shell active="events"><main className="managed-event-page">
    <section className="managed-event-hero">
      <div><p className="eyebrow">Aadaab Arz · Gathering</p><h1>{event.title}</h1><p>{event.description}</p><dl><div><dt>Date</dt><dd>{event.dateLabel}</dd></div><div><dt>Time</dt><dd>{event.time}</dd></div><div><dt>Venue</dt><dd>{event.place}</dd></div></dl><div className="managed-event-actions">{event.registrationUrl ? <a className="button" href={event.registrationUrl} target="_blank" rel="noreferrer">Join this gathering <span>↗</span></a> : <span className="button is-placeholder" aria-disabled="true">Registration opening soon</span>}<a className="outline" href="/events">Back to Events</a></div></div>
      <div className="managed-event-cover">{event.imageUrl && <Image priority sizes="(max-width: 760px) 100vw, 60vw" width={1200} height={800} src={event.imageUrl} alt={event.title} />}<blockquote>People · Place · Purpose</blockquote></div>
    </section>
    <section className="managed-event-body">
      <article><p className="eyebrow">A closer look</p><h2>More than an event.<br />A living experience.</h2>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article>
      <aside className="managed-event-payment"><p className="eyebrow">Registration payment</p><h2>Pay by UPI</h2>{event.qrImageUrl ? <img loading="lazy" decoding="async" src={event.qrImageUrl} alt="UPI payment QR code" /> : <div className="managed-payment-placeholder">QR code<br />coming soon</div>}<p><strong>Fee</strong><span>{event.paymentAmount || 'To be announced'}</span></p><p><strong>UPI ID</strong><span>{event.upiId || 'Coming soon'}</span></p></aside>
    </section>
    <section className="managed-event-features"><div><span>✣</span><h3>Meet Local People</h3><p>Real people, real stories</p></div><div><span>◫</span><h3>Living Traditions</h3><p>See heritage in action</p></div><div><span>◌</span><h3>Meaningful Conversations</h3><p>Ask, learn and connect</p></div><div><span>◇</span><h3>Support Heritage</h3><p>Help keep traditions alive</p></div></section>
    {event.contentBlocks?.length > 0 && <section className="managed-event-content">{event.contentBlocks.map((block) => <EventContentBlock key={block.id} block={block} />)}</section>}
    {event.gallery.length > 0 && <section className="managed-event-gallery"><p className="eyebrow">Event gallery</p><h2>A glimpse of the experience.</h2><div>{event.gallery.map((image, index) => <img loading="lazy" decoding="async" key={image} src={image} alt={`${event.title} gallery ${index + 1}`} />)}</div></section>}
  </main></Shell>;
}
