const express = require('express');

const {
    getCategories
} = require('../controllers/categoryController');

const router = express.Router();


// =====================================================
// GET /api/categories
// =====================================================

router.get('/', getCategories);


module.exports = router;