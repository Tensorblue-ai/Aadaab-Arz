'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { MEMBERS } from './MembersExperience';

const AtmosphereCanvas = dynamic(() => import('./AtmosphereCanvas'), { ssr: false });

const SCENES = [
  { id: 'salaam', label: 'Salaam' },
  { id: 'heritage', label: 'Heritage' },
  { id: 'events', label: 'Gatherings' },
  { id: 'stories', label: 'Stories' },
  { id: 'craft', label: 'Craft' },
  { id: 'community', label: 'Community' },
  { id: 'members', label: 'Members' },
  { id: 'archive', label: 'Archive' },
  { id: 'guidelines', label: 'Guidelines' },
  { id: 'join', label: 'Join' },
  { id: 'contact', label: 'Contact' },
] as const;

const DARK_SCENES = new Set([1, 2, 3, 5, 6, 7, 8, 9, 10]);

type PanelKey =
  | 'event-walk'
  | 'event-music'
  | 'event-craft'
  | 'story-rumi'
  | 'story-music'
  | 'story-craft'
  | 'community';

type DetailPanel = {
  type: 'event' | 'story';
  kicker: string;
  title: string;
  image: string;
  imageAlt: string;
  meta: string[];
  paragraphs: string[];
};

const DETAILS: Record<Exclude<PanelKey, 'community'>, DetailPanel> = {
  'event-walk': {
    type: 'event',
    kicker: 'Heritage gathering · June 22',
    title: 'Heritage Walk at Bara Imambara',
    image: '/images/events/heritage-walk.webp',
    imageAlt: 'The grand white facade of Bara Imambara at sunset',
    meta: ['Bara Imambara, Lucknow', '7:00 AM — 10:30 AM', 'Guided walk'],
    paragraphs: [
      'Walk through one of Awadh’s most ingenious monuments with storytellers who make its courtyards, corridors and legends feel vividly present.',
      'The morning moves slowly: architecture, oral history and small details most visitors walk straight past.',
    ],
  },
  'event-music': {
    type: 'event',
    kicker: 'Mehfil · July 06',
    title: 'The Music Evening',
    image: '/images/events/music-evening.webp',
    imageAlt: 'A candlelit ensemble performing Hindustani music',
    meta: ['Rumi Darwaza Courtyard', '6:30 PM — 9:00 PM', 'Intimate baithak'],
    paragraphs: [
      'An evening of ghazal, thumri and conversation, held close enough to hear every breath between the notes.',
      'Come for the music; stay for the poetry, stories and gracious pauses that make a Lucknow mehfil unmistakable.',
    ],
  },
  'event-craft': {
    type: 'event',
    kicker: 'Makers’ baithak · July 19',
    title: 'Craft & Culture Baithak',
    image: '/images/events/craft-baithak.webp',
    imageAlt: 'Lucknow artisans at work by warm lantern light',
    meta: ['Husainabad Heritage Centre', '4:00 PM — 7:00 PM', 'Hands-on session'],
    paragraphs: [
      'Meet the hands keeping chikankari and zardozi alive. This is a patient afternoon of material, memory and making.',
      'Artisans demonstrate their process, share the meaning behind motifs, and invite you to try a few careful stitches yourself.',
    ],
  },
  'story-rumi': {
    type: 'story',
    kicker: 'Architecture · 8 minute read',
    title: 'The Arches of Rumi Darwaza',
    image: '/images/stories/rumi-gateway.webp',
    imageAlt: 'Rumi Darwaza glowing in the evening light',
    meta: ['Built in 1784', 'Awadhi architecture', 'Husainabad'],
    paragraphs: [
      'Rumi Darwaza does more than mark a threshold. Its great arch turns arrival itself into theatre—shadow, scale and ornament drawing the eye upward.',
      'Commissioned during a time of famine, the gateway also remembers a city building dignity through collective work.',
    ],
  },
  'story-music': {
    type: 'story',
    kicker: 'Living culture · 6 minute read',
    title: 'Music, Manners & Memory',
    image: '/images/events/music-evening.webp',
    imageAlt: 'Musicians gathered for an evening performance',
    meta: ['Ghazal', 'Thumri', 'Tehzeeb'],
    paragraphs: [
      'In Lucknow, music has always been held by more than melody. It lives in how a room gathers, how a verse is offered and how silence answers it.',
      'These intimate traditions carry an entire etiquette of listening—an art of giving attention generously.',
    ],
  },
  'story-craft': {
    type: 'story',
    kicker: 'Craft traditions · 7 minute read',
    title: 'A City Carried by Hand',
    image: '/images/stories/craft-artisan.webp',
    imageAlt: 'An artisan embroidering cloth beside an arched courtyard',
    meta: ['Chikankari', 'Zardozi', 'Generational craft'],
    paragraphs: [
      'Every stitch holds patience. Every motif carries memory. Lucknow’s celebrated textile traditions are not static heirlooms, but living conversations between hand, cloth and time.',
      'Meet the makers adapting centuries of knowledge without losing the quiet discipline at its heart.',
    ],
  },
};

