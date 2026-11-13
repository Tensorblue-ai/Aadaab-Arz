import { pageMetadata } from '@/lib/seo';
import { ArchivePage } from "@/components/ForeignSite";
export const metadata = pageMetadata("Lucknow Community Archive", "Contribute photographs, oral histories, research and memories of Lucknow and Awadh.", "/community/archive");
export default function Page() { return <ArchivePage />; }
