import { createBrowserRouter } from "react-router-dom";
import { TaskListPage } from "./features/tasks/pages/TaskListPage";
import { TaskDetailsPage } from "./features/tasks/pages/TaskDetailsPage";
import { CreateTaskPage } from "./features/tasks/pages/CreateTaskPage";
import Layout from "./shared/components/Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <TaskListPage />,
      },
      {
        path: "/tasks",
        element: <TaskListPage />,
      },
      {
        path: "/tasks/create",
        element: <CreateTaskPage />,
      },
      {
        path: "/tasks/:id",
        element: <TaskDetailsPage />,
      },
    ],
  },
]);

export default router;
