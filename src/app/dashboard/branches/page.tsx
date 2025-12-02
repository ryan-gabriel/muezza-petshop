import BranchForm from "@/components/form/BranchForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Branch } from "@/type/branch";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import DeleteResourceButton from "@/components/resource/DeleteResourceButton";

async function getBranches(): Promise<Branch[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/branches`);

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export default async function Page() {
  const branches = await getBranches();

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
        <BranchForm />
      </div>

      {branches.length === 0 && (
        <p className="text-muted-foreground">Belum ada cabang.</p>
      )}

      {branches.length > 0 && (
        <Tabs defaultValue={branches[0].id.toString()} className="w-full">
          {/* -------- TAB LIST (Sticky) ---------- */}
          <div className="sticky top-0 bg-background z-10 shadow-sm py-2 mb-4">
            <TabsList className="overflow-x-auto w-full flex gap-1">
              {branches.map((b) => (
                <TabsTrigger
                  key={b.id}
                  value={b.id.toString()}
                  className="whitespace-nowrap"
                >
                  {b.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* -------- TAB CONTENT -------- */}
          {branches.map((b) => (
            <TabsContent key={b.id} value={b.id.toString()}>
              <div className="max-w-4xl space-y-6">
                {/* IMAGE CARD */}
                <div className="rounded-xl overflow-hidden border shadow-md">
                  <div className="relative aspect-video">
                    <Image
                      src={b.image_url}
                      alt={b.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* INFO */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">{b.name}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {b.description}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {b.google_map_url && (
                    <Button variant="outline" asChild className="gap-2">
                      <a
                        href={b.google_map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in Google Maps
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}

                  <BranchForm branch={b} />
                  <DeleteResourceButton
                    id={b.id}
                    apiUrl="/api/branches"
                    title="Delete Branch"
                    message="This branch will be permanently deleted."
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
