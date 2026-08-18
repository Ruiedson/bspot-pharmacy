const db = require('../config/database');


// =====================================================
// DASHBOARD GERAL
// =====================================================

async function getDashboard(req, res) {

    try {

        // =================================================
        // TOTAL DE PRODUTOS
        // =================================================

        const [products] = await db.query(`
            SELECT COUNT(*) AS total
            FROM products
            WHERE active = 1
        `);


        // =================================================
        // STOCK TOTAL
        // =================================================

        const [stock] = await db.query(`
            SELECT
                COALESCE(SUM(quantity), 0) AS total
            FROM batches
            WHERE quantity > 0
        `);


        // =================================================
        // PRODUTOS COM STOCK BAIXO
        // =================================================

        const [lowStock] = await db.query(`
            SELECT COUNT(*) AS total
            FROM (
                SELECT
                    p.id,
                    p.minimum_stock,
                    COALESCE(SUM(b.quantity), 0) AS current_stock
                FROM products p
                LEFT JOIN batches b
                    ON p.id = b.product_id
                WHERE p.active = 1
                GROUP BY
                    p.id,
                    p.minimum_stock
                HAVING current_stock <= p.minimum_stock
            ) AS low_stock_products
        `);


        // =================================================
        // LOTES A VENCER NOS PRÓXIMOS 30 DIAS
        // =================================================

        const [expiring] = await db.query(`
            SELECT COUNT(*) AS total
            FROM batches
            WHERE quantity > 0
            AND expiration_date >= CURDATE()
            AND expiration_date <= DATE_ADD(
                CURDATE(),
                INTERVAL 30 DAY
            )
        `);


        // =================================================
        // VENDAS DE HOJE
        // =================================================

        const [salesToday] = await db.query(`
            SELECT COUNT(*) AS total
            FROM sales
            WHERE status = 'COMPLETED'
            AND DATE(created_at) = CURDATE()
        `);


        // =================================================
        // RECEITA DE HOJE
        // =================================================

        const [revenueToday] = await db.query(`
            SELECT
                COALESCE(SUM(total_amount), 0) AS total
            FROM sales
            WHERE status = 'COMPLETED'
            AND DATE(created_at) = CURDATE()
        `);


        // =================================================
        // RESPOSTA
        // =================================================

        res.json({

            products:
                Number(products[0].total),

            total_stock:
                Number(stock[0].total),

            low_stock:
                Number(lowStock[0].total),

            expiring_soon:
                Number(expiring[0].total),

            sales_today:
                Number(salesToday[0].total),

            revenue_today:
                Number(revenueToday[0].total)

        });


    } catch (error) {

        console.error(
            'Erro ao buscar dashboard:',
            error
        );

        res.status(500).json({
            message: 'Erro ao buscar dashboard'
        });

    }

}


// =====================================================
// PRODUTOS COM STOCK BAIXO
// =====================================================

async function getLowStock(req, res) {

    try {

        const [rows] = await db.query(`
            SELECT
                p.id,
                p.code,
                p.name,
                p.minimum_stock,
                COALESCE(SUM(b.quantity), 0) AS current_stock,
                (
                    p.minimum_stock -
                    COALESCE(SUM(b.quantity), 0)
                ) AS shortage
            FROM products p
            LEFT JOIN batches b
                ON p.id = b.product_id
            WHERE p.active = 1
            GROUP BY
                p.id,
                p.code,
                p.name,
                p.minimum_stock
            HAVING current_stock <= p.minimum_stock
            ORDER BY current_stock ASC
        `);


        res.json(rows);


    } catch (error) {

        console.error(
            'Erro ao buscar stock baixo:',
            error
        );

        res.status(500).json({
            message: 'Erro ao buscar stock baixo'
        });

    }

}


// =====================================================
// LOTES PRÓXIMOS DO VENCIMENTO
// =====================================================

async function getExpiringBatches(req, res) {

    try {

        const [rows] = await db.query(`
            SELECT
                b.id,
                b.batch_number,
                b.expiration_date,
                b.quantity,
                p.id AS product_id,
                p.code AS product_code,
                p.name AS product_name
            FROM batches b
            INNER JOIN products p
                ON b.product_id = p.id
            WHERE b.quantity > 0
            AND b.expiration_date >= CURDATE()
            AND b.expiration_date <= DATE_ADD(
                CURDATE(),
                INTERVAL 30 DAY
            )
            ORDER BY b.expiration_date ASC
        `);


        res.json(rows);


    } catch (error) {

        console.error(
            'Erro ao buscar lotes próximos do vencimento:',
            error
        );

        res.status(500).json({
            message: 'Erro ao buscar lotes próximos do vencimento'
        });

    }

}


// =====================================================
// PRODUTOS MAIS VENDIDOS
// =====================================================

async function getTopProducts(req, res) {

    try {

        const [rows] = await db.query(`
            SELECT
                p.id,
                p.code,
                p.name,
                SUM(si.quantity) AS quantity_sold,
                SUM(si.subtotal) AS total_revenue
            FROM sale_items si
            INNER JOIN sales s
                ON si.sale_id = s.id
            INNER JOIN batches b
                ON si.batch_id = b.id
            INNER JOIN products p
                ON b.product_id = p.id
            WHERE s.status = 'COMPLETED'
            GROUP BY
                p.id,
                p.code,
                p.name
            ORDER BY quantity_sold DESC
            LIMIT 10
        `);


        res.json(rows);


    } catch (error) {

        console.error(
            'Erro ao buscar produtos mais vendidos:',
            error
        );

        res.status(500).json({
            message: 'Erro ao buscar produtos mais vendidos'
        });

    }

}


// =====================================================
// VENDAS DE HOJE
// =====================================================

async function getTodaySales(req, res) {

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
                u.name AS user_name
            FROM sales s
            INNER JOIN users u
                ON s.user_id = u.id
            WHERE s.status = 'COMPLETED'
            AND DATE(s.created_at) = CURDATE()
            ORDER BY s.created_at DESC
        `);


        res.json(rows);


    } catch (error) {

        console.error(
            'Erro ao buscar vendas de hoje:',
            error
        );

        res.status(500).json({
            message: 'Erro ao buscar vendas de hoje'
        });

    }

}


// =====================================================
// EXPORTAR
// =====================================================

module.exports = {

    getDashboard,

    getLowStock,

    getExpiringBatches,

    getTopProducts,

    getTodaySales

};