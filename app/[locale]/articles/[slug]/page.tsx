import { collectionEntry } from "@/components/content/CollectionPages";

// Axons' articles = the default Markdown collection (components/content/CollectionPages.tsx).
const page = collectionEntry("articles");

export const generateMetadata = page.generateMetadata;
export default page.Page;
