import type { Metadata } from 'next';
import { MembersPage } from '@/components/MembersExperience';

export const metadata: Metadata = {
  title: 'Members — Aadaab Arz Lucknow',
  description: 'Meet the people guiding Aadaab Arz Lucknow.',
};

export default function Page() {
  return <MembersPage />;
}
