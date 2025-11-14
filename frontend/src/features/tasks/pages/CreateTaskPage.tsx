import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tasksApi } from "../api";
import type { CreateTaskInput } from "../types";
import { CreateTaskForm } from "../components/CreateTaskForm";
import { BackButton } from "../../../shared/components/BackButton";
import "./CreateTaskPage.css";

export const CreateTaskPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateTaskInput) => {
    try {
      setIsLoading(true);
      setError(null);
      await tasksApi.create(data);
      navigate("/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
      setIsLoading(false);
    }
  };

  return (
    <div className="create-task-page">
      <BackButton />

      {error && <div className="error-message-container">{error}</div>}

      <CreateTaskForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};
