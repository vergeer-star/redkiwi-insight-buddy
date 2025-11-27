import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import redkiwiLogo from "@/assets/redkiwi-logo-new.png";
import { User, Session } from "@supabase/supabase-js";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Redirect authenticated users to dashboard
      if (session?.user) {
        setTimeout(() => {
          navigate("/dashboard");
        }, 0);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.endsWith("@redkiwi.nl")) {
      toast({
        title: "Toegang geweigerd",
        description: "Alleen @redkiwi.nl e-mailadressen zijn toegestaan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account aangemaakt",
        description: "Je bent nu ingelogd en wordt doorgestuurd naar het dashboard",
      });
    } catch (error: any) {
      toast({
        title: "Fout bij registreren",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Ingelogd",
        description: "Welkom terug!",
      });
    } catch (error: any) {
      toast({
        title: "Fout bij inloggen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(227,6,19,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(227,6,19,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={redkiwiLogo} alt="RedKiwi" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">{isLogin ? "Inloggen" : "Registreren"}</h1>
          <p className="text-white/70 mt-2">Alleen voor Redkiwi-medewerkers (@redkiwi.nl)</p>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">{isLogin ? "Log in op je account" : "Maak een account aan"}</CardTitle>
            <CardDescription className="text-white/70">
              {isLogin ? "Voer je e-mailadres en wachtwoord in" : "Voer je gegevens in om te registreren"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Volledige naam</label>
                  <Input
                    type="text"
                    placeholder="Jan Jansen"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-white/70">E-mailadres</label>
                <Input
                  type="email"
                  placeholder="naam@redkiwi.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70">Wachtwoord</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white">
                {loading ? (isLogin ? "Inloggen..." : "Registreren...") : isLogin ? "Inloggen" : "Registreren"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {isLogin ? "Nog geen account? Registreer hier" : "Al een account? Log hier in"}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-white/50 hover:text-white/70 transition-colors"
              >
                Terug naar home
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
