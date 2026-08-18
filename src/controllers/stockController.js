const db = require('../config/database');


// =====================================================
// LISTAR MOVIMENTOS DE STOCK
// =====================================================

async function getStockMovements(req, res) {

    try {

        const [rows] = await db.query(`
            SELECT
                sm.id,
                sm.batch_id,
                p.name AS product_name,
                b.batch_number,
                sm.movement_type,
                sm.quantity,
                sm.reference,
                sm.notes,
                sm.user_id,
                u.name AS user_name,
                sm.created_at
            FROM stock_movements sm

            INNER JOIN batches b
                ON sm.batch_id = b.id

            INNER JOIN products p
                ON b.product_id = p.id

            INNER JOIN users u
                ON sm.user_id = u.id

            ORDER BY sm.created_at DESC
        `);

        res.json(rows);

    } catch (error) {

        console.error(
            'Erro ao buscar movimentos:',
            error
        );

        res.status(500).json({
            message: 'Erro ao buscar movimentos de stock'
        });

    }
}


// =====================================================
// REGISTRAR ENTRADA DE STOCK
// =====================================================

async function stockIn(req, res) {

    const connection = await db.getConnection();

    try {

        const {
            batch_id,
            quantity,
            reference,
            notes,
            user_id
        } = req.body;


        // -------------------------------------------------
        // VALIDAÇÃO
        // -------------------------------------------------

        if (!batch_id || !quantity || !user_id) {

            return res.status(400).json({
                message: 'batch_id, quantity e user_id são obrigatórios'
            });

        }

        if (quantity <= 0) {

            return res.status(400).json({
                message: 'A quantidade deve ser maior que zero'
            });

        }


        // -------------------------------------------------
        // INICIAR TRANSAÇÃO
        // -------------------------------------------------

        await connection.beginTransaction();


        // -------------------------------------------------
        // VERIFICAR LOTE
        // -------------------------------------------------

        const [batches] = await connection.query(
            `
            SELECT id, quantity
            FROM batches
            WHERE id = ?
            FOR UPDATE
            `,
            [batch_id]
        );


        if (batches.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                message: 'Lote não encontrado'
            });

        }


        // -------------------------------------------------
        // ATUALIZAR STOCK
        // -------------------------------------------------

        await connection.query(
            `
            UPDATE batches
            SET quantity = quantity + ?
            WHERE id = ?
            `,
            [
                quantity,
                batch_id
            ]
        );


        // -------------------------------------------------
        // REGISTRAR MOVIMENTO
        // -------------------------------------------------

        await connection.query(
            `
            INSERT INTO stock_movements (
                batch_id,
                movement_type,
                quantity,
                reference,
                notes,
                user_id
            )
            VALUES (?, 'IN', ?, ?, ?, ?)
            `,
            [
                batch_id,
                quantity,
                reference || null,
                notes || null,
                user_id
            ]
        );


        // -------------------------------------------------
        // CONFIRMAR
        // -------------------------------------------------

        await connection.commit();


        res.status(201).json({

            message: 'Entrada de stock registrada com sucesso',

            batch_id,

            quantity_added: quantity

        });


    } catch (error) {

        await connection.rollback();

        console.error(
            'Erro ao registrar entrada:',
            error
        );

        res.status(500).json({
            message: 'Erro ao registrar entrada de stock'
        });

    } finally {

        connection.release();

    }
}


// =====================================================
// REGISTRAR SAÍDA DE STOCK
// =====================================================

async function stockOut(req, res) {

    const connection = await db.getConnection();

    try {

        const {
            batch_id,
            quantity,
            reference,
            notes,
            user_id
        } = req.body;


        // -------------------------------------------------
        // VALIDAÇÃO
        // -------------------------------------------------

        if (!batch_id || !quantity || !user_id) {

            return res.status(400).json({
                message: 'batch_id, quantity e user_id são obrigatórios'
            });

        }

        if (quantity <= 0) {

            return res.status(400).json({
                message: 'A quantidade deve ser maior que zero'
            });

        }


        // -------------------------------------------------
        // INICIAR TRANSAÇÃO
        // -------------------------------------------------

        await connection.beginTransaction();


        // -------------------------------------------------
        // BUSCAR LOTE
        // -------------------------------------------------

        const [batches] = await connection.query(
            `
            SELECT id, quantity
            FROM batches
            WHERE id = ?
            FOR UPDATE
            `,
            [batch_id]
        );


        if (batches.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                message: 'Lote não encontrado'
            });

        }


        const currentStock = batches[0].quantity;


        // -------------------------------------------------
        // VERIFICAR STOCK DISPONÍVEL
        // -------------------------------------------------

        if (currentStock < quantity) {

            await connection.rollback();

            return res.status(400).json({

                message: 'Stock insuficiente',

                available_stock: currentStock,

                requested_quantity: quantity

            });

        }


        // -------------------------------------------------
        // ATUALIZAR STOCK
        // -------------------------------------------------

        await connection.query(
            `
            UPDATE batches
            SET quantity = quantity - ?
            WHERE id = ?
            `,
            [
                quantity,
                batch_id
            ]
        );


        // -------------------------------------------------
        // REGISTRAR MOVIMENTO
        // -------------------------------------------------

        await connection.query(
            `
            INSERT INTO stock_movements (
                batch_id,
                movement_type,
                quantity,
                reference,
                notes,
                user_id
            )
            VALUES (?, 'OUT', ?, ?, ?, ?)
            `,
            [
                batch_id,
                quantity,
                reference || null,
                notes || null,
                user_id
            ]
        );


        // -------------------------------------------------
        // CONFIRMAR
        // -------------------------------------------------

        await connection.commit();


        res.status(201).json({

            message: 'Saída de stock registrada com sucesso',

            batch_id,

            quantity_removed: quantity

        });


    } catch (error) {

        await connection.rollback();

        console.error(
            'Erro ao registrar saída:',
            error
        );

        res.status(500).json({
            message: 'Erro ao registrar saída de stock'
        });

    } finally {

        connection.release();

    }
}


// =====================================================
// EXPORTAR
// =====================================================

module.exports = {

    getStockMovements,
    stockIn,
    stockOut

};