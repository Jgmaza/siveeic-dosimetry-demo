import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { Shell } from "./layout/Shell";
import { Ledger } from "./pages/Ledger";
import { Login } from "./pages/Login";
import { Overview } from "./pages/Overview";
import { Pipeline } from "./pages/Pipeline";
import { Reports } from "./pages/Reports";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading demo…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Protected>
              <Shell />
            </Protected>
          }
        >
          <Route index element={<Overview />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
