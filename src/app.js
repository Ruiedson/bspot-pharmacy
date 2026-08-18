// =====================================================
// BSPOT PHARMACY API
// =====================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


// =====================================================
// CONFIGURAÇÃO
// =====================================================

dotenv.config();

const app = express();


// =====================================================
// MIDDLEWARES
// =====================================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// =====================================================
// ROTAS
// =====================================================

const productRoutes = require('./routes/productRoutes');

const categoryRoutes = require('./routes/categoryRoutes');

const batchRoutes = require('./routes/batchRoutes');

const stockRoutes = require('./routes/stockRoutes');

const saleRoutes = require('./routes/saleRoutes');

const dashboardRoutes = require('./routes/dashboardRoutes');


// =====================================================
// ENDPOINT PRINCIPAL
// =====================================================

app.get('/', (req, res) => {

    res.json({
        message: 'Bspot Pharmacy API',
        status: 'online',
        version: '1.0.0'
    });

});


// =====================================================
// TESTE DA API
// =====================================================

app.get('/api', (req, res) => {

    res.json({
        message: 'Bspot Pharmacy API funcionando'
    });

});


// =====================================================
// ROTAS DA APLICAÇÃO
// =====================================================

app.use(
    '/api/products',
    productRoutes
);


app.use(
    '/api/categories',
    categoryRoutes
);


app.use(
    '/api/batches',
    batchRoutes
);


app.use(
    '/api/stock',
    stockRoutes
);


app.use(
    '/api/sales',
    saleRoutes
);


app.use(
    '/api/dashboard',
    dashboardRoutes
);


// =====================================================
// ROTA 404
// =====================================================

app.use((req, res) => {

    res.status(404).json({

        message: 'Endpoint não encontrado',

        path: req.originalUrl

    });

});


// =====================================================
// TRATAMENTO GLOBAL DE ERROS
// =====================================================

app.use((error, req, res, next) => {

    console.error(
        'Erro interno:',
        error
    );

    res.status(500).json({

        message: 'Erro interno do servidor'

    });

});


// =====================================================
// PORTA
// =====================================================

const PORT =
    process.env.PORT || 3000;


// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {

    console.log(
        `Bspot Pharmacy API rodando na porta ${PORT}`
    );

});