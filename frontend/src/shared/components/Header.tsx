import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <header className="app-header">
      <h1>Task Manager</h1>
      <nav className="nav-links">
        <Link to="/tasks" className="nav-link">
          Tasks
        </Link>
        <Link to="/tasks/create" className="nav-link">
          Create Task
        </Link>
      </nav>
    </header>
  );
};

export default Header;
