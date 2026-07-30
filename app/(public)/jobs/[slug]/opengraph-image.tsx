import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getJobBySlug } from "@/data/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function JobOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const job = await getJobBySlug((await params).slug);
  if (!job) notFound();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 70, background: "#fffaf1", color: "#241c1c", borderTop: "24px solid #7c1d1d" }}>
        <div style={{ color: "#7c1d1d", fontSize: 28, fontWeight: 700 }}>Sarkari Global Result</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ maxWidth: 1050, fontSize: 60, lineHeight: 1.1, fontWeight: 800 }}>{job.title}</div>
          <div style={{ marginTop: 28, fontSize: 27, color: "#675858" }}>{job.organization} · {job.vacancies.toLocaleString("en-IN")} vacancies</div>
        </div>
        <div style={{ fontSize: 23, color: "#7c1d1d" }}>sarkariglobalresult.com</div>
      </div>
    ),
    size,
  );
}
