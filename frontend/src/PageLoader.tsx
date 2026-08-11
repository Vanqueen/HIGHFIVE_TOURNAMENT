import { Loader2 } from "lucide-react";

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-[color:var(--app-bg)] text-[color:var(--text-primary)]">
    <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#C6963B' }} />
  </div>
);

export default PageLoader;
