"use client";

import Image from "next/image";

import type { EventDetails } from "@/lib/events";
import { FOREIGN_MEMBERS } from "@/lib/members";

import { FormEvent, useEffect, useState } from "react";

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "/home";
export const CONTENT_API_BASE = process.env.NEXT_PUBLIC_CONTENT_API_BASE ?? (process.env.NEXT_PUBLIC_MAIN_SITE_URL ? "" : MAIN_SITE);
const stories = [
  { title: "The Arches of Rumi Darwaza", text: "Explore the grace, detail and enduring beauty of Lucknow’s iconic gateway.", image: "/images/stories/rumi-gateway.webp", href: "/stories/rumi-darwaza" },
  { title: "Music, Manners and Memory", text: "Step into a world where every note, gesture and gathering tells a story.", image: "/images/events/music-evening.webp", href: "/stories/music-and-memory" },
  { title: "Craft Traditions of Awadh", text: "Discover the hands carrying centuries of Awadhi excellence and artistry.", image: "/images/stories/craft-artisan.webp", href: "/stories/craft-traditions" },
];
const categories = [
  ["Heritage & Architecture", "Historic buildings, monuments, gateways, neighbourhoods and restoration stories."],
  ["History", "People, documents, discoveries and original research connected to Lucknow."],
  ["Craft", "Chikankari, traditional craftsmanship, artisans, techniques and workshops."],
  ["Music & Dance", "Musical traditions, performers, instruments and cultural performances."],
  ["Wildlife & Nature", "Natural spaces, gardens, landscapes and ecological heritage."],
  ["Memories", "Photographs, family stories, neighbourhood histories and everyday moments."],
];

const FOREIGN_MEMBER_FOCUS: Record<string, [string, string][]> = {
  "iffat-khan": [["Culture & Community", "Bringing people together across borders through shared interests."], ["Art & Heritage", "Sharing India’s traditions, architecture and creative heritage."], ["Creative Leadership", "Encouraging fresh ideas and connected cultural experiences."]],
  "saif-norris": [["Business & Enterprise", "Creating positive opportunities through collaboration and experience."], ["Community Development", "Strengthening communities through meaningful engagement."], ["Cultural Connection", "Preserving Lucknow’s culture and traditions abroad."]],
  "ghulam-mujtaba": [["Urdu", "Promoting the language at the heart of Lucknow’s civilisation."], ["Arts", "Celebrating ghazal, daastaan-goi, music, dance and theatre."], ["Community", "Supporting cultural exchange and community engagement."]],
  "dev-puri": [["Banking Experience", "Bringing decades of public and private sector banking experience."], ["Community Support", "Supporting the society’s activities with steady commitment."], ["Vancouver", "Building cultural connections with the community in Canada."]],
};

