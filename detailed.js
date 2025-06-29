// detailed.js - Logika khusus untuk halaman detailed.html

document.addEventListener('DOMContentLoaded', async function() {
    // Variabel untuk menyimpan opsi item (akan dimuat dari Firebase)
    let itemOptions = {}; // Inisialisasi kosong atau dengan default minimal

    // Hanya jalankan kode ini jika berada di halaman detailed.html
    const isDetailedPage = window.location.pathname.endsWith('/detailed.html');

    if (isDetailedPage) {
        // Tambahkan fungsi pembantu untuk menunggu Firebase Firestore siap
        const waitForFirestore = () => {
            return new Promise(resolve => {
                const checkDb = () => {
                    if (window.db) {
                        resolve();
                    } else {
                        setTimeout(checkDb, 50); // Coba lagi setelah 50ms
                    }
                };
                checkDb();
            });
        };

        // Tunggu hingga Firestore siap sebelum memuat opsi item
        await waitForFirestore();

        // Panggil ini di awal untuk memastikan itemOptions dimuat sebelum digunakan oleh elemen lain.
        itemOptions = await loadItemOptionsFromFirebase();

        // Ambil referensi elemen input cashflow
        const dateFilter = document.getElementById('date-filter');
        const inputKategoriFilter = document.getElementById('kategori-filter');
        const inputItemFilter = document.getElementById('item-filter');
        const amountInput = document.querySelector('.amount-input');
        const submitButton = document.querySelector('.submit-button');
        const monthFilter = document.getElementById('month-filter');

        // Global Chart.js configuration for text colors
        // This ensures chart elements adapt to theme changes
        Chart.defaults.color = getComputedStyle(document.body).getPropertyValue('--text-color');
        Chart.defaults.borderColor = getComputedStyle(document.body).getPropertyValue('--border-color'); // For grid lines etc.

        // Also explicitly set for legend labels and title for robustness
        if (Chart.defaults.plugins && Chart.defaults.plugins.legend && Chart.defaults.plugins.legend.labels) {
            Chart.defaults.plugins.legend.labels.color = getComputedStyle(document.body).getPropertyValue('--text-color');
        }
        if (Chart.defaults.plugins && Chart.defaults.plugins.title) {
            Chart.defaults.plugins.title.color = getComputedStyle(document.body).getPropertyValue('--text-color');
        }

        // Fungsi untuk menyimpan itemOptions ke Firebase
        async function saveItemsToFirebase(category, itemsArray) {
            try {
                // Get Firestore instance explicitly from window.db
                const firestoreDb = window.db; // Use window.db directly
                if (!firestoreDb) {
                    console.error('Firestore instance (window.db) is not available. Cannot save item options.');
                    alert('Gagal menyimpan item: Firestore tidak tersedia.');
                    return;
                }
                // Gunakan set dengan merge: true agar hanya field 'items' yang diupdate
                await firestoreDb.collection('categories').doc(category).set({ items: itemsArray }, { merge: true });
                console.log(`Items for ${category} saved to Firebase.`);
            } catch (error) {
                console.error('Error saving items to Firebase:', error.code, error.message);
                alert('Gagal menyimpan item ke Firebase.');
            }
        }

        // Fungsi untuk memuat itemOptions dari Firebase
        async function loadItemOptionsFromFirebase() {
            let loadedItemOptions = {
                Expenses: ["Spinjam", "Traveloka", "Makan", "Kerjaan", "Lain-Lain", "Belanja", "Cashout", "Spaylater", "Netflix",
                "Kos", "HBO", "Forex", "Makan2 Tim", "Service Motor", "Listrik", "Crypto", "Game"],
                Income: ["Salary", "Opers", "Insentive", "THR", "Forex", "Crypto", "Project", "Bayaran Utang", "Other"],
                Savings: ["BluBCA", "Crypto"]
            }; // Default hardcoded options

            try {
                // Get Firestore instance explicitly from window.db
                const firestoreDb = window.db; // Use window.db directly
                if (!firestoreDb) {
                    console.warn('Firestore instance (window.db) is not available. Using default item options.');
                    return loadedItemOptions; // Return defaults if db is not ready
                }

                const categoriesSnapshot = await firestoreDb.collection('categories').get();
                if (categoriesSnapshot.empty) {
                    console.log('No categories found in Firebase. Initializing with default options and saving to Firebase.');
                    // Simpan default ke Firebase jika koleksi kosong
                    for (const categoryName in loadedItemOptions) {
                        await saveItemsToFirebase(categoryName, loadedItemOptions[categoryName]);
                    }
                } else {
                    loadedItemOptions = {}; // Reset sebelum mengisi dari Firebase
                    categoriesSnapshot.forEach(doc => {
                        loadedItemOptions[doc.id] = doc.data().items || [];
                    });
                    console.log('Item options loaded from Firebase:', loadedItemOptions);
                }
            } catch (error) {
                console.error('Error loading item options from Firebase:', error.code, error.message);
                alert('Gagal memuat opsi item dari Firebase. Menggunakan opsi default.');
                // loadedItemOptions sudah berisi nilai default di awal fungsi, jadi tidak perlu di-reset lagi
            }
            return loadedItemOptions; // Selalu kembalikan objek itemOptions yang sudah dimuat (atau default)
        }

        const monthlyTableBody = document.querySelector('.detailed-card .detailed-table tbody');
        const viewEntriesSelect = document.getElementById('view-entries'); // Ambil referensi dropdown

        // Ambil referensi ke checkbox header tabel Monthly
        const selectAllCheckbox = document.querySelector('.detailed-card .detailed-table thead input[type="checkbox"]');

        // Variabel untuk menyimpan semua data yang dimuat dari Firebase
        let allMonthlyData = [];
        let trendChartInstance = null; // Variabel untuk menyimpan instance grafik tren
        let categoryChartInstance = null; // Variabel untuk menyimpan instance grafik kategori

        // Referensi elemen form edit
        const editFormContainer = document.getElementById('edit-form-container');
        const editDocIdInput = document.getElementById('edit-doc-id');
        const editDateInput = document.getElementById('edit-date');
        const editMonthSelect = document.getElementById('edit-month');
        const editCategorySelect = document.getElementById('edit-category');
        const editItemInput = document.getElementById('edit-item');
        const editAmountInput = document.getElementById('edit-amount');
        const saveEditButton = document.getElementById('save-edit-btn');
        const cancelEditButton = document.getElementById('cancel-edit-btn');

        // Referensi elemen download dan upload
        const downloadExcelButton = document.getElementById('download-excel-btn');
        const uploadExcelButton = document.getElementById('upload-excel-btn');
        const uploadExcelInput = document.getElementById('upload-excel-input');
        const deleteSelectedButton = document.getElementById('delete-selected-btn'); // Ambil referensi tombol Delete Selected

        // Referensi ke tbody dan tfoot tabel Savings, Income, Expenses
        const detailedCards = document.querySelectorAll('.detailed-card');
        let savingsTableBody = null;
        let incomeTableBody = null;
        let expensesTableBody = null;
        let savingsTableFoot = null; // Referensi tfoot Savings
        let incomeTableFoot = null; // Referensi tfoot Income
        let expensesTableFoot = null; // Referensi tfoot Expenses
        let budgetTargetsMap = new Map(); // Untuk menyimpan target budget per kategori

        detailedCards.forEach(card => {
            const titleElement = card.querySelector('.detailed-card-title');
            if (titleElement) {
                const titleText = titleElement.textContent;
                if (titleText.includes('Savings')) {
                    savingsTableBody = card.querySelector('.detailed-table tbody');
                    savingsTableFoot = card.querySelector('.detailed-table tfoot'); // Ambil tfoot
                } else if (titleText.includes('Income')) {
                    incomeTableBody = card.querySelector('.detailed-table tbody');
                    incomeTableFoot = card.querySelector('.detailed-table tfoot'); // Ambil tfoot
                } else if (titleText.includes('Expenses')) {
                    expensesTableBody = card.querySelector('.detailed-table tbody');
                    expensesTableFoot = card.querySelector('.detailed-table tfoot'); // Ambil tfoot
                }
            }
        });

        // Mapping nama bulan ke index kolom (Januari = 1, Februari = 2, dst, setelah kolom Item di tabel bulanan)
        const monthColumnIndex = {
            'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4,
            'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8,
            'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
        };

        // Fungsi untuk mengurutkan data berdasarkan tanggal
        function sortDataByDate(data) {
            return data.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB;
            });
        }

        // Fungsi untuk memperbarui opsi Item berdasarkan data
        function updateItemOptions(data) {
          const itemFilter = document.getElementById('monthly-item-filter');
          if (!itemFilter) return;

          // Simpan opsi "Semua"
          const defaultOption = itemFilter.options[0];
          itemFilter.innerHTML = '';
          itemFilter.appendChild(defaultOption);

          // Dapatkan semua item unik dari data
          const uniqueItems = [...new Set(data.map(item => item.item))];
          
          // Tambahkan opsi untuk setiap item unik
          uniqueItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            itemFilter.appendChild(option);
          });
        }

        // Modifikasi fungsi renderMonthlyTable untuk menggunakan filter Item
        function renderMonthlyTable(data) {
          console.log('renderMonthlyTable called', data);
          const tbody = document.querySelector('.detailed-table tbody');
          if (!tbody) {
            console.log('Tbody tidak ditemukan!');
            return;
          }

          const bulanFilter = document.getElementById('monthly-bulan-filter');
          const kategoriFilter = document.getElementById('monthly-kategori-filter');
          const itemFilter = document.getElementById('monthly-item-filter');
          const viewEntries = document.getElementById('view-entries');
          const totalAmountSpan = document.getElementById('monthly-total-amount');

          if (!bulanFilter || !kategoriFilter || !itemFilter || !viewEntries) {
            console.log('Filter bulanan/kategori/item/viewEntries tidak ditemukan!');
            return;
          }

          // Filter data berdasarkan pilihan
          let filteredData = data.filter(item => {
            const bulanMatch = bulanFilter.value === 'Semua' || item.month === bulanFilter.value;
            const kategoriMatch = kategoriFilter.value === 'Semua' || item.category === kategoriFilter.value;
            const itemMatch = itemFilter.value === 'Semua' || item.item === itemFilter.value;
            return bulanMatch && kategoriMatch && itemMatch;
          });

          // Batasi jumlah entri yang ditampilkan
          const limit = viewEntries.value === 'all' ? filteredData.length : parseInt(viewEntries.value);
          filteredData = filteredData.slice(0, limit);

          // Urutkan data berdasarkan tanggal
          const sortedData = sortDataByDate(filteredData);

          // Hitung total jumlah uang
          let totalAmount = 0;
          sortedData.forEach(item => {
            totalAmount += parseFloat(item.amount) || 0;
          });
          if (totalAmountSpan) {
            totalAmountSpan.textContent = `Total: ${formatCurrency(totalAmount)}`;
          }

          // Render tabel
          tbody.innerHTML = '';
          sortedData.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td><input type="checkbox" data-id="${item.id}" /></td>
              <td>${item.date}</td>
              <td>${item.month}</td>
              <td>${item.category}</td>
              <td>${item.item}</td>
              <td>${formatCurrency(item.amount)}</td>
              <td>
                <button class="edit-btn" data-id="${item.id}">Edit</button>
                <button class="delete-btn" data-id="${item.id}">Delete</button>
              </td>
            `;
            tbody.appendChild(tr);
          });

          // Tambahkan event listener untuk tombol edit dan delete
          addTableButtonListeners();
        }

        // Fungsi untuk menambahkan event listener pada tombol edit dan delete
        function addTableButtonListeners() {
          console.log('addTableButtonListeners called');
          const editButtons = document.querySelectorAll('.edit-btn');
          const deleteButtons = document.querySelectorAll('.delete-btn');
          console.log('Jumlah tombol edit:', editButtons.length);

          editButtons.forEach(button => {
            button.onclick = null;
            button.addEventListener('click', function() {
              console.log('Edit button clicked', this);
              const docId = this.getAttribute('data-id');
              const row = this.closest('tr');
              const cells = row.cells;
              // Pastikan semua elemen form ada
              const editFormContainer = document.getElementById('edit-form-container');
              const editDocIdInput = document.getElementById('edit-doc-id');
              const editDateInput = document.getElementById('edit-date');
              const editMonthSelect = document.getElementById('edit-month');
              const editCategorySelect = document.getElementById('edit-category');
              const editItemInput = document.getElementById('edit-item');
              const editAmountInput = document.getElementById('edit-amount');
              // Tambahkan log untuk setiap elemen
              console.log('editFormContainer', editFormContainer);
              console.log('editDocIdInput', editDocIdInput);
              console.log('editDateInput', editDateInput);
              console.log('editMonthSelect', editMonthSelect);
              console.log('editCategorySelect', editCategorySelect);
              console.log('editItemInput', editItemInput);
              console.log('editAmountInput', editAmountInput);
              if (!editFormContainer || !editDocIdInput || !editDateInput || !editMonthSelect || 
                  !editCategorySelect || !editItemInput || !editAmountInput) {
                alert('Ada elemen form edit yang tidak ditemukan! Cek console untuk detail.');
                console.error('Form edit elements not found', {
                  editFormContainer, editDocIdInput, editDateInput, editMonthSelect, editCategorySelect, editItemInput, editAmountInput
                });
                return;
              }
              // Bersihkan format Rupiah dari jumlah uang
              const amountText = cells[5].textContent;
              const cleanAmount = amountText.replace(/[^\d.-]/g, '');
              // Format tanggal ke format yang sesuai dengan input type="date"
              const dateText = cells[1].textContent;
              const formattedDate = dateText;
              // Isi form edit
              editDocIdInput.value = docId;
              editDateInput.value = formattedDate;
              editMonthSelect.value = cells[2].textContent;
              editCategorySelect.value = cells[3].textContent;
              editItemInput.value = cells[4].textContent;
              editAmountInput.value = cleanAmount;
              // Tampilkan form
              editFormContainer.classList.add('active');
            });
          });

          deleteButtons.forEach(button => {
            button.onclick = null;
            button.addEventListener('click', async function() {
              const docId = this.getAttribute('data-id');
              if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                try {
                  await db.collection('cashflow').doc(docId).delete();
                  loadAndRenderData(); // Muat ulang data setelah hapus
                } catch (error) {
                  console.error('Error deleting document:', error);
                  alert('Gagal menghapus data');
                }
              }
            });
          });
        }

        // Event listener untuk form edit
        if (saveEditButton && cancelEditButton && editFormContainer) {
          saveEditButton.onclick = null;
          cancelEditButton.onclick = null;
          saveEditButton.addEventListener('click', async function() {
            const editDocIdInput = document.getElementById('edit-doc-id');
            const editDateInput = document.getElementById('edit-date');
            const editMonthSelect = document.getElementById('edit-month');
            const editCategorySelect = document.getElementById('edit-category');
            const editItemInput = document.getElementById('edit-item');
            const editAmountInput = document.getElementById('edit-amount');
            if (!editDocIdInput || !editDateInput || !editMonthSelect || !editCategorySelect || 
                !editItemInput || !editAmountInput) {
              console.error('Form edit elements not found');
              alert('Terjadi kesalahan: Form edit tidak lengkap');
              return;
            }
            const docId = editDocIdInput.value;
            const updatedData = {
              date: editDateInput.value,
              month: editMonthSelect.value,
              category: editCategorySelect.value,
              item: editItemInput.value,
              amount: parseFloat(editAmountInput.value)
            };
            try {
              await db.collection('cashflow').doc(docId).update(updatedData);
              editFormContainer.classList.remove('active');
              loadAndRenderData(); // Muat ulang data setelah update
            } catch (error) {
              console.error('Error updating document:', error);
              alert('Gagal menyimpan perubahan');
            }
          });
          cancelEditButton.addEventListener('click', function() {
            editFormContainer.classList.remove('active');
          });
        }

        // Event listener untuk checkbox select all
        if (selectAllCheckbox) {
          selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.detailed-table tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
              checkbox.checked = this.checked;
            });
          });
        }

        // Event listener untuk tombol delete selected
        if (deleteSelectedButton) {
          deleteSelectedButton.addEventListener('click', async function() {
            const selectedCheckboxes = document.querySelectorAll('.detailed-table tbody input[type="checkbox"]:checked');
            if (selectedCheckboxes.length === 0) {
              alert('Pilih data yang akan dihapus');
              return;
            }

            if (confirm(`Apakah Anda yakin ingin menghapus ${selectedCheckboxes.length} data yang dipilih?`)) {
              try {
                const batch = db.batch();
                selectedCheckboxes.forEach(checkbox => {
                  const docId = checkbox.getAttribute('data-id');
                  const docRef = db.collection('cashflow').doc(docId);
                  batch.delete(docRef);
                });
                await batch.commit();
                loadAndRenderData(); // Muat ulang data setelah hapus
              } catch (error) {
                console.error('Error deleting documents:', error);
                alert('Gagal menghapus data yang dipilih');
              }
            }
          });
        }

        // Event listener untuk filter
        const bulanFilter = document.getElementById('monthly-bulan-filter');
        const kategoriFilter = document.getElementById('monthly-kategori-filter');
        const itemFilter = document.getElementById('monthly-item-filter');
        const viewEntries = document.getElementById('view-entries');

        if (bulanFilter) {
          bulanFilter.addEventListener('change', loadAndRenderData);
        }

        if (kategoriFilter) {
          kategoriFilter.addEventListener('change', loadAndRenderData);
        }

        if (itemFilter) {
          itemFilter.addEventListener('change', loadAndRenderData);
        }

        if (viewEntries) {
          viewEntries.addEventListener('change', loadAndRenderData);
        }

        // Fungsi untuk membuat grafik tren
        function createTrendChart(data, period = 'Monthly') {
            const ctx = document.getElementById('trendChart').getContext('2d');
            
            // Hancurkan chart yang ada jika sudah ada
            if (trendChartInstance) {
                trendChartInstance.destroy();
            }

            // Proses data untuk grafik
            const monthlyData = processDataForTrendChart(data, period);
            console.log(`Data untuk Trend Chart (${period}):`, monthlyData);

            // Ambil dictionary translasi
            const lang = localStorage.getItem('appLanguage') || 'en';
            const dict = translations[lang] || translations['en'];

            trendChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: monthlyData.labels,
                    datasets: [
                        {
                            label: dict['income'] || 'Income',
                            data: monthlyData.income,
                            borderColor: '#43a047',
                            backgroundColor: 'rgba(67, 160, 71, 0.1)',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: dict['expenses'] || 'Expenses',
                            data: monthlyData.expenses,
                            borderColor: '#e53935',
                            backgroundColor: 'rgba(229, 57, 53, 0.1)',
                            tension: 0.4,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `${dict['trend_chart_title'] || 'Income and Expense Trend'} (${period})`
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return formatCurrency(value);
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: period === 'Daily' ? (dict['date'] || 'Date') : (period === 'Weekly' ? (dict['week'] || 'Week') : period)
                            }
                        }
                    }
                }
            });
        }

        // Fungsi untuk membuat grafik kategori
        function createCategoryChart(data, period = 'Monthly') {
            const ctx = document.getElementById('categoryChart').getContext('2d');
            
            // Hancurkan chart yang ada jika sudah ada
            if (categoryChartInstance) {
                categoryChartInstance.destroy();
            }

            // Proses data untuk grafik
            const categoryData = processDataForCategoryChart(data, period);
            console.log(`Data untuk Category Chart (${period}):`, categoryData);

            // Ambil dictionary translasi
            const lang = localStorage.getItem('appLanguage') || 'en';
            const dict = translations[lang] || translations['en'];

            // Hanya tampilkan grafik jika ada data
            if (categoryData.labels.length === 0) {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                const noDataText = dict['no_expense_data'] || 'No expense data to display';
                ctx.font = '14px Poppins';
                ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-color');
                ctx.textAlign = 'center';
                ctx.fillText(noDataText, ctx.canvas.width / 2, ctx.canvas.height / 2);
                return;
            }

            categoryChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: categoryData.labels,
                    datasets: [{
                        data: categoryData.values,
                        backgroundColor: [
                            '#e53935', '#43a047', '#1e88e5', '#fb8c00', '#8e24aa',
                            '#d81b60', '#00897b', '#3949ab', '#f4511e', '#6d4c41'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `${dict['category_chart_title'] || 'Expense Distribution by Category'} (${period})`
                        },
                        legend: {
                            position: 'right',
                            labels: {
                                color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                                font: {
                                    family: 'Poppins'
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed !== null) {
                                        label += formatCurrency(context.parsed) + ' (' + context.dataset.data[context.dataIndex] + '%';
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Fungsi untuk memproses data untuk grafik tren
        function processDataForTrendChart(data, period) {
            const aggregatedData = {};
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                               'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

            // Helper function to get the start date of the week (Monday)
            function getStartOfWeek(date) {
                const d = new Date(date);
                const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
                const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjusted to start from Monday
                d.setDate(d.getDate() - diff);
                d.setHours(0, 0, 0, 0);
                return d.toISOString().split('T')[0]; // Return date in YYYY-MM-DD format
            }

            data.forEach(item => {
                const amount = parseFloat(item.amount) || 0;
                const itemDate = new Date(item.date); // Asumsikan item.date format YYYY-MM-DD

                if (isNaN(itemDate.getTime())) {
                    console.warn('Invalid date format in data:', item.date);
                    return; // Skip item with invalid date
                }

                let key;
                if (period === 'Daily') {
                    key = item.date;
                } else if (period === 'Weekly') {
                    key = getStartOfWeek(itemDate);
                } else if (period === 'Monthly') {
                    const year = itemDate.getFullYear();
                    const month = itemDate.getMonth();
                    key = `${year}-${month.toString().padStart(2, '0')}`;
                } else if (period === 'Yearly') {
                    key = itemDate.getFullYear().toString();
                }

                if (!aggregatedData[key]) {
                    aggregatedData[key] = { income: 0, expenses: 0 };
                };

                if (item.category === 'Income') {
                    aggregatedData[key].income += amount;
                } else if (item.category === 'Expenses') {
                    aggregatedData[key].expenses += amount;
                }
            });

            const sortedKeys = Object.keys(aggregatedData).sort();

            const labels = sortedKeys.map(key => {
                if (period === 'Monthly') {
                    const [year, monthIndex] = key.split('-');
                    return `${monthNames[parseInt(monthIndex, 10)]} ${year}`;
                } else if (period === 'Weekly') {
                    return `Minggu (${key})`;
                } else if (period === 'Daily') {
                    return key;
                } else if (period === 'Yearly') {
                    return key;
                }
                return key;
            });

            const income = sortedKeys.map(key => aggregatedData[key].income);
            const expenses = sortedKeys.map(key => aggregatedData[key].expenses);

            return { labels, income, expenses };
        }

        // Fungsi untuk memproses data untuk grafik kategori
        function processDataForCategoryChart(data, period) {
            const aggregatedData = {};

            // Filter data berdasarkan periode, jika diperlukan (untuk kategori, biasanya melihat total selama periode)
            // Untuk grafik kategori (doughnut), kita biasanya melihat total pengeluaran per kategori.
            // Jadi, kita hanya perlu memfilter berdasarkan kategori 'Expenses'.
            // Logika periode bisa diaplikasikan di sini jika kita ingin melihat distribusi kategori dalam periode tertentu.
            
            data.forEach(item => {
                const amount = parseFloat(item.amount) || 0;
                const itemDate = new Date(item.date); // Asumsikan item.date format YYYY-MM-DD

                if (isNaN(itemDate.getTime())) {
                    console.warn('Invalid date format in data:', item.date);
                    return; // Skip item with invalid date
                }

                // Filter berdasarkan kategori 'Expenses'
                if (item.category === 'Expenses') {
                    // Jika ada filter periode, kita bisa menerapkannya di sini
                    // Untuk saat ini, kita mengasumsikan grafik kategori menunjukkan total expenses tanpa filter periode.
                    // Jika ingin filter periode, tambahkan logika seperti di processDataForTrendChart
                    
                    if (!aggregatedData[item.item]) {
                        aggregatedData[item.item] = 0;
                    }
                    aggregatedData[item.item] += amount;
                }
            });

            const labels = [];
            const values = [];
            for (const [category, amount] of Object.entries(aggregatedData)) {
                labels.push(category);
                values.push(amount);
            }
            
            return { labels, values };
        }

        // Fungsi untuk mengambil target budget dari Firestore
        const fetchBudgetTargets = async () => {
            try {
                const querySnapshot = await db.collection('budgetTargets').get();
                budgetTargetsMap.clear(); // Bersihkan map sebelumnya
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    budgetTargetsMap.set(data.category, data.targetAmount);
                });
                console.log('BudgetTargets loaded:', budgetTargetsMap);
            } catch (error) {
                console.error('Error fetching budget targets:', error);
            }
        };

        // Modifikasi fungsi loadAndRenderData untuk memuat target budget juga
        async function loadAndRenderData() {
            await fetchBudgetTargets(); // Panggil ini sebelum merender tabel
            try {
                const snapshot = await db.collection('cashflow').get();
                allMonthlyData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                // Render tabel
                renderMonthlyTable(allMonthlyData);
                renderCategoryTables(allMonthlyData);
                
                // Dapatkan elemen tombol periode
                const periodTabsDetailed = document.querySelectorAll('.period-tab-detailed');
                let currentPeriod = 'Monthly'; // Default period

                // Cari tombol aktif saat ini untuk menentukan periode awal
                periodTabsDetailed.forEach(tab => {
                    if (tab.classList.contains('active')) {
                        currentPeriod = tab.getAttribute('data-period');
                    }
                });

                // Buat grafik dengan periode awal
                createTrendChart(allMonthlyData, currentPeriod);
                createCategoryChart(allMonthlyData, currentPeriod);
                
                // Update opsi item
                updateItemOptions(allMonthlyData);

                // Tambahkan event listener untuk tombol periode
                periodTabsDetailed.forEach(tab => {
                    tab.addEventListener('click', function() {
                        // Hapus kelas 'active' dari semua tombol
                        periodTabsDetailed.forEach(t => t.classList.remove('active'));
                        // Tambahkan kelas 'active' ke tombol yang diklik
                        this.classList.add('active');

                        const selectedPeriod = this.getAttribute('data-period');
                        createTrendChart(allMonthlyData, selectedPeriod);
                        createCategoryChart(allMonthlyData, selectedPeriod);
                    });
                });
                
            } catch (error) {
                console.error('Error loading data:', error);
                alert('Gagal memuat data. Silakan coba lagi.');
            }
        }

        // Fungsi untuk me-render tabel kategori bulanan (Savings, Income, Expenses)
        function renderCategoryTables(data) {
            // Pastikan elemen tabel ada sebelum membersihkan/mengisi
            if (savingsTableBody) savingsTableBody.innerHTML = '';
            if (incomeTableBody) incomeTableBody.innerHTML = '';
            if (expensesTableBody) expensesTableBody.innerHTML = '';

            // Agregasi data berdasarkan item dan bulan
            const aggregatedData = {};

            data.forEach(dataItem => {
                if (dataItem.category === 'Savings' || dataItem.category === 'Income' || dataItem.category === 'Expenses') {
                    const key = `${dataItem.category}-${dataItem.item}-${dataItem.month}`;
                    if (!aggregatedData[key]) {
                        aggregatedData[key] = { ...dataItem, amount: 0 };
                    }
                    aggregatedData[key].amount += parseFloat(dataItem.amount) || 0;
                }
            });

            // Gunakan data yang sudah diagregasi untuk mengisi tabel kategori
            Object.values(aggregatedData).forEach(dataItem => {
                let targetTableBody = null;
                if (dataItem.category === 'Savings' && savingsTableBody) {
                    targetTableBody = savingsTableBody;
                } else if (dataItem.category === 'Income' && incomeTableBody) {
                    targetTableBody = incomeTableBody;
                } else if (dataItem.category === 'Expenses' && expensesTableBody) {
                    targetTableBody = expensesTableBody;
                }

                if (targetTableBody) {
                    // Cari atau buat baris Item dan perbarui sel bulan serta Total
                    let itemRow = null;
                    const rows = targetTableBody.getElementsByTagName('tr');
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const itemCell = row.cells[0];
                        if (itemCell && itemCell.textContent.trim() === dataItem.item.trim()) {
                            itemRow = row;
                            break;
                        }
                    }

                    if (!itemRow) {
                        itemRow = document.createElement('tr');
                        itemRow.innerHTML = `<td>${dataItem.item}</td>` +
                                            Array(12).fill('<td>Rp 0</td>').join('') +
                                            '<td>Rp 0</td>';
                        targetTableBody.appendChild(itemRow);
                    }

                    // Normalisasi nama bulan
                    const normalizedMonth = (dataItem.month || '').trim().toLowerCase();
                    const monthKey = Object.keys(monthColumnIndex).find(
                        key => key.toLowerCase() === normalizedMonth
                    );
                    const monthIndex = monthKey ? monthColumnIndex[monthKey] : undefined;
                    if (monthIndex !== undefined && itemRow.cells.length > monthIndex) {
                        const monthCell = itemRow.cells[monthIndex];
                        // Menimpa nilai bulan dengan jumlah yang diagregasi
                        monthCell.textContent = formatCurrency(dataItem.amount);

                        // Hitung ulang Total
                        let total = 0;
                        for (let i = 1; i <= 12; i++) {
                            if (itemRow.cells.length > i) {
                                const cellText = itemRow.cells[i].textContent;
                                const cleanCellText = cellText.replace(/^Rp\s*/, '').replace(/\./g, '').replace(',', '.');
                                const numericValue = parseFloat(cleanCellText) || 0;
                                total += numericValue;
                            }
                        }
                        if (itemRow.cells.length > 13) {
                            itemRow.cells[13].textContent = formatCurrency(total);
                        }
                    }
                }
            });

            // --- Hitung dan Tampilkan Total di Footer Tabel Kategori ---
            if (savingsTableFoot && savingsTableBody) calculateAndRenderTotals(savingsTableBody, savingsTableFoot, 'Savings', budgetTargetsMap);
            if (incomeTableFoot && incomeTableBody) calculateAndRenderTotals(incomeTableBody, incomeTableFoot, 'Income', budgetTargetsMap);
            if (expensesTableFoot && expensesTableBody) calculateAndRenderTotals(expensesTableBody, expensesTableFoot, 'Expenses', budgetTargetsMap);
            // --- Akhir Hitung dan Tampilkan Total ---

            // Log total Income dari detailed page
            if (incomeTableFoot) {
                const incomeTotalCell = incomeTableFoot.querySelector('tr').cells[13];
                if (incomeTotalCell) {
                    console.log('Detailed Page - Calculated Total Income (from table text):', incomeTotalCell.textContent);
                }
            }

            // Render Expenses Table
            if (expensesTableBody) {
                expensesTableBody.innerHTML = '';
                const expensesData = data.filter(item => item.category === 'Expenses');
                // Kelompokkan expenses berdasarkan item untuk perhitungan bulanan
                const groupedExpenses = expensesData.reduce((acc, current) => {
                    if (!acc[current.item]) {
                        acc[current.item] = {};
                    }
                    acc[current.item][current.month] = (acc[current.item][current.month] || 0) + current.amount;
                    return acc;
                }, {});

                // Hitung total per item untuk sorting
                const itemTotals = Object.entries(groupedExpenses).map(([item, months]) => {
                    let total = 0;
                    for (let i = 1; i <= 12; i++) {
                        const monthName = Object.keys(monthColumnIndex).find(key => monthColumnIndex[key] === i);
                        total += months[monthName] || 0;
                    }
                    return { item, months, total };
                });

                // Urutkan dari total terbesar ke terkecil
                itemTotals.sort((a, b) => b.total - a.total);

                // Render baris sesuai urutan
                for (const { item, months, total: totalItem } of itemTotals) {
                    const row = expensesTableBody.insertRow();
                    row.insertCell(0).textContent = item;

                    // Dapatkan target budget untuk kategori Expenses dari item ini
                    const targetBudget = budgetTargetsMap.get(item) || 0; // Mengambil target berdasarkan item/kategori
                    const targetBudgetCell = row.insertCell(1);
                    targetBudgetCell.textContent = targetBudget > 0 ? formatCurrency(targetBudget) : '-';
                    
                    let runningTotal = 0;
                    for (let i = 1; i <= 12; i++) {
                        const monthName = Object.keys(monthColumnIndex).find(key => monthColumnIndex[key] === i);
                        const amount = months[monthName] || 0;
                        const cell = row.insertCell(i + 1);
                        cell.textContent = formatCurrency(amount);
                        // Tambahkan indikator visual jika pengeluaran bulanan melebihi target budget
                        if (targetBudget > 0 && amount > targetBudget) {
                            cell.style.color = '#e53935'; // Merah untuk pengeluaran yang melebihi target
                            cell.innerHTML = `${formatCurrency(amount)} <span style="color: #e53935;">⚠️</span>`;
                        } else if (targetBudget > 0 && amount <= targetBudget) {
                            cell.style.color = '#43a047'; // Hijau untuk pengeluaran yang masih dalam target
                            cell.innerHTML = `${formatCurrency(amount)} <span style="color: #43a047;">✓</span>`;
                        }
                        runningTotal += amount;
                    }
                    // Tambahkan indikator visual untuk total keseluruhan
                    const totalCell = row.insertCell(14);
                    totalCell.textContent = formatCurrency(runningTotal);
                    if (targetBudget > 0) {
                        const monthlyTarget = targetBudget; // Target per bulan
                        const yearlyTarget = monthlyTarget * 12; // Target per tahun
                        if (runningTotal > yearlyTarget) {
                            totalCell.style.color = '#e53935'; // Merah untuk total yang melebihi target tahunan
                            totalCell.innerHTML = `${formatCurrency(runningTotal)} <span style="color: #e53935;">⚠️</span>`;
                        } else {
                            totalCell.style.color = '#43a047'; // Hijau untuk total yang masih dalam target tahunan
                            totalCell.innerHTML = `${formatCurrency(runningTotal)} <span style="color: #43a047;">✓</span>`;
                        }
                    }
                }
                calculateAndRenderTotals(expensesTableBody, expensesTableFoot, 'Expenses', budgetTargetsMap);
            }
        }

        // Fungsi untuk menghitung dan menampilkan total per kolom di footer tabel kategori
        function calculateAndRenderTotals(tableBody, tableFoot, category, budgetTargetsMap = new Map()) {
            if (!tableBody || !tableFoot) return; // Pastikan elemen ada

            const rows = tableBody.getElementsByTagName('tr');
            const totalCells = tableFoot.querySelector('tr').cells; // Sel di baris footer

            // Inisialisasi array untuk menyimpan total per kolom
            const columnTotals = Array(totalCells.length).fill(0);

            // Hitung total untuk kolom Target Budget (hanya untuk kategori Expenses)
            if (category === 'Expenses') {
                let totalTargetBudget = 0;
                for (let i = 0; i < rows.length; i++) {
                    const cells = rows[i].cells;
                    const itemName = cells[0].textContent.trim();
                    const targetAmount = budgetTargetsMap.get(itemName) || 0;
                    totalTargetBudget += targetAmount;
                }
                columnTotals[1] = totalTargetBudget;
                
                // Tambahkan indikator visual untuk total target budget
                if (totalTargetBudget > 0) {
                    totalCells[1].innerHTML = `${formatCurrency(totalTargetBudget)} <span style="color: #1e88e5;">🎯</span>`;
                }
            }

            // Iterasi setiap baris data di tabel untuk total bulanan
            for (let i = 0; i < rows.length; i++) {
                const cells = rows[i].cells;
                for (let j = 1; j < totalCells.length; j++) {
                    if (cells.length > j) {
                        const cellText = cells[j].textContent;
                        const cleanCellText = cellText.replace(/^Rp\s*/, '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]+/g, '');
                        const numericValue = parseFloat(cleanCellText) || 0;
                        columnTotals[j] += numericValue;
                    }
                }
            }

            // Hitung total keseluruhan (kolom terakhir)
            let categoryGrandTotal = 0;
            for (let i = 1; i < totalCells.length - 1; i++) {
                categoryGrandTotal += columnTotals[i];
            }
            columnTotals[totalCells.length - 1] = categoryGrandTotal;

            // Tampilkan total dengan indikator visual
            for (let j = 1; j < totalCells.length; j++) {
                if (totalCells.length > j) {
                    if (category === 'Expenses' && j > 1 && j < 14) {
                        // Untuk kolom bulanan, bandingkan dengan target bulanan
                        const monthlyTarget = columnTotals[1] / 12; // Target per bulan
                        if (columnTotals[j] > monthlyTarget) {
                            totalCells[j].style.color = '#e53935';
                            totalCells[j].innerHTML = `${formatCurrency(columnTotals[j])} <span style="color: #e53935;">⚠️</span>`;
                        } else {
                            totalCells[j].style.color = '#43a047';
                            totalCells[j].innerHTML = `${formatCurrency(columnTotals[j])} <span style="color: #43a047;">✓</span>`;
                        }
                    } else if (category === 'Expenses' && j === 14) {
                        // Untuk total keseluruhan, bandingkan dengan target tahunan
                        const yearlyTarget = columnTotals[1];
                        if (columnTotals[j] > yearlyTarget) {
                            totalCells[j].style.color = '#e53935';
                            totalCells[j].innerHTML = `${formatCurrency(columnTotals[j])} <span style="color: #e53935;">⚠️</span>`;
                        } else {
                            totalCells[j].style.color = '#43a047';
                            totalCells[j].innerHTML = `${formatCurrency(columnTotals[j])} <span style="color: #43a047;">✓</span>`;
                        }
                    } else {
                        totalCells[j].textContent = formatCurrency(columnTotals[j]);
                    }
                }
            }
            console.log(`Detailed Page - Calculated Total for ${category}: Grand Total ${formatCurrency(categoryGrandTotal)}, Column Totals:`, columnTotals);
        }

        // Fungsi untuk menangani perubahan periode
        function handlePeriodChange(period, chartType) {
            // Hapus kelas active dari semua tab
            document.querySelectorAll(`.period-tab-detailed[data-chart="${chartType}"]`).forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Tambahkan kelas active ke tab yang diklik
            event.target.classList.add('active');

            // Update grafik berdasarkan periode
            if (chartType === 'trend') {
                updateTrendChart(period);
            } else if (chartType === 'category') {
                updateCategoryChart(period);
            }
        }

        // Tambahkan event listener untuk periode tab di Trend Chart
        document.querySelectorAll('.period-tab-detailed[data-chart="trend"]').forEach(tab => {
            tab.addEventListener('click', function() {
                handlePeriodChange(this.dataset.period, 'trend');
            });
        });

        // Tambahkan event listener untuk periode tab di Category Chart
        document.querySelectorAll('.period-tab-detailed[data-chart="category"]').forEach(tab => {
            tab.addEventListener('click', function() {
                handlePeriodChange(this.dataset.period, 'category');
            });
        });

        // Fungsi untuk memperbarui Trend Chart
        function updateTrendChart(period) {
            // Implementasi logika untuk memperbarui grafik berdasarkan periode
            console.log('Updating trend chart for period:', period);
            // TODO: Implementasi logika pembaruan grafik
        }

        // Fungsi untuk memperbarui Category Chart
        function updateCategoryChart(period) {
            // Implementasi logika untuk memperbarui grafik berdasarkan periode
            console.log('Updating category chart for period:', period);
            // TODO: Implementasi logika pembaruan grafik
        }

        // Panggil fungsi untuk memuat data saat halaman dimuat
        loadAndRenderData();

        // Fungsi untuk menampilkan modal manajemen item
        function showItemManagementModal(category) {
          const modal = document.createElement('div');
          modal.className = 'modal-container';
          modal.innerHTML = `
            <div style="background-color: var(--card-bg); padding: 20px; border-radius: 8px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 101; min-width: 300px; border: 1px solid var(--border-color);">
              <h2 style="color: var(--text-color);">Kelola Item ${category}</h2>
              <div style="margin-bottom: 15px;">
                <input type="text" id="new-item-input" placeholder="Nama item baru" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--input-background); color: var(--input-text-color);">
                <button id="add-item-btn" style="width: 100%; padding: 8px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Tambah Item</button>
              </div>
              <div id="items-list" style="max-height: 200px; overflow-y: auto; margin-bottom: 15px; border: 1px solid var(--border-color); border-radius: 4px;">
                ${itemOptions[category].map(item => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid var(--border-color); color: var(--text-color);">
                    <span>${item}</span>
                    <button class="remove-item-btn" data-category="${category}" data-item="${item}" style="background-color: #f44336; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;">Hapus</button>
                  </div>
                `).join('')}
              </div>
              <button id="close-modal-btn" style="width: 100%; padding: 8px; background-color: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">Tutup</button>
            </div>
          `;

          document.body.appendChild(modal);

          // Tambahkan event listener untuk tombol hapus setelah modal ditambahkan ke DOM
          addRemoveItemButtonListeners(category);

          // Event listener untuk tombol tambah item
          document.getElementById('add-item-btn').addEventListener('click', async () => {
            const newItemInput = document.getElementById('new-item-input');
            const newItem = newItemInput.value.trim();
            
            if (newItem) {
                if (!itemOptions[category].includes(newItem)) {
                    itemOptions[category].push(newItem);
                    await saveItemsToFirebase(category, itemOptions[category]); // Simpan ke Firebase
                    updateItemsList(category);
                    updateItemFilter(category);
                    newItemInput.value = '';
                } else {
                    alert('Item sudah ada dalam daftar!');
                }
            }
          });

          // Event listener untuk tombol tutup
          document.getElementById('close-modal-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
          });
        }

        // Fungsi untuk menghapus item
        async function removeItem(category, item) {
          if (confirm(`Apakah Anda yakin ingin menghapus item "${item}"?`)) {
            itemOptions[category] = itemOptions[category].filter(i => i !== item);
            await saveItemsToFirebase(category, itemOptions[category]); // Simpan ke Firebase
            updateItemsList(category);
            updateItemFilter(category);
          }
        }

        // Fungsi untuk memperbarui daftar item di modal
        function updateItemsList(category) {
          const itemsList = document.getElementById('items-list');
          if (itemsList) {
            itemsList.innerHTML = itemOptions[category].map(item => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid var(--border-color); color: var(--text-color);">
                <span>${item}</span>
                <button class="remove-item-btn" data-category="${category}" data-item="${item}" style="background-color: #f44336; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;">Hapus</button>
              </div>
            `).join('');
            // Panggil fungsi untuk menambahkan event listener setelah daftar item diperbarui
            addRemoveItemButtonListeners(category);
          }
        }

        // Fungsi pembantu untuk menambahkan event listener ke tombol hapus
        function addRemoveItemButtonListeners(category) {
            const removeButtons = document.querySelectorAll(`#items-list .remove-item-btn[data-category="${category}"]`);
            removeButtons.forEach(button => {
                button.addEventListener('click', async function() {
                    const itemToRemove = this.getAttribute('data-item');
                    await removeItem(category, itemToRemove);
                });
            });
        }

        // Fungsi untuk memperbarui filter item
        function updateItemFilter(category) {
          const inputItemFilter = document.getElementById('item-filter');
          if (inputItemFilter) {
            const currentValue = inputItemFilter.value;
            inputItemFilter.innerHTML = '<option value="">Pilih Item</option>';
            itemOptions[category].forEach(item => {
              const option = document.createElement('option');
              option.value = item;
              option.textContent = item;
              inputItemFilter.appendChild(option);
            });
            inputItemFilter.value = currentValue;
          }
        }

        // Modifikasi event listener untuk inputKategoriFilter
        if (inputKategoriFilter && inputItemFilter) {
          inputKategoriFilter.addEventListener('change', async function() { // Menjadi async
            const selectedCategory = this.value;
            // itemOptions sekarang seharusnya sudah dimuat di awal DOMContentLoaded
            // Tidak perlu lagi memuat di sini atau mengecek Object.keys(itemOptions).length === 0
            // if (Object.keys(itemOptions).length === 0) {
            //     await loadItemOptionsFromFirebase(); // Muat jika belum
            // }
            console.log('Selected Category:', selectedCategory);
            console.log('Item Options for selected category:', itemOptions[selectedCategory]);
            console.log('Full itemOptions object after category change:', itemOptions);

            if (inputItemFilter) {
              inputItemFilter.innerHTML = '<option value="">Pilih Item</option>';
            }

            if (selectedCategory) {
              // Periksa apakah itemOptions[selectedCategory] sudah ada dan merupakan array
              if (Array.isArray(itemOptions[selectedCategory]) && inputItemFilter) {
                inputItemFilter.disabled = false;
                itemOptions[selectedCategory].forEach(item => {
                  const option = document.createElement('option');
                  option.value = item;
                  option.textContent = item;
                  inputItemFilter.appendChild(option);
                });

                // Tambahkan tombol kelola item
                const filterGroup = inputItemFilter.closest('.filter-group');
                if (filterGroup) {
                  // Hapus tombol kelola yang sudah ada jika ada
                  const existingManageBtn = filterGroup.querySelector('.manage-items-btn');
                  if (existingManageBtn) {
                    existingManageBtn.remove();
                  }

                  // Tambahkan tombol kelola baru
                  const manageBtn = document.createElement('button');
                  manageBtn.className = 'manage-items-btn';
                  manageBtn.textContent = 'Kelola Item';
                  manageBtn.style.cssText = 'margin-top: 5px; padding: 4px 8px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;';
                  manageBtn.onclick = () => showItemManagementModal(selectedCategory);
                  filterGroup.appendChild(manageBtn);
                }
              } else if (inputItemFilter) {
                inputItemFilter.disabled = true;
              }
            } else if (inputItemFilter) {
              inputItemFilter.disabled = true;
            }
          });
        }

        // Tambahkan event listener untuk tombol Submit
        if (submitButton && dateFilter && inputKategoriFilter && inputItemFilter && amountInput && monthFilter) {
             submitButton.addEventListener('click', async function() {
                const selectedDate = dateFilter.value;
                const selectedCategory = inputKategoriFilter.value;
                const selectedItem = inputItemFilter.value;
                const enteredAmount = amountInput.value;
                const selectedMonth = monthFilter.value;

                if (!selectedDate || !selectedCategory || !selectedItem || !enteredAmount || !selectedMonth) {
                    alert('Mohon lengkapi semua field.');
                    return;
                }

                let cleanAmount = enteredAmount.replace(/[^\d.,]/g, '');
                cleanAmount = cleanAmount.replace(',', '.');
                const numericAmount = parseFloat(cleanAmount) || 0;

                const newData = {
                    date: selectedDate,
                    month: selectedMonth,
                    category: selectedCategory,
                    item: selectedItem,
                    amount: numericAmount
                };

                if (typeof db === 'undefined' || !db) {
                    console.error('Firestore is not initialized. Make sure Firebase SDK and config.js are added to your HTML BEFORE detailed.js.');
                    alert('Gagal menyimpan data: Firebase belum siap.');
                    return;
                }

                try {
                    const docRef = await db.collection('cashflow').add(newData);
                    console.log('Document written with ID: ', docRef.id);

                    alert('Data berhasil disimpan ke Firebase!');

                    dateFilter.value = '';
                    inputKategoriFilter.value = '';
                    inputItemFilter.value = '';
                    amountInput.value = '';
                    monthFilter.value = '';
                    if (inputItemFilter) inputItemFilter.disabled = true;

                    // Muat ulang data tabel setelah submit
                    loadAndRenderData(); 
                } catch (error) {
                    console.error('Error adding document to Firestore: ', error);
                    alert('Gagal menyimpan data ke Firebase.\nMohon periksa console untuk detail error.');
                }
            });
        }

        updateWelcomeUser();
    }
});

function updateWelcomeUser() {
  const welcomeUser = document.getElementById('welcomeUser');
  if (!welcomeUser) return;
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      const savedDisplayName = localStorage.getItem('userDisplayName');
      const displayName = user.displayName || savedDisplayName || user.email.split('@')[0];
      welcomeUser.textContent = `Welcome, ${displayName}`;
    } else {
      welcomeUser.textContent = 'Welcome, Guest';
    }
  });
} 