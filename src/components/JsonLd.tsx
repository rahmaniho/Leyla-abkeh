import type { JsonLd as JsonLdData } from "../lib/seo";

/** خروجی امن JSON-LD (جلوگیری از بسته شدن تگ script در محتوا) */
function serialize(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function JsonLd({ data }: { data?: JsonLdData[] }) {
  if (!data || data.length === 0) return null;

  return (
    <>
      {data.map((item, index) => (
        <script
          key={`${String(item["@type"])}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialize(item) }}
        />
      ))}
    </>
  );
}
