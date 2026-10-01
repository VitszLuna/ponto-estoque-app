import { createClient } from '@supabase/supabase-js';

// Tentar carregar variáveis do .env ou do localStorage para runtime
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('PONTO_SUPABASE_URL') || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('PONTO_SUPABASE_KEY') || '';

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// DADOS INICIAIS DE DEMONSTRAÇÃO (VAZIOS)
// ==========================================
const INITIAL_EMPLOYEES = [];
const INITIAL_TIME_RECORDS = [];
const INITIAL_ALLOWANCES = [];
const INITIAL_PRODUCTS = [];
const INITIAL_STOCK_MOVEMENTS = [];

// Helper para gerenciar o localStorage
const getLocalData = (key, initial) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

const setLocalData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ==========================================
// SERVIÇOS DE DADOS UNIFICADOS (SUPABASE OU LOCAL)
// ==========================================

export const api = {
  // ---------------- FUNCIONÁRIOS ----------------
  employees: {
    async list() {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('employees').select('*').order('name');
        if (!error && data) return data;
      }
      return getLocalData('ponto_employees', INITIAL_EMPLOYEES);
    },

    async create(employeeData) {
      const newEmployee = {
        ...employeeData,
        id: employeeData.id || `emp-${Date.now()}`,
        status: employeeData.status || 'active',
        created_at: new Date().toISOString()
      };

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('employees').insert([newEmployee]).select().single();
        if (!error && data) return data;
      }

      const list = getLocalData('ponto_employees', INITIAL_EMPLOYEES);
      list.push(newEmployee);
      setLocalData('ponto_employees', list);
      return newEmployee;
    },

    async update(id, updates) {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('employees').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      }

      const list = getLocalData('ponto_employees', INITIAL_EMPLOYEES);
      const index = list.findIndex(e => e.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updates };
        setLocalData('ponto_employees', list);
        return list[index];
      }
      return null;
    },

    async toggleStatus(id, newStatus, dismissalDate = null) {
      const updates = {
        status: newStatus,
        dismissal_date: newStatus === 'inactive' ? (dismissalDate || new Date().toISOString().split('T')[0]) : null
      };
      return this.update(id, updates);
    }
  },

  // ---------------- REGISTROS DE PONTO ----------------
  timeRecords: {
    async listByMonth(employeeId, year, month) {
      // month é 1-indexed (1 a 12)
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      // Calcular último dia do mês
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      if (isSupabaseConfigured()) {
        let query = supabase.from('time_records').select('*');
        if (employeeId) query = query.eq('employee_id', employeeId);
        query = query.gte('date', startDate).lte('date', endDate);
        const { data, error } = await query;
        if (!error && data) return data;
      }

      const list = getLocalData('ponto_time_records', INITIAL_TIME_RECORDS);
      return list.filter(r => {
        const matchEmp = !employeeId || r.employee_id === employeeId;
        const matchDate = r.date >= startDate && r.date <= endDate;
        return matchEmp && matchDate;
      });
    },

    async listByDate(dateStr) {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('time_records').select('*').eq('date', dateStr);
        if (!error && data) return data;
      }

      const list = getLocalData('ponto_time_records', INITIAL_TIME_RECORDS);
      return list.filter(r => r.date === dateStr);
    },

    async upsert(recordData) {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('time_records')
          .upsert([recordData], { onConflict: 'employee_id,date' })
          .select()
          .single();
        if (!error && data) return data;
      }

      const list = getLocalData('ponto_time_records', INITIAL_TIME_RECORDS);
      const existingIdx = list.findIndex(r => r.employee_id === recordData.employee_id && r.date === recordData.date);

      let savedRecord;
      if (existingIdx !== -1) {
        list[existingIdx] = { ...list[existingIdx], ...recordData };
        savedRecord = list[existingIdx];
      } else {
        savedRecord = { ...recordData, id: `rec-${Date.now()}` };
        list.push(savedRecord);
      }

      setLocalData('ponto_time_records', list);
      return savedRecord;
    },

    async delete(id) {
      if (isSupabaseConfigured()) {
        await supabase.from('time_records').delete().eq('id', id);
      }
      const list = getLocalData('ponto_time_records', INITIAL_TIME_RECORDS);
      const filtered = list.filter(r => r.id !== id);
      setLocalData('ponto_time_records', filtered);
    }
  },

  // ---------------- ABONOS E FOLGAS ----------------
  allowances: {
    async listByMonth(employeeId, year, month) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      if (isSupabaseConfigured()) {
        let query = supabase.from('allowances').select('*');
        if (employeeId) query = query.eq('employee_id', employeeId);
        query = query.gte('date', startDate).lte('date', endDate);
        const { data, error } = await query;
        if (!error && data) return data;
      }

      const list = getLocalData('ponto_allowances', INITIAL_ALLOWANCES);
      return list.filter(a => {
        const matchEmp = !employeeId || a.employee_id === employeeId;
        const matchDate = a.date >= startDate && a.date <= endDate;
        return matchEmp && matchDate;
      });
    },

    async create(allowanceData) {
      const newAllowance = {
        ...allowanceData,
        id: `alo-${Date.now()}`,
        created_at: new Date().toISOString()
      };

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('allowances').insert([newAllowance]).select().single();
        if (!error && data) return data;
      }

      const list = getLocalData('ponto_allowances', INITIAL_ALLOWANCES);
      list.push(newAllowance);
      setLocalData('ponto_allowances', list);
      return newAllowance;
    },

    async delete(id) {
      if (isSupabaseConfigured()) {
        await supabase.from('allowances').delete().eq('id', id);
      }
      const list = getLocalData('ponto_allowances', INITIAL_ALLOWANCES);
      const filtered = list.filter(a => a.id !== id);
      setLocalData('ponto_allowances', filtered);
    }
  },

  // ---------------- PRODUTOS / ESTOQUE ----------------
  products: {
    async list() {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('products').select('*').order('name');
        if (!error && data) return data;
      }
      return getLocalData('ponto_products', INITIAL_PRODUCTS);
    },

    async create(productData) {
      const newProduct = {
        ...productData,
        id: productData.id || `prod-${Date.now()}`,
        code: (productData.code || `PRD${Date.now()}`).trim().toUpperCase(),
        created_at: new Date().toISOString()
      };

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
        if (!error && data) return data;
      }

      const list = getLocalData('ponto_products', INITIAL_PRODUCTS);
      list.push(newProduct);
      setLocalData('ponto_products', list);
      return newProduct;
    },

    async update(id, updates) {
      if (updates.code) {
        updates.code = updates.code.trim().toUpperCase();
      }
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      }

      const list = getLocalData('ponto_products', INITIAL_PRODUCTS);
      const index = list.findIndex(p => p.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updates };
        setLocalData('ponto_products', list);
        return list[index];
      }
      return null;
    },

    async delete(id) {
      if (isSupabaseConfigured()) {
        await supabase.from('products').delete().eq('id', id);
      }
      const list = getLocalData('ponto_products', INITIAL_PRODUCTS);
      const filtered = list.filter(p => p.id !== id);
      setLocalData('ponto_products', filtered);
    }
  },

  // ---------------- MOVIMENTAÇÕES DE ESTOQUE ----------------
  stockMovements: {
    async list() {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('stock_movements').select('*').order('date', { ascending: false });
        if (!error && data) return data;
      }
      const list = getLocalData('ponto_stock_movements', INITIAL_STOCK_MOVEMENTS);
      return list.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
    },

    async listByDate(dateStr) {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('stock_movements').select('*').eq('date', dateStr);
        if (!error && data) return data;
      }
      const list = getLocalData('ponto_stock_movements', INITIAL_STOCK_MOVEMENTS);
      return list.filter(m => m.date === dateStr);
    },

    async listByProduct(productCodeOrId) {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('stock_movements')
          .select('*')
          .or(`product_id.eq.${productCodeOrId},product_code.eq.${productCodeOrId}`);
        if (!error && data) return data;
      }
      const list = getLocalData('ponto_stock_movements', INITIAL_STOCK_MOVEMENTS);
      return list.filter(m => m.product_id === productCodeOrId || m.product_code === productCodeOrId);
    },

    async create(movementData) {
      const newMovement = {
        ...movementData,
        id: `mov-${Date.now()}`,
        product_code: movementData.product_code ? movementData.product_code.trim().toUpperCase() : '',
        quantity: Number(movementData.quantity),
        date: movementData.date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('stock_movements').insert([newMovement]).select().single();
        if (!error && data) return data;
      }

      const list = getLocalData('ponto_stock_movements', INITIAL_STOCK_MOVEMENTS);
      list.push(newMovement);
      setLocalData('ponto_stock_movements', list);
      return newMovement;
    },

    async delete(id) {
      if (isSupabaseConfigured()) {
        await supabase.from('stock_movements').delete().eq('id', id);
      }
      const list = getLocalData('ponto_stock_movements', INITIAL_STOCK_MOVEMENTS);
      const filtered = list.filter(m => m.id !== id);
      setLocalData('ponto_stock_movements', filtered);
    }
  }
};

