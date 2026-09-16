"use client";

import { FormEvent, useEffect, useState } from "react";

const MAIN_SITE = "https://settlement-fcc-processes-tones.trycloudflare.com";
const CONTENT_API_BASE = process.env.NEXT_PUBLIC_CONTENT_API_BASE ?? MAIN_SITE;
type ContentEvent = { id?: number; date: string; title: string; place: string; time: string; image: string; href: string; description?: string };
const DEFAULT_EVENTS: ContentEvent[] = [
  { date: "22 Jun", title: "Heritage Walk at Bara Imambara", place: "Bara Imambara, Lucknow", time: "7:00 AM – 10:30 AM", image: "/images/events/heritage-walk.webp", href: "/events" },
  { date: "06 Jul", title: "The Music Evening", place: "Rumi Darwaza Courtyard", time: "6:30 PM – 9:00 PM", image: "/images/events/music-evening.webp", href: "/events" },
  { date: "19 Jul", title: "Craft & Culture Baithak", place: "Husainabad Heritage Centre", time: "4:00 PM – 7:00 PM", image: "/images/events/craft-baithak.webp", href: "/events/craft-culture-baithak" },
];
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

function Link({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={href} {...props} />;
}

function Mark() { return <span className="mark" aria-hidden="true">✣</span>; }
function Header({ active = "" }: { active?: string }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(active);
  useEffect(() => {
    const sections = ["explore", "events", "stories", "community", "footer"]
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (sections.length < 2) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setCurrent(visible.target.id === "footer" ? "contact" : visible.target.id);
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, .2, .5] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return <header className="header">
    <Link href="/" className="brand"><Mark /><span>Aadaab Arz <b>Foreign</b></span></Link>
    <nav className={open ? "nav open" : "nav"} aria-label="Primary navigation">
      <Link className={current === "explore" ? "active" : ""} href="/#explore">Explore Lucknow</Link><Link className={current === "events" ? "active" : ""} href="/#events">Events</Link><Link className={current === "stories" ? "active" : ""} href="/#stories">Stories</Link><Link className={current === "community" ? "active" : ""} href="/#community">Community</Link><Link className={current === "contact" ? "active" : ""} href="/#footer">Contact</Link>
    </nav>
    <div className="header-actions"><a className="site-switch" href={MAIN_SITE}>Lucknow site ↗</a><Link className="button" href="/#join">Join the Community <span>→</span></Link><button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">☰</button></div>
  </header>;
}
function Footer() { return <footer id="footer" className="footer"><div className="footer-brand"><Mark /><h2>Aadaab Arz<br />Foreign</h2><p>Carrying Lucknow’s living heritage across borders.</p></div><div><h3>Explore</h3><Link href="/#explore">Explore Lucknow</Link><Link href="/#events">Events</Link><Link href="/#stories">Stories</Link><Link href="/#community">Community</Link></div><div><h3>Contribute</h3><Link href="/#join">Share a Story</Link><Link href="/#join">Share Research</Link><Link href="/#join">Join Community</Link></div><div><h3>About</h3><Link href="/#community">Community</Link><a href="mailto:hello@aadaabarz.com">Contact</a><a href={MAIN_SITE}>Aadaab Arz Lucknow ↗</a></div><p className="copyright">© 2026 Aadaab Arz · People · Places · Stories</p></footer>; }
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
function Shell({ active, children }: { active?: string; children: React.ReactNode }) { return <><AmbientMotion /><ScrollProgress /><Header active={active} />{children}<Footer /></>; }
function EventCards({ onePage = false }: { onePage?: boolean }) {
  const [events, setEvents] = useState<ContentEvent[]>(DEFAULT_EVENTS);
  useEffect(() => {
    let active = true;
    fetch(`${CONTENT_API_BASE}/api/public/events?site=foreign`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((items: Array<{ id: number; dateLabel: string; title: string; place: string; time: string; imageUrl: string; description: string }>) => {
        if (!active || !Array.isArray(items)) return;
        setEvents(items.map((item) => ({ id: item.id, date: item.dateLabel, title: item.title, place: item.place, time: item.time, image: item.imageUrl, description: item.description, href: "#join" })));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);
  return <div className="event-grid">{events.map((event) => <article className="event-card" key={event.id ?? event.title}><div className="event-image"><img src={event.image} alt="" /><span>{event.date}</span></div><div><p className="kicker">Featured experience</p><h3>{event.title}</h3><p>{event.place}</p><p>{event.time}</p><Link href={onePage ? "#join" : event.href}>View Event <span>→</span></Link></div></article>)}</div>;
}

function JoinSection() {
  const [done, setDone] = useState(false);
  function submit(e: FormEvent) { e.preventDefault(); setDone(true); }
  return <section className="join-wrap" id="join">{done ? <div className="success"><Mark /><h2>Shukriya.</h2><p>Your request has been received.</p></div> : <form onSubmit={submit}><p className="eyebrow">Become part of the story</p><h2>Join the Community</h2><div className="form-grid"><label>Full Name<input required name="name" placeholder="Enter your full name" /></label><label>Email Address<input required type="email" name="email" placeholder="Enter your email address" /></label><label>City / Location<input required name="city" placeholder="Enter your city or location" /></label><label>What interests you most?<select required defaultValue=""><option value="" disabled>Select an option</option><option>Heritage & Architecture</option><option>History</option><option>Craft</option><option>Music & Dance</option><option>Memories</option></select></label><label className="wide">Why do you want to join?<textarea required rows={3} placeholder="Share a few lines about your connection with Lucknow…" /></label><label className="wide consent"><input required type="checkbox" />I agree to follow the Community Guidelines.</label></div><button className="button" type="submit">Request to Join →</button></form>}</section>;
}

export function HomePage() { return <Shell active="explore"><main><section className="home-hero" id="explore"><div className="hero-copy"><p className="eyebrow">A city of living heritage</p><h1>Aadaab,<br /><em>Lucknow</em></h1><h2>Where heritage lives, stories gather, and culture continues.</h2><p>A thoughtful introduction to Lucknow and Awadh—for visitors who want to look beyond monuments and meet the people, traditions and stories that keep the city alive.</p><div className="actions"><Link className="button" href="#events">Explore Lucknow <span>→</span></Link><Link className="outline" href="#stories">Discover Stories</Link></div></div><div className="hero-image"><img src="/images/hero-architecture.webp" alt="An ornate gateway in Lucknow at sunrise" /><blockquote>More than a city.<br />A living inheritance.</blockquote></div></section><section className="section events-preview" id="events"><div className="section-heading"><div><p className="eyebrow">Featured experiences</p><h2>Unforgettable Experiences in Lucknow</h2></div><p>Walk historic lanes, hear timeless music and meet the artisans carrying Awadh’s traditions forward.</p></div><EventCards onePage /></section><section className="values"><div>Authentic experiences<small>Go beyond the guidebooks</small></div><div>Meet local people<small>Real stories, real connections</small></div><div>A richer perspective<small>Heritage, art, food and more</small></div><div>A meaningful journey<small>Travel with purpose</small></div></section><section className="section" id="stories"><div className="section-heading"><div><p className="eyebrow">Stories of a timeless city</p><h2>Discover Lucknow</h2></div><p>Meet the city through its architecture, music, manners, memory and craft.</p></div><div className="story-grid">{stories.map(story=><article key={story.title}><img src={story.image} alt="" /><div><h2>{story.title}</h2><p>{story.text}</p><Link className="button" href="#community">Continue the journey →</Link></div></article>)}</div></section><section className="community-hero" id="community"><div><p className="eyebrow">Aadaab Arz · Lucknow</p><h1>Be part of<br />Lucknow’s story.</h1><p>Lucknow lives in its memories, crafts, music, streets and stories. Together, let’s celebrate, document and pass them on.</p><div className="actions"><Link className="button" href="#join">Join the Community →</Link><Link className="outline" href="#stories">Explore the Stories</Link></div><strong>4.5K+ <small>members across the world</small></strong></div><div className="collage"><img src="/images/community/archive-collage.webp" alt="A collage of Lucknow heritage and culture" /></div></section><section className="community-links"><Link href="#join"><b>Bring something to the archive</b><span>Share a place, craft, memory or story →</span></Link><Link href="#join"><b>Aadaab begins with respect</b><span>Join a thoughtful global community →</span></Link><Link href="#join"><b>Your Lucknow has a story too</b><span>Become part of the community →</span></Link></section><JoinSection /></main></Shell>; }

export function EventsPage() { return <Shell active="events"><main><section className="split-hero"><div><p className="eyebrow">Culture · People · Places · Together</p><h1>Gather Around<br />Heritage</h1><p>Walk historic lanes. Hear timeless music. Meet master artisans. Discover the living heritage of Lucknow through curated experiences that bring people, culture and stories together.</p><Link className="button" href="#events">Explore Events →</Link></div><img src="/images/heritage-arch.webp" alt="Lucknow heritage architecture at sunset" /></section><section className="section" id="events"><div className="section-heading"><div><p className="eyebrow">Featured events</p><h2>Unforgettable Experiences in Lucknow</h2></div><p>Join walks, music evenings and craft sessions that offer a deeper connection to the city.</p></div><EventCards /></section></main></Shell>; }

export function EventDetailPage() { const flow=["Arrival","The Story of the Craft","Artisan Demonstration","Hands-On Session","Conversation","Closing"]; return <Shell active="events"><main><section className="detail-hero"><div><p className="eyebrow">Event 03</p><h1>Craft & Culture<br />Baithak</h1><p>An intimate afternoon to meet the hands behind Lucknow’s living traditions and explore knowledge passed from one generation to another.</p><ul><li>19 July</li><li>4:00 PM – 7:00 PM</li><li>Husainabad Heritage Centre</li></ul><Link className="button" href="/community/join">Join the Baithak →</Link></div><img src="/images/events/craft-baithak.webp" alt="Artisans practising embroidery in Lucknow" /></section><section className="section"><p className="eyebrow">A closer look</p><h2>Craft Is More Than What We See</h2><p className="lead">Every stitch carries a memory. Every motif holds a meaning. We go beyond the finished work to meet the hands that make it and the traditions that sustain it.</p><div className="maker-grid"><article><img src="/images/stories/craft-artisan.webp" alt="Chikankari artisan" /><h3>Chikankari Artisan</h3><p>Fine needlework, floral jaalis and shadow work.</p></article><article><img src="/images/events/craft-baithak.webp" alt="Zardozi artisan" /><h3>Zardozi Artisan</h3><p>Zari, dabka, sitara and karchob work.</p></article></div></section><section className="section flow"><p className="eyebrow">Program flow</p><h2>An Evening to Remember</h2><div>{flow.map((item,i)=><article key={item}><span>{["4:00","4:20","5:00","5:45","6:30","7:00"][i]}</span><h3>{item}</h3></article>)}</div></section></main></Shell>; }

export function StoriesPage() { return <Shell active="stories"><main><section className="split-hero stories-hero"><div><p className="eyebrow">Stories of a timeless city</p><h1>Discover<br /><em>Lucknow</em></h1><p>Meet the city through its architecture, music, manners, memory and craft.</p></div><img src="/images/stories/rumi-gateway.webp" alt="Rumi Darwaza at sunset" /></section><section className="section"><div className="story-grid">{stories.map(story=><article key={story.title}><img src={story.image} alt="" /><div><h2>{story.title}</h2><p>{story.text}</p><Link className="button" href={story.href}>Read Story →</Link></div></article>)}</div></section></main></Shell>; }

export function StoryPage({ kind }: { kind: "rumi"|"music"|"craft" }) { const story=stories[kind==="rumi"?0:kind==="music"?1:2]; return <Shell active="stories"><main><section className="story-detail"><div><p className="eyebrow">History lives here</p><h1>{story.title}</h1><p>{story.text}</p><blockquote>{kind==="craft"?"More than crafts, these are living stories of a people and a place.":kind==="music"?"A culture of warmth, attention and respect.":"In every arch, a story. In every stone, a timeless Lucknow."}</blockquote><Link className="outline" href="/stories">Back to stories</Link></div><img src={story.image} alt={story.title} /></section><section className="values"><div>Iconic Heritage<small>A symbol of rich history</small></div><div>Living Stories<small>Where generations connect</small></div><div>Timeless Beauty<small>An enduring cultural treasure</small></div></section></main></Shell>; }

export function CommunityPage() { return <Shell active="community"><main><section className="community-hero"><div><p className="eyebrow">Aadaab Arz · Lucknow</p><h1>Be part of<br />Lucknow’s story.</h1><p>Lucknow lives in its memories, crafts, music, streets and stories. Together, let’s celebrate, document and pass them on.</p><div className="actions"><Link className="button" href="/community/join">Join the Community →</Link><Link className="outline" href="/community/archive">Explore the Archive</Link></div><strong>4.5K+ <small>members across the world</small></strong></div><div className="collage"><img src="/images/community/archive-collage.webp" alt="A collage of Lucknow heritage and culture" /></div></section><section className="community-links"><Link href="/community/archive"><b>Bring something to the archive</b><span>Share a place, craft, memory or story →</span></Link><Link href="/community/guidelines"><b>Aadaab begins with respect</b><span>Read our community guidelines →</span></Link><Link href="/community/join"><b>Your Lucknow has a story too</b><span>Join the community →</span></Link></section></main></Shell>; }

export function ArchivePage() { return <Shell active="community"><main><section className="split-hero archive-hero"><div><p className="eyebrow">Community archive</p><h1>Bring Something<br />to the Archive</h1><p>Some of Lucknow’s most valuable stories live in family albums, oral histories, traditional crafts and neighbourhood memories.</p><Link className="button" href="/community/join">Join the Community →</Link></div><img src="/images/community/archive-collage.webp" alt="Lucknow community archive" /></section><section className="section"><div className="section-heading"><div><p className="eyebrow">Ways to contribute</p><h2>Share What Makes Lucknow Extraordinary</h2></div></div><div className="category-grid">{categories.map(([title,text])=><article key={title}><Mark /><h3>{title}</h3><p>{text}</p><Link href="/community/join">Explore →</Link></article>)}</div></section></main></Shell>; }

export function GuidelinesPage() { const rules=[["Be respectful","Honour people, places, traditions and different perspectives."],["Be relevant","Share content that adds value to conversations around Lucknow and Awadh."],["Be responsible","Check information before sharing and provide reliable references."],["Respect privacy","Do not share private information or identifiable stories without permission."]]; return <Shell active="community"><main><section className="guidelines"><p className="eyebrow">Aadaab Arz · Lucknow</p><h1>Aadaab Begins<br />with Respect</h1><p>We want Aadaab Arz to remain a thoughtful, welcoming and trustworthy space.</p><div>{rules.map(([title,text])=><article key={title}><Mark /><h2>{title}</h2><p>{text}</p></article>)}</div><ul><li>No unrelated commercial content</li><li>No bullying or personal attacks</li><li>Respect people’s privacy</li><li>Give credit when using someone else’s work</li></ul><Link className="button" href="/community/join">Continue to Join →</Link></section></main></Shell>; }

export function JoinPage() { const [done,setDone]=useState(false); function submit(e:FormEvent){e.preventDefault();setDone(true);} return <Shell active="community"><main><section className="join-intro"><div><p className="eyebrow">Aadaab Arz · Lucknow</p><h1>Join the<br />Community</h1><p>Become part of a growing global community that celebrates and preserves the heritage and culture of Lucknow and Awadh.</p></div><img src="/images/heritage-arch.webp" alt="Lucknow heritage architecture" /></section><section className="join-wrap">{done?<div className="success"><Mark /><h2>Shukriya.</h2><p>Your request has been received.</p></div>:<form onSubmit={submit}><h2>Your Details</h2><div className="form-grid"><label>Full Name<input required name="name" placeholder="Enter your full name" /></label><label>Email Address<input required type="email" name="email" placeholder="Enter your email address" /></label><label>Phone Number <small>Optional</small><input type="tel" name="phone" placeholder="Enter your phone number" /></label><label>City / Location<input required name="city" placeholder="Enter your city or location" /></label><label className="wide">How did you hear about Aadaab Arz Lucknow?<select required defaultValue=""><option value="" disabled>Select an option</option><option>Friend or family</option><option>Social media</option><option>Community event</option><option>Online search</option></select></label><label className="wide">Why do you want to join?<textarea required rows={4} placeholder="Share a few lines about your interest in Lucknow and Awadh…" /></label><fieldset className="wide"><legend>What topics interest you most?</legend><div className="checks">{categories.map(([title])=><label key={title}><input type="checkbox" />{title}</label>)}</div></fieldset><label className="wide">Do you have something to contribute?<textarea rows={2} placeholder="Stories, research, photographs, documents or skills" /></label><label className="wide consent"><input required type="checkbox" />I agree to follow the Community Guidelines.</label></div><button className="button" type="submit">Request to Join the Community →</button></form>}</section></main></Shell>; }
