import { useEffect, useState } from "react";

export default function PreLoader({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />

          <p className="mt-6 text-sm text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}
