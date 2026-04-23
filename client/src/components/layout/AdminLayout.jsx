import { LogOut, Menu, Sparkles } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { adminNavigation } from "@/data/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function NavItems() {
  return adminNavigation.map((item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.href}
        to={item.href}
        end={item.href === "/admin"}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-ink-700/70 transition hover:bg-white/75 hover:text-ink-900",
            isActive && "bg-white text-ink-900 shadow-soft",
          )
        }
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </NavLink>
    );
  });
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success("Signed out");
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-mesh-warm">
      <div className="container py-4 md:py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-panel backdrop-blur lg:block">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-500 text-white shadow-soft">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-2xl text-ink-900">MAH Booking</div>
                <div className="text-xs uppercase tracking-[0.24em] text-ink-700/55">
                  Calm control center
                </div>
              </div>
            </div>

            <div className="mb-8 rounded-[1.75rem] bg-surface-50 p-4">
              <p className="text-sm font-semibold text-ink-900">
                Welcome back, {user?.name?.split(" ")[0] || "Owner"}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-700/70">
                Keep things simple: start with appointments, then update services
                and images whenever you need.
              </p>
            </div>

            <nav className="space-y-2">
              <NavItems />
            </nav>

            <Button variant="secondary" className="mt-8 w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </aside>

          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-[2rem] border border-white/80 bg-white/80 px-5 py-4 shadow-soft backdrop-blur lg:hidden">
              <div>
                <p className="font-display text-2xl text-ink-900">MAH Booking</p>
                <p className="text-sm text-ink-700/65">Beauty business dashboard</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[min(92vw,420px)]">
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-display text-3xl text-ink-900">Admin menu</h2>
                      <p className="text-sm text-ink-700/70">
                        Everything important is right here.
                      </p>
                    </div>
                    <nav className="space-y-2">
                      <NavItems />
                    </nav>
                    <Button variant="secondary" className="w-full" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
