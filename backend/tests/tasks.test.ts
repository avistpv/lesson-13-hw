import db from '../src/config/database.js';
import { Task, TaskAttributes } from '../src/models/task.model.js';
import { User } from '../src/models/user.model.js';
import request from 'supertest';
import app from '../src/app.js';

beforeEach(async () => {
  await db.sync({ force: true });
});

afterAll(async () => {
  await db.close();
});

describe('GET /tasks', () => {
  it('should return 200 and empty array when no tasks exist', async () => {
    const response = await request(app).get('/tasks').expect(200);

    expect(response.body).toHaveLength(0);
  });

  it('should return 200 and list of all tasks with assignees', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    await Task.create({
      title: 'Task 1',
      description: 'Description 1',
      status: 'pending',
      priority: 'high',
      userId: user.id,
    });

    await Task.create({
      title: 'Task 2',
      description: 'Description 2',
      status: 'in-progress',
      priority: 'medium',
      userId: user.id,
    });

    const response = await request(app).get('/tasks').expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('title');
    expect(response.body[0]).toHaveProperty('assignee');
    expect(response.body[0].assignee).toHaveProperty('id');
    expect(response.body[0].assignee).toHaveProperty('name');
  });

  it('should return 200 and filter tasks by status', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    await Task.create({
      title: 'Pending Task',
      status: 'pending',
      priority: 'high',
      userId: user.id,
    });

    await Task.create({
      title: 'Completed Task',
      status: 'completed',
      priority: 'medium',
      userId: user.id,
    });

    const response = await request(app).get('/tasks').query({ status: 'pending' }).expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe('pending');
  });

  it('should return 200 and filter tasks by priority', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    await Task.create({
      title: 'High Priority Task',
      status: 'pending',
      priority: 'high',
      userId: user.id,
    });

    await Task.create({
      title: 'Low Priority Task',
      status: 'pending',
      priority: 'low',
      userId: user.id,
    });

    const response = await request(app).get('/tasks').query({ priority: 'high' }).expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].priority).toBe('high');
  });

  it('should return 200 and filter tasks by createdAt', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const today = new Date();

    const oldTask = await Task.create({
      title: 'Old Task',
      status: 'pending',
      priority: 'medium',
      userId: user.id,
      createdAt: yesterday,
    });

    await Task.create({
      title: 'New Task',
      status: 'pending',
      priority: 'medium',
      userId: user.id,
      createdAt: today,
    });

    const response = await request(app)
      .get('/tasks')
      .query({ createdAt: today.toISOString() })
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    const foundTask = (response.body as TaskAttributes[]).find((t) => t.id === oldTask.id);
    expect(foundTask).toBeUndefined();
  });

  it('should return 200 and filter tasks by multiple criteria', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    await Task.create({
      title: 'Task 1',
      status: 'pending',
      priority: 'high',
      userId: user.id,
    });

    await Task.create({
      title: 'Task 2',
      status: 'pending',
      priority: 'low',
      userId: user.id,
    });

    await Task.create({
      title: 'Task 3',
      status: 'completed',
      priority: 'high',
      userId: user.id,
    });

    const response = await request(app)
      .get('/tasks')
      .query({ status: 'pending', priority: 'high' })
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe('pending');
    expect(response.body[0].priority).toBe('high');
  });

  it('should return 400 when status query parameter is invalid', async () => {
    const response = await request(app)
      .get('/tasks')
      .query({ status: 'invalid-status' })
      .expect(400);

    expect(response.text).toContain('Invalid query parameters');
  });

  it('should return 400 when priority query parameter is invalid', async () => {
    const response = await request(app)
      .get('/tasks')
      .query({ priority: 'invalid-priority' })
      .expect(400);

    expect(response.text).toContain('Invalid query parameters');
  });
});

