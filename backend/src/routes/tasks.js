const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { taskCreateSchema, taskUpdateSchema } = require('../validators/taskValidators');

router.use(protect);
router.route('/').get(getTasks).post(validate(taskCreateSchema), createTask);
router.route('/:id').put(validate(taskUpdateSchema), updateTask).delete(deleteTask);

module.exports = router;
