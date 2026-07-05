export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-forge-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-forge-accent/10 via-forge-background to-forge-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-forge-accent/5 rounded-full blur-3xl" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