type ManagedEvent = {
  id: number;
  slug: string;
  day: string;
  month: string;
  title: string;
  location: string;
  time: string;
  image: string;
  description: string;
};

const DEFAULT_EVENTS: ManagedEvent[] = [
  {
    id: 1,
    slug: 'heritage-walk-at-bara-imambara',
    day: '22',
    month: 'Jun',
    title: 'Heritage Walk at Bara Imambara',
    location: 'Bara Imambara',
    time: '7:00 — 10:30 AM',
    image: '/images/events/heritage-walk-v2.png',
    description: 'Walk through one of Awadh’s most ingenious monuments with storytellers who bring its courtyards, corridors and legends to life.',
  },
  {
    id: 2,
    slug: 'the-music-evening',
    day: '06',
    month: 'Jul',
    title: 'The Music Evening',
    location: 'Rumi Darwaza Courtyard',
    time: '6:30 — 9:00 PM',
    image: '/images/events/music-evening-v2.png',
    description: 'An intimate evening of ghazal, thumri, poetry and conversation in the heart of Lucknow.',
  },
  {
    id: 3,
    slug: 'craft-culture-baithak',
    day: '19',
    month: 'Jul',
    title: 'Craft & Culture Baithak',
    location: 'Husainabad Heritage Centre',
    time: '4:00 — 7:00 PM',
    image: '/images/events/craft-baithak-v2.png',
    description: 'Meet the artisans keeping chikankari and zardozi alive through material, memory and making.',
  },
  {
    id: 4,
    slug: 'dastangoi-under-the-stars',
    day: '03',
    month: 'Aug',
    title: 'Dastangoi Under the Stars',
    location: 'Residency Gardens',
    time: '6:00 — 8:30 PM',
    image: '/images/events/dastangoi-under-stars-v2.png',
    description: 'An evening of classical oral storytelling, poetry and conversation beneath the Lucknow sky.',
  },
];

const STORY_LINKS = [
  { key: 'story-rumi' as const, number: '01', title: 'The Arches of Rumi Darwaza' },
  { key: 'story-music' as const, number: '02', title: 'Music, Manners & Memory' },
  { key: 'story-craft' as const, number: '03', title: 'Craft Traditions of Awadh' },
];

const ARCHIVE_CATEGORIES = [
  ['Heritage & Architecture', 'Historic buildings, monuments, gateways, neighbourhoods and restoration stories.'],
  ['History', 'People, documents, discoveries, references and original research connected to Lucknow.'],
  ['Craft', 'Chikankari, traditional craftsmanship, artisans, techniques and workshops.'],
  ['Music & Dance', 'Musical traditions, performers, instruments, dance forms and cultural performances.'],
  ['Wildlife & Nature', 'Natural spaces, gardens, landscapes and Lucknow’s ecological heritage.'],
  ['Memories', 'Photographs, family stories, neighbourhood histories and everyday moments.'],
] as const;

const GUIDELINES = [
  ['Be respectful', 'Honour people, places, traditions and different perspectives.'],
  ['Be relevant', 'Share content that adds value to conversations around Lucknow and Awadh.'],
  ['Be responsible', 'Check information before sharing it and credit reliable sources.'],
  ['Respect privacy', 'Do not share private information or identifiable stories without permission.'],
] as const;

