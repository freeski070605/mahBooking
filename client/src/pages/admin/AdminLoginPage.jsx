import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LockKeyhole, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export function AdminLoginPage() {
  const { isAuthenticated, isAdmin, login } = useAuth();
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (values) => login(values),
    onSuccess: (user) => {
      if (user.role !== "admin") {
        toast.error("This sign-in is for the business owner dashboard.");
        navigate("/account");
        return;
      }

      toast.success("Welcome back");
      navigate("/admin");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to sign in."));
    },
  });

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-hero-glow">
      <div className="container grid min-h-screen gap-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-ink-900 text-white">
          <CardContent className="flex h-full flex-col justify-between gap-10 p-8">
            <div className="space-y-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
                  MAH Booking admin
                </p>
                <h1 className="font-display text-6xl leading-none">
                  A calm beauty-business control center.
                </h1>
                <p className="text-base leading-8 text-white/75">
                  The dashboard is designed to feel clear, gentle, and obvious so
                  the business owner always knows what to click next.
                </p>
              </div>
            </div>
            <div className="rounded-[1.8rem] bg-white/10 p-5 text-sm leading-7 text-white/75">
              Use the admin email and password you set during setup or bootstrap.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex h-full items-center justify-center p-8">
            <div className="w-full max-w-md space-y-6">
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-100 text-surface-600">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <h2 className="font-display text-5xl text-ink-900">Owner login</h2>
                <p className="text-sm leading-7 text-ink-700/70">
                  Sign in to manage appointments, services, images, and availability.
                </p>
              </div>

              <form
                className="space-y-5"
                onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}
              >
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input id="admin-email" type="email" {...form.register("email")} />
                  {form.formState.errors.email ? (
                    <p className="text-sm text-rose-600">
                      {form.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password ? (
                    <p className="text-sm text-rose-600">
                      {form.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>
                <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Signing in..." : "Open dashboard"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
