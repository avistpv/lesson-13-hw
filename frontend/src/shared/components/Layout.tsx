import { Outlet } from "react-router-dom";
import Header from "./Header";
import "./Layout.css";

const Layout = () => {
  return (
    <>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
