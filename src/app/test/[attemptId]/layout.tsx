import { IntegrityWarningHost } from "@/components/IntegrityWarningHost";

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <IntegrityWarningHost />
    </>
  );
}
