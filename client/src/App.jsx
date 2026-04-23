import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

const HomePage = lazy(() =>
  import("@/pages/public/HomePage").then((module) => ({ default: module.HomePage })),
);
const ServicesPage = lazy(() =>
  import("@/pages/public/ServicesPage").then((module) => ({ default: module.ServicesPage })),
);
const GalleryPage = lazy(() =>
  import("@/pages/public/GalleryPage").then((module) => ({ default: module.GalleryPage })),
);
const BookingPage = lazy(() =>
  import("@/pages/public/BookingPage").then((module) => ({ default: module.BookingPage })),
);
const PoliciesPage = lazy(() =>
  import("@/pages/public/PoliciesPage").then((module) => ({ default: module.PoliciesPage })),
);
const ContactPage = lazy(() =>
  import("@/pages/public/ContactPage").then((module) => ({ default: module.ContactPage })),
);
const AccountPage = lazy(() =>
  import("@/pages/public/AccountPage").then((module) => ({ default: module.AccountPage })),
);
const AdminLoginPage = lazy(() =>
  import("@/pages/admin/AdminLoginPage").then((module) => ({ default: module.AdminLoginPage })),
);
const AdminDashboardPage = lazy(() =>
  import("@/pages/admin/AdminDashboardPage").then((module) => ({
    default: module.AdminDashboardPage,
  })),
);
const AdminAppointmentsPage = lazy(() =>
  import("@/pages/admin/AdminAppointmentsPage").then((module) => ({
    default: module.AdminAppointmentsPage,
  })),
);
const AdminServicesPage = lazy(() =>
  import("@/pages/admin/AdminServicesPage").then((module) => ({
    default: module.AdminServicesPage,
  })),
);
const AdminGalleryPage = lazy(() =>
  import("@/pages/admin/AdminGalleryPage").then((module) => ({
    default: module.AdminGalleryPage,
  })),
);
const AdminAvailabilityPage = lazy(() =>
  import("@/pages/admin/AdminAvailabilityPage").then((module) => ({
    default: module.AdminAvailabilityPage,
  })),
);
const AdminClientsPage = lazy(() =>
  import("@/pages/admin/AdminClientsPage").then((module) => ({
    default: module.AdminClientsPage,
  })),
);
const AdminSettingsPage = lazy(() =>
  import("@/pages/admin/AdminSettingsPage").then((module) => ({
    default: module.AdminSettingsPage,
  })),
);

function App() {
  return (
    <Suspense
      fallback={
        <div className="page-shell">
          <div className="glass-panel p-10 text-center text-sm text-ink-700/70">
            Loading MAH Booking...
          </div>
        </div>
      }
    >
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="appointments" element={<AdminAppointmentsPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
          <Route path="availability" element={<AdminAvailabilityPage />} />
          <Route path="clients" element={<AdminClientsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
