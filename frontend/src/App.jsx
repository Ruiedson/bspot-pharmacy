import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [batches, setBatches] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [sales, setSales] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockModal, setStockModal] = useState(null);
  const [saleModal, setSaleModal] = useState(false);

  const [form, setForm] = useState({
    code: "",
    name: "",
    active_ingredient: "",
    category_id: "",
    unit: "Caixa",
    purchase_price: "",
    selling_price: "",
    minimum_stock: "",
  });

  const [batchForm, setBatchForm] = useState({
    product_id: "",
    batch_number: "",
    expiration_date: "",
    quantity: "",
  });

  const [stockForm, setStockForm] = useState({
    batch_id: "",
    quantity: "",
    reference: "",
    notes: "",
    user_id: 1,
  });

  const [saleForm, setSaleForm] = useState({
    customer_name: "",
    payment_method: "CASH",
    product_id: "",
    quantity: "",
    user_id: 3,
  });

  useEffect(() => {
    loadDashboard();
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    if (activePage === "Stock") {
      loadBatches();
      loadStockMovements();
      loadDashboard();
    }

    if (activePage === "Vendas") {
      loadSales();
      loadProducts();
      loadBatches();
      loadDashboard();
    }

    if (activePage === "Alertas") {
      loadProducts();
      loadBatches();
      loadDashboard();
    }
  }, [activePage]);

  async function loadDashboard() {
    try {
      const response = await fetch(`${API_URL}/api/dashboard`);

      if (!response.ok) {
        throw new Error("Erro ao carregar dashboard");
      }

      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      console.error("Dashboard:", err);
    }
  }

  async function loadProducts() {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/products`);

      if (!response.ok) {
        throw new Error("Erro ao carregar produtos");
      }

      const data = await response.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Produtos:", err);
      setError("Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const response = await fetch(`${API_URL}/api/categories`);

      if (!response.ok) {
        throw new Error("Erro ao carregar categorias");
      }

      const data = await response.json();

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Categorias:", err);
    }
  }

  async function loadBatches() {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/batches`);

      if (!response.ok) {
        throw new Error("Erro ao carregar lotes");
      }

      const data = await response.json();

      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lotes:", err);
      setError("Não foi possível carregar os lotes.");
    } finally {
      setLoading(false);
    }
  }

  async function loadStockMovements() {
    try {
      const response = await fetch(`${API_URL}/api/stock`);

      if (!response.ok) {
        throw new Error("Erro ao carregar movimentos");
      }

      const data = await response.json();

      setStockMovements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Stock:", err);
    }
  }

  async function loadSales() {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/sales`);

      if (!response.ok) {
        throw new Error("Erro ao carregar vendas");
      }

      const data = await response.json();

      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Vendas:", err);
      setError("Não foi possível carregar as vendas.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openCreateForm() {
    setEditingProduct(null);

    setForm({
      code: "",
      name: "",
      active_ingredient: "",
      category_id: "",
      unit: "Caixa",
      purchase_price: "",
      selling_price: "",
      minimum_stock: "",
    });

    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingProduct(product);

    setForm({
      code: product.code || "",
      name: product.name || "",
      active_ingredient: product.active_ingredient || "",
      category_id: product.category_id || "",
      unit: product.unit || "Caixa",
      purchase_price: product.purchase_price || "",
      selling_price: product.selling_price || "",
      minimum_stock: product.minimum_stock || "",
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingProduct(null);
  }

  async function saveProduct(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!form.category_id) {
        throw new Error("Selecione uma categoria.");
      }

      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        active_ingredient: form.active_ingredient.trim(),
        category_id: Number(form.category_id),
        unit: form.unit,
        purchase_price: Number(form.purchase_price),
        selling_price: Number(form.selling_price),
        minimum_stock: Number(form.minimum_stock),
      };

      const url = editingProduct
        ? `${API_URL}/api/products/${editingProduct.id}`
        : `${API_URL}/api/products`;

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erro ao guardar produto"
        );
      }

      alert(data.message);

      closeForm();

      await loadProducts();
      await loadDashboard();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deactivateProduct(id) {
    const confirmed = window.confirm(
      "Tem certeza que deseja desativar este produto?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/products/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erro ao desativar produto"
        );
      }

      alert(data.message);

      await loadProducts();
      await loadDashboard();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // STOCK
  // =====================================================

  function openStockModal(type) {
    setError("");

    setStockForm({
      batch_id: "",
      quantity: "",
      reference: "",
      notes: "",
      user_id: 1,
    });

    setStockModal(type);
  }

  function closeStockModal() {
    setStockModal(null);
  }

  function handleStockChange(event) {
    const { name, value } = event.target;

    setStockForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleBatchChange(event) {
    const { name, value } = event.target;

    setBatchForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openBatchModal() {
    setBatchForm({
      product_id: "",
      batch_number: "",
      expiration_date: "",
      quantity: "",
    });

    setStockModal("batch");
    setError("");
  }

  async function saveBatch(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!batchForm.product_id) {
        throw new Error("Selecione um produto.");
      }

      if (!batchForm.batch_number.trim()) {
        throw new Error("Informe o número do lote.");
      }

      if (!batchForm.expiration_date) {
        throw new Error("Informe a validade.");
      }

      const quantity = Number(batchForm.quantity);

      if (quantity < 0) {
        throw new Error(
          "A quantidade não pode ser negativa."
        );
      }

      const response = await fetch(`${API_URL}/api/batches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: Number(batchForm.product_id),
          batch_number: batchForm.batch_number.trim(),
          expiration_date: batchForm.expiration_date,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erro ao criar lote"
        );
      }

      alert(data.message);

      closeStockModal();

      await loadBatches();
      await loadDashboard();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveStockMovement(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!stockForm.batch_id) {
        throw new Error("Selecione um lote.");
      }

      const quantity = Number(stockForm.quantity);

      if (!quantity || quantity <= 0) {
        throw new Error(
          "A quantidade deve ser maior que zero."
        );
      }

      const endpoint =
        stockModal === "in"
          ? `${API_URL}/api/stock/in`
          : `${API_URL}/api/stock/out`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batch_id: Number(stockForm.batch_id),
          quantity,
          reference:
            stockForm.reference.trim() || null,
          notes: stockForm.notes.trim() || null,
          user_id: Number(stockForm.user_id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erro ao registrar movimento"
        );
      }

      alert(data.message);

      closeStockModal();

      await loadBatches();
      await loadStockMovements();
      await loadDashboard();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getBatchStatus(batch) {
    const quantity = Number(batch.quantity || 0);

    if (quantity === 0) {
      return {
        label: "Sem Stock",
        className: "badge inactive",
      };
    }

    const expiration = new Date(
      batch.expiration_date
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiration < today) {
      return {
        label: "Vencido",
        className: "badge inactive",
      };
    }

    const days = Math.ceil(
      (expiration - today) /
        (1000 * 60 * 60 * 24)
    );

    if (days <= 30) {
      return {
        label: "Vence em breve",
        className: "badge warning",
      };
    }

    return {
      label: "Disponível",
      className: "badge active",
    };
  }

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("pt-PT");
  }

  // =====================================================
  // VENDAS
  // =====================================================

  function openSaleModal() {
    setSaleForm({
      customer_name: "",
      payment_method: "CASH",
      product_id: "",
      quantity: "",
      user_id: 3,
    });

    setError("");
    setSaleModal(true);
  }

  function closeSaleModal() {
    setSaleModal(false);
  }

  function handleSaleChange(event) {
    const { name, value } = event.target;

    setSaleForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function getProductStock(productId) {
    return batches
      .filter(
        (batch) =>
          Number(batch.product_id) ===
            Number(productId) &&
          Number(batch.quantity) > 0
      )
      .reduce(
        (total, batch) =>
          total + Number(batch.quantity || 0),
        0
      );
  }

  async function saveSale(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!saleForm.product_id) {
        throw new Error("Selecione um produto.");
      }

      const quantity = Number(saleForm.quantity);

      if (!quantity || quantity <= 0) {
        throw new Error(
          "A quantidade deve ser maior que zero."
        );
      }

      const availableStock = getProductStock(
        saleForm.product_id
      );

      if (availableStock < quantity) {
        throw new Error(
          `Stock insuficiente. Disponível: ${availableStock}`
        );
      }

      const response = await fetch(
        `${API_URL}/api/sales`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_name:
              saleForm.customer_name.trim() || null,
            payment_method:
              saleForm.payment_method,
            user_id: Number(saleForm.user_id),
            items: [
              {
                product_id: Number(
                  saleForm.product_id
                ),
                quantity,
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erro ao criar venda"
        );
      }

      alert(
        `${data.message}\n\nVenda: ${
          data.sale_number
        }\nTotal: ${Number(
          data.total_amount
        ).toFixed(2)} MZN`
      );

      closeSaleModal();

      await loadSales();
      await loadBatches();
      await loadStockMovements();
      await loadDashboard();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  function renderDashboard() {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Visão geral da farmácia</p>
          </div>
        </div>

        <div className="status-card">
          <span className="status-dot"></span>

          <div>
            <strong>Sistema Online</strong>
            <small>
              API conectada com sucesso
            </small>
          </div>
        </div>

        <div className="metrics">
          <div className="metric-card">
            <span>Produtos</span>
            <strong>
              {dashboard?.products ?? 0}
            </strong>
          </div>

          <div className="metric-card">
            <span>Stock Total</span>
            <strong>
              {dashboard?.total_stock ?? 0}
            </strong>
          </div>

          <div className="metric-card">
            <span>Vendas Hoje</span>
            <strong>
              {dashboard?.sales_today ?? 0}
            </strong>
          </div>

          <div className="metric-card">
            <span>Receita Hoje</span>
            <strong>
              {Number(
                dashboard?.revenue_today ?? 0
              ).toFixed(2)}{" "}
              MZN
            </strong>
          </div>
        </div>

        <div className="monitoring">
          <div className="section-card">
            <h2>Stock Baixo</h2>

            <strong>
              {dashboard?.low_stock ?? 0}
            </strong>

            <p>
              {Number(
                dashboard?.low_stock ?? 0
              ) > 0
                ? "Produtos precisam de reposição."
                : "Nenhum produto com stock baixo."}
            </p>
          </div>

          <div className="section-card">
            <h2>Próximos Vencimentos</h2>

            <strong>
              {dashboard?.expiring_soon ?? 0}
            </strong>

            <p>
              {Number(
                dashboard?.expiring_soon ?? 0
              ) > 0
                ? "Existem lotes próximos do vencimento."
                : "Nenhum lote próximo do vencimento."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PRODUTOS
  // =====================================================

  function renderProducts() {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Produtos</h1>
            <p>
              Gestão de medicamentos e produtos da
              farmácia
            </p>
          </div>

          <button
            className="primary-button"
            onClick={openCreateForm}
          >
            + Novo Produto
          </button>
        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            A processar...
          </div>
        )}

        <div className="table-card">
          <div className="table-header">
            <h2>Lista de Produtos</h2>

            <span>
              {products.length} produtos
            </span>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Produto</th>
                  <th>Princípio Ativo</th>
                  <th>Categoria</th>
                  <th>Unidade</th>
                  <th>Compra</th>
                  <th>Venda</th>
                  <th>Stock Mín.</th>
                  <th>Estado</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>

                    <td>{product.code}</td>

                    <td>
                      <strong>
                        {product.name}
                      </strong>
                    </td>

                    <td>
                      {product.active_ingredient}
                    </td>

                    <td>
                      {product.category_name}
                    </td>

                    <td>{product.unit}</td>

                    <td>
                      {Number(
                        product.purchase_price
                      ).toFixed(2)}{" "}
                      MZN
                    </td>

                    <td>
                      {Number(
                        product.selling_price
                      ).toFixed(2)}{" "}
                      MZN
                    </td>

                    <td>
                      {product.minimum_stock}
                    </td>

                    <td>
                      <span
                        className={
                          product.active
                            ? "badge active"
                            : "badge inactive"
                        }
                      >
                        {product.active
                          ? "Ativo"
                          : "Inativo"}
                      </span>
                    </td>

                    <td>
                      <div className="actions">
                        <button
                          className="edit-button"
                          onClick={() =>
                            openEditForm(product)
                          }
                        >
                          Editar
                        </button>

                        {product.active === 1 && (
                          <button
                            className="delete-button"
                            onClick={() =>
                              deactivateProduct(
                                product.id
                              )
                            }
                          >
                            Desativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {products.length === 0 &&
                  !loading && (
                    <tr>
                      <td
                        colSpan="11"
                        className="empty"
                      >
                        Nenhum produto encontrado.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <div>
                  <h2>
                    {editingProduct
                      ? "Editar Produto"
                      : "Novo Produto"}
                  </h2>

                  <p>
                    Preencha os dados do produto
                  </p>
                </div>

                <button
                  className="close-button"
                  onClick={closeForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={saveProduct}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Código</label>

                    <input
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Nome</label>

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Princípio Ativo
                    </label>

                    <input
                      name="active_ingredient"
                      value={
                        form.active_ingredient
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Categoria</label>

                    <select
                      name="category_id"
                      value={
                        form.category_id
                      }
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Selecionar categoria
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Unidade</label>

                    <select
                      name="unit"
                      value={form.unit}
                      onChange={handleChange}
                    >
                      <option value="Caixa">
                        Caixa
                      </option>

                      <option value="Frasco">
                        Frasco
                      </option>

                      <option value="Unidade">
                        Unidade
                      </option>

                      <option value="Pacote">
                        Pacote
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Preço de Compra
                    </label>

                    <input
                      name="purchase_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        form.purchase_price
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Preço de Venda
                    </label>

                    <input
                      name="selling_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        form.selling_price
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Stock Mínimo
                    </label>

                    <input
                      name="minimum_stock"
                      type="number"
                      min="0"
                      value={
                        form.minimum_stock
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closeForm}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={loading}
                  >
                    {editingProduct
                      ? "Atualizar"
                      : "Criar Produto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =====================================================
  // STOCK
  // =====================================================

  function renderStock() {
    const totalQuantity =
      batches.reduce(
        (total, batch) =>
          total +
          Number(batch.quantity || 0),
        0
      );

    const lowStock = products.filter(
      (product) => {
        const quantity = batches
          .filter(
            (batch) =>
              Number(batch.product_id) ===
              Number(product.id)
          )
          .reduce(
            (total, batch) =>
              total +
              Number(
                batch.quantity || 0
              ),
            0
          );

        return (
          quantity <=
          Number(
            product.minimum_stock || 0
          )
        );
      }
    ).length;

    const expiringSoon =
      batches.filter(
        (batch) =>
          getBatchStatus(batch).label ===
          "Vence em breve"
      ).length;

    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Stock</h1>

            <p>
              Gestão de stock, lotes e movimentos
            </p>
          </div>

          <div className="page-actions">
            <button
              className="secondary-button"
              onClick={openBatchModal}
            >
              + Novo Lote
            </button>

            <button
              className="primary-button"
              onClick={() =>
                openStockModal("in")
              }
            >
              + Entrada
            </button>

            <button
              className="stock-out-button"
              onClick={() =>
                openStockModal("out")
              }
            >
              − Saída
            </button>
          </div>
        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            A processar...
          </div>
        )}

        <div className="metrics">
          <div className="metric-card">
            <span>Stock Total</span>
            <strong>{totalQuantity}</strong>
          </div>

          <div className="metric-card">
            <span>Lotes</span>
            <strong>{batches.length}</strong>
          </div>

          <div className="metric-card">
            <span>Stock Baixo</span>
            <strong>{lowStock}</strong>
          </div>

          <div className="metric-card">
            <span>
              Vencimentos Próximos
            </span>
            <strong>
              {expiringSoon}
            </strong>
          </div>
        </div>

        <div className="table-card">
          <div className="table-header">
            <div>
              <h2>Lotes</h2>

              <span>
                {batches.length} lotes
                registados
              </span>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Produto</th>
                  <th>Lote</th>
                  <th>Validade</th>
                  <th>Quantidade</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {batches.map((batch) => {
                  const status =
                    getBatchStatus(
                      batch
                    );

                  return (
                    <tr key={batch.id}>
                      <td>{batch.id}</td>

                      <td>
                        {batch.product_code}
                      </td>

                      <td>
                        <strong>
                          {
                            batch.product_name
                          }
                        </strong>
                      </td>

                      <td>
                        {batch.batch_number}
                      </td>

                      <td>
                        {formatDate(
                          batch.expiration_date
                        )}
                      </td>

                      <td>
                        <strong>
                          {batch.quantity}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            status.className
                          }
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {batches.length === 0 &&
                  !loading && (
                    <tr>
                      <td
                        colSpan="7"
                        className="empty"
                      >
                        Nenhum lote
                        encontrado.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card stock-movements-card">
          <div className="table-header">
            <div>
              <h2>
                Histórico de Movimentos
              </h2>

              <span>
                Últimas movimentações
              </span>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Lote</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Referência</th>
                  <th>Utilizador</th>
                </tr>
              </thead>

              <tbody>
                {stockMovements.map(
                  (movement) => (
                    <tr
                      key={
                        movement.id
                      }
                    >
                      <td>
                        {movement.created_at
                          ? new Date(
                              movement.created_at
                            ).toLocaleString(
                              "pt-PT"
                            )
                          : "-"}
                      </td>

                      <td>
                        <strong>
                          {
                            movement.product_name
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          movement.batch_number
                        }
                      </td>

                      <td>
                        <span
                          className={
                            movement.movement_type ===
                            "IN"
                              ? "badge active"
                              : "badge inactive"
                          }
                        >
                          {movement.movement_type ===
                          "IN"
                            ? "Entrada"
                            : "Saída"}
                        </span>
                      </td>

                      <td>
                        {movement.quantity}
                      </td>

                      <td>
                        {movement.reference ||
                          "-"}
                      </td>

                      <td>
                        {movement.user_name ||
                          movement.user_id ||
                          "-"}
                      </td>
                    </tr>
                  )
                )}

                {stockMovements.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="empty"
                    >
                      Nenhum movimento
                      registado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {stockModal === "batch" && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <div>
                  <h2>Novo Lote</h2>

                  <p>
                    Registar um novo lote
                    de produto
                  </p>
                </div>

                <button
                  className="close-button"
                  onClick={
                    closeStockModal
                  }
                >
                  ×
                </button>
              </div>

              <form onSubmit={saveBatch}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Produto
                    </label>

                    <select
                      name="product_id"
                      value={
                        batchForm.product_id
                      }
                      onChange={
                        handleBatchChange
                      }
                      required
                    >
                      <option value="">
                        Selecionar
                        produto
                      </option>

                      {products
                        .filter(
                          (product) =>
                            product.active ===
                            1
                        )
                        .map(
                          (product) => (
                            <option
                              key={
                                product.id
                              }
                              value={
                                product.id
                              }
                            >
                              {
                                product.code
                              }{" "}
                              -{" "}
                              {
                                product.name
                              }
                            </option>
                          )
                        )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Número do Lote
                    </label>

                    <input
                      name="batch_number"
                      value={
                        batchForm.batch_number
                      }
                      onChange={
                        handleBatchChange
                      }
                      required
                      placeholder="LOT-2026-001"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Data de Validade
                    </label>

                    <input
                      type="date"
                      name="expiration_date"
                      value={
                        batchForm.expiration_date
                      }
                      onChange={
                        handleBatchChange
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Quantidade Inicial
                    </label>

                    <input
                      type="number"
                      name="quantity"
                      min="0"
                      value={
                        batchForm.quantity
                      }
                      onChange={
                        handleBatchChange
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      closeStockModal
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={loading}
                  >
                    Criar Lote
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {(stockModal === "in" ||
          stockModal === "out") && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <div>
                  <h2>
                    {stockModal ===
                    "in"
                      ? "Entrada de Stock"
                      : "Saída de Stock"}
                  </h2>

                  <p>
                    {stockModal ===
                    "in"
                      ? "Registar entrada de mercadoria"
                      : "Registar saída de stock"}
                  </p>
                </div>

                <button
                  className="close-button"
                  onClick={
                    closeStockModal
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  saveStockMovement
                }
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Lote
                    </label>

                    <select
                      name="batch_id"
                      value={
                        stockForm.batch_id
                      }
                      onChange={
                        handleStockChange
                      }
                      required
                    >
                      <option value="">
                        Selecionar lote
                      </option>

                      {batches
                        .filter(
                          (batch) =>
                            stockModal ===
                            "out"
                              ? Number(
                                  batch.quantity
                                ) > 0
                              : true
                        )
                        .map(
                          (batch) => (
                            <option
                              key={
                                batch.id
                              }
                              value={
                                batch.id
                              }
                            >
                              {
                                batch.product_code
                              }{" "}
                              -{" "}
                              {
                                batch.product_name
                              }{" "}
                              | Lote{" "}
                              {
                                batch.batch_number
                              }{" "}
                              | Stock:{" "}
                              {
                                batch.quantity
                              }
                            </option>
                          )
                        )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Quantidade
                    </label>

                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={
                        stockForm.quantity
                      }
                      onChange={
                        handleStockChange
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Referência
                    </label>

                    <input
                      name="reference"
                      value={
                        stockForm.reference
                      }
                      onChange={
                        handleStockChange
                      }
                      placeholder="Ex.: COMP-001"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Observação
                    </label>

                    <input
                      name="notes"
                      value={
                        stockForm.notes
                      }
                      onChange={
                        handleStockChange
                      }
                      placeholder="Observação"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      closeStockModal
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className={
                      stockModal ===
                      "in"
                        ? "primary-button"
                        : "stock-out-button"
                    }
                    disabled={loading}
                  >
                    {stockModal ===
                    "in"
                      ? "Registar Entrada"
                      : "Registar Saída"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =====================================================
  // VENDAS
  // =====================================================

  function renderSales() {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Vendas</h1>

            <p>
              Gestão de vendas e saídas
              automáticas por FEFO
            </p>
          </div>

          <button
            className="primary-button"
            onClick={openSaleModal}
          >
            + Nova Venda
          </button>
        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            A processar...
          </div>
        )}

        <div className="metrics">
          <div className="metric-card">
            <span>Vendas Hoje</span>

            <strong>
              {dashboard?.sales_today ??
                0}
            </strong>
          </div>

          <div className="metric-card">
            <span>Receita Hoje</span>

            <strong>
              {Number(
                dashboard?.revenue_today ??
                  0
              ).toFixed(2)}{" "}
              MZN
            </strong>
          </div>

          <div className="metric-card">
            <span>Total de Vendas</span>

            <strong>
              {sales.length}
            </strong>
          </div>

          <div className="metric-card">
            <span>Produtos</span>

            <strong>
              {products.length}
            </strong>
          </div>
        </div>

        <div className="table-card">
          <div className="table-header">
            <div>
              <h2>
                Histórico de Vendas
              </h2>

              <span>
                {sales.length} vendas
                registadas
              </span>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Pagamento</th>
                  <th>Estado</th>
                  <th>Utilizador</th>
                  <th>Data</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.id}</td>

                    <td>
                      <strong>
                        {
                          sale.sale_number
                        }
                      </strong>
                    </td>

                    <td>
                      {sale.customer_name ||
                        "Cliente balcão"}
                    </td>

                    <td>
                      {Number(
                        sale.total_amount
                      ).toFixed(2)}{" "}
                      MZN
                    </td>

                    <td>
                      {sale.payment_method ===
                      "CASH"
                        ? "Dinheiro"
                        : sale.payment_method ===
                          "CARD"
                        ? "Cartão"
                        : sale.payment_method ===
                          "MPESA"
                        ? "M-Pesa"
                        : sale.payment_method ===
                          "EMOLA"
                        ? "e-Mola"
                        : sale.payment_method}
                    </td>

                    <td>
                      <span className="badge active">
                        {sale.status}
                      </span>
                    </td>

                    <td>
                      {sale.user_name ||
                        sale.user_id ||
                        "-"}
                    </td>

                    <td>
                      {sale.created_at
                        ? new Date(
                            sale.created_at
                          ).toLocaleString(
                            "pt-PT"
                          )
                        : "-"}
                    </td>
                  </tr>
                ))}

                {sales.length === 0 &&
                  !loading && (
                    <tr>
                      <td
                        colSpan="8"
                        className="empty"
                      >
                        Nenhuma venda
                        registada.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>

        {saleModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <div>
                  <h2>Nova Venda</h2>

                  <p>
                    A saída será processada
                    automaticamente por
                    FEFO.
                  </p>
                </div>

                <button
                  className="close-button"
                  onClick={
                    closeSaleModal
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={saveSale}
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Cliente
                    </label>

                    <input
                      name="customer_name"
                      value={
                        saleForm.customer_name
                      }
                      onChange={
                        handleSaleChange
                      }
                      placeholder="Cliente balcão"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Forma de Pagamento
                    </label>

                    <select
                      name="payment_method"
                      value={
                        saleForm.payment_method
                      }
                      onChange={
                        handleSaleChange
                      }
                      required
                    >
                      <option value="CASH">
                        Dinheiro
                      </option>

                      <option value="CARD">
                        Cartão
                      </option>

                      <option value="MPESA">
                        M-Pesa
                      </option>

                      <option value="EMOLA">
                        e-Mola
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Produto
                    </label>

                    <select
                      name="product_id"
                      value={
                        saleForm.product_id
                      }
                      onChange={
                        handleSaleChange
                      }
                      required
                    >
                      <option value="">
                        Selecionar produto
                      </option>

                      {products
                        .filter(
                          (product) =>
                            product.active ===
                              1 &&
                            getProductStock(
                              product.id
                            ) > 0
                        )
                        .map(
                          (product) => (
                            <option
                              key={
                                product.id
                              }
                              value={
                                product.id
                              }
                            >
                              {
                                product.code
                              }{" "}
                              -{" "}
                              {
                                product.name
                              }{" "}
                              | Stock:{" "}
                              {
                                getProductStock(
                                  product.id
                                )
                              }
                            </option>
                          )
                        )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Quantidade
                    </label>

                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={
                        saleForm.quantity
                      }
                      onChange={
                        handleSaleChange
                      }
                      required
                    />
                  </div>
                </div>

                {saleForm.product_id && (
                  <div className="sale-stock-info">
                    Stock disponível:{" "}
                    <strong>
                      {getProductStock(
                        saleForm.product_id
                      )}
                    </strong>
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      closeSaleModal
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={loading}
                  >
                    Finalizar Venda
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =====================================================
  // ALERTAS
  // =====================================================

  function renderAlerts() {
    const lowStockProducts =
      products.filter((product) => {
        const stock =
          getProductStock(product.id);

        return (
          stock <=
          Number(
            product.minimum_stock || 0
          )
        );
      });

    const expiringBatches =
      batches.filter(
        (batch) =>
          getBatchStatus(batch).label ===
          "Vence em breve"
      );

    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Alertas</h1>

            <p>
              Produtos com stock baixo e
              lotes próximos do vencimento
            </p>
          </div>
        </div>

        <div className="monitoring">
          <div className="section-card">
            <h2>Stock Baixo</h2>

            <strong>
              {lowStockProducts.length}
            </strong>

            {lowStockProducts.length >
            0 ? (
              <div className="alert-list">
                {lowStockProducts.map(
                  (product) => (
                    <div
                      className="alert-item"
                      key={
                        product.id
                      }
                    >
                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        Stock:{" "}
                        {getProductStock(
                          product.id
                        )}{" "}
                        | Mínimo:{" "}
                        {
                          product.minimum_stock
                        }
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p>
                Nenhum alerta de stock
                baixo.
              </p>
            )}
          </div>

          <div className="section-card">
            <h2>
              Vencimentos Próximos
            </h2>

            <strong>
              {expiringBatches.length}
            </strong>

            {expiringBatches.length >
            0 ? (
              <div className="alert-list">
                {expiringBatches.map(
                  (batch) => (
                    <div
                      className="alert-item"
                      key={batch.id}
                    >
                      <strong>
                        {
                          batch.product_name
                        }
                      </strong>

                      <span>
                        Lote{" "}
                        {
                          batch.batch_number
                        }{" "}
                        | Validade:{" "}
                        {formatDate(
                          batch.expiration_date
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p>
                Nenhum vencimento próximo.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderPage() {
    if (activePage === "Dashboard") {
      return renderDashboard();
    }

    if (activePage === "Produtos") {
      return renderProducts();
    }

    if (activePage === "Stock") {
      return renderStock();
    }

    if (activePage === "Vendas") {
      return renderSales();
    }

    if (activePage === "Alertas") {
      return renderAlerts();
    }

    return null;
  }

  return (
    <div className="app">
      <aside className="sidebar">

        {/* =================================================
            LOGOTIPO
        ================================================= */}
        <div className="brand-area">
          <img
            src="/logo.png"
            alt="BSPOT Pharmacy"
            className="brand-logo"
          />
        </div>

        <div className="profile">
          <div className="avatar">A</div>

          <div>
            <strong>Administrador</strong>
            <span>Admin</span>
          </div>
        </div>

        <nav>
          {[
            "Dashboard",
            "Produtos",
            "Stock",
            "Vendas",
            "Alertas",
          ].map((item) => (
            <button
              key={item}
              className={
                activePage === item
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => {
                setActivePage(item);
                setError("");
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <small>
            Management System
          </small>
        </div>
      </aside>

      <main className="main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;