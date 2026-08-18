const db = require('../config/database');


// =====================================================
// LISTAR VENDAS
// =====================================================

async function getSales(req, res) {

    try {

        const [rows] = await db.query(`
            SELECT
                s.id,
                s.sale_number,
                s.customer_name,
                s.total_amount,
                s.payment_method,
                s.status,
                s.created_at,
                s.user_id,
                u.name AS user_name
            FROM sales s
            INNER JOIN users u
                ON s.user_id = u.id
            ORDER BY s.created_at DESC
        `);

        res.json(rows);

    } catch (error) {

        console.error('Erro ao buscar vendas:', error);

        res.status(500).json({
            message: 'Erro ao buscar vendas'
        });

    }

}


// =====================================================
// BUSCAR VENDA POR ID
// =====================================================

async function getSaleById(req, res) {

    try {

        const { id } = req.params;


        // -------------------------------------------------
        // BUSCAR VENDA
        // -------------------------------------------------

        const [sales] = await db.query(`
            SELECT
                s.id,
                s.sale_number,
                s.customer_name,
                s.total_amount,
                s.payment_method,
                s.status,
                s.created_at,
                s.user_id,
                u.name AS user_name
            FROM sales s
            INNER JOIN users u
                ON s.user_id = u.id
            WHERE s.id = ?
        `, [id]);


        if (sales.length === 0) {

            return res.status(404).json({
                message: 'Venda não encontrada'
            });

        }


        // -------------------------------------------------
        // BUSCAR ITENS
        // -------------------------------------------------

        const [items] = await db.query(`
            SELECT
                si.id,
                si.sale_id,
                si.batch_id,
                p.name AS product_name,
                p.code AS product_code,
                b.batch_number,
                b.expiration_date,
                si.quantity,
                si.unit_price,
                si.subtotal
            FROM sale_items si
            INNER JOIN batches b
                ON si.batch_id = b.id
            INNER JOIN products p
                ON b.product_id = p.id
            WHERE si.sale_id = ?
            ORDER BY si.id
        `, [id]);


        res.json({

            sale: sales[0],

            items

        });

    } catch (error) {

        console.error('Erro ao buscar venda:', error);

        res.status(500).json({
            message: 'Erro ao buscar venda'
        });

    }

}


// =====================================================
// CRIAR VENDA - FEFO
// =====================================================

