import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBottomNav } from "@/components/public/PublicBottomNav";
import { LatestNewsFlash } from "@/components/public/LatestNewsFlash";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="public-site">
      <PublicHeader />
      <LatestNewsFlash />
      <main>{children}</main>
      <PublicFooter />
      <PublicBottomNav />
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
    </div>
  );
}