function Rosette({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? 'rosette rosette--small' : 'rosette'} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function SceneBackground({
  src,
  active,
  className = '',
  position,
}: {
  src: string;
  active: boolean;
  className?: string;
  position?: string;
}) {
  return (
    <motion.div
      className={`scene-background ${className}`}
      animate={{ scale: active ? 1 : 1.075, filter: active ? 'blur(0px)' : 'blur(2px)' }}
      transition={{ duration: 1.35, ease: [0.2, 0.8, 0.2, 1] }}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        style={{ objectPosition: position }}
        className="scene-background__image"
      />
    </motion.div>
  );
}

function SceneHeading({
  eyebrow,
  title,
  body,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  body: string;
  align?: 'left' | 'center';
}) {
  return (
    <motion.div
      className={`scene-heading scene-heading--${align}`}
      initial={{ opacity: 0, y: 54 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.45 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="scene-eyebrow"><span />{eyebrow}</p>
      <h2>{title}</h2>
      <p>{body}</p>
    </motion.div>
  );
}

function EventCard({
  event,
  index,
}: {
  event: ManagedEvent;
  index: number;
}) {
  return (
    <motion.article
      className="event-card"
      initial={{ opacity: 0, y: 90, rotateY: -10 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ amount: 0.35 }}
      transition={{ duration: 0.85, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="event-card__image">
        <img src={event.image} alt="" />
        <span className="date-badge"><small>{event.month}</small>{event.day}</span>
      </div>
      <div className="event-card__copy">
        <p className="event-card__number">0{index + 1}</p>
        <h3>{event.title}</h3>
        <p><span aria-hidden="true">⌖</span>{event.location}</p>
        <p><span aria-hidden="true">◷</span>{event.time}</p>
        <a href={`/events/${event.slug}`}>
          View gathering <span aria-hidden="true">↗</span>
        </a>
      </div>
    </motion.article>
  );
}

function ContributionForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="form-success" role="status">
        <Rosette />
        <h3>Shukriya.</h3>
        <p>Your story has a place here. This local prototype keeps the contribution on this screen only.</p>
      </div>
    );
  }

  return (
    <form className="contribution-form" onSubmit={handleSubmit}>
      <label>
        Your name
        <input name="name" autoComplete="name" required placeholder="How should we address you?" />
      </label>
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </label>
      <label>
        Phone number <span>Optional</span>
        <input name="phone" type="tel" autoComplete="tel" placeholder="Your phone number" />
      </label>
      <label>
        City / Location
        <input name="city" autoComplete="address-level2" required placeholder="Your city or location" />
      </label>
      <label>
        How did you hear about Aadaab Arz Lucknow?
        <select name="source" defaultValue="">
          <option value="" disabled>Select an option</option>
          <option value="friend">Friend or family</option>
          <option value="social">Social media</option>
          <option value="event">A community event</option>
          <option value="search">Online search</option>
        </select>
      </label>
      <label className="form-wide">
        Why do you want to join the community?
        <textarea name="reason" rows={3} required placeholder="Share a few lines about your interest in Lucknow and Awadh…" />
      </label>
      <fieldset className="form-wide topic-fieldset">
        <legend>What topics interest you most?</legend>
        <div className="topic-options">
          {ARCHIVE_CATEGORIES.map(([title]) => (
            <label key={title}><input type="checkbox" name="topics" value={title} />{title}</label>
          ))}
        </div>
      </fieldset>
      <label className="form-wide">
        Do you have something to contribute? <span>Optional</span>
        <input name="contribution" placeholder="Stories, research, photographs, documents or skills" />
      </label>
      <label className="form-wide consent-label">
        <input type="checkbox" name="guidelines" required />
        I have read and agree to follow the Community Guidelines.
      </label>
      <button className="primary-action" type="submit">Request to join the community <span>→</span></button>
    </form>
  );
}

function DetailOverlay({ panel, event, onClose }: { panel: PanelKey | null; event: ManagedEvent | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!panel && !event) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const backgroundElements = Array.from(
      document.querySelectorAll<HTMLElement>('.site-header, .progress-rail, .scene'),
    );
    const inertStates = backgroundElements.map((element) => [element, element.inert] as const);
    document.body.style.overflow = 'hidden';
    backgroundElements.forEach((element) => { element.inert = true; });
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!panelRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      inertStates.forEach(([element, wasInert]) => { element.inert = wasInert; });
      window.removeEventListener('keydown', handleKey);
      previousFocus?.focus();
    };
  }, [panel, event, onClose]);

  return (
    <AnimatePresence>
      {panel || event ? (
        <motion.div
          className="detail-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            ref={panelRef}
            className={`detail-panel ${panel === 'community' ? 'detail-panel--form' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            initial={{ opacity: 0, y: 70, rotateX: -7, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.97 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <button ref={closeRef} className="detail-close" type="button" onClick={onClose} aria-label="Close detail panel">×</button>
            {event ? (
              <>
                <div className="detail-panel__image">
                  <img src={event.image} alt="" />
                </div>
                <div className="detail-panel__copy">
                  <p className="scene-eyebrow"><span />{event.day} {event.month}</p>
                  <h2 id="detail-title">{event.title}</h2>
                  <div className="detail-meta"><span>{event.location}</span><span>{event.time}</span></div>
                  <p>{event.description}</p>
                  <button className="primary-action" type="button" onClick={onClose}>Return to the journey <span aria-hidden="true">←</span></button>
                </div>
              </>
            ) : panel === 'community' ? (
              <div className="detail-panel__form-copy">
                <p className="scene-eyebrow"><span />A living archive</p>
                <h2 id="detail-title">Bring something to the archive.</h2>
                <p>A photograph, a family memory, a neighbourhood tale, a recipe or a place worth remembering.</p>
                <ContributionForm />
              </div>
            ) : panel ? (
              <>
                <div className="detail-panel__image">
                  <Image src={DETAILS[panel].image} alt={DETAILS[panel].imageAlt} fill sizes="(max-width: 760px) 100vw, 48vw" />
                </div>
                <div className="detail-panel__copy">
                  <p className="scene-eyebrow"><span />{DETAILS[panel].kicker}</p>
                  <h2 id="detail-title">{DETAILS[panel].title}</h2>
                  <div className="detail-meta">
                    {DETAILS[panel].meta.map((item) => <span key={item}>{item}</span>)}
                  </div>
                  {DETAILS[panel].paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  <button className="primary-action" type="button" onClick={onClose}>
                    Return to the journey <span aria-hidden="true">←</span>
                  </button>
                </div>
              </>
            ) : null}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Header({
  active,
  soundOn,
  menuOpen,
  onSound,
  onMenu,
}: {
  active: number;
  soundOn: boolean;
  menuOpen: boolean;
  onSound: () => void;
  onMenu: () => void;
}) {
  const dark = DARK_SCENES.has(active);
  return (
    <>
      <header className={`site-header ${dark ? 'site-header--dark' : ''}`}>
        <a className="brand" href="#salaam" aria-label="Aadaab Arz Lucknow home">
          <img className="brand-logo" src="/images/aadaab-arz-logo.png" alt="" />
          <span>Aadaab Arz Lucknow</span>
        </a>
        <nav className="main-nav" aria-label="Primary navigation">
          <a href="#heritage" aria-current={active <= 1 ? 'page' : undefined}>Explore Lucknow</a>
          <a href="#events" aria-current={active === 2 ? 'page' : undefined}>Events</a>
          <a href="#stories" aria-current={active === 3 || active === 4 ? 'page' : undefined}>Stories</a>
          <a href="#community" aria-current={active === 5 || (active >= 7 && active <= 9) ? 'page' : undefined}>Community</a>
          <a href="#members" aria-current={active === 6 ? 'page' : undefined}>Members</a>
          <a href="#contact" aria-current={active === 10 ? 'page' : undefined}>Contact</a>
        </nav>
        <div className="header-actions">
          <a className="foreign-link" href="https://beautifully-purchase-singing-hydraulic.trycloudflare.com">Foreign site ↗</a>
          <button className="sound-toggle" type="button" onClick={onSound} aria-pressed={soundOn} aria-label={soundOn ? 'Turn ambient sound off' : 'Turn ambient sound on'}>
            <span aria-hidden="true">{soundOn ? '◖))' : '◖·'}</span>
            <span>{soundOn ? 'Sound on' : 'Sound off'}</span>
          </button>
          <a className="join-button" href="#join">Join the community</a>
          <button className="menu-button" type="button" onClick={onMenu} aria-expanded={menuOpen} aria-controls="mobile-menu">
            <span /><span /><span className="sr-only">Menu</span>
          </button>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, clipPath: 'circle(0% at 92% 6%)' }}
            animate={{ opacity: 1, clipPath: 'circle(145% at 92% 6%)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at 92% 6%)' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {SCENES.map((scene, index) => (
              <a key={scene.id} href={`#${scene.id}`} onClick={onMenu}>
                <span>0{index + 1}</span>{scene.label}
              </a>
            ))}
            <a href="https://beautifully-purchase-singing-hydraulic.trycloudflare.com" onClick={onMenu}>
              <span>↗</span>Aadaab Arz Lucknow Abroad
            </a>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function ProgressRail({ active }: { active: number }) {
  return (
    <nav className="progress-rail" aria-label="Journey progress">
      <span className="progress-rail__number">0{active + 1}</span>
      <div className="progress-rail__line">
        <i style={{ height: `${((active + 1) / SCENES.length) * 100}%` }} />
      </div>
      <div className="progress-rail__dots">
        {SCENES.map((scene, index) => (
          <a
            key={scene.id}
            href={`#${scene.id}`}
            className={active === index ? 'is-active' : ''}
            aria-label={`Go to ${scene.label}`}
            aria-current={active === index ? 'step' : undefined}
          >
            <span>{scene.label}</span>
          </a>
        ))}
      </div>
      <span className="progress-rail__total">0{SCENES.length}</span>
    </nav>
  );
}

export default function ImmersiveExperience() {
  const [activeScene, setActiveScene] = useState(0);
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ManagedEvent | null>(null);
  const [events, setEvents] = useState<ManagedEvent[]>(DEFAULT_EVENTS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const closePanel = useCallback(() => { setPanel(null); setSelectedEvent(null); }, []);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 921px)');
    const closeMobileMenu = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    desktop.addEventListener('change', closeMobileMenu);
    return () => desktop.removeEventListener('change', closeMobileMenu);
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/public/events?site=lucknow', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((items: Array<{ id: number; slug: string; title: string; dateLabel: string; place: string; time: string; description: string; imageUrl: string }>) => {
        if (!active || !Array.isArray(items)) return;
        setEvents(items.map((item) => {
          const [day, ...month] = item.dateLabel.trim().split(/\s+/);
          return { id: item.id, slug: item.slug, day: day || '', month: month.join(' '), title: item.title, location: item.place, time: item.time, image: item.imageUrl, description: item.description };
        }));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'));
    let animationFrame = 0;
    const updateActiveScene = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const viewportCenter = window.innerHeight / 2;
        let closestScene = 0;
        let closestDistance = Number.POSITIVE_INFINITY;
        sections.forEach((section) => {
          const bounds = section.getBoundingClientRect();
          const distance = Math.abs(bounds.top + bounds.height / 2 - viewportCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestScene = Number(section.dataset.scene ?? 0);
          }
        });
        setActiveScene(closestScene);
      });
    };
    updateActiveScene();
    window.addEventListener('scroll', updateActiveScene, { passive: true });
    window.addEventListener('resize', updateActiveScene);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', updateActiveScene);
      window.removeEventListener('resize', updateActiveScene);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const backgroundElements = Array.from(
      document.querySelectorAll<HTMLElement>('.scene, .progress-rail, .brand, .sound-toggle, .join-button'),
    );
    const inertStates = backgroundElements.map((element) => [element, element.inert] as const);
    const menu = document.querySelector<HTMLElement>('#mobile-menu');
    const focusable = Array.from(menu?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    document.body.style.overflow = 'hidden';
    backgroundElements.forEach((element) => { element.inert = true; });
    focusable[0]?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!menu?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      inertStates.forEach(([element, wasInert]) => { element.inert = wasInert; });
      window.removeEventListener('keydown', handleKey);
      previousFocus?.focus();
    };
  }, [menuOpen]);

  useEffect(() => {
    let animationFrame = 0;
    const handlePointer = (event: PointerEvent) => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
        document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
      });
    };
    window.addEventListener('pointermove', handlePointer, { passive: true });
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('pointermove', handlePointer);
    };
  }, []);

  useEffect(() => {
    if (!soundOn || !audioRef.current) return;
    const context = audioRef.current;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(196 + activeScene * 16, context.currentTime);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.025, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.7);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.72);
  }, [activeScene, soundOn]);

  useEffect(() => () => {
    audioRef.current?.close();
  }, []);

  function toggleSound() {
    if (soundOn) {
      audioRef.current?.close();
      audioRef.current = null;
      setSoundOn(false);
      return;
    }
    audioRef.current = new AudioContext();
    setSoundOn(true);
  }

  return (
    <MotionConfig reducedMotion="user">
    <main className="experience">
      <a className="skip-link" href="#heritage">Skip to the journey</a>
      <div className="pointer-glow" aria-hidden="true" />
      <div className="webgl-layer" aria-hidden="true">
        {prefersReducedMotion ? null : <AtmosphereCanvas activeScene={activeScene} />}
      </div>
      <Header
        active={activeScene}
        soundOn={soundOn}
        menuOpen={menuOpen}
        onSound={toggleSound}
        onMenu={toggleMenu}
      />
      <ProgressRail active={activeScene} />

      <section className="scene hero-scene" id="salaam" data-scene="0" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">A living inheritance</p>
          <h1 id="hero-title" className="official-hero-name">Aadaab Arz,<br />Lucknow.</h1>
          <div className="ornament" aria-hidden="true"><span /><Rosette small /><span /></div>
          <p className="hero-lede">Where heritage lives, stories gather, and culture continues.</p>
          <p className="hero-description">Step through a city remembered in stone, thread, rhythm and grace—an invitation to meet the Lucknow that still lives between generations.</p>
          <div className="hero-actions">
            <a className="primary-action" href="#heritage">Enter the city <span aria-hidden="true">→</span></a>
            <a className="secondary-action" href="#stories">Discover stories <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="sun-haze" />
          <Image src="/images/hero-architecture.webp" alt="" fill priority sizes="(max-width: 800px) 100vw, 68vw" className="hero-image" />
          <div className="hero-vignette" />
        </div>
        <div className="location-card" aria-label="Lucknow, Uttar Pradesh, India">
          <span className="location-pin" aria-hidden="true">●</span>
          <span><small>You are here</small>Lucknow, Uttar Pradesh</span>
          <span className="coordinates">26.8467° N · 80.9462° E</span>
        </div>
        <a className="scroll-cue" href="#heritage" aria-label="Scroll to explore Lucknow">
          <span className="mouse" aria-hidden="true"><i /></span>Scroll to explore<span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="scene heritage-scene scene--dark" id="heritage" data-scene="1" aria-labelledby="heritage-title">
        <SceneBackground src="/images/heritage-arch.webp" active={activeScene === 1} position="center" />
        <div className="heritage-shade" aria-hidden="true" />
        <motion.div
          className="heritage-copy"
          initial={{ opacity: 0, scale: 0.84, z: -160 }}
          whileInView={{ opacity: 1, scale: 1, z: 0 }}
          viewport={{ amount: 0.55 }}
          transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="scene-eyebrow"><span />The city opens in layers<span /></p>
          <h2 id="heritage-title">Gather Around<br />Heritage</h2>
          <p>Not simply to look back—but to listen, meet and take part.</p>
          <a className="ghost-action" href="#events">See what is gathering <span>↓</span></a>
        </motion.div>
        <div className="portal-rings" aria-hidden="true"><span /><span /><span /></div>
      </section>

      <section className={`scene events-scene scene--dark${events.length > 3 ? ' events-scene--expanded' : ''}`} id="events" data-scene="2" aria-labelledby="events-title">
        <SceneBackground src="/images/heritage-arch.webp" active={activeScene === 2} position="center" className="events-background" />
        <div className="events-shade" aria-hidden="true" />
        <div className="events-layout">
          <div className="events-intro">
            <p className="scene-eyebrow"><span />Gatherings in the city</p>
            <h2 id="events-title">Meet Lucknow<br />in the present.</h2>
            <p>Walk, listen and make alongside the people who carry Awadh’s living traditions forward.</p>
          </div>
          <div className={`events-grid${events.length > 3 ? ' events-grid--expanded' : ''}`}>
            {events.map((event, index) => <EventCard key={event.id} event={event} index={index} />)}
          </div>
        </div>
      </section>

      <section className="scene stories-scene scene--dark" id="stories" data-scene="3" aria-labelledby="stories-title">
        <SceneBackground src="/images/stories/rumi-gateway.webp" active={activeScene === 3} position="72% center" className="stories-background" />
        <div className="stories-shade" aria-hidden="true" />
        <div className="stories-layout">
          <SceneHeading eyebrow="Discover Lucknow" title="Every arch holds an echo." body="Enter a city through the people who remember it—and the places that still speak." />
          <button className="story-feature" type="button" onClick={() => setPanel('story-rumi')}>
            <span>Featured story</span>
            <strong id="stories-title">The Arches of<br />Rumi Darwaza</strong>
            <i>Read the story <b aria-hidden="true">↗</b></i>
          </button>
          <div className="story-index">
            {STORY_LINKS.map((story) => (
              <button key={story.key} type="button" onClick={() => setPanel(story.key)}>
                <span>{story.number}</span><strong>{story.title}</strong><i aria-hidden="true">↗</i>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="scene craft-scene" id="craft" data-scene="4" aria-labelledby="craft-title">
        <div className="craft-image-wrap" aria-hidden="true">
          <Image src="/images/stories/craft-artisan.webp" alt="" fill sizes="(max-width: 800px) 100vw, 58vw" className="craft-image" />
          <div className="craft-image-shade" />
        </div>
        <div className="thread-field" aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => <span key={index} style={{ '--thread': index } as React.CSSProperties} />)}
        </div>
        <motion.div
          className="craft-copy"
          initial={{ opacity: 0, x: 70 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ amount: 0.45 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="scene-eyebrow"><span />The hand and the thread</p>
          <h2 id="craft-title">A city carried<br />by hand.</h2>
          <p className="craft-lede">Every stitch holds patience. Every motif carries memory.</p>
          <p>From chikankari to zardozi, Lucknow’s craft traditions remain a living conversation between material, maker and time.</p>
          <div className="craft-tags"><span>Chikankari</span><span>Zardozi</span><span>Metalwork</span><span>Woodcraft</span></div>
          <button className="secondary-action" type="button" onClick={() => setPanel('story-craft')}>Meet the makers <span>↗</span></button>
        </motion.div>
      </section>

      <section className="scene community-scene scene--dark" id="community" data-scene="5" aria-labelledby="community-title">
        <SceneBackground src="/images/community/archive-collage.webp" active={activeScene === 5} position="72% center" className="community-background" />
        <div className="community-shade" aria-hidden="true" />
        <motion.div
          className="community-copy"
          initial={{ opacity: 0, x: -65 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ amount: 0.5 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="scene-eyebrow"><span />A living archive</p>
          <h2 id="community-title">Your Lucknow<br />has a story too.</h2>
          <p>Bring a photograph, a family memory, a neighbourhood tale, a song, a recipe—or simply a place worth remembering.</p>
          <div className="contribution-chips" aria-label="Contribution categories">
            {['Heritage', 'History', 'Craft', 'Music & dance', 'Nature', 'Memories'].map((chip) => <span key={chip}>{chip}</span>)}
          </div>
          <div className="community-actions">
            <button className="primary-action" type="button" onClick={() => setPanel('community')}>Contribute to the archive <span>→</span></button>
            <span><strong>4.5k+</strong> voices gathering</span>
          </div>
        </motion.div>
        <div className="floating-seal floating-seal--one" aria-hidden="true"><Rosette /></div>
        <div className="floating-seal floating-seal--two" aria-hidden="true"><Rosette /></div>
      </section>

      <section className="scene home-members-scene scene--dark" id="members" data-scene="6" aria-labelledby="members-title">
        <SceneBackground src="/images/heritage-arch.webp" active={activeScene === 6} position="center" className="home-members-background" />
        <div className="home-members-shade" aria-hidden="true" />
        <div className="home-members-layout">
          <div className="home-members-heading">
            <p className="scene-eyebrow"><span />The people of Aadaab Arz</p>
            <h2 id="members-title">The people who<br />hold the circle.</h2>
            <p>Meet the team guiding Aadaab Arz Lucknow with care, continuity and a shared love for the city.</p>
          </div>
          <div className="home-members-grid">
            {MEMBERS.map((member, index) => (
              <article className="home-member-card" key={member.slug}>
                <div className="home-member-portrait">
                  {member.image ? <img src={member.image} alt={member.name} /> : <><span>{member.initials}</span><small>Portrait to follow</small></>}
                </div>
                <div>
                  <p>0{index + 1} · {member.role}</p>
                  <h3>{member.name}</h3>
                  <Link href={`/members/${member.slug}`}>View profile <span aria-hidden="true">↗</span></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="scene archive-scene scene--dark" id="archive" data-scene="7" aria-labelledby="archive-title">
        <SceneBackground src="/images/community/archive-collage.webp" active={activeScene === 7} position="center" />
        <div className="archive-shade" aria-hidden="true" />
        <div className="archive-layout">
          <div className="archive-intro">
            <p className="scene-eyebrow"><span />A living archive</p>
            <h2 id="archive-title">Bring something<br />to the archive.</h2>
            <p>Some of Lucknow’s most valuable stories live in family albums, neighbourhood memories, traditional crafts and the people who carry them forward.</p>
          </div>
          <div className="archive-grid">
            {ARCHIVE_CATEGORIES.map(([title, body], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                <a href="#join">Explore <b aria-hidden="true">→</b></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="scene guidelines-scene scene--dark" id="guidelines" data-scene="8" aria-labelledby="guidelines-title">
        <SceneBackground src="/images/community/closing-atmosphere.webp" active={activeScene === 8} position="center" />
        <div className="guidelines-shade" aria-hidden="true" />
        <div className="guidelines-layout">
          <p className="scene-eyebrow"><span />Community guidelines<span /></p>
          <h2 id="guidelines-title">Aadaab begins<br />with respect.</h2>
          <p>Help us keep this a thoughtful, welcoming and trustworthy space for conversations about Lucknow.</p>
          <div className="guidelines-grid">
            {GUIDELINES.map(([title, body], index) => (
              <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>
            ))}
          </div>
          <a className="primary-action" href="#join">I understand — continue <span>→</span></a>
        </div>
      </section>

      <section className="scene join-scene scene--dark" id="join" data-scene="9" aria-labelledby="join-title">
        <SceneBackground src="/images/community/closing-atmosphere.webp" active={activeScene === 9} position="center" />
        <div className="join-shade" aria-hidden="true" />
        <div className="join-layout">
          <div className="join-heading">
            <p className="scene-eyebrow"><span />Aadaab Arz · Lucknow<span /></p>
            <h2 id="join-title">Join the community.</h2>
            <p>Become part of a growing community that celebrates, documents and preserves the heritage and culture of Lucknow and Awadh.</p>
          </div>
          <div className="join-form-shell"><ContributionForm /></div>
        </div>
      </section>

      <section className="scene invitation-scene scene--dark" id="contact" data-scene="10" aria-labelledby="invitation-title">
        <SceneBackground src="/images/community/closing-atmosphere.webp" active={activeScene === 10} position="center" className="invitation-background" />
        <div className="invitation-shade" aria-hidden="true" />
        <motion.div
          className="invitation-copy"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ amount: 0.5 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Rosette />
          <p className="scene-eyebrow"><span />Aadaab Arz · Lucknow<span /></p>
          <h2 id="invitation-title">Preserve the past.<br />Celebrate the present.<br />Carry Lucknow forward.</h2>
          <p>Join a thoughtful community for the heritage and culture of Lucknow & Awadh.</p>
          <div className="invitation-actions">
            <a className="primary-action" href="#join">Join the community <span>→</span></a>
            <a className="ghost-action" href="#salaam">Return to the beginning <span>↑</span></a>
          </div>
        </motion.div>
        <footer className="site-footer">
          <span>© 2026 Aadaab Arz Lucknow</span>
          <span>Made with care in Lucknow</span>
          <nav aria-label="Footer navigation"><a href="#heritage">Explore</a><a href="#events">Events</a><a href="#stories">Stories</a><a href="#members">Members</a><a href="#community">Community</a><a href="mailto:hello@aadaabarzlucknow.com">Contact</a></nav>
        </footer>
      </section>

      <DetailOverlay panel={panel} event={selectedEvent} onClose={closePanel} />
    </main>
    </MotionConfig>
  );
}
