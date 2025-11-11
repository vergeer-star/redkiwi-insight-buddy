import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import redkiwiLogo from "@/assets/redkiwi-logo-new.png";
import { Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Check if user is Redkiwi employee
        checkRedkiwiEmployee(session.user.id);
      }
    });
  }, []);

  const checkRedkiwiEmployee = async (userId: string) => {
    const { data, error } = await supabase
      .rpc('is_redkiwi_employee', { _user_id: userId });
    
    if (data === true) {
      navigate('/dashboard');
    } else {
      toast({
        title: "Geen toegang",
        description: "Deze omgeving is alleen toegankelijk voor Redkiwi-medewerkers",
        variant: "destructive"
      });
      await supabase.auth.signOut();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Check if user is Redkiwi employee
          await checkRedkiwiEmployee(data.user.id);
        }
      } else {
        // Signup - check email domain first
        if (!email.endsWith('@redkiwi.nl')) {
          toast({
            title: "Registratie geweigerd",
            description: "Alleen @redkiwi.nl e-mailadressen kunnen zich registreren",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "Account aangemaakt",
            description: "Je bent nu ingelogd en wordt doorgestuurd naar het dashboard",
          });
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(237,28,36,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(237,28,36,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      <div className="relative z-10 w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <img 
            src={redkiwiLogo} 
            alt="RedKiwi Logo" 
            className="h-16 mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-white mb-2">
            Dashboard <span className="text-[#FF2B2B]">Toegang</span>
          </h1>
          <p className="text-white/70">
            Alleen voor Redkiwi-medewerkers
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-8 bg-white/[0.03] backdrop-blur-sm border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm text-white/70 font-medium">
                  Volledige naam
                </label>
                <Input
                  type="text"
                  placeholder="Jan Jansen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#FF2B2B] focus:ring-[#FF2B2B]"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-white/70 font-medium">
                E-mailadres
              </label>
              <Input
                type="email"
                placeholder="naam@redkiwi.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#FF2B2B] focus:ring-[#FF2B2B]"
              />
              {!isLogin && (
                <p className="text-xs text-white/50">
                  Alleen @redkiwi.nl e-mailadressen worden geaccepteerd
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70 font-medium">
                Wachtwoord
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#FF2B2B] focus:ring-[#FF2B2B] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-white/50">
                  Minimaal 6 karakters
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF2B2B] hover:bg-[#FF2B2B]/90 text-white font-bold py-6 rounded-xl shadow-[0_0_40px_rgba(237,28,36,0.4)] hover:shadow-[0_0_60px_rgba(237,28,36,0.6)] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? 'Inloggen...' : 'Registreren...'}
                </span>
              ) : (
                isLogin ? 'Inloggen' : 'Registreren'
              )}
            </Button>
          </form>

          {/* Toggle between login/signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail("");
                setPassword("");
                setFullName("");
              }}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {isLogin ? (
                <>
                  Nog geen account? <span className="text-[#FF2B2B] font-medium">Registreer hier</span>
                </>
              ) : (
                <>
                  Al een account? <span className="text-[#FF2B2B] font-medium">Login hier</span>
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Back button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            ← Terug naar start
          </button>
        </div>
      </div>
    </div>
  );
}
