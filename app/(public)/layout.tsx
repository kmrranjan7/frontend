import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="public-site">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
    </div>
  );
}
