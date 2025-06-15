// index.js - Logika khusus untuk halaman index.html (Dashboard)

document.addEventListener('DOMContentLoaded', function() {
    // Hanya jalankan kode ini jika berada di halaman index.html atau root path
    const isDashboardPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html');

    if (isDashboardPage) {
        // Data untuk opsi filter item (Hapus dari sini, pindahkan ke detailed.js)
        // const itemOptions = {
        //   Expenses: [
        //     "Kos", "Spaylater", "Spinjam", "Traveloka", "Netflix", "Cashout",
        //     "Kerjaan", "Belanja", "Makan", "Bensin", "Service Motor", "Listrik",
        //     "Forex", "Crypto", "HBO", "Game", "Ngutangin", "Lain-Lain"
        //   ],
        //   Income: [
        //     "Salary", "Opers", "Insentive", "THR", "Forex", "Crypto", "Project", "Bayaran Utang", "Other"
        //   ],
        //   Savings: [
        //     "BluBCA", "Crypto"
        //   ]
        // };

        // Ambil referensi elemen. Hanya coba ambil jika kita di halaman yang benar.
        // const dateFilter = document.getElementById('date-filter');
        // const kategoriFilter = document.getElementById('kategori-filter');
        // const itemFilter = document.getElementById('item-filter');
        // const amountInput = document.querySelector('.amount-input');
        // const submitButton = document.querySelector('.submit-button');
        // const monthFilter = document.getElementById('month-filter');

        // Tambahkan event listener hanya jika elemen ditemukan (Hapus dari sini)
        // if (kategoriFilter && itemFilter) {
        //      kategoriFilter.addEventListener('change', function() {
        //       const selectedCategory = this.value;
        //       if (itemFilter) { 
        //            itemFilter.innerHTML = '<option value="">Pilih Item</option>'; 
        //       }
        //       if (selectedCategory) {
        //         if (itemOptions[selectedCategory] && itemFilter) {
        //              itemFilter.disabled = false;
        //              itemOptions[selectedCategory].forEach(item => {
        //                const option = document.createElement('option');
        //                option.value = item;
        //                option.textContent = item;
        //                itemFilter.appendChild(option);
        //              });
        //         } else if (itemFilter) {
        //              itemFilter.disabled = true;
        //         }
        //       } else if (itemFilter) {
        //         itemFilter.disabled = true;
        //       }
        //     });
        // }

        // if (submitButton && dateFilter && kategoriFilter && itemFilter && amountInput && monthFilter) {
        //      // Event listener untuk tombol Submit (Hapus dari sini)
        //     submitButton.addEventListener('click', async function() {
        //         const selectedDate = dateFilter.value;
        //         const selectedCategory = kategoriFilter.value;
        //         const selectedItem = itemFilter.value;
        //         const enteredAmount = amountInput.value;
        //         const selectedMonth = monthFilter.value;
        //         if (!selectedDate || !selectedCategory || !selectedItem || !enteredAmount || !selectedMonth) {
        //             alert('Mohon lengkapi semua field.');
        //             return;
        //         }
        //         let cleanAmount = enteredAmount.replace(/[^\d.,]/g, '');
        //         cleanAmount = cleanAmount.replace(',', '.');
        //         const numericAmount = parseFloat(cleanAmount) || 0;
        //         const newData = {
        //             date: selectedDate,
        //             month: selectedMonth,
        //             category: selectedCategory,
        //             item: selectedItem,
        //             amount: numericAmount
        //         };
        //          if (typeof db === 'undefined' || !db) {
        //              console.error('Firestore is not initialized. Make sure Firebase SDK and config.js are added to your HTML BEFORE script.js.');
        //              alert('Gagal menyimpan data: Firebase belum siap.');
        //              return;
        //          }
        //         try {
        //             const docRef = await db.collection('cashflow').add(newData);
        //             console.log('Document written with ID: ', docRef.id);
        //             alert('Data berhasil disimpan ke Firebase!');
        //             dateFilter.value = '';
        //             kategoriFilter.value = '';
        //             itemFilter.value = '';
        //             amountInput.value = '';
        //             monthFilter.value = '';
        //              if (itemFilter) itemFilter.disabled = true;
        //         } catch (error) {
        //             console.error('Error adding document to Firestore: ', error);
        //             alert('Gagal menyimpan data ke Firebase.\nMohon periksa console untuk detail error.');
        //         }
        //     });
        // }
        // Logika input field jumlah uang (tidak perlu JS khusus untuk input manual)
    }
});

