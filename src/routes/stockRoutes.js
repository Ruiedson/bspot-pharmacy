const express = require('express');

const router = express.Router();

const {
    getStockMovements,
    stockIn,
    stockOut
} = require('../controllers/stockController');


// LISTAR MOVIMENTOS
router.get('/', getStockMovements);


// ENTRADA DE STOCK
router.post('/in', stockIn);


// SAÍDA DE STOCK
router.post('/out', stockOut);


module.exports = router;