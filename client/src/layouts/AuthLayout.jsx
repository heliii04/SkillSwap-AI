import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="container py-5">
      <Outlet />
    </div>
  );
}