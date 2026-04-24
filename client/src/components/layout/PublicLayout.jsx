import { Menu, Sparkles } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { publicNavigation } from "@/data/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function PublicLayout() {
  const { isAuthenticated, user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-hero-glow text-ink-900">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-[#fff9f4]/85 backdrop-blur-xl">
        <div className="container flex h-20 items-center justify-between gap-6">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-500 text-white shadow-soft">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-2xl leading-none">MAH Booking</div>
              <div className="text-xs uppercase tracking-[0.3em] text-ink-700/55">
                Healthy hair studio
              </div>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-7 lg:flex">
            {publicNavigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium text-ink-700/75 transition hover:text-ink-900",
                    isActive && "text-ink-900",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button variant="ghost" asChild>
              <NavLink to="/account">
                {isAuthenticated
                  ? user?.name?.split(" ")[0] || "My account"
                  : "Client account"}
              </NavLink>
            </Button>
            {isAdmin ? (
              <Button variant="secondary" asChild>
                <NavLink to="/admin">Admin</NavLink>
              </Button>
            ) : null}
            <Button asChild>
              <NavLink to="/booking">Book now</NavLink>
            </Button>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[min(92vw,420px)]">
              <DialogTitle className="font-display text-3xl">Explore the studio</DialogTitle>
              <div className="mt-6 flex flex-col gap-3">
                {publicNavigation.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className="rounded-2xl border border-surface-100 bg-white px-4 py-4 text-base font-semibold text-ink-900"
                  >
                    {item.label}
                  </NavLink>
                ))}
                <NavLink
                  to="/account"
                  className="rounded-2xl border border-surface-100 bg-white px-4 py-4 text-base font-semibold text-ink-900"
                >
                  Account
                </NavLink>
                {isAdmin ? (
                  <NavLink
                    to="/admin"
                    className="rounded-2xl border border-surface-100 bg-white px-4 py-4 text-base font-semibold text-ink-900"
                  >
                    Admin dashboard
                  </NavLink>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-surface-200/70 bg-[#fff8f2]">
        <div className="container grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <p className="font-display text-3xl text-ink-900">MAH Booking</p>
            <p className="max-w-md text-sm leading-7 text-ink-700/75">
              Healthy hair care, polished styling, and a booking experience that
              feels warm from the first click.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-surface-600">
              Explore
            </p>
            {publicNavigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className="block text-sm text-ink-700/75 transition hover:text-ink-900"
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-surface-600">
              Contact
            </p>
            <p className="text-sm text-ink-700/75">hello@mahbooking.com</p>
            <p className="text-sm text-ink-700/75">(555) 274-5612</p>
            <p className="text-sm text-ink-700/75">Atlanta, GA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
