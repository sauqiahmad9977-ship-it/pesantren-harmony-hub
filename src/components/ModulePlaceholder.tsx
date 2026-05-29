import { PageHeader } from "./PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export function ModulePlaceholder({
  title, description, icon, features,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features?: string[];
}) {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader title={title} description={description} icon={icon} />
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/40 flex items-center justify-center mx-auto mb-4">
            <Construction className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-lg">Modul sedang disiapkan</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
            Halaman ini akan segera berisi fitur lengkap. Berikut rencana fitur yang akan tersedia:
          </p>
          {features && (
            <ul className="mt-5 inline-flex flex-col items-start gap-1.5 text-sm text-foreground/80">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {f}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
