import { ImageManagerPanel } from "@/components/dashboard/ImageManagerPanel";

export default function ImagesPage() {
  return (
    <>
      <header className="dashboard-header">
        <div><span>ADMIN PORTAL / MEDIA</span><h1>Image Manager</h1></div>
      </header>
      <div className="dashboard-content"><ImageManagerPanel /></div>
    </>
  );
}
