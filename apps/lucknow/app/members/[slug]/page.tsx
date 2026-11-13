import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/seo';
import { MemberProfilePage, MEMBERS } from '@/components/MembersExperience';


type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return MEMBERS.map((member) => ({ slug: member.slug })); }
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const member = MEMBERS.find((item) => item.slug === slug);
  if (!member) notFound();
  return pageMetadata(member.name, `${member.name}, ${member.role}. ${member.bio[0] || 'Meet the people preserving Lucknow’s culture and heritage.'}`.slice(0, 160), `/members/${slug}`, member.image);
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!MEMBERS.some((item) => item.slug === slug)) notFound();
  return <MemberProfilePage slug={slug} />;
}
