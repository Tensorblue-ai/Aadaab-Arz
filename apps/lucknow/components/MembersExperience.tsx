import Link from 'next/link';

export const MEMBERS = [
  {
    slug: 'iffat', name: 'Iffat Khan', role: 'Founder & President of AALA', initials: 'IK',
    image: '/images/members/iffat-khan.png', qualification: 'M.A., MBA — Dalhousie University, Canada',
    bio: [
      'As a passionate believer in the power of culture, art and community, my goal is to build an environment where every member feels inspired to express their unique creativity. Exposing the values, traditions and architecture of India to the world and its visitors is my aim.',
      'Having been actively involved in group activities around music, handicrafts, art and heritage walks, I understand the dedication it takes to keep our traditions alive while pushing for fresh, modern ideas. Together, we can make the future more vibrant and memorable.',
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
    image: null, qualification: null, bio: [],
  },
] as const;

function MembersHeader() {
  return (
    <header className="members-header">
      <Link className="members-brand" href="/">
        <span className="rosette rosette--small" aria-hidden="true"><span /><span /><span /><span /></span>
        Aadaab Arz Lucknow
      </Link>
      <nav aria-label="Members page navigation">
        <Link href="/#heritage">Explore</Link>
        <Link href="/#events">Events</Link>
        <Link href="/#stories">Stories</Link>
        <Link className="is-active" href="/#members">Members</Link>
        <Link href="/#community">Community</Link>
      </nav>
      <Link className="members-home-link" href="/">Back to Lucknow <span aria-hidden="true">→</span></Link>
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
                <Link href={`/members/${member.slug}`}>View profile <span aria-hidden="true">↗</span></Link>
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
        <section className="member-profile__hero">
          <div className="member-portrait-placeholder member-portrait-placeholder--large">
            {member.image ? <img src={member.image} alt={member.name} /> : <><span>{member.initials}</span><small>Portrait to follow</small></>}
          </div>
          <div>
            <p className="members-eyebrow">Leadership profile</p>
            <h1>{member.name}</h1>
            <h2>{member.role}</h2>
            <i aria-hidden="true" />
            {member.qualification && <p className="member-profile__qualification">{member.qualification}</p>}
            <p className="member-profile__statement">Serving Lucknow’s living culture with care, continuity and community.</p>
          </div>
        </section>

        <section className="member-profile__about">
          <div>
            <p className="members-eyebrow">About</p>
            <h2>About {member.name}</h2>
          </div>
          <div>
            {member.bio.length ? member.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>Profile details will be added soon.</p>}
          </div>
          <blockquote>Culture continues when people come together with purpose.</blockquote>
        </section>

        <nav className="member-profile__nav" aria-label="Member profiles">
          <Link href="/#members">← All members</Link>
          <Link href="/#community">Join the community →</Link>
        </nav>
      </main>
    </div>
  );
}
