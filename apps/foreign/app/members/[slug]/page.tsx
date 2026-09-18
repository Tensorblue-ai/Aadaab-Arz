import { ForeignMemberProfilePage, FOREIGN_MEMBERS } from '@/components/ForeignSite';

export function generateStaticParams() {
  return FOREIGN_MEMBERS.map((member) => ({ slug: member.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ForeignMemberProfilePage slug={slug} />;
}
