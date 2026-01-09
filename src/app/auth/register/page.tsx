'use client';

/**
 * Page d'Inscription
 * 
 * Utilise une Server Action personnalisée pour contourner
 * le problème de proxy /api/* sur la plateforme Emergent
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { registerAction } from '@/actions/auth';

// Schéma de validation Zod
const registerSchema = z
  .object({
    name: z.string().min(2, 'Nom trop court (min. 2 caractères)'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Mot de passe trop court (min. 8 caractères)'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form avec react-hook-form + Zod
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Submit handler utilisant Server Action
  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      // Utiliser notre Server Action personnalisée
      const result = await registerAction(values.name, values.email, values.password);

      if (!result.success) {
        setError(result.error || "Erreur d'inscription");
        toast.error(result.error || "Échec de l'inscription");
        return;
      }

      // Succès : rediriger
      toast.success('Compte créé avec succès !');
      router.push('/sessions');
      router.refresh();
    } catch (error) {
      console.error('Register error:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
      toast.error("Erreur d'inscription");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🎵 Tribeat</h1>
            <p className="text-gray-600 dark:text-gray-400">Créer un compte</p>
          </div>

          {/* Erreur globale */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Formulaire */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Nom */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        disabled={isLoading}
                        data-testid="register-name-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="vous@exemple.com"
                        disabled={isLoading}
                        data-testid="register-email-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        data-testid="register-password-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        data-testid="register-confirm-password-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="register-submit-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </form>
          </Form>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Vous avez déjà un compte ?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Retour accueil */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
