const express = require('express');

const router = express.Router();


// =====================================================
// CONTROLLER
// =====================================================

const {
    getBatches,
    getBatchById,
    createBatch,
    getBatchesByProduct
} = require('../controllers/batchController');


// =====================================================
// LISTAR TODOS OS LOTES
// =====================================================

router.get(
    '/',
    getBatches
);


// =====================================================
// BUSCAR LOTES DE UM PRODUTO
// FEFO
// =====================================================

router.get(
    '/product/:product_id',
    getBatchesByProduct
);


// =====================================================
// BUSCAR LOTE POR ID
// =====================================================

router.get(
    '/:id',
    getBatchById
);


// =====================================================
// CRIAR LOTE
// =====================================================

router.post(
    '/',
    createBatch
);


// =====================================================
// EXPORTAR ROUTER
// =====================================================

module.exports = router;