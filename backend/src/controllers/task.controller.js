import crypto from "crypto";
import pool from "../config/db.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const getTasks = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const { project_id, status, filter } = req.query;

  let query = `
    SELECT 
      t.id, t.title, t.description, t.status, t.priority, t.due_date, t.created_at,
      p.id AS project_id, p.name AS project_name,
      m.id AS milestone_id, m.title AS milestone_title,
      u.id AS assignee_id, u.name AS assignee_name, u.email AS assignee_email
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN milestones m ON t.milestone_id = m.id
    LEFT JOIN users u ON t.assignee_id = u.id
    WHERE t.agency_id = ?
  `;

  const params = [agencyId];

  if (project_id) {
    query += " AND t.project_id = ?";
    params.push(project_id);
  }

  if (status) {
    query += " AND t.status = ?";
    params.push(status);
  }

  if (filter === "overdue") {
    query += " AND t.due_date < CURDATE() AND t.status != 'completed'";
  } else if (filter === "due_this_week") {
    query += " AND t.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)";
  } else if (filter === "my_tasks") {
    query += " AND t.assignee_id = ?";
    params.push(req.user.userId);
  }

  query += " ORDER BY t.due_date ASC, t.created_at DESC";

  const [tasks] = await pool.query(query, params);

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks retrieved successfully."));
});


export const createTask = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const {
    project_id,
    milestone_id,
    assignee_id,
    title,
    description,
    priority,
    due_date,
  } = req.body;

  if (!project_id || !title) {
    throw new ApiError(400, "Project ID and task title are required.");
  }


  const [project] = await pool.query(
    "SELECT id FROM projects WHERE id = ? AND agency_id = ?",
    [project_id, agencyId]
  );

  if (project.length === 0) {
    throw new ApiError(400, "Specified project does not belong to your agency.");
  }

  const taskId = "task-" + crypto.randomUUID().slice(0, 8);

  await pool.query(
    `INSERT INTO tasks 
      (id, agency_id, project_id, milestone_id, assignee_id, title, description, status, priority, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'todo', ?, ?)`,
    [
      taskId,
      agencyId,
      project_id,
      milestone_id || null,
      assignee_id || null,
      title.trim(),
      description || null,
      priority || "medium",
      due_date || null,
    ]
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        id: taskId,
        project_id,
        title,
        status: "todo",
        priority: priority || "medium",
        due_date,
      },
      "Task created successfully."
    )
  );
});


export const updateTaskStatus = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["todo", "in_progress", "in_review", "completed"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const [existing] = await pool.query(
    "SELECT id, project_id FROM tasks WHERE id = ? AND agency_id = ?",
    [id, agencyId]
  );

  if (existing.length === 0) {
    throw new ApiError(404, "Task not found or unauthorized.");
  }

  await pool.query(
    "UPDATE tasks SET status = ? WHERE id = ? AND agency_id = ?",
    [status, id, agencyId]
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { id, status, projectId: existing[0].project_id },
      "Task status updated successfully."
    )
  );
});

export const createMilestone = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const { project_id, title, description, order_index, due_date } = req.body;

  if (!project_id || !title) {
    throw new ApiError(400, "Project ID and milestone title are required.");
  }

  const milestoneId = "ms-" + crypto.randomUUID().slice(0, 8);

  await pool.query(
    `INSERT INTO milestones 
      (id, agency_id, project_id, title, description, order_index, status, due_date)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      milestoneId,
      agencyId,
      project_id,
      title.trim(),
      description || null,
      order_index || 0,
      due_date || null,
    ]
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      { id: milestoneId, project_id, title, status: "pending" },
      "Milestone created successfully."
    )
  );
});
