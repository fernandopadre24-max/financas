
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Icons } from "@/components/icons";
import { AlertCircle } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();
  const bgImage = PlaceHolderImages.find(p => p.id === 'login-background');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // O Firebase exige uma senha com pelo menos 6 caracteres.
      if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres.");
      }

      // Construindo um e-mail a partir do nome de usuário.
      // Isso é necessário porque o Firebase Auth requer um e-mail.
      const email = `${name.toLowerCase().replace(/\s/g, '_')}@exemplo.com`;
      await signup(email, password);
      router.push("/");
    } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/email-already-in-use') {
            setError("Este nome de usuário já está em uso. Por favor, escolha outro.");
        } else if (err.message) {
            setError(err.message);
        } else {
            setError("Ocorreu um erro desconhecido ao criar a conta.");
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Icons.logo className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-headline">Finance Flow</h1>
            </div>
            <p className="text-balance text-muted-foreground">
              Crie uma conta para começar a gerenciar suas finanças
            </p>
          </div>
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="seu nome"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {bgImage && (
             <Image
                src={bgImage.imageUrl}
                alt={bgImage.description}
                data-ai-hint={bgImage.imageHint}
                width="1920"
                height="1080"
                className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                priority
            />
        )}
      </div>
    </div>
  );
}
