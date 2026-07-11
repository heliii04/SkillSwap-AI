import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="container-fluid">

      <div className="row">

        <div className="col-lg-3">

          <Sidebar />

        </div>

        <div className="col-lg-9 py-4">

          <Outlet />

        </div>

      </div>

    </div>
  );
}