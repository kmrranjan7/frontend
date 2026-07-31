import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="shell footer-grid">
        <div>
          <Logo light />
          <p>Government job and education updates for students across India.</p>
        </div>
        <div className="footer-links">
          <Link href="/jobs" prefetch={false}>Latest Jobs</Link>
          <Link href="/results" prefetch={false}>Results</Link>
          <Link href="/contact" prefetch={false}>Contact</Link>
          <Link href="/about" prefetch={false}>About</Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 Sarkari Global Result</span>
        <span>Independent information service · Verify all details officially</span>
      </div>
    </footer>
  );
}
