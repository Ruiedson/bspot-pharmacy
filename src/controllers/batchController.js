const db = require('../config/database');


// =====================================================
// LISTAR TODOS OS LOTES
// =====================================================

async function getBatches(req, res) {

    try {

        const [rows] = await db.query(`
            SELECT
                b.id,
                b.product_id,
                p.code AS product_code,
                p.name AS product_name,
                b.batch_number,
                b.expiration_date,
                b.quantity,
                b.created_at,
                b.updated_at
            FROM batches b
            INNER JOIN products p
                ON b.product_id = p.id
            ORDER BY b.expiration_date ASC
        `);

        res.json(rows);

    } catch (error) {

        console.error(
            'Erro ao buscar lotes:',
            error
        );

        res.status(500).json({
            message: 'Erro ao buscar lotes'
        });

    }

}


// =====================================================
// BUSCAR LOTE POR ID
// =====================================================

async function getBatchById(req, res) {

    try {

        const { id } = req.params;

        const [rows] = await db.query(`
            SELECT
                b.id,
                b.product_id,
                p.code AS product_code,
                p.name AS product_name,
                b.batch_number,
                b.expiration_date,
                b.quantity,
                b.created_at,
                b.updated_at
            FROM batches b
            INNER JOIN products p
                ON b.product_id = p.id
            WHERE b.id = ?
        `, [id]);


        if (rows.length === 0) {

            return res.status(404).json({
                message: 'Lote não encontrado'
            });

        }


        res.json(rows[0]);

    } catch (error) {

        console.error(
            'Erro ao buscar lote:',
            error
        );

        res.status(500).json({
            message: 'Erro ao buscar lote'
        });

    }

}


// =====================================================
// CRIAR LOTE
// =====================================================

async function createBatch(req, res) {

    try {

        const {
            product_id,
            batch_number,
            expiration_date,
            quantity
        } = req.body;


        // -----------------------------------------------
        // VALIDAÇÕES
        // -----------------------------------------------

        if (!product_id) {

            return res.status(400).json({
                message: 'product_id é obrigatório'
            });

        }


        if (!batch_number) {

            return res.status(400).json({
                message: 'batch_number é obrigatório'
            });

        }


        if (!expiration_date) {

            return res.status(400).json({
                message: 'expiration_date é obrigatória'
            });

        }


        if (quantity === undefined || quantity < 0) {

            return res.status(400).json({
                message: 'quantity deve ser maior ou igual a zero'
            });

        }


        // -----------------------------------------------
        // VERIFICAR PRODUTO
        // -----------------------------------------------

        const [products] = await db.query(`
            SELECT id
            FROM products
            WHERE id = ?
            AND active = 1
        `, [product_id]);


        if (products.length === 0) {

            return res.status(404).json({
                message: 'Produto não encontrado ou inativo'
            });

        }


        // -----------------------------------------------
        // INSERIR LOTE
        // -----------------------------------------------

        const [result] = await db.query(`
            INSERT INTO batches (
                product_id,
                batch_number,
                expiration_date,
                quantity
            )
            VALUES (?, ?, ?, ?)
        `, [
            product_id,
            batch_number,
            expiration_date,
            quantity
        ]);


        res.status(201).json({

            message: 'Lote criado com sucesso',

            batch_id: result.insertId

        });

    } catch (error) {

        console.error(
            'Erro ao criar lote:',
            error
        );

        res.status(500).json({
            message: 'Erro ao criar lote'
        });

    }

}


// =====================================================
// BUSCAR LOTES DE UM PRODUTO
// FEFO - FIRST EXPIRED, FIRST OUT
// =====================================================

async function getBatchesByProduct(req, res) {

    try {

        const { product_id } = req.params;


        const [rows] = await db.query(`
            SELECT
                b.id,
                b.product_id,
                p.code AS product_code,
                p.name AS product_name,
                b.batch_number,
                b.expiration_date,
                b.quantity
            FROM batches b
            INNER JOIN products p
                ON b.product_id = p.id
            WHERE b.product_id = ?
              AND b.quantity > 0
              AND b.expiration_date >= CURDATE()
            ORDER BY b.expiration_date ASC
        `, [product_id]);


        res.json(rows);

    } catch (error) {

        console.error(
            'Erro ao buscar lotes do produto:',
            error
        );

        res.status(500).json({
            message: 'Erro ao buscar lotes do produto'
        });

    }

}


// =====================================================
// EXPORTAR FUNÇÕES
// =====================================================

module.exports = {

    getBatches,

    getBatchById,

    createBatch,

    getBatchesByProduct

};