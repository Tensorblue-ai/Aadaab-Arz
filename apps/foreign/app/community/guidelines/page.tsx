import { pageMetadata } from '@/lib/seo';
import { GuidelinesPage } from "@/components/ForeignSite";
export const metadata = pageMetadata("Community Guidelines", "Read the guidelines for respectful, responsible contributions to the Lucknow community.", "/community/guidelines");
export default function Page() { return <GuidelinesPage />; }