describe('GET /tasks/:id', () => {
  it('should return 200 and task details with assignee', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const task = await Task.create({
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'high',
      userId: user.id,
    });

    const response = await request(app).get(`/tasks/${task.id}`).expect(200);

    expect(response.body).toHaveProperty('id', task.id);
    expect(response.body).toHaveProperty('title', 'Test Task');
    expect(response.body).toHaveProperty('description', 'Test Description');
    expect(response.body).toHaveProperty('status', 'pending');
    expect(response.body).toHaveProperty('priority', 'high');
    expect(response.body).toHaveProperty('assignee');
    expect(response.body.assignee).toHaveProperty('id', user.id);
    expect(response.body.assignee).toHaveProperty('name', 'Test User');
  });

  it('should return 404 when task does not exist', async () => {
    const response = await request(app).get('/tasks/999').expect(404);

    expect(response.text).toBe('Task not found');
  });

  it('should return 400 when id is not a number', async () => {
    const response = await request(app).get('/tasks/invalid').expect(400);

    expect(response.text).toBe('Task ID must be a number');
  });

  it('should return 200 when accessing /tasks/ (routes to list endpoint)', async () => {
    const response = await request(app).get('/tasks/').expect(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return 404 when id is negative number (treated as valid number)', async () => {
    const response = await request(app).get('/tasks/-1').expect(404);

    expect(response.text).toBe('Task not found');
  });

  it('should return 404 when id is zero (treated as valid number)', async () => {
    const response = await request(app).get('/tasks/0').expect(404);

    expect(response.text).toBe('Task not found');
  });

  it('should return 404 when id is a float (treated as valid number)', async () => {
    const response = await request(app).get('/tasks/1.5').expect(404);

    expect(response.text).toBe('Task not found');
  });
});

describe('POST /tasks', () => {
  it('should return 201 and create a new task', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'New Task',
        description: 'New Description',
        status: 'pending',
        priority: 'high',
        userId: user.id,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title', 'New Task');
    expect(response.body).toHaveProperty('description', 'New Description');
    expect(response.body).toHaveProperty('status', 'pending');
    expect(response.body).toHaveProperty('priority', 'high');
    expect(response.body).toHaveProperty('assignee');
    expect(response.body.assignee).toHaveProperty('id', user.id);

    const taskInDb = await Task.findByPk(response.body.id);
    expect(taskInDb).not.toBeNull();
    expect(taskInDb?.title).toBe('New Task');
  });

  it('should return 201 and create task with default status and priority', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Task with defaults',
        userId: user.id,
      })
      .expect(201);

    expect(response.body).toHaveProperty('status', 'pending');
    expect(response.body).toHaveProperty('priority', 'medium');
  });

  it('should return 400 when title is missing', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const response = await request(app)
      .post('/tasks')
      .send({
        description: 'No title',
        userId: user.id,
      })
      .expect(400);

    expect(response.text).toMatch(/Title is required|Invalid input: expected string/);
  });

  it('should return 400 when userId is missing', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Task without user',
      })
      .expect(400);

    expect(response.text).toMatch(/User ID \(assignee\) is required|Invalid input/);
  });

  it('should return 500 when userId does not exist', async () => {
    const _response = await request(app)
      .post('/tasks')
      .send({
        title: 'Task with invalid user',
        userId: 999,
      })
      .expect(500);
  });

  it('should return 400 when title is empty string', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const response = await request(app)
      .post('/tasks')
      .send({
        title: '',
        userId: user.id,
      })
      .expect(400);

    expect(response.text).toContain('Title is required');
  });

  it('should return 400 when status is invalid enum value', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Valid Title',
        status: 'invalid-status',
        userId: user.id,
      })
      .expect(400);

    expect(response.text).toMatch(/Invalid enum value|Invalid option/);
  });

  it('should return 400 when priority is invalid enum value', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Valid Title',
        priority: 'invalid-priority',
        userId: user.id,
      })
      .expect(400);

    expect(response.text).toMatch(/Invalid enum value|Invalid option/);
  });

  it('should return 400 when title is missing from body', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const response = await request(app)
      .post('/tasks')
      .send({
        description: 'Description without title',
        userId: user.id,
      })
      .expect(400);

    expect(response.text).toMatch(/Title is required|Invalid input: expected string/);
  });

  it('should return 201 and accept all valid status values', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const statuses = ['pending', 'in-progress', 'completed'];

    for (const status of statuses) {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: `Task with status ${status}`,
          status,
          userId: user.id,
        })
        .expect(201);

      expect(response.body.status).toBe(status);
    }
  });

  it('should return 201 and accept all valid priority values', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const priorities = ['low', 'medium', 'high'];

    for (const priority of priorities) {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: `Task with priority ${priority}`,
          priority,
          userId: user.id,
        })
        .expect(201);

      expect(response.body.priority).toBe(priority);
    }
  });
});

