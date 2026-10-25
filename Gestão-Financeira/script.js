document.addEventListener('DOMContentLoaded', () => {
  let transactions = JSON.parse(localStorage.getItem('vilar_transactions')) || [];

  const totalIncomeEl = document.getElementById('totalIncome');
  const totalExpenseEl = document.getElementById('totalExpense');
  const netBalanceEl = document.getElementById('netBalance');
  const transactionForm = document.getElementById('transactionForm');
  const descriptionInput = document.getElementById('description');
  const amountInput = document.getElementById('amount');
  const typeInput = document.getElementById('type');
  const categoryInput = document.getElementById('category');
  const transactionsList = document.getElementById('transactionsList');
  const clearAllBtn = document.getElementById('clearAllBtn');

  let expenseChart = null;

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const updateSummary = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    totalIncomeEl.textContent = formatCurrency(income);
    totalExpenseEl.textContent = formatCurrency(expense);
    netBalanceEl.textContent = formatCurrency(balance);
  };

  const renderTransactions = () => {
    transactionsList.innerHTML = '';
    
    if (transactions.length === 0) {
      transactionsList.innerHTML = '<p style="text-align:center; color: var(--text-muted); font-size: 0.9rem; padding: 20px 0;">Nenhuma movimentação registrada.</p>';
      return;
    }

    transactions.slice().reverse().forEach(t => {
      const item = document.createElement('div');
      item.classList.add('transaction-item');
      
      const isIncome = t.type === 'income';
      const sign = isIncome ? '+ ' : '- ';

      item.innerHTML = `
        <div class="transaction-info">
          <strong>${t.description}</strong>
          <small>${t.category}</small>
        </div>
        <div class="transaction-amount ${t.type}">
          <span>${sign}${formatCurrency(t.amount)}</span>
          <button class="delete-btn" onclick="removeTransaction(${t.id})">&times;</button>
        </div>
      `;
      transactionsList.appendChild(item);
    });
  };

  const updateChart = () => {
    const canvasElement = document.getElementById('expenseChart');
    if (!canvasElement) return;

    // Categorias de despesas mapeadas no gráfico
    const expenseCategories = ['Alimentação', 'Moradia', 'Telefone', 'Estudos', 'Lazer', 'Transporte', 'Outros'];
    
    const categoryTotals = expenseCategories.map(cat => {
      return transactions
        .filter(t => t.type === 'expense' && t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0);
    });

    const ctx = canvasElement.getContext('2d');

    if (expenseChart) {
      expenseChart.destroy();
    }

    const totalExpensesSum = categoryTotals.reduce((a, b) => a + b, 0);
    const dataValues = totalExpensesSum === 0 ? [1, 1, 1, 1, 1, 1, 1] : categoryTotals;
    const backgroundColors = totalExpensesSum === 0 
      ? ['#27272a', '#27272a', '#27272a', '#27272a', '#27272a', '#27272a', '#27272a'] 
      : ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16']; // Cores vivas para as 7 categorias

    expenseChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: expenseCategories,
        datasets: [{
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: '#121214',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { 
              color: '#a1a1aa', 
              font: { size: 11 },
              boxWidth: 12
            }
          }
        }
      }
    });
  };

  transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newTransaction = {
      id: Date.now(),
      description: descriptionInput.value.trim(),
      amount: parseFloat(amountInput.value),
      type: typeInput.value,
      category: categoryInput.value
    };

    transactions.push(newTransaction);
    localStorage.setItem('vilar_transactions', JSON.stringify(transactions));

    transactionForm.reset();
    initApp();
  });

  window.removeTransaction = (id) => {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('vilar_transactions', JSON.stringify(transactions));
    initApp();
  };

  clearAllBtn.addEventListener('click', () => {
    if (confirm('Deseja realmente apagar todas as transações?')) {
      transactions = [];
      localStorage.removeItem('vilar_transactions');
      initApp();
    }
  });

  const initApp = () => {
    updateSummary();
    renderTransactions();
    updateChart();
  };

  initApp();
});