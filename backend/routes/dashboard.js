const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard
router.get('/', protect, async (req, res) => {
  try {
    // Get user's projects
    const projects = await Project.find({ 'members.user': req.user._id });
    const projectIds = projects.map(p => p._id);

    // All tasks in user's projects
    const allTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name color');

    const now = new Date();

    // Stats
    const totalTasks = allTasks.length;
    const todoTasks = allTasks.filter(t => t.status === 'To Do').length;
    const inProgressTasks = allTasks.filter(t => t.status === 'In Progress').length;
    const doneTasks = allTasks.filter(t => t.status === 'Done').length;
    const overdueTasks = allTasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done'
    ).length;

    // My tasks
    const myTasks = allTasks.filter(t =>
      t.assignedTo && t.assignedTo._id.toString() === req.user._id.toString()
    );

    // Tasks per user (for admin view)
    const tasksByUser = {};
    allTasks.forEach(task => {
      if (task.assignedTo) {
        const userId = task.assignedTo._id.toString();
        if (!tasksByUser[userId]) {
          tasksByUser[userId] = {
            user: task.assignedTo,
            total: 0,
            done: 0,
            inProgress: 0,
            todo: 0
          };
        }
        tasksByUser[userId].total++;
        if (task.status === 'Done') tasksByUser[userId].done++;
        else if (task.status === 'In Progress') tasksByUser[userId].inProgress++;
        else tasksByUser[userId].todo++;
      }
    });

    // Recent tasks
    const recentTasks = allTasks
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    // Overdue task list
    const overdueTaskList = allTasks
      .filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    res.json({
      stats: {
        totalProjects: projects.length,
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks,
        myTasks: myTasks.length
      },
      tasksByUser: Object.values(tasksByUser),
      recentTasks,
      overdueTaskList
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: err.message });
  }
});

module.exports = router;