describe('PUT /tasks/:id', () => {
  it('should return 200 and update task details', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const task = await Task.create({
      title: 'Original Title',
      description: 'Original Description',
      status: 'pending',
      priority: 'low',
      userId: user.id,
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        title: 'Updated Title',
        description: 'Updated Description',
        status: 'in-progress',
        priority: 'high',
      })
      .expect(200);

    expect(response.body).toHaveProperty('title', 'Updated Title');
    expect(response.body).toHaveProperty('description', 'Updated Description');
    expect(response.body).toHaveProperty('status', 'in-progress');
    expect(response.body).toHaveProperty('priority', 'high');

    const updatedTask = await Task.findByPk(task.id);
    expect(updatedTask?.title).toBe('Updated Title');
    expect(updatedTask?.status).toBe('in-progress');
  });

  it('should return 200 and allow partial updates', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const task = await Task.create({
      title: 'Original Title',
      status: 'pending',
      priority: 'low',
      userId: user.id,
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        status: 'completed',
      })
      .expect(200);

    expect(response.body).toHaveProperty('title', 'Original Title');
    expect(response.body).toHaveProperty('status', 'completed');

    const updatedTask = await Task.findByPk(task.id);
    expect(updatedTask?.status).toBe('completed');
    expect(updatedTask?.title).toBe('Original Title');
  });

  it('should return 200 and update assignee', async () => {
    const user1 = await User.create({
      name: 'User 1',
      email: 'user1@example.com',
    });

    const user2 = await User.create({
      name: 'User 2',
      email: 'user2@example.com',
    });

    const task = await Task.create({
      title: 'Task',
      status: 'pending',
      priority: 'medium',
      userId: user1.id,
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        userId: user2.id,
      })
      .expect(200);

    expect(response.body.assignee).toHaveProperty('id', user2.id);
    expect(response.body.assignee).toHaveProperty('name', 'User 2');

    const updatedTask = await Task.findByPk(task.id);
    expect(updatedTask?.userId).toBe(user2.id);
  });

  it('should return 404 when task does not exist', async () => {
    const response = await request(app)
      .put('/tasks/999')
      .send({
        title: 'Updated Title',
      })
      .expect(404);

    expect(response.text).toBe('Task not found');
  });

  it('should return 400 when id is not a number', async () => {
    const response = await request(app)
      .put('/tasks/invalid')
      .send({
        title: 'Updated Title',
      })
      .expect(400);

    expect(response.text).toBe('Task ID must be a number');
  });

  it('should return 404 when id is negative number (treated as valid number)', async () => {
    const response = await request(app)
      .put('/tasks/-1')
      .send({
        title: 'Updated Title',
      })
      .expect(404);

    expect(response.text).toBe('Task not found');
  });

  it('should return 404 when id is zero (treated as valid number)', async () => {
    const response = await request(app)
      .put('/tasks/0')
      .send({
        title: 'Updated Title',
      })
      .expect(404);

    expect(response.text).toBe('Task not found');
  });

  it('should return 404 when id is a float (treated as valid number)', async () => {
    const response = await request(app)
      .put('/tasks/1.5')
      .send({
        title: 'Updated Title',
      })
      .expect(404);

    expect(response.text).toBe('Task not found');
  });

  it('should return 400 when title is empty string', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const task = await Task.create({
      title: 'Original Title',
      status: 'pending',
      priority: 'medium',
      userId: user.id,
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        title: '',
      })
      .expect(400);

    expect(response.text).toMatch(
      /String must contain at least 1 character|Title is required|Too small: expected string to have/
    );
  });

  it('should return 400 when status is invalid enum value', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const task = await Task.create({
      title: 'Task',
      status: 'pending',
      priority: 'medium',
      userId: user.id,
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        status: 'invalid-status',
      })
      .expect(400);

    expect(response.text).toMatch(/Invalid enum value|Invalid option/);
  });

  it('should return 400 when priority is invalid enum value', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const task = await Task.create({
      title: 'Task',
      status: 'pending',
      priority: 'medium',
      userId: user.id,
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        priority: 'invalid-priority',
      })
      .expect(400);

    expect(response.text).toMatch(/Invalid enum value|Invalid option/);
  });

  it('should return 200 and update only description', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const task = await Task.create({
      title: 'Original Title',
      description: 'Original Description',
      status: 'pending',
      priority: 'medium',
      userId: user.id,
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        description: 'Updated Description',
      })
      .expect(200);

    expect(response.body.title).toBe('Original Title');
    expect(response.body.description).toBe('Updated Description');
    expect(response.body.status).toBe('pending');
  });

  it('should return 200 and update only status', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const task = await Task.create({
      title: 'Task',
      status: 'pending',
      priority: 'medium',
      userId: user.id,
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        status: 'completed',
      })
      .expect(200);

    expect(response.body.status).toBe('completed');
    expect(response.body.title).toBe('Task');
  });

  it('should return 200 and update only priority', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const task = await Task.create({
      title: 'Task',
      status: 'pending',
      priority: 'low',
      userId: user.id,
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({
        priority: 'high',
      })
      .expect(200);

    expect(response.body.priority).toBe('high');
    expect(response.body.status).toBe('pending');
  });

  it('should return 200 with empty body (no updates)', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const task = await Task.create({
      title: 'Task',
      status: 'pending',
      priority: 'medium',
      userId: user.id,
    });

    const response = await request(app).put(`/tasks/${task.id}`).send({}).expect(200);

    expect(response.body.title).toBe('Task');
    expect(response.body.status).toBe('pending');
  });
});

