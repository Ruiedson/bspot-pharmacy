const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });

        const text = await response.text();

        let data;

        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = {
                message: text
            };
        }

        if (!response.ok) {
            throw new Error(
                data.message || `Erro HTTP ${response.status}`
            );
        }

        return data;

    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}


// =====================================================
// DASHBOARD
// =====================================================

export async function getDashboard() {
    return request("/dashboard");
}


// =====================================================
// PRODUTOS
// =====================================================

export async function getProducts() {
    return request("/products");
}

export async function getProduct(id) {
    return request(`/products/${id}`);
}

export async function createProduct(product) {
    return request("/products", {
        method: "POST",
        body: JSON.stringify(product)
    });
}

export async function updateProduct(id, product) {
    return request(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(product)
    });
}

export async function deleteProduct(id) {
    return request(`/products/${id}`, {
        method: "DELETE"
    });
}


// =====================================================
// CATEGORIAS
// =====================================================

export async function getCategories() {
    return request("/categories");
}


// =====================================================
// LOTES
// =====================================================

export async function getBatches() {
    return request("/batches");
}

export async function getBatch(id) {
    return request(`/batches/${id}`);
}

export async function getBatchesByProduct(productId) {
    return request(`/batches/product/${productId}`);
}

export async function createBatch(batch) {
    return request("/batches", {
        method: "POST",
        body: JSON.stringify(batch)
    });
}


// =====================================================
// STOCK
// =====================================================

export async function getStock() {
    return request("/stock");
}

export async function stockIn(data) {
    return request("/stock/in", {
        method: "POST",
        body: JSON.stringify(data)
    });
}

export async function stockOut(data) {
    return request("/stock/out", {
        method: "POST",
        body: JSON.stringify(data)
    });
}


// =====================================================
// VENDAS
// =====================================================

export async function getSales() {
    return request("/sales");
}

export async function getSale(id) {
    return request(`/sales/${id}`);
}

export async function createSale(sale) {
    return request("/sales", {
        method: "POST",
        body: JSON.stringify(sale)
    });
}