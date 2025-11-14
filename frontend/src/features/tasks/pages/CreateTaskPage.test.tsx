import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { CreateTaskPage } from "./CreateTaskPage";
import { tasksApi } from "../api";

vi.mock("../api");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("CreateTaskPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays the create task form", () => {
    renderWithRouter(<CreateTaskPage />);

    expect(screen.getByText("Create New Task")).toBeInTheDocument();
    expect(screen.getByLabelText(/task name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/user id/i)).toBeInTheDocument();
  });

  it("displays error message when task creation fails", async () => {
    const errorMessage = "Failed to create task";
    vi.mocked(tasksApi.create).mockRejectedValue(new Error(errorMessage));

    renderWithRouter(<CreateTaskPage />);

    const user = userEvent.setup();
    const titleInput = screen.getByLabelText(/task name/i);
    const userIdInput = screen.getByLabelText(/user id/i);

    await user.type(titleInput, "New Task");
    await user.clear(userIdInput);
    await user.type(userIdInput, "1");

    const submitButton = screen.getByRole("button", { name: /create task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("navigates to tasks list after successful task creation", async () => {
    const mockTask = {
      id: 1,
      title: "New Task",
      description: "Description",
      status: "pending" as const,
      priority: "medium" as const,
      userId: 1,
    };

    vi.mocked(tasksApi.create).mockResolvedValue(mockTask);

    renderWithRouter(<CreateTaskPage />);

    const user = userEvent.setup();
    const titleInput = screen.getByLabelText(/task name/i);
    const userIdInput = screen.getByLabelText(/user id/i);

    await user.type(titleInput, "New Task");
    await user.clear(userIdInput);
    await user.type(userIdInput, "1");

    const submitButton = screen.getByRole("button", { name: /create task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/tasks");
    });
  });

  it("displays loading state during task creation", async () => {
    vi.mocked(tasksApi.create).mockImplementation(() => new Promise(() => {}));

    renderWithRouter(<CreateTaskPage />);

    const user = userEvent.setup();
    const titleInput = screen.getByLabelText(/task name/i);
    const userIdInput = screen.getByLabelText(/user id/i);

    await user.type(titleInput, "New Task");
    await user.clear(userIdInput);
    await user.type(userIdInput, "1");

    const submitButton = screen.getByRole("button", { name: /create task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Creating...")).toBeInTheDocument();
    });
  });

  it("hides error message when task creation succeeds", async () => {
    const mockTask = {
      id: 1,
      title: "New Task",
      status: "pending" as const,
      priority: "medium" as const,
      userId: 1,
    };

    vi.mocked(tasksApi.create).mockRejectedValueOnce(new Error("Failed"));
    renderWithRouter(<CreateTaskPage />);

    const user = userEvent.setup();
    const titleInput = screen.getByLabelText(/task name/i);
    const userIdInput = screen.getByLabelText(/user id/i);

    await user.type(titleInput, "New Task");
    await user.clear(userIdInput);
    await user.type(userIdInput, "1");

    const submitButton = screen.getByRole("button", { name: /create task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });

    vi.mocked(tasksApi.create).mockResolvedValueOnce(mockTask);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText("Failed")).not.toBeInTheDocument();
    });
  });

  it("renders back button", () => {
    renderWithRouter(<CreateTaskPage />);

    const backButton = screen.getByRole("button", { name: /back to tasks/i });
    expect(backButton).toBeInTheDocument();
  });
});
