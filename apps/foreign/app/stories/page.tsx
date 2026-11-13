import { pageMetadata } from '@/lib/seo';
import { StoriesPage } from "@/components/ForeignSite";
export const metadata = pageMetadata("Stories of Lucknow", "Explore Lucknow\u2019s architecture, music, manners and craft through stories of Awadh.", "/stories");
export default function Page() { return <StoriesPage />; }
