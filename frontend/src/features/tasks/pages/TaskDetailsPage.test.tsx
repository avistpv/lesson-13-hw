import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { TaskDetailsPage } from "./TaskDetailsPage";
import { tasksApi } from "../api";
import type { Task } from "../types";

vi.mock("../api");

const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

const mockTask: Task = {
  id: 1,
  title: "Test Task",
  description: "Test Description",
  status: "in-progress",
  priority: "high",
  userId: 1,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-02T00:00:00Z",
  assignee: {
    id: 1,
    name: "Test User",
    email: "test@example.com",
  },
};

describe("TaskDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: "1" });
  });

  it("displays task details correctly with all required fields present", async () => {
    vi.mocked(tasksApi.getById).mockResolvedValue(mockTask);

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Task")).toBeInTheDocument();
    });

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("in progress")).toBeInTheDocument();
    expect(screen.getByText("Priority:")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("Assignee:")).toBeInTheDocument();
    expect(
      screen.getByText("Test User (test@example.com)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Created:")).toBeInTheDocument();
    expect(screen.getByText("Updated:")).toBeInTheDocument();
  });

  it("displays task without optional fields", async () => {
    const taskWithoutOptional: Task = {
      id: 2,
      title: "Simple Task",
      status: "pending",
      priority: "medium",
      userId: 1,
    };

    vi.mocked(tasksApi.getById).mockResolvedValue(taskWithoutOptional);

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText("Simple Task")).toBeInTheDocument();
    });

    expect(screen.getByText("Simple Task")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("Priority:")).toBeInTheDocument();
    expect(screen.queryByText("Description")).not.toBeInTheDocument();
  });

  it("displays completed badge for completed tasks", async () => {
    const completedTask: Task = {
      ...mockTask,
      status: "completed",
    };

    vi.mocked(tasksApi.getById).mockResolvedValue(completedTask);

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Task")).toBeInTheDocument();
    });

    const completedBadge = screen
      .getByText("Test Task")
      .parentElement?.querySelector(".completed-badge");
    expect(completedBadge).toBeInTheDocument();
  });

  it("displays loading state initially", () => {
    vi.mocked(tasksApi.getById).mockImplementation(() => new Promise(() => {}));

    renderWithRouter(<TaskDetailsPage />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays error message when error occurs", async () => {
    const errorMessage = "Failed to fetch task";
    vi.mocked(tasksApi.getById).mockRejectedValue(new Error(errorMessage));

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it("displays error when task ID is missing", () => {
    mockUseParams.mockReturnValue({ id: undefined });

    renderWithRouter(<TaskDetailsPage />);

    expect(screen.getByText("Error: Task ID is required")).toBeInTheDocument();
  });

  it("displays not found state when task is null", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(tasksApi.getById).mockResolvedValue(null as any);

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText("Task not found")).toBeInTheDocument();
    });
  });

  it("displays formatted dates correctly", async () => {
    vi.mocked(tasksApi.getById).mockResolvedValue(mockTask);

    renderWithRouter(<TaskDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText("Created:")).toBeInTheDocument();
    });

    const createdDate = screen.getByText("Created:").nextSibling?.textContent;
    expect(createdDate).toBeTruthy();
  });
});
