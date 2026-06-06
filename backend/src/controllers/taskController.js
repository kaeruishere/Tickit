const Task = require('../models/Task');

const pickTaskPayload = (body) => {
  const allowedFields = ['title', 'description', 'completed', 'priority', 'color', 'category', 'dueAt'];
  return allowedFields.reduce((payload, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = body[field];
    }
    return payload;
  }, {});
};

exports.getTasks = async (req, res, next) => {
  try {
    const {
      page: pageQ,
      limit: limitQ,
      q,
      status,
      category,
      sort: sortBy,
    } = req.query;

    const baseMatch = { user: req.user._id };

    if (status === 'active') baseMatch.completed = false;
    if (status === 'completed') baseMatch.completed = true;
    if (category && category !== 'all') baseMatch.category = category;
    if (q) {
      const re = new RegExp(q.trim(), 'i');
      baseMatch.$or = [ { title: re }, { description: re } ];
    }

    // If no pagination requested, preserve previous behavior (return all)
    const page = pageQ ? Math.max(parseInt(pageQ, 10) || 1, 1) : null;
    const limit = limitQ ? Math.max(parseInt(limitQ, 10) || 10, 1) : null;

    // Helper: build sort object for non-aggregation sorts
    const buildSort = () => {
      if (sortBy === 'oldest') return { createdAt: 1 };
      if (sortBy === 'dueAt') return { dueAt: 1, createdAt: -1 };
      // default newest
      return { createdAt: -1 };
    };

    if (!page) {
      const tasks = await Task.find(baseMatch).sort(buildSort());
      return res.json({ success: true, count: tasks.length, tasks });
    }

    const skip = (page - 1) * limit;

    // Use aggregation to support priority sorting and also return categories list
    const priorityRank = {
      $switch: {
        branches: [
          { case: { $eq: ['$priority', 'high'] }, then: 3 },
          { case: { $eq: ['$priority', 'medium'] }, then: 2 },
          { case: { $eq: ['$priority', 'low'] }, then: 1 },
        ],
        default: 0,
      },
    };

    const addFieldsStage = { $addFields: { priorityRank } };

    let sortStage;
    if (sortBy === 'priority') {
      sortStage = { $sort: { priorityRank: -1, createdAt: -1 } };
    } else if (sortBy === 'oldest') {
      sortStage = { $sort: { createdAt: 1 } };
    } else if (sortBy === 'dueAt') {
      sortStage = { $sort: { dueAt: 1, createdAt: -1 } };
    } else {
      sortStage = { $sort: { createdAt: -1 } };
    }

    const facetStage = {
      $facet: {
        metadata: [ { $match: baseMatch }, { $count: 'total' } ],
        data: [ { $match: baseMatch }, sortStage, { $skip: skip }, { $limit: limit } ],
        categories: [
          { $match: baseMatch },
          { $group: { _id: '$category' } },
          { $project: { category: '$_id', _id: 0 } },
          { $match: { category: { $ne: '' } } },
          { $sort: { category: 1 } },
        ],
        globalCounts: [
          { $match: { user: req.user._id } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: { $sum: { $cond: [{ $eq: ['$completed', false] }, 1, 0] } },
              completed: { $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] } },
            },
          },
        ],
      },
    };

    const agg = [ addFieldsStage, facetStage ];
    const result = await Task.aggregate(agg);
    const meta = result[0]?.metadata?.[0];
    const total = (meta && meta.total) ? meta.total : 0;
    const data = result[0]?.data || [];
    const cats = (result[0]?.categories || []).map((c) => c.category).filter(Boolean);
    const globalCounts = result[0]?.globalCounts?.[0] || {};
    const globalTotal = globalCounts.total || 0;
    const globalActive = globalCounts.active || 0;
    const globalCompleted = globalCounts.completed || 0;

    const totalPages = Math.ceil(total / limit) || 1;

    return res.json({
      success: true,
      total,
      page,
      totalPages,
      count: total,
      tasks: data,
      categories: cats,
      globalTotal,
      globalActive,
      globalCompleted,
    });
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...pickTaskPayload(req.body), user: req.user._id });
    res.status(201).json({ success: true, task });
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      pickTaskPayload(req.body),
      { returnDocument: 'after', runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Görev bulunamadı' });
    res.json({ success: true, task });
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Görev bulunamadı' });
    res.json({ success: true, message: 'Görev silindi' });
  } catch (err) { next(err); }
};