async function createSale(req, res) {

    const connection = await db.getConnection();

    try {

        const {
            customer_name,
            payment_method,
            user_id,
            items
        } = req.body;


        // =================================================
        // VALIDAÇÕES
        // =================================================

        if (!payment_method) {

            return res.status(400).json({
                message: 'payment_method é obrigatório'
            });

        }


        if (!user_id) {

            return res.status(400).json({
                message: 'user_id é obrigatório'
            });

        }


        if (!items || !Array.isArray(items) || items.length === 0) {

            return res.status(400).json({
                message: 'A venda deve possuir pelo menos um item'
            });

        }


        // =================================================
        // INICIAR TRANSAÇÃO
        // =================================================

        await connection.beginTransaction();


        // =================================================
        // VALIDAR UTILIZADOR
        // =================================================

        const [users] = await connection.query(`
            SELECT
                id
            FROM users
            WHERE id = ?
            AND active = 1
        `, [user_id]);


        if (users.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                message: 'Utilizador não encontrado ou inativo'
            });

        }


        // =================================================
        // GERAR NÚMERO DA VENDA
        // =================================================

        const saleNumber =
            'SALE-' + Date.now();


        // =================================================
        // TOTAL DA VENDA
        // =================================================

        let totalAmount = 0;

        const processedItems = [];


        // =================================================
        // PROCESSAR PRODUTOS
        // =================================================

        for (const item of items) {

            const {
                product_id,
                quantity
            } = item;


            // -------------------------------------------------
            // VALIDAR PRODUTO E QUANTIDADE
            // -------------------------------------------------

            if (!product_id || !quantity || quantity <= 0) {

                await connection.rollback();

                return res.status(400).json({
                    message: 'product_id e quantity são obrigatórios'
                });

            }


            // =================================================
            // BUSCAR LOTES POR FEFO
            // =================================================

            const [batches] = await connection.query(`
                SELECT
                    b.id AS batch_id,
                    b.batch_number,
                    b.expiration_date,
                    b.quantity AS available_quantity,
                    p.id AS product_id,
                    p.name AS product_name,
                    p.code AS product_code,
                    p.selling_price
                FROM batches b
                INNER JOIN products p
                    ON b.product_id = p.id
                WHERE b.product_id = ?
                AND b.quantity > 0
                AND b.expiration_date >= CURDATE()
                AND p.active = 1
                ORDER BY b.expiration_date ASC
                FOR UPDATE
            `, [product_id]);


            // -------------------------------------------------
            // PRODUTO / LOTES NÃO ENCONTRADOS
            // -------------------------------------------------

            if (batches.length === 0) {

                await connection.rollback();

                return res.status(404).json({

                    message:
                        `Nenhum lote disponível para ${product_id}`

                });

            }


            // =================================================
            // VERIFICAR STOCK TOTAL
            // =================================================

            const totalStock = batches.reduce(
                (total, batch) =>
                    total + Number(batch.available_quantity),
                0
            );


            if (totalStock < quantity) {

                await connection.rollback();

                return res.status(400).json({

                    message:
                        `Stock insuficiente para ${batches[0].product_name}`,

                    available_stock: totalStock,

                    requested_quantity: quantity

                });

            }


            // =================================================
            // QUANTIDADE QUE AINDA PRECISA SER VENDIDA
            // =================================================

            let remainingQuantity = Number(quantity);


            // =================================================
            // PROCESSAR LOTES EM ORDEM FEFO
            // =================================================

            for (const batch of batches) {

                if (remainingQuantity <= 0) {
                    break;
                }


                const available =
                    Number(batch.available_quantity);


                const quantityFromBatch =
                    Math.min(
                        remainingQuantity,
                        available
                    );


                // -------------------------------------------------
                // PREÇO
                // -------------------------------------------------

                const unitPrice =
                    Number(batch.selling_price);


                const subtotal =
                    unitPrice * quantityFromBatch;


                totalAmount += subtotal;


                // -------------------------------------------------
                // ATUALIZAR STOCK DO LOTE
                // -------------------------------------------------

                await connection.query(`
                    UPDATE batches
                    SET quantity = quantity - ?
                    WHERE id = ?
                `, [
                    quantityFromBatch,
                    batch.batch_id
                ]);


                // -------------------------------------------------
                // REGISTRAR MOVIMENTO OUT
                // -------------------------------------------------

                await connection.query(`
                    INSERT INTO stock_movements (
                        batch_id,
                        movement_type,
                        quantity,
                        reference,
                        notes,
                        user_id
                    )
                    VALUES (?, 'OUT', ?, ?, ?, ?)
                `, [
                    batch.batch_id,
                    quantityFromBatch,
                    saleNumber,
                    `Saída por venda - FEFO - ${batch.batch_number}`,
                    user_id
                ]);


                // -------------------------------------------------
                // GUARDAR ITEM
                // -------------------------------------------------

                processedItems.push({

                    batch_id:
                        batch.batch_id,

                    quantity:
                        quantityFromBatch,

                    unit_price:
                        unitPrice,

                    subtotal:
                        subtotal

                });


                // -------------------------------------------------
                // REDUZIR QUANTIDADE PENDENTE
                // -------------------------------------------------

                remainingQuantity -=
                    quantityFromBatch;

            }


            // =================================================
            // SEGURANÇA
            // =================================================

            if (remainingQuantity > 0) {

                await connection.rollback();

                return res.status(400).json({

                    message:
                        'Não foi possível completar a quantidade solicitada'

                });

            }

        }


        // =================================================
        // CRIAR VENDA
        // =================================================

        const [saleResult] = await connection.query(`
            INSERT INTO sales (
                sale_number,
                customer_name,
                total_amount,
                payment_method,
                status,
                user_id
            )
            VALUES (?, ?, ?, ?, 'COMPLETED', ?)
        `, [
            saleNumber,
            customer_name || null,
            totalAmount,
            payment_method,
            user_id
        ]);


        const saleId =
            saleResult.insertId;


        // =================================================
        // INSERIR ITENS DA VENDA
        // =================================================

        for (const item of processedItems) {

            await connection.query(`
                INSERT INTO sale_items (
                    sale_id,
                    batch_id,
                    quantity,
                    unit_price,
                    subtotal
                )
                VALUES (?, ?, ?, ?, ?)
            `, [
                saleId,
                item.batch_id,
                item.quantity,
                item.unit_price,
                item.subtotal
            ]);

        }


        // =================================================
        // CONFIRMAR TRANSAÇÃO
        // =================================================

        await connection.commit();


        // =================================================
        // RESPOSTA
        // =================================================

        res.status(201).json({

            message:
                'Venda criada com sucesso',

            sale_id:
                saleId,

            sale_number:
                saleNumber,

            total_amount:
                totalAmount,

            items:
                processedItems

        });


    } catch (error) {

        await connection.rollback();

        console.error(
            'Erro ao criar venda:',
            error
        );

        res.status(500).json({
            message: 'Erro ao criar venda'
        });

    } finally {

        connection.release();

    }

}


// =====================================================
// EXPORTAR
// =====================================================

module.exports = {

    getSales,

    getSaleById,

    createSale

};