function Link({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={href} {...props} />;
}

function Mark() { return <span className="mark" aria-hidden="true">✣</span>; }
function Header({ active = "" }: { active?: string }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(active);
  useEffect(() => {
    const sections = ["explore", "events", "stories", "community", "members", "footer"]
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (sections.length < 2) return;
    const update = () => {
      let next = sections[0].id;
      sections.forEach((section) => { if (section.getBoundingClientRect().top <= 180) next = section.id; });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24) next = "footer";
      setCurrent(next === "footer" ? "contact" : next);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); window.removeEventListener("hashchange", update); };
  }, []);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1281px)");
    const closeMenu = (event: MediaQueryListEvent) => { if (event.matches) setOpen(false); };
    desktop.addEventListener("change", closeMenu);
    return () => desktop.removeEventListener("change", closeMenu);
  }, []);
  return (
    <header className="header">
      <a href="/" className="brand">
        <img loading="lazy" decoding="async" className="brand-logo" src="/images/aadaab-arz-logo.png" alt="" />
        <span>
          AADAAB ARZ LUCKNOW <b>ABROAD</b>
        </span>
      </a>
      <nav
        className={open ? "nav open" : "nav"}
        aria-label="Primary navigation"
        onClick={() => setOpen(false)}
      >
        <a className={current === "explore" ? "active" : ""} href="/#explore">
          Explore Lucknow
        </a>
        <a className={current === "events" ? "active" : ""} href="/events">
          Events
        </a>
        <a className={current === "stories" ? "active" : ""} href="/stories">
          Stories
        </a>
        <a
          className={current === "community" ? "active" : ""}
          href="/community"
        >
          Community
        </a>
        <a className={current === "members" ? "active" : ""} href="/#members">
          Members
        </a>
        <a className={current === "contact" ? "active" : ""} href="/#footer">
          Contact
        </a>
        <a className="mobile-site-switch" href={MAIN_SITE}>
          Go to Aadaab Arz Lucknow <span>→</span>
        </a>
      </nav>
      <div className="header-actions">
        <a className="site-switch" href={MAIN_SITE}>
          Lucknow site <span>↗</span>
        </a>
        <button
          className="menu"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>
    </header>
  );
}
function Footer() { return <footer id="footer" className="footer"><div className="footer-brand"><img loading="lazy" decoding="async" className="footer-logo" src="/images/aadaab-arz-logo.png" alt="" /><h2>Aadaab Arz<br />Lucknow Abroad</h2><p>Carrying Lucknow’s living heritage across borders.</p></div><div><h3>Explore</h3><Link href="/#explore">Explore Lucknow</Link><Link href="/events">Events</Link><Link href="/stories">Stories</Link><Link href="/community">Community</Link><Link href="/#members">Members</Link></div><div><h3>Contribute</h3><Link href="/#join">Share a Story</Link><Link href="/#join">Share Research</Link><Link href="/#join">Join Community</Link></div><div><h3>About</h3><Link href="/community">Community</Link><a href="mailto:hello@aadaabarz.com">Contact</a><a href={MAIN_SITE}>Aadaab Arz Lucknow ↗</a></div><p className="copyright">© 2026 Aadaab Arz Lucknow Abroad · People · Places · Stories</p></footer>; }
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? window.scrollY / height : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <span className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />;
}
function AmbientMotion() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
        root.style.setProperty("--pointer-shift-x", `${(event.clientX / window.innerWidth - .5) * 18}px`);
        root.style.setProperty("--pointer-shift-y", `${(event.clientY / window.innerHeight - .5) * 18}px`);
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", move); };
  }, []);
  return <div className="ambient-motion" aria-hidden="true"><i /><i /><i /></div>;
}
export function Shell({ active, children }: { active?: string; children: React.ReactNode }) { return <><AmbientMotion /><ScrollProgress /><Header active={active} />{children}<Footer /></>; }
function EventCards({ onePage = false, events: publishedEvents }: { onePage?: boolean; events: EventDetails[] }) {
  const events = publishedEvents.map((item) => ({ id: item.id, slug: item.slug, date: item.dateLabel, title: item.title, place: item.place, time: item.time, image: item.imageUrl, description: item.description, isPast: item.isPast, href: `/events/${item.slug}` }));
  return <div className={`event-grid ${onePage ? "event-grid-home" : "event-grid-list"}`}>{events.length === 0 && <p>No published events yet.</p>}{events.map((event, index) => {
    const [day = event.date, month = ""] = event.date.split(" ");
    return <article className={`event-card ${!onePage && index === 0 ? "event-card-featured" : ""}`} key={event.id ?? event.title}>
      <div className="event-image">{event.image && <Image src={event.image} alt={event.title} width={1200} height={800} sizes="(max-width: 760px) 100vw, 50vw" />}<span><b>{month}</b>{day}</span></div>
      <div className="event-card-copy"><p className="kicker">{event.isPast ? "Past event" : index === 0 ? "History lives here" : index === 1 ? "Music brings us together" : "Traditions in every detail"}</p><h3>{event.title}</h3><p className="event-place">{event.place}</p><p className="event-time">{event.time}</p>{event.description && <p className="event-description">{event.description}</p>}<Link href={event.href}>View Event <span>→</span></Link></div>
    </article>;
  })}</div>;
}

function MemberPortrait({ member, large = false }: { member: { image?: string; name: string; initials: string }; large?: boolean }) {
  return <div className={`foreign-member-portrait${large ? " foreign-member-portrait--large" : ""}`}>{member.image ? <img loading="lazy" decoding="async" src={member.image} alt={member.name} width="640" height="800" /> : <><span>{member.initials}</span><small>Portrait to follow</small></>}</div>;
}

