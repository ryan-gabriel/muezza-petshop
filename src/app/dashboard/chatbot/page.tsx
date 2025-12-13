"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { showAlert } from "@/lib/alert";

export default function ChatbotConfigPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load Prompt Saat Ini
  useEffect(() => {
    async function fetchPrompt() {
      try {
        const res = await fetch("/api/chatbot-config");
        const data = await res.json();
        if (data?.prompt_text) {
          setPrompt(data.prompt_text);
        }
      } catch (error) {
        console.error("Gagal memuat prompt", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPrompt();
  }, []);

  // Simpan Prompt
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/chatbot-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt_text: prompt }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");

      showAlert("Prompt chatbot berhasil diperbarui!", "success");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      showAlert("Gagal menyimpan prompt.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
             Konfigurasi Chatbot AI
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Edit instruksi sistem (prompt) untuk mengatur pengetahuan dan gaya bicara AI.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[500px] font-mono text-sm leading-relaxed p-4"
            placeholder="Masukkan prompt sistem di sini..."
          />
          
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="w-32">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Simpan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}