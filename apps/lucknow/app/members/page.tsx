import { MembersPage } from '@/components/MembersExperience';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('Our Team', 'Meet the people supporting Lucknow’s heritage, arts, music and community.', '/members');
export default function Page() { return <MembersPage />; }
