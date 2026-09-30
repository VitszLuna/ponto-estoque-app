import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import EmployeeManagement from './components/EmployeeManagement';
import TimesheetReport from './components/TimesheetReport';
import StockManagement from './components/StockManagement';
import LoginPage from './components/LoginPage';
import TimeClockModal from './components/TimeClockModal';
import SupabaseConfigModal from './components/SupabaseConfigModal';
import { api } from './lib/supabaseClient';

export default function App() {
  // Autenticação & Sessão de Usuário
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ponto_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'employees', 'timesheet', 'stock'
  const [theme, setTheme] = useState('light');

  const [employees, setEmployees] = useState([]);
  const [timeRecords, setTimeRecords] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Estados de Estoque e Produtos
  const [products, setProducts] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);

  // Modais
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [modalEmployeeId, setModalEmployeeId] = useState('');
  const [modalDate, setModalDate] = useState('');

  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Carregar dados
  const loadData = async () => {
    try {
      const empList = await api.employees.list();
      setEmployees(empList || []);

      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const recList = await api.timeRecords.listByMonth(null, year, month);
      setTimeRecords(recList || []);

      const prodList = await api.products.list();
      setProducts(prodList || []);

      const movList = await api.stockMovements.list();
      setStockMovements(movList || []);

      if (empList && empList.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(empList[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('ponto_user_session');
    setCurrentUser(null);
  };

  // Salvar registro de ponto
  const handleSaveTimeRecord = async (recordData) => {
    await api.timeRecords.upsert(recordData);
    await loadData();
  };

  // Gerenciamento de Funcionários
  const handleSaveEmployee = async (employeeData) => {
    if (employeeData.id) {
      await api.employees.update(employeeData.id, employeeData);
    } else {
      await api.employees.create(employeeData);
    }
    await loadData();
  };

  const handleToggleEmployeeStatus = async (id, newStatus, dismissalDate) => {
    await api.employees.toggleStatus(id, newStatus, dismissalDate);
    await loadData();
  };

  // Gerenciamento de Produtos e Estoque
  const handleSaveProduct = async (productData) => {
    if (productData.id) {
      await api.products.update(productData.id, productData);
    } else {
      await api.products.create(productData);
    }
    await loadData();
  };

  const handleDeleteProduct = async (id) => {
    await api.products.delete(id);
    await loadData();
  };

  const handleSaveMovement = async (movementData) => {
    await api.stockMovements.create(movementData);
    await loadData();
  };

  const handleDeleteMovement = async (id) => {
    await api.stockMovements.delete(id);
    await loadData();
  };

  const handleOpenTimeModal = (empId = '', dateStr = '') => {
    setModalEmployeeId(empId);
    setModalDate(dateStr);
    setIsTimeModalOpen(true);
  };

  const handleSelectForTimesheet = (empId) => {
    setSelectedEmployeeId(empId);
    setActiveTab('timesheet');
  };

  // TELA DE LOGIN OBRIGATÓRIA SE NÃO TIVER SESSÃO
  if (!currentUser) {
    return <LoginPage onLoginSuccess={(userData) => setCurrentUser(userData)} />;
  }

  return (
    <div className="app-container">
      {/* NAVEGAÇÃO SUPERIOR */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* CONTEÚDO DA PÁGINA */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            employees={employees}
            timeRecords={timeRecords}
            onOpenTimeModal={handleOpenTimeModal}
            onOpenEmployeeModal={() => setActiveTab('employees')}
            onNavigateToTimesheet={handleSelectForTimesheet}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeManagement
            employees={employees}
            onSaveEmployee={handleSaveEmployee}
            onToggleStatus={handleToggleEmployeeStatus}
            onSelectForTimesheet={handleSelectForTimesheet}
          />
        )}

        {activeTab === 'timesheet' && (
          <TimesheetReport
            employees={employees}
            timeRecords={timeRecords}
            selectedEmployeeId={selectedEmployeeId}
            onSelectEmployee={setSelectedEmployeeId}
            onOpenTimeModal={handleOpenTimeModal}
          />
        )}

        {activeTab === 'stock' && (
          <StockManagement
            products={products}
            stockMovements={stockMovements}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onSaveMovement={handleSaveMovement}
            onDeleteMovement={handleDeleteMovement}
          />
        )}
      </main>

      {/* MODAIS GLOBAIS */}
      <TimeClockModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        employees={employees}
        timeRecords={timeRecords}
        initialEmployeeId={modalEmployeeId}
        initialDate={modalDate}
        onSave={handleSaveTimeRecord}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
