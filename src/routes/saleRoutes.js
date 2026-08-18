const express = require('express');

const router = express.Router();

const {
    getSales,
    getSaleById,
    createSale
} = require('../controllers/saleController');


// =====================================================
// LISTAR VENDAS
// =====================================================

router.get('/', getSales);


// =====================================================
// BUSCAR VENDA POR ID
// =====================================================

router.get('/:id', getSaleById);


// =====================================================
// CRIAR VENDA
// =====================================================

router.post('/', createSale);


module.exports = router;