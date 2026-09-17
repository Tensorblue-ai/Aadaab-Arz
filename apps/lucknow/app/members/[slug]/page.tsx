import type { Metadata } from 'next';
import { MemberProfilePage, MEMBERS } from '@/components/MembersExperience';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const member = MEMBERS.find((item) => item.slug === slug);
  return { title: member ? `${member.name} — Aadaab Arz Lucknow` : 'Member — Aadaab Arz Lucknow' };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <MemberProfilePage slug={slug} />;
}
