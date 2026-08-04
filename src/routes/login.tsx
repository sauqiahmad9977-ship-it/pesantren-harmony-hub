import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Masuk — SIM Pondok Pesantren" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const { data: settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Berhasil masuk");
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      toast.error(err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const message = await signUp(email, password, fullName);
      toast.success(message);
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      toast.error(err.message || "Pendaftaran gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-forest)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6 text-primary-foreground">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="w-16 h-16 rounded-2xl mx-auto mb-4 object-cover bg-white/20 p-1" />
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
          )}
          <h1 className="text-3xl font-bold font-display">{settings?.app_name || "SIM Pondok Pesantren"}</h1>
          <p className="text-sm opacity-80 mt-1">Sistem informasi manajemen terpadu</p>
        </div>
        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="font-display">Selamat Datang</CardTitle>
            <CardDescription>Masuk atau buat akun baru</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">Masuk</TabsTrigger>
                <TabsTrigger value="signup">Daftar</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@pesantren.id" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Kata Sandi</Label>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Masuk
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email2">Email</Label>
                    <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password2">Kata Sandi</Label>
                    <Input id="password2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Daftar
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Pengguna pertama otomatis menjadi <b>admin</b>.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              <Link to="/" className="hover:underline">← Kembali</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
