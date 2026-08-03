import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  type BreadcrumbItem,
} from "@/lib/seo/json-ld";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          {items.map((item, index) => {
            const current = index === items.length - 1;
            return (
              <li key={`${item.path}-${index}`}>
                {index > 0 && <span className="breadcrumb-separator" aria-hidden="true">›</span>}
                {current ? (
                  <span aria-current="page">{item.name}</span>
                ) : (
                  <Link href={item.path}>{item.name}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