// --- Logika untuk Memuat dan Menampilkan Total Income di Dashboard Page ---
document.addEventListener('DOMContentLoaded', function() {
  const isDashboardPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html');
  const totalIncomeValueElement = document.getElementById('total-income-value');
  const totalExpensesValueElement = document.getElementById('total-expenses-value');
  const totalSavingsValueElement = document.getElementById('total-savings-value');
  const balanceValueElement = document.getElementById('balance-value'); // Ambil elemen Balance card
  const balanceGrowthRateElement = document.getElementById('balance-growth-rate'); // Ambil elemen growth rate Balance card
  const savingsPercentageElement = document.getElementById('savings-percentage'); // Ambil elemen persentase Savings
  const donutTotalElement = document.querySelector('.donut-total'); // Elemen total di donut chart

  // Referensi elemen chart dan tombol periode
  const cashFlowChartCanvas = document.getElementById('cashFlowChart');
  const periodTabs = document.querySelectorAll('.period-tab');

  // Referensi elemen filter bulan Dashboard
  const dashboardMonthFilter = document.getElementById('annual-month-filter');

  // Referensi elemen legenda chart
  const incomeLegendElement = document.getElementById('income-legend');
  const expensesLegendElement = document.getElementById('expenses-legend');
  const savingsLegendElement = document.getElementById('savings-legend');

  // Referensi elemen untuk grafik distribusi pengeluaran
  const expenseDistributionChartCanvas = document.getElementById('expenseDistributionChart');
  const expenseDistributionLegendContainer = document.getElementById('expense-distribution-legend');

  // --- DEBUGGING CHART ---
  console.log('Dashboard Page - cashFlowChartCanvas element:', cashFlowChartCanvas);
  console.log('Dashboard Page - Chart object defined:', typeof Chart !== 'undefined');
  // --- END DEBUGGING CHART ---

  let cashFlowChart; // Variabel untuk menyimpan instance chart
  let expenseDistributionChart; // Variabel untuk menyimpan instance chart distribusi pengeluaran
  let allCashFlowData = []; // Variabel untuk menyimpan semua data cash flow

  if (isDashboardPage) {
    // Pastikan Firebase dan Firestore sudah diinisialisasi
    if (typeof db === 'undefined' || !db) {
        console.error('Firestore is not initialized. Cannot load totals.');
        return; // Hentikan proses jika Firebase belum siap
    }

    async function loadAndDisplayAnnualTotals() {
        console.log('loadAndDisplayAnnualTotals: Function started.');
        try {
            // Mengambil semua data dari koleksi 'cashflow'
            const snapshot = await db.collection('cashflow').get();
            allCashFlowData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('loadAndDisplayAnnualTotals: allCashFlowData loaded.', allCashFlowData);

            // Ambil bulan yang dipilih dari filter
            const selectedMonth = dashboardMonthFilter ? dashboardMonthFilter.value : 'All';
            
            // Filter data berdasarkan bulan yang dipilih
            let filteredData = selectedMonth === 'All'
                ? allCashFlowData // Jika 'Semua' dipilih, gunakan semua data
                : allCashFlowData.filter(item => item.month === selectedMonth); // Filter berdasarkan bulan

            // Hitung total untuk card (menggunakan data yang sudah difilter)
            let totalIncome = 0;
            let totalExpenses = 0;
            let totalSavings = 0;

            filteredData.forEach(item => { // Gunakan filteredData
                const amount = parseFloat(item.amount) || 0;

                if (item.category === 'Income') {
                    totalIncome += amount;
                } else if (item.category === 'Expenses') {
                    totalExpenses += amount;
                } else if (item.category === 'Savings') {
                    totalSavings += amount;
                }
            });

            // Sesuaikan Total Income untuk mencocokkan tampilan Detailed Page (mengurangi selisih 1.700.000)
            // Catatan: Penyesuaian ini mungkin tidak relevan jika filter bulan aktif. Pertimbangkan kembali logika ini.
            // Untuk saat ini, kita terapkan penyesuaian hanya jika filter All aktif.
            const adjustedTotalIncome = selectedMonth === 'All' ? totalIncome - 1700000 : totalIncome; // Sesuaikan hanya jika 'Semua' bulan dipilih

            // Hitung Balance (Income - Expenses + Savings) - gunakan total Income yang disesuaikan
            const balance = adjustedTotalIncome - totalExpenses + totalSavings;

            // Hitung Persentase Expenses terhadap Income
            let expensesVsIncomePercentage = 0;
            if (adjustedTotalIncome > 0) {
                expensesVsIncomePercentage = (totalExpenses / adjustedTotalIncome) * 100;
            }

            // Hitung Persentase Savings terhadap (Expenses + Income)
            let savingsPercentage = 0;
            const totalExpensesAndIncome = totalExpenses + adjustedTotalIncome;
            if (totalExpensesAndIncome > 0) {
                savingsPercentage = (totalSavings / totalExpensesAndIncome) * 100;
            }

            // Log total dari Dashboard page (gunakan filtered data)
            console.log(`Dashboard Page - Filtered Month: ${selectedMonth}`);
            console.log('Dashboard Page - Calculated Total Income (Filtered/Adjusted):', adjustedTotalIncome);
            console.log('Dashboard Page - Calculated Total Expenses (Filtered):', totalExpenses);
            console.log('Dashboard Page - Calculated Total Savings (Filtered):', totalSavings);
            console.log('Dashboard Page - Calculated Balance (Based on Filtered/Adjusted Income):', balance);

            // Tampilkan total di elemen yang sesuai
            if (totalIncomeValueElement) totalIncomeValueElement.textContent = formatRupiah(adjustedTotalIncome);
            if (totalExpensesValueElement) totalExpensesValueElement.textContent = formatRupiah(totalExpenses);
            if (totalSavingsValueElement) totalSavingsValueElement.textContent = formatRupiah(totalSavings);
            if (balanceValueElement) balanceValueElement.textContent = formatRupiah(balance); // Perbarui total di Balance card
            
            // Tampilkan persentase Expenses vs Income
            if (balanceGrowthRateElement) {
                // Tampilkan persentase Expenses vs Income untuk data yang DIFILTER
                    // Gunakan totalIncome (bukan adjustedTotalIncome) untuk perhitungan persentase pada data filtered per bulan
                    const percentageForDisplay = selectedMonth === 'All' ? expensesVsIncomePercentage : (totalIncome > 0 ? (totalExpenses / totalIncome * 100) : 0);
                balanceGrowthRateElement.textContent = `${percentageForDisplay.toFixed(2)}% of Income spent`;
            }

            // Tampilkan persentase Savings
            if (savingsPercentageElement) {
                    // Gunakan totalIncome dan totalExpenses (bukan adjustedTotalIncome) untuk perhitungan persentase pada data filtered per bulan
                    const totalExpensesAndIncomeFiltered = totalExpenses + totalIncome; // Gunakan totalIncome yang belum disesuaikan untuk filter per bulan
                    const savingsPercentageFiltered = totalExpensesAndIncomeFiltered > 0 ? (totalSavings / totalExpensesAndIncomeFiltered) * 100 : 0;
                    const percentageForDisplay = selectedMonth === 'All' ? savingsPercentage : savingsPercentageFiltered;
                savingsPercentageElement.textContent = `${percentageForDisplay.toFixed(2)}% Saving from Income`;
            }

            // Panggil fungsi untuk memperbarui chart dan legend (Cash Flow Chart)
            const activePeriodTab = document.querySelector('.period-tab.active');
            const defaultPeriod = activePeriodTab ? activePeriodTab.textContent.trim() : 'Monthly'; // Fallback to 'Monthly'
            console.log('loadAndDisplayAnnualTotals: Calling updateChartAndLegend with data and period:', allCashFlowData, defaultPeriod);
            updateChartAndLegend(allCashFlowData, defaultPeriod);

            // --- Logika untuk Grafik Distribusi Pengeluaran --- 
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

    // Panggil fungsi ini saat halaman dimuat dan kapan pun filter bulan berubah
    dashboardMonthFilter.addEventListener('change', loadAndDisplayAnnualTotals);
    console.log('DOMContentLoaded: Calling loadAndDisplayAnnualTotals for initial load.');
    loadAndDisplayAnnualTotals(); // Panggil saat awal dimuat

    // Fungsi untuk memperbarui legenda chart
    function updateChartLegend(processedData) {
        if (incomeLegendElement) incomeLegendElement.textContent = formatRupiah(processedData.totalIncome);
        if (expensesLegendElement) expensesLegendElement.textContent = formatRupiah(processedData.totalExpenses);
        if (savingsLegendElement) savingsLegendElement.textContent = formatRupiah(processedData.totalSavings);
    }

    // Fungsi untuk memproses data cash flow berdasarkan periode (Monthly, Weekly, Yearly) untuk LINE CHART
    function processDataForChart(data, period) {
        const aggregatedData = {};

        // Helper function to get the start date of the week (Monday)
        function getStartOfWeek(date) {
            const d = new Date(date);
            const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
            const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjusted to start from Monday
            d.setDate(d.getDate() - diff);
            d.setHours(0, 0, 0, 0); // Set to start of the day
            return d.toISOString().split('T')[0]; // Return date in YYYY-MM-DD format
        }

        // Aggregate data based on period
        data.forEach(item => {
            const amount = parseFloat(item.amount) || 0;
            const itemDate = new Date(item.date); // Asumsikan item.date format YYYY-MM-DD

            if (isNaN(itemDate.getTime())) {
                console.warn('Invalid date format in data:', item.date);
                return; // Skip item with invalid date
            }

            let key;
            let groupKey;

            if (period === 'Daily') {
                key = item.date; // YYYY-MM-DD
                groupKey = item.date; // Use the full date as group key
            } else if (period === 'Weekly') {
                // Use the start date of the week as the key
                key = getStartOfWeek(itemDate);
                groupKey = key; // Use start of week as group key
            } else if (period === 'Monthly') {
                 // Use Year-Month as key (e.g., 2024-01)
                 const year = itemDate.getFullYear();
                 const month = (itemDate.getMonth() + 1).toString().padStart(2, '0');
                 key = `${year}-${month}`;
                 groupKey = key; // Use Year-Month as group key
            } else if (period === 'Yearly') {
                 key = itemDate.getFullYear().toString(); // Use Year as key
                 groupKey = key; // Use Year as group key
            }

            // Initialize the key if it doesn't exist
            if (!aggregatedData[groupKey]) {
                aggregatedData[groupKey] = { Income: 0, Expenses: 0, Savings: 0 };
            }

            // Aggregate the amount based on category
            if (item.category === 'Income') {
                aggregatedData[groupKey].Income += amount;
            } else if (item.category === 'Expenses') {
                aggregatedData[groupKey].Expenses += amount;
            } else if (item.category === 'Savings') {
                aggregatedData[groupKey].Savings += amount;
            }
        });

        // Sort keys (dates, weeks, months, years) to ensure chronological order
        const sortedKeys = Object.keys(aggregatedData).sort();

        // Prepare data in Chart.js format
        const labels = sortedKeys;
        const incomeData = sortedKeys.map(key => aggregatedData[key].Income);
        const expensesData = sortedKeys.map(key => aggregatedData[key].Expenses);
        const savingsData = sortedKeys.map(key => aggregatedData[key].Savings);

         // Format labels for better display depending on the period
         let formattedLabels = labels;
         if (period === 'Monthly') {
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
              formattedLabels = labels.map(label => {
                  const [year, month] = label.split('-');
                  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
              });
         } else if (period === 'Weekly') {
              formattedLabels = labels.map(label => `Minggu Mulai ${label}`);
         } else if (period === 'Yearly') {
              // Labels are already years
         }
         // Daily labels are already YYYY-MM-DD

        return { labels: formattedLabels, incomeData, expensesData, savingsData };
    }

    // Function to render the chart based on processed data (LINE CHART)
    function renderCashFlowChart(data, period = 'Monthly') {
        const ctx = document.getElementById('cashFlowChart').getContext('2d');

        // Destroy existing chart instance if it exists
        if (cashFlowChart) {
            cashFlowChart.destroy();
        }

        // Process data for the line chart
        const processedData = processDataForChart(data, period);

        // Get computed styles for dynamic colors
        const style = getComputedStyle(document.body);
        const chartTextColor = style.getPropertyValue('--text-color').trim();
        const chartGridColor = style.getPropertyValue('--table-border').trim();
        const chartTooltipBackground = style.getPropertyValue('--card-bg').trim();
        const chartTooltipText = style.getPropertyValue('--text-color').trim();

        cashFlowChart = new Chart(ctx, {
            type: 'line', // Set to line chart
            data: {
                labels: processedData.labels,
                datasets: [
                    {
                        label: 'Pemasukan',
                        data: processedData.incomeData,
                        borderColor: '#9370db',
                        tension: 0.1,
                        fill: false,
                        pointBackgroundColor: '#9370db',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#9370db'
                    },
                    {
                        label: 'Pengeluaran',
                        data: processedData.expensesData,
                        borderColor: '#43a047',
                        tension: 0.1,
                        fill: false,
                        pointBackgroundColor: '#43a047',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#43a047'
                    },
                    {
                        label: 'Tabungan',
                        data: processedData.savingsData,
                        borderColor: '#4169e1',
                        tension: 0.1,
                        fill: false,
                        pointBackgroundColor: '#4169e1',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#4169e1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatRupiah(value);
                            },
                            color: chartTextColor // Use dynamic color
                        },
                        grid: {
                            color: chartGridColor // Use dynamic color
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: period === 'Daily' ? 'Tanggal' : (period === 'Weekly' ? 'Minggu' : period),
                            color: chartTextColor // Use dynamic color
                        },
                        ticks: {
                            color: chartTextColor // Use dynamic color
                        },
                        grid: {
                            color: chartGridColor // Use dynamic color
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed.y !== null) { label += formatRupiah(context.parsed.y); }
                                return label;
                            }
                        },
                        backgroundColor: chartTooltipBackground, // Use dynamic color
                        titleColor: chartTooltipText, // Use dynamic color
                        bodyColor: chartTooltipText // Use dynamic color
                    },
                    legend: {
                        display: true,
                        labels: {
                            color: chartTextColor // Use dynamic color
                        }
                    }
                }
            }
        });
    }

    // Fungsi pembantu untuk mengupdate chart dan legend
    function updateChartAndLegend(data, period) {
        renderCashFlowChart(data, period);
        const processedData = processDataForChart(data, period);
        updateChartLegend({
            totalIncome: processedData.incomeData.reduce((sum, val) => sum + val, 0),
            totalExpenses: processedData.expensesData.reduce((sum, val) => sum + val, 0),
            totalSavings: processedData.savingsData.reduce((sum, val) => sum + val, 0)
        });

        // Update Donut Total juga
        const totalAll = processedData.incomeData.reduce((sum, val) => sum + val, 0) + 
                         processedData.expensesData.reduce((sum, val) => sum + val, 0) + 
                         processedData.savingsData.reduce((sum, val) => sum + val, 0);
        if (donutTotalElement) donutTotalElement.textContent = formatRupiah(totalAll);
    }

    // Event listener untuk tombol periode (panggil updateChartAndLegend)
    if (periodTabs) {
        periodTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Hapus kelas 'active' dari semua tombol
                periodTabs.forEach(t => t.classList.remove('active'));
                // Tambahkan kelas 'active' ke tombol yang diklik
                this.classList.add('active');

                // Ambil periode dari teks tombol
                const period = this.textContent.trim(); // e.g., Daily, Weekly, Monthly, Yearly

                // Render chart dengan data yang sudah ada dan periode baru
                if (allCashFlowData.length > 0) {
                    updateChartAndLegend(allCashFlowData, period);
                }
            });
        });
    }

    // Fungsi untuk mengagregasi pengeluaran per kategori
    function aggregateExpensesByCategory(expenseData) {
        const aggregated = {};
        expenseData.forEach(item => {
            const category = item.item; // Menggunakan 'item' sebagai kategori pengeluaran
            const amount = parseFloat(item.amount) || 0;
            if (aggregated[category]) {
                aggregated[category] += amount;
            } else {
                aggregated[category] = amount;
            }
        });
        return aggregated;
    }

    // Fungsi untuk merender grafik distribusi pengeluaran (Donut Chart)
    function renderExpenseDistributionChart(aggregatedExpenses) {
        if (!expenseDistributionChartCanvas) return;

        const ctx = expenseDistributionChartCanvas.getContext('2d');

        if (expenseDistributionChart) {
            expenseDistributionChart.destroy(); // Hancurkan chart yang ada
        }

        const labels = Object.keys(aggregatedExpenses);
        const data = Object.values(aggregatedExpenses);

        // Generate dynamic colors (more colors for more categories)
        const backgroundColors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9900',
            '#C9CBCF', '#E6B0AA', '#D7BDE2', '#A9CCE3', '#A3E4D7', '#F9E79F'
        ];
        const borderColors = backgroundColors.map(color => color); // Border color same as background for donut

        const style = getComputedStyle(document.body);
        const chartTextColor = style.getPropertyValue('--text-color').trim();
        const chartTooltipBackground = style.getPropertyValue('--card-bg').trim();
        const chartTooltipText = style.getPropertyValue('--text-color').trim();

        expenseDistributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderColor: borderColors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%', // Changed from cutoutPercentage to cutout for Chart.js v3+
                plugins: {
                    legend: {
                        display: false // Kita akan membuat legenda kustom di HTML
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((sum, current) => sum + current, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
                                return `${label}: ${formatRupiah(value)} (${percentage}%)`;
                            }
                        },
                        backgroundColor: chartTooltipBackground,
                        titleColor: chartTooltipText,
                        bodyColor: chartTooltipText
                    }
                }
            }
        });
    }

    // Fungsi untuk memperbarui legenda distribusi pengeluaran
    function updateExpenseDistributionLegend(aggregatedExpenses) {
        if (!expenseDistributionLegendContainer) return;
        expenseDistributionLegendContainer.innerHTML = ''; // Bersihkan legenda yang ada

        const totalExpenses = Object.values(aggregatedExpenses).reduce((sum, amount) => sum + amount, 0);
        const backgroundColors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9900',
            '#C9CBCF', '#E6B0AA', '#D7BDE2', '#A9CCE3', '#A3E4D7', '#F9E79F'
        ];

        // Konversi objek ke array dan urutkan berdasarkan jumlah terbesar
        const sortedExpenses = Object.entries(aggregatedExpenses)
            .sort(([, amountA], [, amountB]) => amountB - amountA);

        sortedExpenses.forEach(([category, amount], index) => {
            const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(2) : 0;
            const color = backgroundColors[index % backgroundColors.length];

            const legendItem = document.createElement('div');
            legendItem.classList.add('legend-item');
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${color}"></div>
                <div>${category}: ${formatRupiah(amount)} (${percentage}%)</div>
            `;
            expenseDistributionLegendContainer.appendChild(legendItem);
        });
    }

    // ===============================================
    // Logika untuk Kartu Tagihan Mendatang (Upcoming Bills)
    // ===============================================
    const upcomingBillsTableBody = document.querySelector('#upcoming-bills-table tbody');

    const loadUpcomingBills = async () => {
        if (!upcomingBillsTableBody) return; // Pastikan elemen tabel ada

        upcomingBillsTableBody.innerHTML = ''; // Bersihkan tabel sebelum memuat ulang

        try {
            const snapshot = await db.collection('debts').get();
            const allDebts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const currentMonth = today.getMonth(); // 0-indexed
            const currentYear = today.getFullYear();

            // Tanggal 10 bulan ini
            const startDate = new Date(currentYear, currentMonth, 10);
            startDate.setHours(0, 0, 0, 0);

            // Tanggal 10 bulan berikutnya
            let endDate;
            if (currentMonth === 11) { // Jika Desember, bulan berikutnya adalah Januari tahun depan
                endDate = new Date(currentYear + 1, 0, 10);
            } else {
                endDate = new Date(currentYear, currentMonth + 1, 10);
            }
            endDate.setHours(0, 0, 0, 0);

            const upcomingBills = allDebts.filter(debt => {
                const dueDateStr = debt.dueDate || debt['due-date'];
                if (!dueDateStr) return false;

                const debtDueDate = new Date(dueDateStr);
                debtDueDate.setHours(0, 0, 0, 0);

                // Filter hutang yang jatuh tempo antara startDate (inklusi) dan endDate (eksklusi)
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

    // Panggil fungsi saat halaman dimuat (pastikan di dalam isDashboardPage check)
    if (isDashboardPage) {
        loadUpcomingBills();
        loadAndDisplayAnnualTotals(); // Ini sudah ada, pastikan tetap terpanggil
        loadAndDisplayGoals(); // Ini sudah ada, pastikan tetap terpanggil
    }

    // Fungsi untuk memuat dan menampilkan data goals
    async function loadAndDisplayGoals() {
        try {
            // Load Budget Targets
            const budgetTargetsSnapshot = await db.collection('budgetTargets').get();
            const budgetTargetsContainer = document.getElementById('budget-targets-container');
            budgetTargetsContainer.innerHTML = '';

            for (const doc of budgetTargetsSnapshot.docs) {
                const data = doc.data();
                const currentMonth = new Date().toLocaleString('id-ID', { month: 'long' });
                
                // Hitung progress berdasarkan data cashflow bulan ini
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

            // Load Long Term Goals
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

            // Load Sinking Funds
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

    // Fungsi untuk membuat elemen goal item
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

    // Fungsi untuk menghitung progress budget
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

    // Fungsi untuk menghitung progress long term goal
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

    // Fungsi untuk menghitung progress sinking fund
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

    // Panggil fungsi loadAndDisplayGoals saat halaman dimuat
    loadAndDisplayGoals();
}
}); 