describe('DELETE /tasks/:id', () => {
  it('should return 204 and delete the task', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const task = await Task.create({
      title: 'Task to delete',
      status: 'pending',
      priority: 'medium',
      userId: user.id,
    });

    await request(app).delete(`/tasks/${task.id}`).expect(204);

    const deletedTask = await Task.findByPk(task.id);
    expect(deletedTask).toBeNull();
  });

  it('should return 404 when task does not exist', async () => {
    const response = await request(app).delete('/tasks/999').expect(404);

    expect(response.text).toBe('Task not found');
  });

  it('should return 400 when id is not a number', async () => {
    const response = await request(app).delete('/tasks/invalid').expect(400);

    expect(response.text).toBe('Task ID must be a number');
  });

  it('should return 404 when id is negative number (treated as valid number)', async () => {
    const response = await request(app).delete('/tasks/-1').expect(404);

    expect(response.text).toBe('Task not found');
  });

  it('should return 404 when id is zero (treated as valid number)', async () => {
    const response = await request(app).delete('/tasks/0').expect(404);

    expect(response.text).toBe('Task not found');
  });

  it('should return 404 when id is a float (treated as valid number)', async () => {
    const response = await request(app).delete('/tasks/1.5').expect(404);

    expect(response.text).toBe('Task not found');
  });
});