function MembersSection() {
  return <section className="foreign-members" id="members"><div className="foreign-members-hero"><div><p className="eyebrow">Our people · A stronger tomorrow</p><h2>Meet Our <em>Team</em></h2><h3>Aadaab Arz Lucknow Abroad</h3><p>A dedicated team bringing people together to preserve, celebrate and share the rich culture, heritage and values of Lucknow across borders.</p><div className="actions"><Link className="button" href="#members-grid">Explore Our Team <span>→</span></Link><Link className="outline" href="#join">Our Mission</Link></div></div><div className="foreign-members-hero-image"><img loading="lazy" decoding="async" src="/images/heritage-arch.webp" alt="Lucknow heritage architecture" /><blockquote>Culture connects us,<br />no matter where we are.</blockquote></div></div><p className="foreign-members-ribbon">Same roots · New horizons · A stronger community</p><div className="foreign-members-grid" id="members-grid">{FOREIGN_MEMBERS.map((member) => <article className="foreign-member-card" key={member.slug}><MemberPortrait member={member} /><div><p className="eyebrow">{member.role}</p><h3>{member.name}</h3><p className="foreign-member-title">{member.role}<br />Aadaab Arz Lucknow Abroad</p>{member.qualification && <p className="foreign-member-card-qualification">{member.qualification}</p>}<p className="foreign-member-card-bio">{member.bio[0] ?? "Profile details will be added soon."}</p><Link className="button" href={`/members/${member.slug}`}>View More <span>→</span></Link></div></article>)}</div><div className="foreign-members-closing"><Mark /><h3>Different Places. A Shared Love for Lucknow.</h3><p>Join our growing global community and be part of a meaningful journey.</p></div></section>;
}

