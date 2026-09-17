import { ForeignMemberProfilePage } from '@/components/ForeignSite';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ForeignMemberProfilePage slug={slug} />;
}
