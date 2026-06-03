const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const Lead = require('../models/Lead');

// Validation middleware
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const leadValidation = [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().trim().withMessage('Phone is required'),
  body('company').notEmpty().trim().withMessage('Company is required'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Converted', 'Lost'])
    .withMessage('Invalid status'),
];

// GET /api/leads — Get all leads with search, filter, sort, pagination
router.get('/', async (req, res) => {
  try {
    const {
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
      source,
    } = req.query;

    const query = {};

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by source
    if (source && source !== 'All') {
      query.source = source;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [leads, total] = await Promise.all([
      Lead.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Lead.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/leads/stats — Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [statusCounts, sourceCounts, recentLeads, totalValue] = await Promise.all([
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
      Lead.find().sort({ createdAt: -1 }).limit(5).select('name company status createdAt'),
      Lead.aggregate([
        { $match: { status: 'Converted' } },
        { $group: { _id: null, total: { $sum: '$value' } } },
      ]),
    ]);

    const statusMap = { New: 0, Contacted: 0, Qualified: 0, Converted: 0, Lost: 0 };
    statusCounts.forEach((s) => {
      if (s._id) statusMap[s._id] = s.count;
    });

    const total = await Lead.countDocuments();
    const thisMonth = await Lead.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    });

    res.json({
      success: true,
      data: {
        total,
        thisMonth,
        byStatus: statusMap,
        bySource: sourceCounts,
        recentLeads,
        totalConvertedValue: totalValue[0]?.total || 0,
        conversionRate:
          total > 0 ? ((statusMap.Converted / total) * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/leads/:id — Get single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/leads — Create lead
router.post('/', leadValidation, handleValidation, async (req, res) => {
  try {
    const existing = await Lead.findOne({ email: req.body.email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A lead with this email already exists' });
    }
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json({ success: true, data: lead, message: 'Lead created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/leads/:id — Update lead
router.put('/:id', leadValidation, handleValidation, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, data: lead, message: 'Lead updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/leads/:id/status — Update status only
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['New', 'Contacted', 'Qualified', 'Converted', 'Lost'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, data: lead, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/leads/:id — Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/leads — Bulk delete
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No IDs provided' });
    }
    const result = await Lead.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: `${result.deletedCount} leads deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
