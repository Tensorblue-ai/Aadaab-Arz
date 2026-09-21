import type { AnchorHTMLAttributes } from 'react';

function Link({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={href} {...props} />;
}

export const MEMBERS = [
  {
    slug: 'iffat', name: 'Iffat Khan', role: 'Founder & President of AALA', initials: 'IK',
    image: '/images/members/iffat-khan.png', qualification: 'M.A., MBA — Dalhousie University, Canada',
    bio: [
      'As a passionate advocate for culture, art, heritage, and community, my vision is to create an environment where everyone feels inspired to discover, express, and celebrate their unique creativity.',
      'I am especially passionate about showcasing India’s rich cultural heritage, timeless traditions, vibrant arts, and remarkable architecture to the world and to visitors from around the globe.',
      'Through my involvement in community activities featuring music, handicrafts, art, and heritage walks, I have developed a deep appreciation for the dedication required to preserve our traditions while embracing fresh, modern ideas.',
      'I believe that when we come together, we can celebrate our heritage, inspire creativity, and build a more vibrant and connected community.',
    ],
  },
  {
    slug: 'sheikh-tariq', name: 'Sheikh Mohammad Tariq', role: 'Vice President', initials: 'ST',
    image: '/images/members/sheikh-mohammad-tariq.png', qualification: 'Senior Cambridge — La Martiniere College, Lucknow · Graduate — Aligarh Muslim University',
    bio: [
      'Sheikh Mohammad Tariq completed his Senior Cambridge education at La Martiniere College, Lucknow, and graduated from Aligarh Muslim University, Aligarh. He is presently a business entrepreneur and belongs to Malihabad, famous for its mangoes and the celebrated poet Josh Malihabadi.',
      'He is closely connected to the culture, heritage and tehzeeb of the Awadh region.',
    ],
  },
  {
    slug: 'murad', name: 'Murad Khan', role: 'Secretary, Aadaab Arz Lucknow', initials: 'MK',
    image: '/images/members/murad-khan.png', qualification: null,
    bio: [
      'I have always been deeply passionate about the arts, music and celebrating our diverse traditions. As an active participant in college activities and event planning, I understand what it takes to bring people together and create a vibrant, inclusive environment.',
      'My motive is to promote the art, culture and vibrant colours of India, especially Lucknow.',
    ],
  },
  {
    slug: 'tariq-durrani', name: 'Tariq Durrani', role: 'Treasurer', initials: 'TD',
    image: '/images/members/tariq-durrani.png', qualification: null, bio: [],
  },
] as const;

const MEMBER_FOCUS: Record<string, [string, string][]> = {
  iffat: [['Culture & Community', 'Bringing people together through shared interests and meaningful engagement.'], ['Art & Heritage', 'Sharing the values, traditions and architecture of India.'], ['Creative Leadership', 'Encouraging fresh ideas and vibrant cultural experiences.']],
  'sheikh-tariq': [['Awadhi Heritage', 'Celebrating the culture, heritage and tehzeeb of Awadh.'], ['Community', 'Creating lasting connections through shared cultural roots.'], ['Leadership', 'Supporting thoughtful programmes and community initiatives.']],
  murad: [['Arts & Music', 'Celebrating India’s diverse artistic and musical traditions.'], ['Events', 'Bringing people together through inclusive cultural gatherings.'], ['Lucknow', 'Promoting the vibrant colours and culture of the city.']],
  'tariq-durrani': [['Community', 'Supporting the people and programmes of Aadaab Arz Lucknow.'], ['Stewardship', 'Helping the organisation grow with care and continuity.'], ['Culture', 'Strengthening connections through shared heritage.']],
};

function MembersHeader() {
  return (
    <header className="members-header">
      <a className="members-brand" href="/">
        <img className="brand-logo" src="/images/aadaab-arz-logo.png" alt="" />
        Aadaab Arz Lucknow
      </a>
      <nav aria-label="Members page navigation">
        <a href="/#heritage">Explore</a>
        <a href="/#events">Events</a>
        <a href="/#stories">Stories</a>
        <a className="is-active" href="/#members">Members</a>
        <a href="/#community">Community</a>
      </nav>
      <a className="members-home-link" href="/">Back to Lucknow <span aria-hidden="true">→</span></a>
    </header>
  );
}

export function MembersPage() {
  return (
    <div className="members-shell">
      <MembersHeader />
      <main>
        <section className="members-hero">
          <div>
            <p className="members-eyebrow">Our people · One shared purpose</p>
            <h1>The people who<br /><em>hold the circle.</em></h1>
          </div>
          <p>Aadaab Arz Lucknow is guided by people committed to keeping the city’s culture, conversations and shared memory alive.</p>
        </section>

        <section className="members-list" aria-label="Aadaab Arz Lucknow members">
          {MEMBERS.map((member, index) => (
            <article className="member-card" key={member.slug}>
              <div className="member-portrait-placeholder">
                {member.image ? <img src={member.image} alt={member.name} /> : <><span>{member.initials}</span><small>Portrait to follow</small></>}
              </div>
              <div className="member-card__copy">
                <p className="members-eyebrow">0{index + 1} · {member.role}</p>
                <h2>{member.name}</h2>
                <p>{member.role}</p>
                <a href={`/members/${member.slug}`} target="_top">View profile <span aria-hidden="true">↗</span></a>
              </div>
            </article>
          ))}
        </section>
      </main>
      <footer className="members-footer"><span>Aadaab Arz Lucknow</span><span>Culture lives through people.</span></footer>
    </div>
  );
}

export function MemberProfilePage({ slug }: { slug: string }) {
  const member = MEMBERS.find((item) => item.slug === slug);
  if (!member) {
    return <div className="members-shell"><MembersHeader /><main className="member-not-found"><p className="members-eyebrow">Member profile</p><h1>Profile not found.</h1><Link href="/#members">View all members →</Link></main></div>;
  }

  return (
    <div className="members-shell">
      <MembersHeader />
      <main className="member-profile">
        <section className="member-profile__intro">
          <p className="members-eyebrow">About</p>
          <h1>About {member.name}</h1>
          <i aria-hidden="true" />
        </section>

        <section className="member-profile__about">
          <div className="member-portrait-placeholder member-portrait-placeholder--large">
            {member.image ? <img src={member.image} alt={member.name} /> : <><span>{member.initials}</span><small>Portrait to follow</small></>}
          </div>
          <div className="member-profile__bio">
            <p className="member-profile__role">{member.role}</p>
            {member.qualification && <p className="member-profile__qualification">{member.qualification}</p>}
            {member.bio.length ? member.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>Profile details will be added soon.</p>}
          </div>
          <blockquote>Culture continues when people come together with purpose.</blockquote>
        </section>

        <section className="member-profile__focus">
          <div className="member-profile__focus-heading"><p className="members-eyebrow">Areas of focus</p><h2>Purpose in practice.</h2></div>
          <div>{MEMBER_FOCUS[member.slug].map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>

        <nav className="member-profile__nav" aria-label="Member profiles">
          <Link href="/#members">← All members</Link>
          <Link href="/#community">Join the community →</Link>
        </nav>
        <footer className="member-profile__ribbon"><span>People</span><span>Heritage</span><span>Creativity</span><span>Community</span><strong>Lucknow lives on</strong></footer>
      </main>
    </div>
  );
}
