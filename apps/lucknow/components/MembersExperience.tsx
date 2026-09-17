import Link from 'next/link';

export const MEMBERS = [
  { slug: 'iffat', name: 'Iffat', role: 'President', initials: 'IF' },
  { slug: 'sheikh-tariq', name: 'Sheikh Tariq', role: 'Vice President', initials: 'ST' },
  { slug: 'murad', name: 'Murad', role: 'Secretary', initials: 'MU' },
  { slug: 'tariq-durrani', name: 'Tariq Durrani', role: 'Treasurer', initials: 'TD' },
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
              <div className="member-portrait-placeholder" aria-label={`${member.name} photograph coming soon`}>
                <span>{member.initials}</span>
                <small>Portrait to follow</small>
              </div>
              <div className="member-card__copy">
                <p className="members-eyebrow">0{index + 1} · {member.role}</p>
                <h2>{member.name}</h2>
                <p>{member.role}, Aadaab Arz Lucknow</p>
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
          <div className="member-portrait-placeholder member-portrait-placeholder--large" aria-label={`${member.name} photograph coming soon`}>
            <span>{member.initials}</span>
            <small>Portrait to follow</small>
          </div>
          <div>
            <p className="members-eyebrow">Leadership profile</p>
            <h1>{member.name}</h1>
            <h2>{member.role}<br />Aadaab Arz Lucknow</h2>
            <i aria-hidden="true" />
            <p className="member-profile__statement">Serving Lucknow’s living culture with care, continuity and community.</p>
          </div>
        </section>

        <section className="member-profile__about">
          <div>
            <p className="members-eyebrow">About</p>
            <h2>About {member.name}</h2>
          </div>
          <div>
            <p>{member.name} serves as {member.role} of Aadaab Arz Lucknow.</p>
            <p>A fuller introduction, photograph and personal message will be added here.</p>
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
