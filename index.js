// index.js - Logika khusus untuk halaman index.html (Dashboard)

document.addEventListener('DOMContentLoaded', function() {
    // Hanya jalankan kode ini jika berada di halaman index.html atau root path
    const isDashboardPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html');

    if (isDashboardPage) {
        const totalIncomeValueElement = document.getElementById('total-income-value');
        const totalExpensesValueElement = document.getElementById('total-expenses-value');
        const totalSavingsValueElement = document.getElementById('total-savings-value');
        const balanceValueElement = document.getElementById('balance-value');
        const balanceGrowthRateElement = document.getElementById('balance-growth-rate');
        const savingsPercentageElement = document.getElementById('savings-percentage');
        const donutTotalElement = document.querySelector('.donut-total');

        const cashFlowChartCanvas = document.getElementById('cashFlowChart');
        const periodTabs = document.querySelectorAll('.period-tab');

        const dashboardMonthFilter = document.getElementById('annual-month-filter');

        const incomeLegendElement = document.getElementById('income-legend');
        const expensesLegendElement = document.getElementById('expenses-legend');
        const savingsLegendElement = document.getElementById('savings-legend');

        const expenseDistributionChartCanvas = document.getElementById('expenseDistributionChart');
        const expenseDistributionLegendContainer = document.getElementById('expense-distribution-legend');

        console.log('Dashboard Page - cashFlowChartCanvas element:', cashFlowChartCanvas);
        console.log('Dashboard Page - Chart object defined:', typeof Chart !== 'undefined');

        let cashFlowChart;
        let expenseDistributionChart;
        let allCashFlowData = [];

        if (typeof db === 'undefined' || !db) {
            console.error('Firestore is not initialized. Cannot load totals.');
            return;
        }

        async function loadAndDisplayAnnualTotals() {
            console.log('loadAndDisplayAnnualTotals: Function started.');
            try {
                const snapshot = await db.collection('cashflow').get();
                console.log('loadAndDisplayAnnualTotals: Snapshot docs count:', snapshot.docs.length);
                allCashFlowData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log('loadAndDisplayAnnualTotals: allCashFlowData loaded.', allCashFlowData);

                const selectedMonth = dashboardMonthFilter ? dashboardMonthFilter.value : 'All';
                
                let filteredData = selectedMonth === 'All'
                    ? allCashFlowData
                    : allCashFlowData.filter(item => item.month === selectedMonth);
                console.log('loadAndDisplayAnnualTotals: filteredData based on month:', filteredData);

                let totalIncome = 0;
                let totalExpenses = 0;
                let totalSavings = 0;

                filteredData.forEach(item => {
                    const amount = parseFloat(item.amount) || 0;

                    if (item.category === 'Income') {
                        totalIncome += amount;
                    } else if (item.category === 'Expenses') {
                        totalExpenses += amount;
                    } else if (item.category === 'Savings') {
                        totalSavings += amount;
                    }
                });
                console.log('loadAndDisplayAnnualTotals: Calculated Totals (Income, Expenses, Savings) - After ForEach:', totalIncome, totalExpenses, totalSavings);

                console.log('loadAndDisplayAnnualTotals: totalIncome before currentTotalIncome assignment:', totalIncome);
                const currentTotalIncome = totalIncome; 
                console.log('loadAndDisplayAnnualTotals: currentTotalIncome after assignment:', currentTotalIncome);

                const balance = currentTotalIncome - totalExpenses + totalSavings;

                let expensesVsIncomePercentage = 0;
                if (currentTotalIncome > 0) {
                    expensesVsIncomePercentage = (totalExpenses / currentTotalIncome) * 100;
                }

                let savingsPercentage = 0;
                const totalExpensesAndIncome = totalExpenses + currentTotalIncome;
                if (totalExpensesAndIncome > 0) {
                    savingsPercentage = (totalSavings / totalExpensesAndIncome) * 100;
                }

                console.log(`Dashboard Page - Filtered Month: ${selectedMonth}`);
                console.log('Dashboard Page - Calculated Total Income (Filtered/Adjusted):', currentTotalIncome);
                console.log('Dashboard Page - Calculated Total Expenses (Filtered):', totalExpenses);
                console.log('Dashboard Page - Calculated Total Savings (Filtered):', totalSavings);
                console.log('Dashboard Page - Calculated Balance (Based on Filtered/Adjusted Income):', balance);

                if (totalIncomeValueElement) totalIncomeValueElement.textContent = formatRupiah(currentTotalIncome);
                if (totalExpensesValueElement) totalExpensesValueElement.textContent = formatRupiah(totalExpenses);
                if (totalSavingsValueElement) totalSavingsValueElement.textContent = formatRupiah(totalSavings);
                if (balanceValueElement) balanceValueElement.textContent = formatRupiah(balance);
                
                if (balanceGrowthRateElement) {
                    const percentageForDisplay = selectedMonth === 'All' ? expensesVsIncomePercentage : (currentTotalIncome > 0 ? (totalExpenses / currentTotalIncome * 100) : 0);
                    balanceGrowthRateElement.textContent = `${percentageForDisplay.toFixed(2)}% of Income spent`;
                }

                if (savingsPercentageElement) {
                    const totalExpensesAndIncomeFiltered = totalExpenses + currentTotalIncome;
                    const savingsPercentageFiltered = totalExpensesAndIncomeFiltered > 0 ? (totalSavings / totalExpensesAndIncomeFiltered) * 100 : 0;
                    const percentageForDisplay = selectedMonth === 'All' ? savingsPercentage : savingsPercentageFiltered;
                    savingsPercentageElement.textContent = `${percentageForDisplay.toFixed(2)}% Saving from Income`;
                }

                const activePeriodTab = document.querySelector('.period-tab.active');
                const defaultPeriod = activePeriodTab ? activePeriodTab.textContent.trim() : 'Monthly';
                console.log('loadAndDisplayAnnualTotals: Calling updateChartAndLegend with data and period:', allCashFlowData, defaultPeriod);
                updateChartAndLegend(allCashFlowData, defaultPeriod);

                if (expenseDistributionChartCanvas && typeof Chart !== 'undefined') {
                    const expenseData = filteredData.filter(item => item.category === 'Expenses');
                    const aggregatedExpenses = aggregateExpensesByCategory(expenseData);
                    renderExpenseDistributionChart(aggregatedExpenses);
                    updateExpenseDistributionLegend(aggregatedExpenses);
                }

            } catch (error) {
                console.error('Error loading and displaying annual totals:', error);
            }
        }

        dashboardMonthFilter.addEventListener('change', loadAndDisplayAnnualTotals);
        console.log('DOMContentLoaded: Calling loadAndDisplayAnnualTotals for initial load.');
        loadAndDisplayAnnualTotals();

        function updateChartLegend(processedData) {
            // Hitung total dari array data
            const totalIncome = processedData.income.reduce((sum, val) => sum + val, 0);
            const totalExpenses = processedData.expenses.reduce((sum, val) => sum + val, 0);
            const totalSavings = processedData.savings.reduce((sum, val) => sum + val, 0);

            if (incomeLegendElement) incomeLegendElement.textContent = formatRupiah(totalIncome);
            if (expensesLegendElement) expensesLegendElement.textContent = formatRupiah(totalExpenses);
            if (savingsLegendElement) savingsLegendElement.textContent = formatRupiah(totalSavings);
        }

        function processDataForChart(data, period) {
            const aggregatedData = {};

            function getStartOfWeek(date) {
                const d = new Date(date);
                const dayOfWeek = d.getDay();
                const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                d.setDate(d.getDate() - diff);
                d.setHours(0, 0, 0, 0);
                return d.toISOString().split('T')[0];
            }

            data.forEach(item => {
                console.log('Processing item:', item.date, item.category, item.amount);
                const amount = parseFloat(item.amount) || 0;
                const itemDate = new Date(item.date);

                if (isNaN(itemDate.getTime())) {
                    console.warn('Invalid date format in data:', item.date);
                    return;
                }

                let key;
                let groupKey;

                if (period === 'Daily') {
                    key = item.date;
                    groupKey = item.date;
                } else if (period === 'Weekly') {
                    key = getStartOfWeek(itemDate);
                    groupKey = key;
                } else if (period === 'Monthly') {
                    const year = itemDate.getFullYear();
                    const month = (itemDate.getMonth() + 1).toString().padStart(2, '0');
                    key = `${year}-${month}`;
                    groupKey = key;
                } else if (period === 'Yearly') {
                    key = itemDate.getFullYear().toString();
                    groupKey = key;
                }
                console.log('Generated groupKey:', groupKey);

                if (!aggregatedData[groupKey]) {
                    aggregatedData[groupKey] = { Income: 0, Expenses: 0, Savings: 0 };
                }

                if (item.category === 'Income') {
                    aggregatedData[groupKey].Income += amount;
                    console.log('Added Income:', amount, 'to', groupKey);
                } else if (item.category === 'Expenses') {
                    aggregatedData[groupKey].Expenses += amount;
                    console.log('Added Expenses:', amount, 'to', groupKey);
                } else if (item.category === 'Savings') {
                    aggregatedData[groupKey].Savings += amount;
                    console.log('Added Savings:', amount, 'to', groupKey);
                }
            });
            console.log('processDataForChart: Aggregated Data:', aggregatedData);

            const sortedKeys = Object.keys(aggregatedData).sort();
            const labels = sortedKeys.map(key => {
                if (period === 'Monthly') {
                    const [year, monthIndex] = key.split('-');
                    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                    return `${monthNames[parseInt(monthIndex, 10) - 1]} ${year}`;
                } else if (period === 'Weekly') {
                    return `Minggu (${key})`;
                } else if (period === 'Daily' || period === 'Yearly') {
                    return key;
                }
                return key;
            });

            const incomeData = sortedKeys.map(key => aggregatedData[key].Income);
            const expensesData = sortedKeys.map(key => aggregatedData[key].Expenses);
            const savingsData = sortedKeys.map(key => aggregatedData[key].Savings);

            console.log('processDataForChart: Labels, Income, Expenses, Savings data:', labels, incomeData, expensesData, savingsData);
            return { labels, income: incomeData, expenses: expensesData, savings: savingsData };
        }

        function renderCashFlowChart(data, period = 'Monthly') {
            const ctx = cashFlowChartCanvas.getContext('2d');

            if (cashFlowChart) {
                cashFlowChart.destroy();
            }

            const processedData = processDataForChart(data, period);
            console.log('renderCashFlowChart: Processed data for chart:', processedData);
            updateChartLegend(processedData);

            cashFlowChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: processedData.labels,
                    datasets: [
                        {
                            label: 'Pemasukan',
                            data: processedData.income,
                            borderColor: '#9370db',
                            backgroundColor: 'rgba(147, 112, 219, 0.2)',
                            tension: 0.4,
                            fill: true,
                            pointRadius: 5,
                            pointBackgroundColor: '#9370db',
                            pointBorderColor: '#fff',
                            pointHoverRadius: 7
                        },
                        {
                            label: 'Pengeluaran',
                            data: processedData.expenses,
                            borderColor: '#43a047',
                            backgroundColor: 'rgba(67, 160, 71, 0.2)',
                            tension: 0.4,
                            fill: true,
                            pointRadius: 5,
                            pointBackgroundColor: '#43a047',
                            pointBorderColor: '#fff',
                            pointHoverRadius: 7
                        },
                        {
                            label: 'Tabungan',
                            data: processedData.savings,
                            borderColor: '#4169e1',
                            backgroundColor: 'rgba(65, 105, 225, 0.2)',
                            tension: 0.4,
                            fill: true,
                            pointRadius: 5,
                            pointBackgroundColor: '#4169e1',
                            pointBorderColor: '#fff',
                            pointHoverRadius: 7
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `Aliran Kas (${period})`,
                            color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                            font: {
                                size: 16,
                                family: 'Poppins',
                                weight: '600'
                            }
                        },
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += formatRupiah(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return formatRupiah(value);
                                },
                                color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                                font: {
                                    family: 'Poppins'
                                }
                            },
                            grid: {
                                color: getComputedStyle(document.body).getPropertyValue('--border-color'),
                                drawBorder: false
                            }
                        },
                        x: {
                            ticks: {
                                color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                                font: {
                                    family: 'Poppins'
                                }
                            },
                            grid: {
                                color: getComputedStyle(document.body).getPropertyValue('--border-color'),
                                drawBorder: false
                            }
                        }
                    }
                }
            });
        }

        function updateChartAndLegend(data, period) {
            renderCashFlowChart(data, period);
        }

        periodTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                periodTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const selectedPeriod = this.textContent.trim();
                updateChartAndLegend(allCashFlowData, selectedPeriod);
            });
        });

        function aggregateExpensesByCategory(expenseData) {
            const aggregated = {};
            expenseData.forEach(item => {
                aggregated[item.item] = (aggregated[item.item] || 0) + (parseFloat(item.amount) || 0);
            });

            const total = Object.values(aggregated).reduce((sum, amount) => sum + amount, 0);

            const result = Object.entries(aggregated).map(([item, amount]) => ({
                item,
                amount,
                percentage: total > 0 ? (amount / total * 100) : 0
            }));

            result.sort((a, b) => b.amount - a.amount);
            return result;
        }

        function renderExpenseDistributionChart(aggregatedExpenses) {
            const ctx = expenseDistributionChartCanvas.getContext('2d');

            if (expenseDistributionChart) {
                expenseDistributionChart.destroy();
            }

            const labels = aggregatedExpenses.map(item => item.item);
            const dataValues = aggregatedExpenses.map(item => item.amount);
            const percentages = aggregatedExpenses.map(item => item.percentage.toFixed(2));

            const backgroundColors = [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                '#E7E9ED', '#8D6E63', '#9C27B0', '#00BCD4', '#CDDC39', '#FFC107'
            ];

            expenseDistributionChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: dataValues,
                        backgroundColor: backgroundColors.slice(0, labels.length),
                        borderColor: getComputedStyle(document.body).getPropertyValue('--card-bg'),
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Distribusi Pengeluaran',
                            color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                            font: {
                                size: 16,
                                family: 'Poppins',
                                weight: '600'
                            }
                        },
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed !== null) {
                                        label += formatRupiah(context.parsed) + ` (${percentages[context.dataIndex]}%)`;
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }

        function updateExpenseDistributionLegend(aggregatedExpenses) {
            if (expenseDistributionLegendContainer) {
                expenseDistributionLegendContainer.innerHTML = '';
                const backgroundColors = [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                    '#E7E9ED', '#8D6E63', '#9C27B0', '#00BCD4', '#CDDC39', '#FFC107'
                ];

                aggregatedExpenses.forEach((item, index) => {
                    const legendItem = document.createElement('div');
                    legendItem.className = 'legend-item';
                    legendItem.innerHTML = `
                        <div class="legend-color" style="background-color: ${backgroundColors[index % backgroundColors.length]}"></div>
                        <div class="legend-text">${item.item}: ${formatRupiah(item.amount)} (${item.percentage.toFixed(2)}%)</div>
                    `;
                    expenseDistributionLegendContainer.appendChild(legendItem);
                });
            }
        }

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextMonth = new Date(tomorrow);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const loadUpcomingBills = async (startDate = tomorrow, endDate = nextMonth) => {
            const upcomingBillsTableBody = document.querySelector('.upcoming-bills-card tbody');
            if (!upcomingBillsTableBody) {
                console.warn('Upcoming bills table body not found.');
                return;
            }
            upcomingBillsTableBody.innerHTML = '';

            try {
                const snapshot = await db.collection('bills').get();
                let upcomingBills = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).filter(bill => {
                    const dueDateStr = bill.dueDate || bill['due-date'];
                    if (!dueDateStr) return false;

                    const debtDueDate = new Date(dueDateStr);
                    debtDueDate.setHours(0, 0, 0, 0);

                    return debtDueDate >= startDate && debtDueDate < endDate && debt.status !== 'Lunas';
                });

                upcomingBills.sort((a, b) => {
                    const dateA = new Date(a.dueDate || a['due-date'] || '');
                    const dateB = new Date(b.dueDate || b['due-date'] || '');
                    return dateA - dateB;
                });

                if (upcomingBills.length === 0) {
                    const noBillsRow = upcomingBillsTableBody.insertRow();
                    const cell = noBillsRow.insertCell(0);
                    cell.colSpan = 3;
                    cell.textContent = 'Tidak ada tagihan yang akan jatuh tempo dalam periode ini.';
                    cell.style.textAlign = 'center';
                    cell.style.color = 'var(--nav-item-color)';
                } else {
                    upcomingBills.forEach(bill => {
                        const row = upcomingBillsTableBody.insertRow();
                        row.setAttribute('data-id', bill.id);

                        const displayDueDate = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';

                        row.innerHTML = `
                            <td>${bill.platform || bill.name || ''}</td>
                            <td>${displayDueDate}</td>
                            <td>${formatRupiah(bill['monthly-payment'] || bill.amount || 0)}</td>
                        `;
                    });
                }

            } catch (error) {
                console.error('Error loading upcoming bills:', error);
                const errorRow = upcomingBillsTableBody.insertRow();
                const cell = errorRow.insertCell(0);
                cell.colSpan = 3;
                cell.textContent = 'Gagal memuat tagihan mendatang.';
                cell.style.textAlign = 'center';
                cell.style.color = 'red';
            }
        };

        loadUpcomingBills();
        loadAndDisplayAnnualTotals();
        loadAndDisplayGoals();

        async function loadAndDisplayGoals() {
            console.log('loadAndDisplayGoals: Function started.');
            try {
                const budgetTargetsSnapshot = await db.collection('budgetTargets').get();
                const budgetTargetsContainer = document.getElementById('budget-targets-container');
                budgetTargetsContainer.innerHTML = '';

                for (const doc of budgetTargetsSnapshot.docs) {
                    const data = doc.data();
                    const currentMonth = new Date().toLocaleString('id-ID', { month: 'long' });
                    
                    const progress = await calculateBudgetProgress(data.category, currentMonth);
                    const percentage = Math.min((progress / data.targetAmount) * 100, 100);
                    
                    const goalItem = createGoalItem(
                        data.category,
                        progress,
                        data.targetAmount,
                        percentage,
                        'blue'
                    );
                    budgetTargetsContainer.appendChild(goalItem);
                }

                const longTermGoalsSnapshot = await db.collection('longTermGoals').get();
                const longTermGoalsContainer = document.getElementById('long-term-goals-container');
                longTermGoalsContainer.innerHTML = '';

                for (const doc of longTermGoalsSnapshot.docs) {
                    const data = doc.data();
                    const progress = await calculateLongTermGoalProgress(data.name);
                    const percentage = Math.min((progress / data.targetAmount) * 100, 100);
                    
                    const goalItem = createGoalItem(
                        data.name,
                        progress,
                        data.targetAmount,
                        percentage,
                        'purple'
                    );
                    longTermGoalsContainer.appendChild(goalItem);
                }

                const sinkingFundsSnapshot = await db.collection('sinkingFunds').get();
                const sinkingFundsContainer = document.getElementById('sinking-funds-container');
                sinkingFundsContainer.innerHTML = '';

                for (const doc of sinkingFundsSnapshot.docs) {
                    const data = doc.data();
                    const progress = await calculateSinkingFundProgress(data.name);
                    const percentage = Math.min((progress / data.targetAmount) * 100, 100);
                    
                    const goalItem = createGoalItem(
                        data.name,
                        progress,
                        data.targetAmount,
                        percentage,
                        'green'
                    );
                    sinkingFundsContainer.appendChild(goalItem);
                }

            } catch (error) {
                console.error('Error loading goals:', error);
            }
        }

        function createGoalItem(title, current, target, percentage, colorClass) {
            const div = document.createElement('div');
            div.className = 'goal-item';
            
            const remaining = target - current;
            const formattedCurrent = formatRupiah(current);
            const formattedTarget = formatRupiah(target);
            const formattedRemaining = formatRupiah(remaining);

            div.innerHTML = `
                <div class="goal-header">
                    <div class="goal-title">${title}</div>
                    <div class="goal-value">${formattedCurrent} / ${formattedTarget}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress progress-${colorClass}" style="width: ${percentage}%"></div>
                </div>
                <div class="goal-details">
                    <span class="goal-percentage">${percentage.toFixed(1)}%</span>
                    <span class="goal-remaining">Sisa: ${formattedRemaining}</span>
                </div>
            `;
            
            return div;
        }

        async function calculateBudgetProgress(category, month) {
            try {
                const snapshot = await db.collection('cashflow')
                    .where('category', '==', 'Expenses')
                    .where('item', '==', category)
                    .where('month', '==', month)
                    .get();
                
                return snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
            } catch (error) {
                console.error('Error calculating budget progress:', error);
                return 0;
            }
        }

        async function calculateLongTermGoalProgress(goalName) {
            try {
                const snapshot = await db.collection('cashflow')
                    .where('category', '==', 'Savings')
                    .where('item', '==', goalName)
                    .get();
                
                return snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
            } catch (error) {
                console.error('Error calculating long term goal progress:', error);
                return 0;
            }
        }

        async function calculateSinkingFundProgress(fundName) {
            try {
                const snapshot = await db.collection('cashflow')
                    .where('category', '==', 'Savings')
                    .where('item', '==', fundName)
                    .get();
                
                return snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
            } catch (error) {
                console.error('Error calculating sinking fund progress:', error);
                return 0;
            }
        }

    }
}); 