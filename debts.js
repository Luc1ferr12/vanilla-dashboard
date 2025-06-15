// debts.js - Logika khusus untuk halaman debts.html

document.addEventListener('DOMContentLoaded', function() {
    // Hanya jalankan kode ini jika berada di halaman debts.html
    const isDebtsPage = window.location.pathname.endsWith('/debts.html');

    if (isDebtsPage) {
        // Variabel global untuk menyimpan semua data hutang
        let allDebtsData = [];

        // Fungsi untuk memuat data hutang
        async function loadDebts() {
            try {
                const snapshot = await db.collection('debts').get();
                allDebtsData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    // Ensure dueDate is present, calculate if missing or invalid
                    if (!data.dueDate && !data['due-date'] && data['start-date'] && data['paid-installments'] !== undefined) {
                        // Calculate for the *next* installment
                        data.dueDate = calculateNextDueDate(data['start-date'], (data['paid-installments'] || 0) + 1);
                    } else if (!data.dueDate && data['due-date']) {
                        // If it's in kebab-case, copy to camelCase for consistency in render function
                        data.dueDate = data['due-date'];
                    }
                    return {
                        id: doc.id,
                        ...data
                    };
                });

                // Urutkan data berdasarkan jatuh tempo terdekat
                allDebtsData.sort((a, b) => {
                    const dateA = new Date(a.dueDate || a['due-date'] || '');
                    const dateB = new Date(b.dueDate || b['due-date'] || '');
                    return dateA - dateB;
                });

                renderDebtsTable(allDebtsData);
                updateDebtSummaryCards(allDebtsData);
            } catch (error) {
                console.error('Error loading debts:', error);
                alert('Gagal memuat data hutang');
            }
        }

        // Fungsi untuk menghitung tanggal jatuh tempo berikutnya
        function calculateNextDueDate(startDateStr, monthsToAdd) { // monthsToAdd adalah jumlah bulan yang akan ditambahkan setelah tanggal mulai
            console.log('calculateNextDueDate - Input: startDateStr=', startDateStr, ', monthsToAdd=', monthsToAdd);
            const startDate = new Date(startDateStr);
            if (isNaN(startDate.getTime())) {
                console.warn('calculateNextDueDate - Invalid startDateStr:', startDateStr);
                return ''; // Mengembalikan string kosong untuk tanggal mulai yang tidak valid
            }
            
            const nextDueDate = new Date(startDate);
            nextDueDate.setMonth(startDate.getMonth() + monthsToAdd); // Menambahkan bulan secara langsung
            
            const resultDate = nextDueDate.toISOString().split('T')[0];
            console.log('calculateNextDueDate - Output:', resultDate);
            return resultDate;
        }

        // Fungsi untuk merender tabel hutang
        function renderDebtsTable(debts) {
            const tbody = document.querySelector('.debt-table tbody');
            const highlightedTotalSpan = document.getElementById('highlighted-total-amount');
            let highlightedTotal = 0;

            if (!tbody) return;

            tbody.innerHTML = '';
            debts.forEach(debt => {
                console.log('Merenender hutang:', debt);
                const tr = document.createElement('tr');
                tr.setAttribute('data-id', debt.id);
                
                // Dapatkan tanggal 10 bulan ini dan tanggal 10 bulan berikutnya
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();

                const highlightStart = new Date(currentYear, currentMonth, 10);
                let highlightEnd;
                if (currentMonth === 11) { // Desember
                    highlightEnd = new Date(currentYear + 1, 0, 10); // Januari tahun depan
                } else {
                    highlightEnd = new Date(currentYear, currentMonth + 1, 10);
                }

                const dueDate = new Date(debt.dueDate || debt['due-date'] || '');
                dueDate.setHours(0, 0, 0, 0); // Reset time for accurate comparison

                // Periksa apakah dueDate adalah tanggal yang valid dan berada dalam rentang highlight
                if (!isNaN(dueDate.getTime()) && dueDate >= highlightStart && dueDate < highlightEnd) {
                    tr.classList.add('highlight-due-date');
                    highlightedTotal += (debt['monthly-payment'] || 0); // Tambahkan pembayaran bulanan dari hutang yang disorot
                    console.log('HIGHLIGHTED (Upcoming Payment):', debt.id, 'dueDate:', dueDate.toISOString().split('T')[0]);
                }
                // Logika highlight lama (jatuh tempo dalam 7 hari) dihapus

                tr.innerHTML = `
                    <td>${debt.platform || ''}</td>
                    <td>${formatRupiah(debt['loan-amount'] || 0)}</td>
                    <td>${formatRupiah(debt['monthly-payment'] || 0)}</td>
                    <td>${(debt['paid-installments'] || 0)}/${(debt['total-installments'] || 0)}</td>
                    <td>${(debt.dueDate || debt['due-date'] || '')}</td>
                    <td>${debt['start-date'] || ''}</td>
                    <td>${debt.status || ''}</td>
                    <td>${debt.note || ''}</td>
                    <td class="action-buttons">
                        <button class="pay-button" data-id="${debt.id}">Bayar</button>
                        <button class="edit-debt-btn" data-id="${debt.id}">Edit</button>
                        <button class="delete-debt-btn" data-id="${debt.id}">Hapus</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Perbarui total yang disorot di DOM
            if (highlightedTotalSpan) {
                highlightedTotalSpan.textContent = `(Total Tagihan: ${formatRupiah(highlightedTotal)})`;
            }

            // Tambahkan event listener untuk tombol-tombol
            addDebtButtonListeners();
        }

        // Fungsi untuk menambahkan event listener pada tombol-tombol
        function addDebtButtonListeners() {
            // Pay button
            document.querySelectorAll('.pay-button').forEach(button => {
                button.addEventListener('click', handlePayButtonClick);
            });

            // Edit button
            document.querySelectorAll('.edit-debt-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const debtId = this.getAttribute('data-id');
                    const debt = allDebtsData.find(d => d.id === debtId);
                    if (debt) {
                        showEditModal(debt);
                    }
                });
            });

            // Delete button
            document.querySelectorAll('.delete-debt-btn').forEach(button => {
                button.addEventListener('click', async function() {
                    const debtId = this.getAttribute('data-id');
                    if (confirm('Apakah Anda yakin ingin menghapus hutang ini?')) {
                        try {
                            await db.collection('debts').doc(debtId).delete();
                            loadDebts(); // Muat ulang data setelah hapus
                        } catch (error) {
                            console.error('Error deleting debt:', error);
                            alert('Gagal menghapus hutang');
                        }
                    }
                });
            });
        }

        // Handler untuk tombol bayar
        async function handlePayButtonClick(event) {
            const debtId = event.target.getAttribute('data-id');
            const debt = allDebtsData.find(d => d.id === debtId);
            
            // Tambahkan konfirmasi di sini
            if (!confirm('Apakah Anda yakin ingin mencatat pembayaran ini?')) {
                return; // Batalkan jika pengguna tidak mengkonfirmasi
            }

            if (debt && debt['paid-installments'] < debt['total-installments']) {
                try {
                    const newPaidInstallments = debt['paid-installments'] + 1;
                    const nextDueDate = calculateNextDueDate(debt['start-date'], newPaidInstallments);
                    
                    await db.collection('debts').doc(debtId).update({
                        'paid-installments': newPaidInstallments,
                        dueDate: nextDueDate,
                        status: newPaidInstallments === debt['total-installments'] ? 'Lunas' : 'Belum Lunas'
                    });

                    loadDebts(); // Muat ulang data setelah update
                } catch (error) {
                    console.error('Error updating debt payment:', error);
                    alert('Gagal memperbarui pembayaran');
                }
            }
        }

        // Fungsi untuk menampilkan modal edit
        function showEditModal(debt) {
            const modal = document.querySelector('.edit-debt-modal');
            if (!modal) return;

            // Isi form dengan data hutang
            document.getElementById('edit-debt-id').value = debt.id;
            document.getElementById('edit-platform').value = debt.platform;
            document.getElementById('edit-loan-amount').value = debt['loan-amount'];
            document.getElementById('edit-monthly-payment').value = debt['monthly-payment'];
            document.getElementById('edit-start-date').value = debt['start-date'] || '';
            document.getElementById('edit-due-date').value = debt.dueDate;
            document.getElementById('edit-status').value = debt.status;
            document.getElementById('edit-total-installments').value = debt['total-installments'] || 0;
            document.getElementById('edit-paid-installments').value = debt['paid-installments'] || 0;
            document.getElementById('edit-note').value = debt.note || '';

            // Tampilkan modal
            modal.style.display = 'flex'; // Use flex to center content
            modal.classList.add('active'); // Add active class for visibility transition
        }

        // Fungsi untuk menyembunyikan modal edit
        function hideEditModal() {
            const modal = document.querySelector('.edit-debt-modal');
            if (modal) {
                modal.classList.remove('active'); // Remove active class
                modal.style.display = 'none'; // Hide after transition (optional, but good practice)
            }
        }

        // Event listener untuk form tambah hutang
        const addDebtForm = document.getElementById('add-debt-form');
        const startDateInput = document.getElementById('start-date');
        const totalInstallmentsSelect = document.getElementById('total-installments');
        const dueDateInput = document.getElementById('due-date');

        function updateAddFormDueDate() {
            const startDateValue = startDateInput.value;
            const totalInstallmentsValue = parseInt(totalInstallmentsSelect.value);
            if (startDateValue && !isNaN(totalInstallmentsValue)) {
                dueDateInput.value = calculateNextDueDate(startDateValue, 0); // Calculate initial due date for first installment
            }
        }

        if (startDateInput) {
            startDateInput.addEventListener('change', updateAddFormDueDate);
        }
        if (totalInstallmentsSelect) {
            totalInstallmentsSelect.addEventListener('change', updateAddFormDueDate);
        }
        // Initial calculation if values are pre-filled
        updateAddFormDueDate();

        if (addDebtForm) {
            addDebtForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const formData = {
                    platform: document.getElementById('platform').value,
                    'loan-amount': cleanInputNumberString(document.getElementById('loan-amount').value),
                    'monthly-payment': cleanInputNumberString(document.getElementById('monthly-payment').value),
                    'start-date': startDateInput.value, // Use the variable
                    dueDate: dueDateInput.value, // Use the variable
                    status: document.getElementById('status').value,
                    'total-installments': parseInt(totalInstallmentsSelect.value), // Use the variable
                    'paid-installments': parseInt(document.getElementById('paid-installments').value),
                    note: document.getElementById('note').value
                };

                try {
                    await db.collection('debts').add(formData);
                    addDebtForm.reset();
                    updateAddFormDueDate(); // Recalculate for empty form
                    loadDebts(); // Muat ulang data setelah tambah
                } catch (error) {
                    console.error('Error adding debt:', error);
                    alert('Gagal menambahkan hutang');
                }
            });
        }

        // Event listener untuk form edit hutang
        const editDebtForm = document.getElementById('edit-debt-form');
        const editStartDateInput = document.getElementById('edit-start-date');
        const editTotalInstallmentsSelect = document.getElementById('edit-total-installments');
        const editDueDateInput = document.getElementById('edit-due-date');

        function updateEditFormDueDate() {
            const startDateValue = editStartDateInput.value;
            const totalInstallmentsValue = parseInt(editTotalInstallmentsSelect.value);
            if (startDateValue && !isNaN(totalInstallmentsValue)) {
                const paidInstallmentsValue = parseInt(document.getElementById('edit-paid-installments').value) || 0;
                // Calculate for the *next* installment
                editDueDateInput.value = calculateNextDueDate(startDateValue, paidInstallmentsValue + 1);
            }
        }

        if (editStartDateInput) {
            editStartDateInput.addEventListener('change', updateEditFormDueDate);
        }
        if (editTotalInstallmentsSelect) {
            editTotalInstallmentsSelect.addEventListener('change', updateEditFormDueDate);
        }

        // Override showEditModal to ensure due date is calculated when modal opens
        const originalShowEditModal = showEditModal;
        showEditModal = function(debt) {
            originalShowEditModal(debt);
            // Set values and then update due date based on them
            document.getElementById('edit-start-date').value = debt['start-date'] || '';
            document.getElementById('edit-total-installments').value = debt['total-installments'] || 0;
            document.getElementById('edit-paid-installments').value = debt['paid-installments'] || 0; // Ensure paid installments is set
            updateEditFormDueDate(); // Calculate after setting initial values
        };

        if (editDebtForm) {
            editDebtForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const debtId = document.getElementById('edit-debt-id').value;
                const formData = {
                    platform: document.getElementById('edit-platform').value,
                    'loan-amount': cleanInputNumberString(document.getElementById('edit-loan-amount').value),
                    'monthly-payment': cleanInputNumberString(document.getElementById('edit-monthly-payment').value),
                    'start-date': editStartDateInput.value, // Use the variable
                    dueDate: editDueDateInput.value, // Use the variable
                    status: document.getElementById('edit-status').value,
                    'total-installments': parseInt(editTotalInstallmentsSelect.value), // Use the variable
                    'paid-installments': parseInt(document.getElementById('edit-paid-installments').value),
                    note: document.getElementById('edit-note').value
                };

                try {
                    await db.collection('debts').doc(debtId).update(formData);
                    hideEditModal();
                    loadDebts(); // Muat ulang data setelah edit
                } catch (error) {
                    console.error('Error updating debt:', error);
                    alert('Gagal memperbarui hutang');
                }
            });
        }

        // Event listener untuk tombol batal di modal edit
        const cancelEditButton = document.getElementById('cancel-edit-btn');
        if (cancelEditButton) {
            cancelEditButton.addEventListener('click', hideEditModal);
        }

        // Event listener untuk filter status
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', function() {
                const filteredDebts = this.value === 'all' 
                    ? allDebtsData 
                    : allDebtsData.filter(debt => debt.status === this.value);
                renderDebtsTable(filteredDebts);
            });
        }

        // Event listener untuk filter urutan
        const sortBy = document.getElementById('sort-by');
        if (sortBy) {
            sortBy.addEventListener('change', function() {
                let sortedDebts = [...allDebtsData];
                switch (this.value) {
                    case 'dueDateAsc':
                        sortedDebts.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                        break;
                    case 'dueDateDesc':
                        sortedDebts.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
                        break;
                    case 'loanAmountDesc':
                        sortedDebts.sort((a, b) => b['loan-amount'] - a['loan-amount']);
                        break;
                    case 'loanAmountAsc':
                        sortedDebts.sort((a, b) => a['loan-amount'] - b['loan-amount']);
                        break;
                }
                renderDebtsTable(sortedDebts);
            });
        }

        // Fungsi untuk memperbarui kartu ringkasan hutang
        function updateDebtSummaryCards(data) {
            const totalLoan = data.reduce((sum, debt) => sum + debt['loan-amount'], 0);
            const totalPaid = data.reduce((sum, debt) => sum + (debt['monthly-payment'] * debt['paid-installments']), 0);
            const totalInterest = data.reduce((sum, debt) => {
                const totalPayment = debt['monthly-payment'] * debt['total-installments'];
                return sum + (totalPayment - debt['loan-amount']);
            }, 0);
            const remainingDebt = totalLoan - totalPaid;

            // Update nilai di kartu
            document.getElementById('total-loan-value').textContent = formatRupiah(totalLoan);
            document.getElementById('total-interest-value').textContent = formatRupiah(totalInterest);
            document.getElementById('total-paid-value').textContent = formatRupiah(totalPaid);
            document.getElementById('remaining-debt-value').textContent = formatRupiah(remainingDebt);
        }

        // Muat data saat halaman dimuat
        loadDebts();

        // Paparkan allDebtsData ke objek window setelah dimuat
        window.allDebtsData = allDebtsData;
    }
}); 