export function ForeignMemberProfilePage({ slug }: { slug: string }) {
  const member = FOREIGN_MEMBERS.find((item) => item.slug === slug);
  if (!member) return <Shell active="members"><main className="foreign-member-not-found"><p className="eyebrow">Leadership profile</p><h1>Profile not found.</h1><Link className="button" href="/#members">Meet the team →</Link></main></Shell>;
  return <Shell active="members"><main className="foreign-member-profile"><section className="foreign-member-profile-hero"><MemberPortrait member={member} large /><div><p className="eyebrow">Aadaab Arz Lucknow Abroad leadership</p><h1>{member.name}</h1><h2>{member.role}<br />Aadaab Arz Lucknow Abroad</h2>{member.qualification && <p className="foreign-member-qualification">{member.qualification}</p>}<p className="foreign-member-statement">Building a more connected world through culture, art and heritage.</p></div></section><section className="foreign-member-about"><div><p className="eyebrow">About our leadership</p><h2>{member.slug === "saif-norris" ? "My Journey" : `About ${member.name}`}</h2></div><div>{member.bio.length ? member.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>Profile details will be added soon.</p>}</div><blockquote>Culture becomes stronger when people share it with the world.</blockquote></section><section className="foreign-member-focus"><div className="foreign-member-focus-heading"><p className="eyebrow">Areas of focus</p><h2>A richer tomorrow through shared heritage.</h2></div><div>{FOREIGN_MEMBER_FOCUS[member.slug].map(([title,text],index)=><article key={title}><span>0{index+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section><section className="foreign-member-cta"><p className="eyebrow">Let’s stay connected</p><h2>Together for a More Connected World</h2><p>Meet our team and learn more about our mission, heritage and community.</p><div><Link className="button" href="/#members">Meet the team →</Link><a className="outline" href={MAIN_SITE}>Explore Aadaab Arz Lucknow →</a></div></section><nav className="foreign-member-profile-nav"><Link href="/#members">← Meet the team</Link><Link href="/#join">Join the community →</Link></nav></main></Shell>;
}

function JoinSection() {
  const [done, setDone] = useState(false);
  function submit(e: FormEvent) { e.preventDefault(); setDone(true); }
  return <section className="join-wrap" id="join">{done ? <div className="success"><Mark /><h2>Shukriya.</h2><p>Your request has been received.</p></div> : <form onSubmit={submit}><p className="eyebrow">Become part of the story</p><h2>Join the Community</h2><div className="form-grid"><label>Full Name<input required name="name" placeholder="Enter your full name" /></label><label>Email Address<input required type="email" name="email" placeholder="Enter your email address" /></label><label>City / Location<input required name="city" placeholder="Enter your city or location" /></label><label>What interests you most?<select required defaultValue=""><option value="" disabled>Select an option</option><option>Heritage & Architecture</option><option>History</option><option>Craft</option><option>Music & Dance</option><option>Memories</option></select></label><label className="wide">Why do you want to join?<textarea required rows={3} placeholder="Share a few lines about your connection with Lucknow…" /></label><label className="wide consent"><input required type="checkbox" />I agree to follow the Community Guidelines.</label></div><button className="button" type="submit">Request to Join →</button></form>}</section>;
}

export function HomePage({ events }: { events: EventDetails[] }) {
  return (
    <Shell active="explore">
      <main>
        <section className="home-hero" id="explore">
          <div className="hero-copy">
            <p className="eyebrow">A city of living heritage</p>
            <h1 className="official-hero-name">
              Aadaab Arz
              <br />
              <em>Lucknow Abroad</em>
            </h1>
            <h2>
              Where heritage lives, stories gather, and culture continues.
            </h2>
            <p>
              A thoughtful introduction to Lucknow and Awadh—for visitors who
              want to look beyond monuments and meet the people, traditions and
              stories that keep the city alive.
            </p>
            <div className="actions">
              <Link className="button" href="#events">
                Explore Lucknow <span>→</span>
              </Link>
              <Link className="outline" href="#stories">
                Discover Stories
              </Link>
            </div>
            <p className="hero-topics">
              Heritage · Culture · Craft · History · Music · Dance · Wildlife
            </p>
          </div>
          <div className="hero-image">
            <img
              src="/images/hero-architecture.webp"
              fetchPriority="high"
              width="1536" height="1024"
              alt="An ornate gateway in Lucknow at sunrise"
            />
            <blockquote>
              More than a city.
              <br />A living inheritance.
            </blockquote>
          </div>
        </section>
        <section className="section events-preview" id="events">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Featured experiences</p>
              <h2>Unforgettable Experiences in Lucknow</h2>
            </div>
            <div className="section-heading-side">
              <p>
                Join walks, music evenings and craft sessions that offer a
                deeper connection to the city’s rich heritage.
              </p>
              <Link href="/events">
                View All Events <span>→</span>
              </Link>
            </div>
          </div>
          <EventCards onePage events={events} />
        </section>
        <section className="values">
          <div>
            Authentic experiences<small>Go beyond the guidebooks</small>
          </div>
          <div>
            Meet local people<small>Real stories, real connections</small>
          </div>
          <div>
            A richer perspective<small>Heritage, art, food and more</small>
          </div>
          <div>
            A meaningful journey<small>Travel with purpose</small>
          </div>
        </section>
        <section className="section" id="stories">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Stories of a timeless city</p>
              <h2>Discover Lucknow</h2>
            </div>
            <p>
              Meet the city through its architecture, music, manners, memory and
              craft.
            </p>
          </div>
          <div className="story-grid">
            {stories.map((story) => (
              <article key={story.title}>
                <img loading="lazy" decoding="async" src={story.image} alt={story.title} />
                <div>
                  <h2>{story.title}</h2>
                  <p>{story.text}</p>
                  <Link className="button" href={story.href}>
                    Read Story <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="community-hero" id="community">
          <div>
            <p className="eyebrow">Aadaab Arz · Lucknow</p>
            <h2 className="community-section-heading">
              Be part of
              <br />
              Lucknow’s story.
            </h2>
            <p>
              Lucknow lives in its memories, crafts, music, streets and stories.
              Together, let’s celebrate, document and pass them on.
            </p>
            <div className="actions">
              <Link className="button" href="#join">
                Join the Community →
              </Link>
              <Link className="outline" href="#stories">
                Explore the Stories
              </Link>
            </div>
            <strong>
              4.5K+ <small>members across the world</small>
            </strong>
          </div>
          <div className="collage">
            <img loading="lazy" decoding="async"
              src="/images/community/archive-collage.webp"
              alt="A collage of Lucknow heritage and culture"
            />
          </div>
        </section>
        <section className="community-links">
          <Link href="/community/archive">
            <b>Bring something to the archive</b>
            <span>Share a place, craft, memory or story →</span>
          </Link>
          <Link href="/community/guidelines">
            <b>Aadaab begins with respect</b>
            <span>Join a thoughtful global community →</span>
          </Link>
          <Link href="/community/join">
            <b>Your Lucknow has a story too</b>
            <span>Become part of the community →</span>
          </Link>
        </section>
        <MembersSection />
        <JoinSection />
      </main>
    </Shell>
  );
}

export function EventsPage({ events }: { events: EventDetails[] }) { return <Shell active="events"><main><section className="split-hero events-hero"><div><p className="eyebrow">Culture · People · Places · Together</p><h1>Gather Around<br />Heritage</h1><p>Walk historic lanes. Hear timeless music. Meet master artisans. Discover the living heritage of Lucknow through curated experiences that bring people, culture and stories together.</p><Link className="button" href="#events">Explore Events <span>→</span></Link></div><div className="events-hero-image"><img loading="lazy" decoding="async" src="/images/heritage-arch.webp" alt="Lucknow heritage architecture at sunset" /><blockquote>More than a city.<br />A way of life.</blockquote></div></section><section className="section events-list-section" id="events"><div className="section-heading"><div><p className="eyebrow">Featured events</p><h2>Unforgettable<br />Experiences in Lucknow</h2></div><div className="section-heading-side"><p>Join walks, music evenings and craft sessions that offer a deeper connection to the city’s rich heritage.</p></div></div><EventCards events={events} /></section><section className="values events-values"><div>Authentic experiences<small>Go beyond the guidebooks</small></div><div>Meet local people<small>Real stories, real connections</small></div><div>A richer perspective<small>Heritage, art, food and more</small></div><div>A meaningful journey<small>Travel with purpose</small></div></section></main></Shell>; }

export function EventDetailPage() { const flow=["Arrival","The Story of the Craft","Artisan Demonstration","Hands-On Session","Conversation","Closing"]; return <Shell active="events"><main><section className="detail-hero"><div><p className="eyebrow">Event 03</p><h1>Craft & Culture<br />Baithak</h1><p>An intimate afternoon to meet the hands behind Lucknow’s living traditions and explore knowledge passed from one generation to another.</p><ul><li>19 July</li><li>4:00 PM – 7:00 PM</li><li>Husainabad Heritage Centre</li></ul><Link className="button" href="/community/join">Join the Baithak →</Link></div><img loading="lazy" decoding="async" src="/images/events/craft-baithak.webp" alt="Artisans practising embroidery in Lucknow" /></section><section className="section"><p className="eyebrow">A closer look</p><h2>Craft Is More Than What We See</h2><p className="lead">Every stitch carries a memory. Every motif holds a meaning. We go beyond the finished work to meet the hands that make it and the traditions that sustain it.</p><div className="maker-grid"><article><img loading="lazy" decoding="async" src="/images/stories/craft-artisan.webp" alt="Chikankari artisan" /><h3>Chikankari Artisan</h3><p>Fine needlework, floral jaalis and shadow work.</p></article><article><img loading="lazy" decoding="async" src="/images/events/craft-baithak.webp" alt="Zardozi artisan" /><h3>Zardozi Artisan</h3><p>Zari, dabka, sitara and karchob work.</p></article></div></section><section className="section flow"><p className="eyebrow">Program flow</p><h2>An Evening to Remember</h2><div>{flow.map((item,i)=><article key={item}><span>{["4:00","4:20","5:00","5:45","6:30","7:00"][i]}</span><h3>{item}</h3></article>)}</div></section></main></Shell>; }

export function StoriesPage() { return <Shell active="stories"><main><section className="split-hero stories-hero"><div><p className="eyebrow">Stories of a timeless city</p><h1>Discover<br /><em>Lucknow</em></h1><p>Meet the city through its architecture, music, manners, memory and craft.</p></div><img loading="lazy" decoding="async" src="/images/stories/rumi-gateway.webp" alt="Rumi Darwaza at sunset" /></section><section className="section"><div className="story-grid">{stories.map(story=><article key={story.title}><img loading="lazy" decoding="async" src={story.image} alt={story.title} /><div><h2>{story.title}</h2><p>{story.text}</p><Link className="button" href={story.href}>Read Story →</Link></div></article>)}</div></section></main></Shell>; }

export function StoryPage({ kind }: { kind: "rumi"|"music"|"craft" }) { const story=stories[kind==="rumi"?0:kind==="music"?1:2]; return <Shell active="stories"><main><section className="story-detail"><div><p className="eyebrow">History lives here</p><h1>{story.title}</h1><p>{story.text}</p><blockquote>{kind==="craft"?"More than crafts, these are living stories of a people and a place.":kind==="music"?"A culture of warmth, attention and respect.":"In every arch, a story. In every stone, a timeless Lucknow."}</blockquote><Link className="outline" href="/stories">Back to stories</Link></div><img loading="lazy" decoding="async" src={story.image} alt={story.title} /></section><section className="values"><div>Iconic Heritage<small>A symbol of rich history</small></div><div>Living Stories<small>Where generations connect</small></div><div>Timeless Beauty<small>An enduring cultural treasure</small></div></section></main></Shell>; }

export function CommunityPage() { return <Shell active="community"><main><section className="community-hero"><div><p className="eyebrow">Aadaab Arz · Lucknow</p><h1>Be part of<br />Lucknow’s story.</h1><p>Lucknow lives in its memories, crafts, music, streets and stories. Together, let’s celebrate, document and pass them on.</p><div className="actions"><Link className="button" href="/community/join">Join the Community →</Link><Link className="outline" href="/community/archive">Explore the Archive</Link></div><strong>4.5K+ <small>members across the world</small></strong></div><div className="collage"><img loading="lazy" decoding="async" src="/images/community/archive-collage.webp" alt="A collage of Lucknow heritage and culture" /></div></section><section className="community-links"><Link href="/community/archive"><b>Bring something to the archive</b><span>Share a place, craft, memory or story →</span></Link><Link href="/community/guidelines"><b>Aadaab begins with respect</b><span>Read our community guidelines →</span></Link><Link href="/community/join"><b>Your Lucknow has a story too</b><span>Join the community →</span></Link></section></main></Shell>; }

export function ArchivePage() { return <Shell active="community"><main><section className="split-hero archive-hero"><div><p className="eyebrow">Community archive</p><h1>Bring Something<br />to the Archive</h1><p>Some of Lucknow’s most valuable stories live in family albums, oral histories, traditional crafts and neighbourhood memories.</p><Link className="button" href="/community/join">Join the Community →</Link></div><img loading="lazy" decoding="async" src="/images/community/archive-collage.webp" alt="Lucknow community archive" /></section><section className="section"><div className="section-heading"><div><p className="eyebrow">Ways to contribute</p><h2>Share What Makes Lucknow Extraordinary</h2></div></div><div className="category-grid">{categories.map(([title,text])=><article key={title}><Mark /><h3>{title}</h3><p>{text}</p><Link href="/community/join">Explore →</Link></article>)}</div></section></main></Shell>; }

export function GuidelinesPage() { const rules=[["Be respectful","Honour people, places, traditions and different perspectives."],["Be relevant","Share content that adds value to conversations around Lucknow and Awadh."],["Be responsible","Check information before sharing and provide reliable references."],["Respect privacy","Do not share private information or identifiable stories without permission."]]; return <Shell active="community"><main><section className="guidelines"><p className="eyebrow">Aadaab Arz · Lucknow</p><h1>Aadaab Begins<br />with Respect</h1><p>We want Aadaab Arz to remain a thoughtful, welcoming and trustworthy space.</p><div>{rules.map(([title,text])=><article key={title}><Mark /><h2>{title}</h2><p>{text}</p></article>)}</div><ul><li>No unrelated commercial content</li><li>No bullying or personal attacks</li><li>Respect people’s privacy</li><li>Give credit when using someone else’s work</li></ul><Link className="button" href="/community/join">Continue to Join →</Link></section></main></Shell>; }

export function JoinPage() { const [done,setDone]=useState(false); function submit(e:FormEvent){e.preventDefault();setDone(true);} return <Shell active="community"><main><section className="join-intro"><div><p className="eyebrow">Aadaab Arz · Lucknow</p><h1>Join the<br />Community</h1><p>Become part of a growing global community that celebrates and preserves the heritage and culture of Lucknow and Awadh.</p></div><img loading="lazy" decoding="async" src="/images/heritage-arch.webp" alt="Lucknow heritage architecture" /></section><section className="join-wrap">{done?<div className="success"><Mark /><h2>Shukriya.</h2><p>Your request has been received.</p></div>:<form onSubmit={submit}><h2>Your Details</h2><div className="form-grid"><label>Full Name<input required name="name" placeholder="Enter your full name" /></label><label>Email Address<input required type="email" name="email" placeholder="Enter your email address" /></label><label>Phone Number <small>Optional</small><input type="tel" name="phone" placeholder="Enter your phone number" /></label><label>City / Location<input required name="city" placeholder="Enter your city or location" /></label><label className="wide">How did you hear about Aadaab Arz Lucknow?<select required defaultValue=""><option value="" disabled>Select an option</option><option>Friend or family</option><option>Social media</option><option>Community event</option><option>Online search</option></select></label><label className="wide">Why do you want to join?<textarea required rows={4} placeholder="Share a few lines about your interest in Lucknow and Awadh…" /></label><fieldset className="wide"><legend>What topics interest you most?</legend><div className="checks">{categories.map(([title])=><label key={title}><input type="checkbox" />{title}</label>)}</div></fieldset><label className="wide">Do you have something to contribute?<textarea rows={2} placeholder="Stories, research, photographs, documents or skills" /></label><label className="wide consent"><input required type="checkbox" />I agree to follow the Community Guidelines.</label></div><button className="button" type="submit">Request to Join the Community →</button></form>}</section></main></Shell>; }
