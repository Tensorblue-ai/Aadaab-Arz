'use client';

import { useEffect, useState } from 'react';

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
};

export default function ManagedEventPage() {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const slug = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop() ?? '');
    fetch(`/api/public/events/${encodeURIComponent(slug)}?site=lucknow`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setEvent)
      .catch(() => setMissing(true));
  }, []);

  if (missing) return <main className="managed-event-state"><a href="/#events">← Back to events</a><h1>Event not found.</h1></main>;
  if (!event) return <main className="managed-event-state"><p>Loading event…</p></main>;

  const paragraphs = (event.fullDescription || event.description).split(/\n+/).filter(Boolean);
  const showPayment = event.upiId || event.qrImageUrl || event.paymentAmount;

  return (
    <div className="managed-event-page">
      <header className="managed-event-header">
        <a className="managed-event-brand" href="/"><span>✣</span>Aadaab Arz Lucknow</a>
        <a href="/#events">All gatherings</a>
      </header>
      <main>
        <section className="managed-event-hero">
          <img src={event.imageUrl} alt={event.title} />
          <div>
            <p className="managed-event-eyebrow">Aadaab Arz · Gathering</p>
            <h1>{event.title}</h1>
            <p>{event.description}</p>
            <dl><div><dt>Date</dt><dd>{event.dateLabel}</dd></div><div><dt>Time</dt><dd>{event.time}</dd></div><div><dt>Venue</dt><dd>{event.place}</dd></div></dl>
            {event.registrationUrl && <a className="managed-event-action" href={event.registrationUrl} target="_blank" rel="noreferrer">Register for this event <span>↗</span></a>}
          </div>
        </section>

        <section className="managed-event-body">
          <article>
            <p className="managed-event-eyebrow">About the gathering</p>
            <h2>Everything you need to know.</h2>
            {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
          {showPayment && <aside className="managed-event-payment">
            <p className="managed-event-eyebrow">Registration payment</p>
            <h2>Pay by UPI</h2>
            {event.qrImageUrl && <img src={event.qrImageUrl} alt="UPI payment QR code" />}
            {event.paymentAmount && <p><strong>Fee</strong><span>{event.paymentAmount}</span></p>}
            {event.upiId && <p><strong>UPI ID</strong><span>{event.upiId}</span></p>}
          </aside>}
        </section>

        {event.gallery.length > 0 && <section className="managed-event-gallery">
          <p className="managed-event-eyebrow">Event gallery</p>
          <h2>A glimpse of the experience.</h2>
          <div>{event.gallery.map((image, index) => <img key={image} src={image} alt={`${event.title} gallery ${index + 1}`} />)}</div>
        </section>}
      </main>
      <footer className="managed-event-footer"><span>✣</span><p>Aadaab Arz Lucknow · People · Places · Stories</p></footer>
    </div>
  );
}
