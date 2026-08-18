const db = require('../config/database');

// =====================================================
// LISTAR TODOS OS PRODUTOS
// =====================================================
async function getProducts(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT
                p.id,
                p.code,
                p.name,
                p.active_ingredient,
                p.category_id,
                c.name AS category_name,
                p.unit,
                p.purchase_price,
                p.selling_price,
                p.minimum_stock,
                p.active
            FROM products p
            INNER JOIN categories c
                ON p.category_id = c.id
            ORDER BY p.name
        `);

        res.json(rows);

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);

        res.status(500).json({
            message: 'Erro ao buscar produtos'
        });
    }
}


// =====================================================
// BUSCAR PRODUTO POR ID
// =====================================================
async function getProductById(req, res) {
    try {
        const { id } = req.params;

        const [rows] = await db.query(`
            SELECT
                p.id,
                p.code,
                p.name,
                p.active_ingredient,
                p.category_id,
                c.name AS category_name,
                p.unit,
                p.purchase_price,
                p.selling_price,
                p.minimum_stock,
                p.active
            FROM products p
            INNER JOIN categories c
                ON p.category_id = c.id
            WHERE p.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Produto não encontrado'
            });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('Erro ao buscar produto:', error);

        res.status(500).json({
            message: 'Erro ao buscar produto'
        });
    }
}


// =====================================================
// CRIAR PRODUTO
// =====================================================
async function createProduct(req, res) {
    try {
        const {
            code,
            name,
            active_ingredient,
            category_id,
            unit,
            purchase_price,
            selling_price,
            minimum_stock
        } = req.body;

        // -----------------------------------------------
        // VALIDAÇÕES
        // -----------------------------------------------

        if (
            !code ||
            !name ||
            !active_ingredient ||
            !category_id ||
            !unit
        ) {
            return res.status(400).json({
                message: 'Preencha todos os campos obrigatórios'
            });
        }

        if (
            purchase_price === undefined ||
            selling_price === undefined ||
            minimum_stock === undefined
        ) {
            return res.status(400).json({
                message: 'Preencha os valores de preço e stock mínimo'
            });
        }

        // -----------------------------------------------
        // VERIFICAR CATEGORIA
        // -----------------------------------------------

        const [category] = await db.query(
            'SELECT id FROM categories WHERE id = ?',
            [category_id]
        );

        if (category.length === 0) {
            return res.status(404).json({
                message: 'Categoria não encontrada'
            });
        }

        // -----------------------------------------------
        // VERIFICAR CÓDIGO DUPLICADO
        // -----------------------------------------------

        const [existingProduct] = await db.query(
            'SELECT id FROM products WHERE code = ?',
            [code]
        );

        if (existingProduct.length > 0) {
            return res.status(409).json({
                message: 'Já existe um produto com este código'
            });
        }

        // -----------------------------------------------
        // INSERIR PRODUTO
        // -----------------------------------------------

        const [result] = await db.query(`
            INSERT INTO products (
                code,
                name,
                active_ingredient,
                category_id,
                unit,
                purchase_price,
                selling_price,
                minimum_stock,
                active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        `, [
            code,
            name,
            active_ingredient,
            category_id,
            unit,
            purchase_price,
            selling_price,
            minimum_stock
        ]);

        // -----------------------------------------------
        // RESPOSTA
        // -----------------------------------------------

        res.status(201).json({
            message: 'Produto criado com sucesso',
            product_id: result.insertId
        });

    } catch (error) {
        console.error('Erro ao criar produto:', error);

        res.status(500).json({
            message: 'Erro ao criar produto'
        });
    }
}


// =====================================================
// ATUALIZAR PRODUTO
// =====================================================
async function updateProduct(req, res) {
    try {
        const { id } = req.params;

        const {
            code,
            name,
            active_ingredient,
            category_id,
            unit,
            purchase_price,
            selling_price,
            minimum_stock
        } = req.body;

        // -----------------------------------------------
        // VALIDAR PRODUTO
        // -----------------------------------------------

        const [product] = await db.query(
            'SELECT id FROM products WHERE id = ?',
            [id]
        );

        if (product.length === 0) {
            return res.status(404).json({
                message: 'Produto não encontrado'
            });
        }

        // -----------------------------------------------
        // VALIDAR CATEGORIA
        // -----------------------------------------------

        const [category] = await db.query(
            'SELECT id FROM categories WHERE id = ?',
            [category_id]
        );

        if (category.length === 0) {
            return res.status(404).json({
                message: 'Categoria não encontrada'
            });
        }

        // -----------------------------------------------
        // VERIFICAR CÓDIGO DUPLICADO
        // -----------------------------------------------

        const [existingProduct] = await db.query(`
            SELECT id
            FROM products
            WHERE code = ?
            AND id <> ?
        `, [
            code,
            id
        ]);

        if (existingProduct.length > 0) {
            return res.status(409).json({
                message: 'Já existe outro produto com este código'
            });
        }

        // -----------------------------------------------
        // ATUALIZAR
        // -----------------------------------------------

        await db.query(`
            UPDATE products
            SET
                code = ?,
                name = ?,
                active_ingredient = ?,
                category_id = ?,
                unit = ?,
                purchase_price = ?,
                selling_price = ?,
                minimum_stock = ?
            WHERE id = ?
        `, [
            code,
            name,
            active_ingredient,
            category_id,
            unit,
            purchase_price,
            selling_price,
            minimum_stock,
            id
        ]);

        // -----------------------------------------------
        // RESPOSTA
        // -----------------------------------------------

        res.json({
            message: 'Produto atualizado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar produto:', error);

        res.status(500).json({
            message: 'Erro ao atualizar produto'
        });
    }
}


// =====================================================
// DESATIVAR PRODUTO
// =====================================================
async function deleteProduct(req, res) {
    try {
        const { id } = req.params;

        const [result] = await db.query(`
            UPDATE products
            SET active = 0
            WHERE id = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Produto não encontrado'
            });
        }

        res.json({
            message: 'Produto desativado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao desativar produto:', error);

        res.status(500).json({
            message: 'Erro ao desativar produto'
        });
    }
}


// =====================================================
// EXPORTAR
// =====================================================

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};