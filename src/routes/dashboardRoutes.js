const express = require('express');

const router = express.Router();


// =====================================================
// CONTROLLER
// =====================================================

const {
    getDashboard,
    getLowStock,
    getExpiringBatches,
    getTopProducts,
    getTodaySales
} = require('../controllers/dashboardController');


// =====================================================
// DASHBOARD GERAL
// =====================================================

router.get(
    '/',
    getDashboard
);


// =====================================================
// STOCK BAIXO
// =====================================================

router.get(
    '/low-stock',
    getLowStock
);


// =====================================================
// LOTES A VENCER
// =====================================================

router.get(
    '/expiring',
    getExpiringBatches
);


// =====================================================
// PRODUTOS MAIS VENDIDOS
// =====================================================

router.get(
    '/top-products',
    getTopProducts
);


// =====================================================
// VENDAS DE HOJE
// =====================================================

router.get(
    '/today-sales',
    getTodaySales
);


// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;