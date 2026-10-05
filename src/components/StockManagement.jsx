import React, { useState, useMemo } from 'react';
import {
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Search,
  Download,
  Printer,
  Trash2,
  Edit3,
  Calendar,
  FileText,
  AlertTriangle,
  Boxes,
  RefreshCw,
  Sparkles,
  Wrench
} from 'lucide-react';

export default function StockManagement({
  products = [],
  stockMovements = [],
  onSaveProduct,
  onDeleteProduct,
  onSaveMovement,
  onDeleteMovement
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Sub-aba ativa: 'movements' | 'products' | 'reports'
  const [subTab, setSubTab] = useState('movements');

  // Filtro de Categoria de Estoque: 'all' | 'limpeza' | 'manutencao'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // ---------- ESTADOS DE CADASTRO DE PRODUTO ----------
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    code: '',
    name: '',
    category: 'limpeza', // 'limpeza' ou 'manutencao'
    unit: 'UN',
    description: ''
  });
  const [productSearch, setProductSearch] = useState('');

  // ---------- ESTADOS DE MOVIMENTAÇÃO DE ESTOQUE ----------
  const [movementForm, setMovementForm] = useState({
    product_code: '',
    type: 'entrada', // 'entrada' ou 'saida'
    quantity: 1,
    date: todayStr,
    notes: ''
  });
  const [movementSearch, setMovementSearch] = useState('');

  // ---------- ESTADOS DE EXPORTAÇÃO / RELATÓRIOS ----------
  const [reportMode, setReportMode] = useState('by_date'); // 'by_date' ou 'by_product'
  const [selectedReportDate, setSelectedReportDate] = useState(todayStr);
  const [selectedReportProductCode, setSelectedReportProductCode] = useState('');

  // Unidades de medida comuns
  const UNIT_OPTIONS = [
    { value: 'UN', label: 'UN - Unidade' },
    { value: 'KG', label: 'KG - Quilograma' },
    { value: 'L', label: 'L - Litro' },
    { value: 'M', label: 'M - Metro' },
    { value: 'CX', label: 'CX - Caixa' },
    { value: 'PAR', label: 'PAR - Par' },
    { value: 'PCT', label: 'PCT - Pacote' },
    { value: 'ROLO', label: 'ROLO - Rolo' },
    { value: 'GALÃO', label: 'GALÃO - Galão' },
    { value: 'OUTRO', label: 'Outro' }
  ];

  // CÁLCULOS DE ESTOQUE ATUAL POR PRODUTO
  const stockLevels = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const codeUpper = (p.code || '').trim().toUpperCase();
      map[codeUpper] = {
        product: p,
        totalEntries: 0,
        totalExits: 0,
        currentStock: 0
      };
    });

    stockMovements.forEach(m => {
      const codeUpper = (m.product_code || '').trim().toUpperCase();
      if (!map[codeUpper]) {
        map[codeUpper] = {
          product: { id: m.product_id, code: codeUpper, name: 'Produto Desconhecido', unit: 'UN', category: 'outros' },
          totalEntries: 0,
          totalExits: 0,
          currentStock: 0
        };
      }
      const qty = Number(m.quantity) || 0;
      if (m.type === 'entrada') {
        map[codeUpper].totalEntries += qty;
      } else if (m.type === 'saida') {
        map[codeUpper].totalExits += qty;
      }
      map[codeUpper].currentStock = map[codeUpper].totalEntries - map[codeUpper].totalExits;
    });

    return map;
  }, [products, stockMovements]);

  // Busca do produto digitado na tela de movimentação
  const activeMovementProduct = useMemo(() => {
    const codeTyped = (movementForm.product_code || '').trim().toUpperCase();
    if (!codeTyped) return null;
    const foundProduct = products.find(p => (p.code || '').trim().toUpperCase() === codeTyped);
    const stockInfo = stockLevels[codeTyped] || { currentStock: 0 };

    if (foundProduct) {
      return {
        ...foundProduct,
        currentStock: stockInfo.currentStock
      };
    }
    return null;
  }, [movementForm.product_code, products, stockLevels]);

  // PRODUTOS FILTRADOS POR CATEGORIA E BUSCA
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCategory = categoryFilter === 'all' || (p.category || 'limpeza') === categoryFilter;
      const term = productSearch.toLowerCase();
      const matchSearch = !term || (p.code || '').toLowerCase().includes(term) || (p.name || '').toLowerCase().includes(term);
      return matchCategory && matchSearch;
    });
  }, [products, categoryFilter, productSearch]);

  // MOVIMENTAÇÕES FILTRADAS POR CATEGORIA E BUSCA
  const filteredMovements = useMemo(() => {
    return stockMovements.filter(m => {
      const codeUpper = (m.product_code || '').toUpperCase();
      const prodObj = products.find(p => (p.code || '').toUpperCase() === codeUpper);
      const prodCat = prodObj?.category || 'limpeza';
      const matchCategory = categoryFilter === 'all' || prodCat === categoryFilter;
      const term = movementSearch.toLowerCase();
      const matchSearch = !term || (m.product_code || '').toLowerCase().includes(term) || (m.notes || '').toLowerCase().includes(term);
      return matchCategory && matchSearch;
    });
  }, [stockMovements, products, categoryFilter, movementSearch]);

  // MANIPULADORES DO FORMULÁRIO DE PRODUTOS
  const handleEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setProductForm({
      code: prod.code || '',
      name: prod.name || '',
      category: prod.category || 'limpeza',
      unit: prod.unit || 'UN',
      description: prod.description || ''
    });
    setSubTab('products');
  };

  const handleCancelProductEdit = () => {
    setEditingProductId(null);
    setProductForm({ code: '', name: '', category: 'limpeza', unit: 'UN', description: '' });
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!productForm.code.trim() || !productForm.name.trim()) {
      alert('Por favor, preencha o código e o nome do produto.');
      return;
    }

    const codeUpper = productForm.code.trim().toUpperCase();
    const existing = products.find(p => (p.code || '').trim().toUpperCase() === codeUpper && p.id !== editingProductId);
    if (existing) {
      alert(`Já existe um produto cadastrado com o código ${codeUpper} (${existing.name}).`);
      return;
    }

    await onSaveProduct({
      ...(editingProductId ? { id: editingProductId } : {}),
      code: codeUpper,
      name: productForm.name.trim(),
      category: productForm.category || 'limpeza',
      unit: productForm.unit,
      description: productForm.description.trim()
    });

    handleCancelProductEdit();
  };

  // MANIPULADORES DO FORMULÁRIO DE MOVIMENTAÇÃO
  const handleSubmitMovement = async (e) => {
    e.preventDefault();
    const codeUpper = (movementForm.product_code || '').trim().toUpperCase();
    if (!codeUpper) {
      alert('Por favor, digite ou selecione o código do produto.');
      return;
    }

    if (!movementForm.quantity || Number(movementForm.quantity) <= 0) {
      alert('Por favor, informe uma quantidade válida maior que zero.');
      return;
    }

    const targetProduct = products.find(p => (p.code || '').trim().toUpperCase() === codeUpper);

    await onSaveMovement({
      product_id: targetProduct ? targetProduct.id : `prod-code-${codeUpper}`,
      product_code: codeUpper,
      type: movementForm.type,
      quantity: Number(movementForm.quantity),
      date: movementForm.date || todayStr,
      notes: movementForm.notes.trim()
    });

    setMovementForm({
      product_code: '',
      type: 'entrada',
      quantity: 1,
      date: movementForm.date,
      notes: ''
    });
  };

  const handleQuickSelectCode = (code) => {
    setMovementForm(prev => ({
      ...prev,
      product_code: code
    }));
    setSubTab('movements');
  };

  // EXPORTAÇÕES (CSV & IMPRESSÃO PDF)
  const movementsBySelectedDate = useMemo(() => {
    if (!selectedReportDate) return [];
    return stockMovements.filter(m => m.date === selectedReportDate);
  }, [stockMovements, selectedReportDate]);

  const dateReportTotals = useMemo(() => {
    let entries = 0;
    let exits = 0;
    movementsBySelectedDate.forEach(m => {
      const q = Number(m.quantity) || 0;
      if (m.type === 'entrada') entries += q;
      if (m.type === 'saida') exits += q;
    });
    return { entries, exits, totalOps: movementsBySelectedDate.length };
  }, [movementsBySelectedDate]);

  const handleExportDateCSV = () => {
    if (movementsBySelectedDate.length === 0) {
      alert('Nenhuma movimentação encontrada na data selecionada.');
      return;
    }

    let csv = "data:text/csv;charset=utf-8,";
    csv += "Data;Codigo Produto;Nome do Produto;Categoria;Unidade;Tipo Movimentacao;Quantidade;Observacao\n";

    movementsBySelectedDate.forEach(m => {
      const code = m.product_code || '';
      const prodObj = products.find(p => (p.code || '').toUpperCase() === code.toUpperCase());
      const prodName = prodObj ? prodObj.name : 'Produto Desconhecido';
      const catLabel = prodObj?.category === 'manutencao' ? 'Manutenção' : 'Limpeza';
      const unit = prodObj ? prodObj.unit : 'UN';
      const typeLabel = m.type === 'entrada' ? 'ENTRADA (+)' : 'SAIDA (-)';
      const qty = m.quantity || 0;
      const obs = (m.notes || '').replace(/;/g, ' ');

      csv += `${m.date};${code};${prodName};${catLabel};${unit};${typeLabel};${qty};${obs}\n`;
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Movimentacoes_Estoque_Data_${selectedReportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedProductObj = useMemo(() => {
    if (!selectedReportProductCode) return null;
    return products.find(p => (p.code || '').toUpperCase() === selectedReportProductCode.toUpperCase()) || null;
  }, [products, selectedReportProductCode]);

  const movementsBySelectedProduct = useMemo(() => {
    if (!selectedReportProductCode) return [];
    const codeUpper = selectedReportProductCode.toUpperCase();
    return stockMovements
      .filter(m => (m.product_code || '').toUpperCase() === codeUpper)
      .sort((a, b) => new Date(a.date || a.created_at) - new Date(b.date || b.created_at));
  }, [stockMovements, selectedReportProductCode]);

  const productMovementLedger = useMemo(() => {
    let runningBalance = 0;
    let totalEntries = 0;
    let totalExits = 0;
    const rows = [];

    for (const m of movementsBySelectedProduct) {
      const q = Number(m.quantity) || 0;
      if (m.type === 'entrada') {
        runningBalance += q;
        totalEntries += q;
      } else {
        runningBalance -= q;
        totalExits += q;
      }

      rows.push({
        ...m,
        balanceAfter: runningBalance
      });
    }

    return {
      rows,
      totalEntries,
      totalExits,
      finalBalance: runningBalance
    };
  }, [movementsBySelectedProduct]);

  const handleExportProductCSV = () => {
    if (!selectedProductObj || productMovementLedger.rows.length === 0) {
      alert('Selecione um produto com movimentações para exportar.');
      return;
    }

    let csv = "data:text/csv;charset=utf-8,";
    csv += `Extrato de Estoque - ${selectedProductObj.code} - ${selectedProductObj.name}\n`;
    csv += "Data;Tipo;Quantidade;Saldo Resultante;Observacao\n";

    productMovementLedger.rows.forEach(row => {
      const typeLabel = row.type === 'entrada' ? 'ENTRADA (+)' : 'SAIDA (-)';
      const obs = (row.notes || '').replace(/;/g, ' ');
      csv += `${row.date};${typeLabel};${row.quantity};${row.balanceAfter} ${selectedProductObj.unit};${obs}\n`;
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Extrato_Estoque_${selectedProductObj.code}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Indicadores de Estoque separados por Categoria (Limpeza vs Manutenção)
  const categoryStats = useMemo(() => {
    const limpezaProds = products.filter(p => (p.category || 'limpeza') === 'limpeza');
    const manutencaoProds = products.filter(p => p.category === 'manutencao');

    let totalLimpezaQty = 0;
    let totalManutencaoQty = 0;

    Object.values(stockLevels).forEach(info => {
      const cat = info.product?.category || 'limpeza';
      const qty = Math.max(0, info.currentStock);
      if (cat === 'limpeza') totalLimpezaQty += qty;
      if (cat === 'manutencao') totalManutencaoQty += qty;
    });

    return {
      limpezaCount: limpezaProds.length,
      limpezaQty: totalLimpezaQty,
      manutencaoCount: manutencaoProds.length,
      manutencaoQty: totalManutencaoQty,
      totalProds: products.length
    };
  }, [products, stockLevels]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* CABEÇALHO DA SEÇÃO DE ESTOQUE */}
      <div className="clean-card no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-subtle) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'var(--accent-blue)',
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            <Boxes size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Gestão de Estoque: Limpeza & Manutenção
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Controle de materiais setorizados por 🧹 <strong>Limpeza</strong> e 🔧 <strong>Manutenção</strong>.
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO DE SUB-ABAS */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          padding: '0.3rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          gap: '0.3rem'
        }}>
          <button
            className={`btn btn-sm ${subTab === 'movements' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSubTab('movements')}
          >
            <RefreshCw size={15} />
            Movimentação
          </button>

          <button
            className={`btn btn-sm ${subTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSubTab('products')}
          >
            <Package size={15} />
            Cadastrar Produtos
          </button>

          <button
            className={`btn btn-sm ${subTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSubTab('reports')}
          >
            <FileText size={15} />
            Relatórios / CSV
          </button>
        </div>
      </div>

      {/* FILTROS DE CATEGORIA (TODOS, LIMPEZA, MANUTENÇÃO) E CARDS */}
      <div className="no-print" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem'
      }}>
        {/* CARD ESTOQUE LIMPEZA */}
        <div
          className="clean-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderLeft: '4px solid var(--accent-emerald)',
            cursor: 'pointer',
            background: categoryFilter === 'limpeza' ? 'var(--accent-emerald-subtle)' : 'var(--bg-card)'
          }}
          onClick={() => setCategoryFilter(categoryFilter === 'limpeza' ? 'all' : 'limpeza')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'var(--accent-emerald-subtle)', color: 'var(--accent-emerald)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Estoque Limpeza</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {categoryStats.limpezaCount} produtos
              </div>
              <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Saldo Total: {categoryStats.limpezaQty} un.</span>
            </div>
          </div>
        </div>

        {/* CARD ESTOQUE MANUTENÇÃO */}
        <div
          className="clean-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderLeft: '4px solid var(--accent-blue)',
            cursor: 'pointer',
            background: categoryFilter === 'manutencao' ? 'var(--accent-blue-subtle)' : 'var(--bg-card)'
          }}
          onClick={() => setCategoryFilter(categoryFilter === 'manutencao' ? 'all' : 'manutencao')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'var(--accent-blue-subtle)', color: 'var(--accent-blue)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <Wrench size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Estoque Manutenção</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {categoryStats.manutencaoCount} produtos
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>Saldo Total: {categoryStats.manutencaoQty} un.</span>
            </div>
          </div>
        </div>

        {/* BOTÕES DE SELEÇÃO DE CATEGORIA */}
        <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filtrar Visualização:</span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              className={`btn btn-sm ${categoryFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => setCategoryFilter('all')}
            >
              Todos ({categoryStats.totalProds})
            </button>
            <button
              className={`btn btn-sm ${categoryFilter === 'limpeza' ? 'btn-emerald' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => setCategoryFilter('limpeza')}
            >
              🧹 Limpeza
            </button>
            <button
              className={`btn btn-sm ${categoryFilter === 'manutencao' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => setCategoryFilter('manutencao')}
            >
              🔧 Manutenção
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: MOVIMENTAÇÃO DE ESTOQUE (ENTRADA / SAÍDA) */}
      {/* ========================================================================= */}
      {subTab === 'movements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* FORMULÁRIO DE REGISTRO DE MOVIMENTAÇÃO */}
          <div className="clean-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={18} color="var(--accent-blue)" />
              Registrar Entrada ou Saída de Estoque
            </h3>

            <form onSubmit={handleSubmitMovement}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Código do Produto *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: PRD001, LIM-01, MAN-02"
                    value={movementForm.product_code}
                    onChange={e => setMovementForm({ ...movementForm, product_code: e.target.value })}
                    style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Ou Selecione por Nome</label>
                  <select
                    className="form-select"
                    value={movementForm.product_code}
                    onChange={e => setMovementForm({ ...movementForm, product_code: e.target.value })}
                  >
                    <option value="">-- Selecionar Produto --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.code}>
                        [{p.category === 'manutencao' ? '🔧 Manutenção' : '🧹 Limpeza'}] {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tipo de Operação *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className={`btn ${movementForm.type === 'entrada' ? 'btn-emerald' : 'btn-secondary'}`}
                      style={{ flex: 1 }}
                      onClick={() => setMovementForm({ ...movementForm, type: 'entrada' })}
                    >
                      <ArrowUpRight size={16} />
                      Entrada (+)
                    </button>
                    <button
                      type="button"
                      className={`btn ${movementForm.type === 'saida' ? 'btn-rose' : 'btn-secondary'}`}
                      style={{ flex: 1 }}
                      onClick={() => setMovementForm({ ...movementForm, type: 'saida' })}
                    >
                      <ArrowDownLeft size={16} />
                      Saída (-)
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Quantidade *</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    className="form-input"
                    value={movementForm.quantity}
                    onChange={e => setMovementForm({ ...movementForm, quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Data *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={movementForm.date}
                    onChange={e => setMovementForm({ ...movementForm, date: e.target.value })}
                    required
                  />
                </div>

              </div>

              {activeMovementProduct && (
                <div style={{
                  background: movementForm.type === 'entrada' ? 'var(--accent-emerald-subtle)' : 'var(--accent-blue-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      Setor: <strong>{activeMovementProduct.category === 'manutencao' ? '🔧 Manutenção' : '🧹 Limpeza'}</strong>
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      [{activeMovementProduct.code}] {activeMovementProduct.name}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estoque Atual</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                      {activeMovementProduct.currentStock} {activeMovementProduct.unit}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Observação / Responsável (Opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Retirado por João para limpeza do pavilhão B / Peça para manutenção do motor"
                  value={movementForm.notes}
                  onChange={e => setMovementForm({ ...movementForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className={`btn ${movementForm.type === 'entrada' ? 'btn-emerald' : 'btn-primary'}`}>
                  {movementForm.type === 'entrada' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                  Confirmar Lançamento de {movementForm.type === 'entrada' ? 'Entrada' : 'Saída'}
                </button>
              </div>

            </form>
          </div>

          {/* HISTÓRICO DE MOVIMENTAÇÕES */}
          <div className="clean-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                Histórico de Movimentações {categoryFilter !== 'all' ? `(${categoryFilter.toUpperCase()})` : ''} ({filteredMovements.length})
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '240px' }}>
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Buscar movimentação..."
                  value={movementSearch}
                  onChange={e => setMovementSearch(e.target.value)}
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Código</th>
                    <th>Setor</th>
                    <th>Produto / Descrição</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Observação / Responsável</th>
                    <th style={{ textAlign: 'right' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Nenhuma movimentação encontrada para esta categoria.
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map(m => {
                      const codeUpper = (m.product_code || '').toUpperCase();
                      const prodObj = products.find(p => (p.code || '').toUpperCase() === codeUpper);
                      const cat = prodObj?.category || 'limpeza';

                      return (
                        <tr key={m.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{m.date}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-secondary"
                              style={{ fontFamily: 'monospace', fontWeight: 800, padding: '0.15rem 0.45rem' }}
                              onClick={() => handleQuickSelectCode(codeUpper)}
                            >
                              {codeUpper}
                            </button>
                          </td>
                          <td>
                            <span className="badge" style={{
                              background: cat === 'manutencao' ? 'var(--accent-blue-subtle)' : 'var(--accent-emerald-subtle)',
                              color: cat === 'manutencao' ? 'var(--accent-blue)' : '#047857',
                              fontWeight: 700
                            }}>
                              {cat === 'manutencao' ? '🔧 Manutenção' : '🧹 Limpeza'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {prodObj ? prodObj.name : `Produto ${codeUpper}`}
                          </td>
                          <td>
                            {m.type === 'entrada' ? (
                              <span className="badge badge-active"><ArrowUpRight size={13} /> Entrada (+)</span>
                            ) : (
                              <span className="badge badge-inactive"><ArrowDownLeft size={13} /> Saída (-)</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 800 }}>{m.quantity} {prodObj?.unit || ''}</td>
                          <td style={{ fontSize: '0.85rem' }}>{m.notes || '--'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-sm btn-rose"
                              onClick={() => {
                                if (window.confirm('Excluir esta movimentação?')) onDeleteMovement(m.id);
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: CADASTRO DE PRODUTOS COM CATEGORIA (LIMPEZA vs MANUTENÇÃO) */}
      {/* ========================================================================= */}
      {subTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="clean-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} color="var(--accent-blue)" />
              {editingProductId ? 'Editar Produto' : 'Cadastrar Novo Produto de Estoque'}
            </h3>

            <form onSubmit={handleSubmitProduct}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Setor / Categoria do Estoque *</label>
                  <select
                    className="form-select"
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    required
                  >
                    <option value="limpeza">🧹 Estoque de Limpeza</option>
                    <option value="manutencao">🔧 Estoque de Manutenção</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Código do Produto (SKU) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: LIM-001, MAN-50, PRD-10"
                    value={productForm.code}
                    onChange={e => setProductForm({ ...productForm, code: e.target.value })}
                    style={{ textTransform: 'uppercase', fontWeight: 700 }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nome do Produto *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Detergente Clorado 5L / Chave Combinada 13mm"
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Unidade de Medida *</label>
                  <select
                    className="form-select"
                    value={productForm.unit}
                    onChange={e => setProductForm({ ...productForm, unit: e.target.value })}
                    required
                  >
                    {UNIT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="form-group">
                <label className="form-label">Descrição Opcional</label>
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="Especificações, marca, setor de armazenamento..."
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                {editingProductId && (
                  <button type="button" className="btn btn-secondary" onClick={handleCancelProductEdit}>
                    Cancelar Edição
                  </button>
                )}
                <button type="submit" className="btn btn-emerald">
                  <Plus size={16} />
                  {editingProductId ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>

            </form>
          </div>

          {/* LISTA DE PRODUTOS CADASTRADOS */}
          <div className="clean-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                Produtos Cadastrados {categoryFilter !== 'all' ? `(${categoryFilter.toUpperCase()})` : ''} ({filteredProducts.length})
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '240px' }}>
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filtrar produtos..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Setor</th>
                    <th>Código</th>
                    <th>Nome do Produto</th>
                    <th>Unidade</th>
                    <th>Descrição</th>
                    <th>Estoque Atual</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Nenhum produto cadastrado nesta categoria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => {
                      const codeUpper = (p.code || '').toUpperCase();
                      const stockInfo = stockLevels[codeUpper] || { currentStock: 0 };
                      const currentStock = stockInfo.currentStock;
                      const cat = p.category || 'limpeza';

                      return (
                        <tr key={p.id}>
                          <td>
                            <span className="badge" style={{
                              background: cat === 'manutencao' ? 'var(--accent-blue-subtle)' : 'var(--accent-emerald-subtle)',
                              color: cat === 'manutencao' ? 'var(--accent-blue)' : '#047857',
                              fontWeight: 700
                            }}>
                              {cat === 'manutencao' ? '🔧 Manutenção' : '🧹 Limpeza'}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--accent-blue)' }}>
                            {codeUpper}
                          </td>
                          <td style={{ fontWeight: 700 }}>{p.name}</td>
                          <td><span className="badge badge-abono">{p.unit}</span></td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.description || '--'}</td>
                          <td>
                            <span style={{
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              color: currentStock > 5 ? '#047857' : currentStock > 0 ? '#b45309' : '#b91c1c'
                            }}>
                              {currentStock} {p.unit}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                              <button
                                className="btn btn-sm btn-emerald"
                                onClick={() => handleQuickSelectCode(codeUpper)}
                              >
                                <ArrowUpRight size={13} /> Movimentar
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleEditProduct(p)}
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                className="btn btn-sm btn-rose"
                                onClick={() => {
                                  if (window.confirm(`Excluir ${p.name}?`)) onDeleteProduct(p.id);
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: RELATÓRIOS */}
      {/* ========================================================================= */}
      {subTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="clean-card no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn ${reportMode === 'by_date' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setReportMode('by_date')}
              >
                <Calendar size={16} /> Movimentações por Data
              </button>
              <button
                className={`btn ${reportMode === 'by_product' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setReportMode('by_product')}
              >
                <Package size={16} /> Extrato por Produto
              </button>
            </div>

            <div>
              {reportMode === 'by_date' ? (
                <button className="btn btn-emerald" onClick={handleExportDateCSV}>
                  <Download size={16} /> Exportar CSV
                </button>
              ) : (
                <button className="btn btn-emerald" onClick={handleExportProductCSV}>
                  <Download size={16} /> Exportar CSV
                </button>
              )}
              <button className="btn btn-primary" onClick={handlePrint} style={{ marginLeft: '0.5rem' }}>
                <Printer size={16} /> Imprimir PDF
              </button>
            </div>
          </div>

          {reportMode === 'by_date' && (
            <div className="clean-card print-only-sheet">
              <div className="no-print" style={{ marginBottom: '1.25rem', maxWidth: '300px' }}>
                <label className="form-label">Data para Exportação</label>
                <input
                  type="date"
                  className="form-input"
                  value={selectedReportDate}
                  onChange={e => setSelectedReportDate(e.target.value)}
                />
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Produto</th>
                      <th>Setor</th>
                      <th>Tipo</th>
                      <th>Quantidade</th>
                      <th>Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movementsBySelectedDate.map(m => {
                      const codeUpper = (m.product_code || '').toUpperCase();
                      const prodObj = products.find(p => (p.code || '').toUpperCase() === codeUpper);
                      const cat = prodObj?.category || 'limpeza';

                      return (
                        <tr key={m.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 800 }}>{codeUpper}</td>
                          <td style={{ fontWeight: 700 }}>{prodObj ? prodObj.name : 'Produto'}</td>
                          <td>{cat === 'manutencao' ? 'Manutenção' : 'Limpeza'}</td>
                          <td>{m.type === 'entrada' ? '+ Entrada' : '- Saída'}</td>
                          <td style={{ fontWeight: 800 }}>{m.quantity} {prodObj?.unit || ''}</td>
                          <td>{m.notes || '--'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportMode === 'by_product' && (
            <div className="clean-card print-only-sheet">
              <div className="no-print" style={{ marginBottom: '1.25rem', maxWidth: '360px' }}>
                <label className="form-label">Selecione o Produto</label>
                <select
                  className="form-select"
                  value={selectedReportProductCode}
                  onChange={e => setSelectedReportProductCode(e.target.value)}
                >
                  <option value="">-- Selecione o Produto --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.code}>
                      [{p.category === 'manutencao' ? 'Manutenção' : 'Limpeza'}] {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProductObj && (
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Quantidade</th>
                        <th>Saldo Resultante</th>
                        <th>Observação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productMovementLedger.rows.map(row => (
                        <tr key={row.id}>
                          <td style={{ fontFamily: 'monospace' }}>{row.date}</td>
                          <td>{row.type === 'entrada' ? '+ Entrada' : '- Saída'}</td>
                          <td style={{ fontWeight: 800 }}>{row.quantity} {selectedProductObj.unit}</td>
                          <td style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>{row.balanceAfter} {selectedProductObj.unit}</td>
                          <td>{row.notes || '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
