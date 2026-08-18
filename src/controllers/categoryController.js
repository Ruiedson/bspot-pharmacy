const db = require('../config/database');

// =====================================================
// LISTAR CATEGORIAS
// =====================================================

async function getCategories(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT
                id,
                name,
                description
            FROM categories
            ORDER BY name
        `);

        res.json(rows);

    } catch (error) {
        console.error('Erro ao buscar categorias:', error);

        res.status(500).json({
            message: 'Erro ao buscar categorias'
        });
    }
}


// =====================================================
// EXPORTAR
// =====================================================

module.exports = {
    getCategories
};