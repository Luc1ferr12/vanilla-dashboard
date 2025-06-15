// budget_tools.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('budget_tools.js loaded');

  const categoryInput = document.getElementById('category-input');
  const targetAmountInput = document.getElementById('target-amount-input');
  const addBudgetTargetBtn = document.getElementById('add-budget-target-btn');
  const budgetTargetTableBody = document.querySelector('#budget-target-table tbody');

  // Pastikan db dari Firebase Firestore sudah tersedia (dari config.js/common.js)
  // Jika 'db' belum didefinisikan, Anda perlu memastikan config.js sudah dimuat dengan benar
  // dan db diekspor atau tersedia secara global.
  if (typeof db === 'undefined') {
    console.error('Firestore (db) not initialized. Make sure config.js is loaded correctly.');
    return;
  }

  // Fungsi untuk memuat dan menampilkan target budget dari Firestore
  const loadBudgetTargets = async () => {
    budgetTargetTableBody.innerHTML = ''; // Bersihkan tabel sebelum memuat ulang
    try {
      const querySnapshot = await db.collection('budgetTargets').orderBy('category').get();
      querySnapshot.forEach((doc) => {
        renderBudgetTarget(doc);
      });
    } catch (error) {
      console.error('Error loading budget targets:', error);
    }
  };

  // Fungsi untuk merender satu baris target budget ke tabel
  const renderBudgetTarget = (doc) => {
    const data = doc.data();
    const row = budgetTargetTableBody.insertRow();
    row.setAttribute('data-id', doc.id);

    row.insertCell(0).textContent = data.category;
    row.insertCell(1).textContent = `Rp ${data.targetAmount.toLocaleString('id-ID')}`;

    const actionsCell = row.insertCell(2);
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('edit-btn');
    editBtn.addEventListener('click', () => editBudgetTarget(doc.id, data));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Hapus';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => deleteBudgetTarget(doc.id));

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
  };

  // Fungsi untuk menambahkan target budget baru
  addBudgetTargetBtn.addEventListener('click', async () => {
    const category = categoryInput.value.trim();
    const targetAmount = parseFloat(targetAmountInput.value);

    if (!category || isNaN(targetAmount) || targetAmount <= 0) {
      alert('Harap isi kategori dan jumlah target yang valid.');
      return;
    }

    try {
      await db.collection('budgetTargets').add({
        category: category,
        targetAmount: targetAmount,
        createdAt: firebase.firestore.FieldValue.serverTimestamp() // Menambahkan timestamp
      });
      categoryInput.value = '';
      targetAmountInput.value = '';
      loadBudgetTargets(); // Muat ulang data setelah menambahkan
    } catch (error) {
      console.error('Error adding budget target:', error);
      alert('Gagal menambahkan target budget. Coba lagi.');
    }
  });

  // Fungsi untuk menghapus target budget
  const deleteBudgetTarget = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus target budget ini?')) {
      try {
        await db.collection('budgetTargets').doc(id).delete();
        loadBudgetTargets(); // Muat ulang data setelah menghapus
      } catch (error) {
        console.error('Error deleting budget target:', error);
        alert('Gagal menghapus target budget. Coba lagi.');
      }
    }
  };

  // Fungsi untuk mengedit target budget (implementasi dasar)
  const editBudgetTarget = async (id, currentData) => {
    // Dapatkan referensi ke elemen modal
    const editBudgetTargetModal = document.getElementById('edit-budget-target-modal');
    const editBudgetTargetIdInput = document.getElementById('edit-budget-target-id');
    const editBudgetCategoryInput = document.getElementById('edit-budget-category');
    const editBudgetTargetAmountInput = document.getElementById('edit-budget-amount');
    const saveBudgetTargetBtn = document.getElementById('save-budget-target-btn');
    const cancelBudgetTargetBtn = document.getElementById('cancel-budget-target-btn');

    // Isi form modal dengan data saat ini
    editBudgetTargetIdInput.value = id;
    editBudgetCategoryInput.value = currentData.category;
    editBudgetTargetAmountInput.value = currentData.targetAmount;

    // Tampilkan modal
    editBudgetTargetModal.style.display = 'flex';

    // Hapus event listener sebelumnya untuk menghindari duplikasi
    const oldSaveBtn = saveBudgetTargetBtn.cloneNode(true);
    saveBudgetTargetBtn.parentNode.replaceChild(oldSaveBtn, saveBudgetTargetBtn);
    const oldCancelBtn = cancelBudgetTargetBtn.cloneNode(true);
    cancelBudgetTargetBtn.parentNode.replaceChild(oldCancelBtn, cancelBudgetTargetBtn);

    // Event listener untuk tombol Simpan
    oldSaveBtn.addEventListener('click', async () => {
      const newCategory = editBudgetCategoryInput.value.trim();
      const newTargetAmount = parseFloat(editBudgetTargetAmountInput.value);

      if (!newCategory || isNaN(newTargetAmount) || newTargetAmount <= 0) {
        alert('Input tidak valid. Harap isi kategori dan jumlah target yang valid.');
        return;
      }
      try {
        await db.collection('budgetTargets').doc(id).update({
          category: newCategory,
          targetAmount: newTargetAmount,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        editBudgetTargetModal.style.display = 'none'; // Sembunyikan modal
        loadBudgetTargets(); // Muat ulang data setelah mengedit
      } catch (error) {
        console.error('Error updating budget target:', error);
        alert('Gagal mengedit target budget. Coba lagi.');
      }
    });

    // Event listener untuk tombol Batal
    oldCancelBtn.addEventListener('click', () => {
      editBudgetTargetModal.style.display = 'none'; // Sembunyikan modal
    });

    // Tutup modal jika klik di luar area konten modal
    editBudgetTargetModal.addEventListener('click', function(event) {
        if (event.target === editBudgetTargetModal) {
            editBudgetTargetModal.style.display = 'none';
        }
    });
  };

  // Panggil fungsi untuk memuat data saat halaman dimuat
  loadBudgetTargets();

  // ===============================================
  // Logika untuk Fitur Perencanaan Keuangan Jangka Panjang
  // ===============================================
  const longTermGoalNameInput = document.getElementById('long-term-goal-name');
  const longTermTargetAmountInput = document.getElementById('long-term-target-amount');
  const longTermTargetDateInput = document.getElementById('long-term-target-date');
  const addLongTermGoalBtn = document.getElementById('add-long-term-goal-btn');
  const longTermGoalsTableBody = document.querySelector('#long-term-goals-table tbody');

  // Fungsi untuk memuat dan menampilkan tujuan jangka panjang dari Firestore
  const loadLongTermGoals = async () => {
    longTermGoalsTableBody.innerHTML = ''; // Bersihkan tabel sebelum memuat ulang
    try {
      const querySnapshot = await db.collection('longTermGoals').orderBy('targetDate').get();
      querySnapshot.forEach((doc) => {
        renderLongTermGoal(doc);
      });
    } catch (error) {
      console.error('Error loading long-term goals:', error);
    }
  };

  // Fungsi untuk merender satu baris tujuan jangka panjang ke tabel
  const renderLongTermGoal = (doc) => {
    const data = doc.data();
    const row = longTermGoalsTableBody.insertRow();
    row.setAttribute('data-id', doc.id);

    row.insertCell(0).textContent = data.name;
    row.insertCell(1).textContent = `Rp ${data.targetAmount.toLocaleString('id-ID')}`;
    row.insertCell(2).textContent = data.targetDate; // Format tanggal jika perlu

    const actionsCell = row.insertCell(3);
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('edit-btn');
    editBtn.addEventListener('click', () => editLongTermGoal(doc.id, data));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Hapus';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => deleteLongTermGoal(doc.id));

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
  };

  // Fungsi untuk menambahkan tujuan jangka panjang baru
  addLongTermGoalBtn.addEventListener('click', async () => {
    const name = longTermGoalNameInput.value.trim();
    const targetAmount = parseFloat(longTermTargetAmountInput.value);
    const targetDate = longTermTargetDateInput.value;

    if (!name || isNaN(targetAmount) || targetAmount <= 0 || !targetDate) {
      alert('Harap isi semua kolom Tujuan Jangka Panjang dengan valid.');
      return;
    }

    try {
      await db.collection('longTermGoals').add({
        name: name,
        targetAmount: targetAmount,
        targetDate: targetDate,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      longTermGoalNameInput.value = '';
      longTermTargetAmountInput.value = '';
      longTermTargetDateInput.value = '';
      loadLongTermGoals(); // Muat ulang data setelah menambahkan
    } catch (error) {
      console.error('Error adding long-term goal:', error);
      alert('Gagal menambahkan tujuan jangka panjang. Coba lagi.');
    }
  });

  // Fungsi untuk menghapus tujuan jangka panjang
  const deleteLongTermGoal = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus tujuan jangka panjang ini?')) {
      try {
        await db.collection('longTermGoals').doc(id).delete();
        loadLongTermGoals(); // Muat ulang data setelah menghapus
      } catch (error) {
        console.error('Error deleting long-term goal:', error);
        alert('Gagal menghapus tujuan jangka panjang. Coba lagi.');
      }
    }
  };

  // Fungsi untuk mengedit tujuan jangka panjang
  const editLongTermGoal = async (id, currentData) => {
    const newName = prompt('Edit Nama Tujuan:', currentData.name);
    const newTargetAmount = prompt('Edit Jumlah Target (Rp):', currentData.targetAmount);
    const newTargetDate = prompt('Edit Target Tanggal (YYYY-MM-DD):', currentData.targetDate);

    if (newName !== null && newTargetAmount !== null && newTargetDate !== null) {
      const parsedAmount = parseFloat(newTargetAmount);
      if (!newName.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !newTargetDate.trim()) {
        alert('Input tidak valid. Harap isi semua kolom dengan valid.');
        return;
      }
      try {
        await db.collection('longTermGoals').doc(id).update({
          name: newName.trim(),
          targetAmount: parsedAmount,
          targetDate: newTargetDate.trim(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        loadLongTermGoals(); // Muat ulang data setelah mengedit
      } catch (error) {
        console.error('Error updating long-term goal:', error);
        alert('Gagal mengedit tujuan jangka panjang. Coba lagi.');
      }
    }
  };

  // Panggil fungsi untuk memuat data tujuan jangka panjang saat halaman dimuat
  loadLongTermGoals();

  // ===============================================
  // Logika untuk Fitur "Sinking Fund"
  // ===============================================
  const sinkingFundNameInput = document.getElementById('sinking-fund-name');
  const sinkingFundTargetAmountInput = document.getElementById('sinking-fund-target-amount');
  const sinkingFundTargetDateInput = document.getElementById('sinking-fund-target-date');
  const addSinkingFundBtn = document.getElementById('add-sinking-fund-btn');
  const sinkingFundTableBody = document.querySelector('#sinking-fund-table tbody');

  // ===============================================
  // Logika untuk Kalkulator Investasi & Bunga
  // ===============================================
  const investmentTypeSelect = document.getElementById('investment-type');
  const generalInvestmentInputs = document.getElementById('general-investment-inputs');
  const cryptoInvestmentInputs = document.getElementById('crypto-investment-inputs');
  const goldInvestmentInputs = document.getElementById('gold-investment-inputs');
  const calculateInvestmentBtn = document.getElementById('calculate-investment-btn');
  const finalAmountDisplay = document.getElementById('final-amount');
  const totalInterestDisplay = document.getElementById('total-interest');
  const cryptoGoldProfitLossDisplay = document.getElementById('crypto-gold-profit-loss');
  const profitLossAmountDisplay = document.getElementById('profit-loss-amount');

  const principalAmountInput = document.getElementById('principal-amount');
  const interestRateInput = document.getElementById('interest-rate');
  const durationYearsInput = document.getElementById('duration-years');

  // Referensi elemen custom dropdown kripto
  const cryptoCustomDropdown = document.getElementById('crypto-custom-dropdown');
  const cryptoSelectedCoin = document.getElementById('crypto-selected-coin');
  const cryptoSelectedCoinIcon = document.getElementById('crypto-selected-coin-icon');
  const cryptoSelectedCoinName = document.getElementById('crypto-selected-coin-name');
  const cryptoDropdownOptions = document.getElementById('crypto-dropdown-options');
  let selectedCryptoCoinId = 'bitcoin'; // Default coin

  const cryptoInvestmentAmountInput = document.getElementById('crypto-investment-amount');
  const cryptoAnnualGrowthInput = document.getElementById('crypto-annual-growth');

  const goldCurrentPriceInput = document.getElementById('gold-current-price-input');
  const goldInvestmentAmountInput = document.getElementById('gold-investment-amount');
  const goldAnnualGrowthInput = document.getElementById('gold-annual-growth');

  const cryptoCurrentPriceDisplay = document.getElementById('crypto-current-price');

  // Fungsi untuk menampilkan/menyembunyikan input berdasarkan jenis investasi
  const showInvestmentInputs = () => {
    const selectedType = investmentTypeSelect.value;
    generalInvestmentInputs.style.display = 'none';
    cryptoInvestmentInputs.style.display = 'none';
    goldInvestmentInputs.style.display = 'none';
    cryptoGoldProfitLossDisplay.style.display = 'none'; // Sembunyikan default

    if (selectedType === 'general') {
      generalInvestmentInputs.style.display = 'block';
    } else if (selectedType === 'crypto') {
      cryptoInvestmentInputs.style.display = 'block';
      cryptoGoldProfitLossDisplay.style.display = 'block';
    } else if (selectedType === 'gold') {
      goldInvestmentInputs.style.display = 'block';
      cryptoGoldProfitLossDisplay.style.display = 'block';
    }
  };

  // Event listener untuk perubahan jenis investasi
  investmentTypeSelect.addEventListener('change', showInvestmentInputs);

  // Panggil saat pertama kali dimuat untuk mengatur tampilan awal
  showInvestmentInputs();

  // Logika untuk custom dropdown kripto
  cryptoSelectedCoin.addEventListener('click', () => {
    cryptoDropdownOptions.classList.toggle('active');
    cryptoSelectedCoin.classList.toggle('active');
  });

  // Tutup dropdown saat klik di luar
  document.addEventListener('click', (event) => {
    if (!cryptoCustomDropdown.contains(event.target)) {
      cryptoDropdownOptions.classList.remove('active');
      cryptoSelectedCoin.classList.remove('active');
    }
  });

  // Fungsi untuk mengambil daftar koin kripto yang sedang tren (atau populer)
  // dan harganya dari CoinGecko API
  const fetchTrendingCryptoCoins = async () => {
    console.log('Memulai fetchTrendingCryptoCoins...');
    try {
        // Perhatikan parameter 'image' untuk mendapatkan URL ikon
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=7d&locale=en');
        const data = await response.json();
        console.log('CoinGecko API Response (with images):', data);

        cryptoDropdownOptions.innerHTML = ''; // Bersihkan opsi sebelumnya

        // Pastikan Bitcoin selalu menjadi opsi pertama
        const bitcoinData = data.find(coin => coin.id === 'bitcoin') || { id: 'bitcoin', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579' };
        const coinsToDisplay = [bitcoinData, ...data.filter(coin => coin.id !== 'bitcoin')];

        coinsToDisplay.forEach(coin => {
            const optionItem = document.createElement('div');
            optionItem.classList.add('option-item');
            optionItem.setAttribute('data-coin-id', coin.id);
            optionItem.setAttribute('data-coin-name', coin.name);
            optionItem.setAttribute('data-coin-image', coin.image);

            const img = document.createElement('img');
            img.src = coin.image;
            img.alt = `${coin.name} Icon`;
            img.classList.add('coin-icon');

            const span = document.createElement('span');
            span.textContent = coin.name;

            optionItem.appendChild(img);
            optionItem.appendChild(span);
            cryptoDropdownOptions.appendChild(optionItem);

            optionItem.addEventListener('click', () => {
                selectedCryptoCoinId = coin.id;
                cryptoSelectedCoinIcon.src = coin.image;
                cryptoSelectedCoinIcon.style.display = 'inline-block'; // Tampilkan ikon
                cryptoSelectedCoinName.textContent = coin.name;
                cryptoDropdownOptions.classList.remove('active');
                cryptoSelectedCoin.classList.remove('active');
                fetchCryptoPrice(selectedCryptoCoinId, cryptoCurrentPriceDisplay); // Ambil harga untuk koin yang dipilih
            });
        });

        // Set pilihan awal (Bitcoin)
        cryptoSelectedCoinIcon.src = bitcoinData.image;
        cryptoSelectedCoinIcon.style.display = 'inline-block';
        cryptoSelectedCoinName.textContent = bitcoinData.name;
        selectedCryptoCoinId = bitcoinData.id;

        // Ambil harga awal untuk Bitcoin
        fetchCryptoPrice('bitcoin', cryptoCurrentPriceDisplay);

        console.log('Harga Bitcoin awal dimuat:', cryptoCurrentPriceDisplay.textContent);

    } catch (error) {
        console.error('Error fetching crypto coins:', error);
        cryptoDropdownOptions.innerHTML = '<div class="option-item">Gagal memuat koin</div>';
        cryptoSelectedCoinIcon.style.display = 'none';
        cryptoSelectedCoinName.textContent = 'Gagal memuat harga';
    }
  };

  // Fungsi untuk mengambil harga koin kripto tertentu
  const fetchCryptoPrice = async (coinId, priceDisplayElement) => {
    console.log(`Memulai fetchCryptoPrice untuk ${coinId}...`);
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
        const data = await response.json();
        console.log(`Respons simple/price untuk ${coinId}:`, data);
        const price = data[coinId]?.usd || 0;
        priceDisplayElement.textContent = formatRupiah(price * formatRupiah.conversionRate);
        console.log(`Harga saat ini untuk ${coinId}:`, priceDisplayElement.textContent);

    } catch (error) {
        console.error(`Error fetching price for ${coinId}:`, error);
        priceDisplayElement.textContent = 'Gagal memuat harga';
    }
  };

  // Panggil saat halaman dimuat untuk mengisi pilihan koin dan data awal
  fetchTrendingCryptoCoins();

  // Event listener untuk tombol Hitung
  calculateInvestmentBtn.addEventListener('click', () => {
    const investmentType = investmentTypeSelect.value;
    const durationYears = parseFloat(durationYearsInput.value);

    if (isNaN(durationYears) || durationYears <= 0) {
        alert('Harap masukkan durasi (tahun) yang valid.');
        return;
    }

    let finalAmount = 0;
    let totalInterestOrProfitLoss = 0;

    if (investmentType === 'general') {
      const principalAmount = parseFloat(principalAmountInput.value);
      const interestRate = parseFloat(interestRateInput.value) / 100;

      if (isNaN(principalAmount) || principalAmount <= 0 || isNaN(interestRate) || interestRate <= 0) {
        alert('Harap isi jumlah pokok dan tingkat bunga yang valid untuk investasi umum.');
        return;
      }

      finalAmount = principalAmount * Math.pow((1 + interestRate), durationYears);
      totalInterestOrProfitLoss = finalAmount - principalAmount;
      totalInterestDisplay.parentNode.style.display = 'block';
      cryptoGoldProfitLossDisplay.style.display = 'none';

    } else if (investmentType === 'crypto') {
      const initialInvestment = parseFloat(cryptoInvestmentAmountInput.value);
      const annualGrowth = parseFloat(cryptoAnnualGrowthInput.value) / 100;
      const currentPriceText = cryptoCurrentPriceDisplay.textContent;
      const currentPrice = parseFloat(currentPriceText.replace(/^Rp\s*/, '').replace(/\./g, '').replace(',', '.')) || 0;

      if (isNaN(initialInvestment) || initialInvestment <= 0 || isNaN(annualGrowth) || currentPrice <= 0) { // Menghapus validasi annualGrowth <= 0
        alert('Harap isi jumlah investasi, asumsi pertumbuhan tahunan, dan pastikan harga kripto dimuat untuk kalkulator kripto.');
        return;
      }

      finalAmount = initialInvestment * Math.pow((1 + annualGrowth), durationYears);
      totalInterestOrProfitLoss = finalAmount - initialInvestment;
      totalInterestDisplay.parentNode.style.display = 'none';
      cryptoGoldProfitLossDisplay.style.display = 'block';

    } else if (investmentType === 'gold') {
      const initialInvestment = parseFloat(goldInvestmentAmountInput.value);
      const annualGrowth = parseFloat(goldAnnualGrowthInput.value) / 100;

      if (isNaN(initialInvestment) || initialInvestment <= 0 || isNaN(annualGrowth) || annualGrowth <= 0) {
        alert('Harap isi jumlah investasi dan asumsi pertumbuhan tahunan untuk kalkulator emas.');
        return;
      }

      finalAmount = initialInvestment * Math.pow((1 + annualGrowth), durationYears);
      totalInterestOrProfitLoss = finalAmount - initialInvestment;
      totalInterestDisplay.parentNode.style.display = 'none';
      cryptoGoldProfitLossDisplay.style.display = 'block';
    }

    finalAmountDisplay.textContent = formatRupiah(finalAmount);
    profitLossAmountDisplay.textContent = formatRupiah(totalInterestOrProfitLoss);
    totalInterestDisplay.textContent = formatRupiah(totalInterestOrProfitLoss);
  });

  // Fungsi untuk memuat dan menampilkan sinking fund dari Firestore
  const loadSinkingFunds = async () => {
    sinkingFundTableBody.innerHTML = ''; // Bersihkan tabel sebelum memuat ulang
    try {
      const querySnapshot = await db.collection('sinkingFunds').orderBy('targetDate').get();
      querySnapshot.forEach((doc) => {
        renderSinkingFund(doc);
      });
    } catch (error) {
      console.error('Error loading sinking funds:', error);
    }
  };

  // Fungsi untuk merender satu baris sinking fund ke tabel
  const renderSinkingFund = (doc) => {
    const data = doc.data();
    const row = sinkingFundTableBody.insertRow();
    row.setAttribute('data-id', doc.id);

    row.insertCell(0).textContent = data.name;
    row.insertCell(1).textContent = `Rp ${data.targetAmount.toLocaleString('id-ID')}`;
    row.insertCell(2).textContent = data.targetDate; // Format tanggal jika perlu

    const actionsCell = row.insertCell(3);
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('edit-btn');
    editBtn.addEventListener('click', () => editSinkingFund(doc.id, data));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Hapus';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => deleteSinkingFund(doc.id));

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
  };

  // Fungsi untuk menambahkan sinking fund baru
  addSinkingFundBtn.addEventListener('click', async () => {
    const name = sinkingFundNameInput.value.trim();
    const targetAmount = parseFloat(sinkingFundTargetAmountInput.value);
    const targetDate = sinkingFundTargetDateInput.value;

    if (!name || isNaN(targetAmount) || targetAmount <= 0 || !targetDate) {
      alert('Harap isi semua kolom Sinking Fund dengan valid.');
      return;
    }

    try {
      await db.collection('sinkingFunds').add({
        name: name,
        targetAmount: targetAmount,
        targetDate: targetDate,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      sinkingFundNameInput.value = '';
      sinkingFundTargetAmountInput.value = '';
      sinkingFundTargetDateInput.value = '';
      loadSinkingFunds(); // Muat ulang data setelah menambahkan
    } catch (error) {
      console.error('Error adding sinking fund:', error);
      alert('Gagal menambahkan sinking fund. Coba lagi.');
    }
  });

  // Fungsi untuk menghapus sinking fund
  const deleteSinkingFund = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus sinking fund ini?')) {
      try {
        await db.collection('sinkingFunds').doc(id).delete();
        loadSinkingFunds(); // Muat ulang data setelah menghapus
      } catch (error) {
        console.error('Error deleting sinking fund:', error);
        alert('Gagal menghapus sinking fund. Coba lagi.');
      }
    }
  };

  // Fungsi untuk mengedit sinking fund
  const editSinkingFund = async (id, currentData) => {
    const newName = prompt('Edit Nama Dana:', currentData.name);
    const newTargetAmount = prompt('Edit Jumlah Target (Rp):', currentData.targetAmount);
    const newTargetDate = prompt('Edit Target Tanggal (YYYY-MM-DD):', currentData.targetDate);

    if (newName !== null && newTargetAmount !== null && newTargetDate !== null) {
      const parsedAmount = parseFloat(newTargetAmount);
      if (!newName.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !newTargetDate.trim()) {
        alert('Input tidak valid. Harap isi semua kolom dengan valid.');
        return;
      }
      try {
        await db.collection('sinkingFunds').doc(id).update({
          name: newName.trim(),
          targetAmount: parsedAmount,
          targetDate: newTargetDate.trim(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        loadSinkingFunds(); // Muat ulang data setelah mengedit
      } catch (error) {
        console.error('Error updating sinking fund:', error);
        alert('Gagal mengedit sinking fund. Coba lagi.');
      }
    }
  };

  // Panggil fungsi untuk memuat data sinking fund saat halaman dimuat
  loadSinkingFunds();

  // Inisialisasi Flatpickr untuk input tanggal
  flatpickr("#long-term-target-date", {
    dateFormat: "d/m/Y",
    allowInput: true,
    locale: "id" // Atur locale ke Indonesia jika perlu
  });

  flatpickr("#sinking-fund-target-date", {
    dateFormat: "d/m/Y",
    allowInput: true,
    locale: "id"
  });

  // Fungsi untuk memformat tanggal ke YYYY-MM-DD untuk penyimpanan Firestore
  const formatDateForFirestore = (dateString) => {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    } 
    return dateString; // Kembali ke string asli jika format tidak sesuai
  };

  // Perbarui addLongTermGoalBtn event listener untuk memformat tanggal
  addLongTermGoalBtn.removeEventListener('click', addLongTermGoalBtn.listener);
  addLongTermGoalBtn.listener = async () => {
    const name = longTermGoalNameInput.value.trim();
    const targetAmount = parseFloat(longTermTargetAmountInput.value);
    const rawTargetDate = longTermTargetDateInput.value;
    const targetDate = formatDateForFirestore(rawTargetDate);

    if (!name || isNaN(targetAmount) || targetAmount <= 0 || !rawTargetDate) {
      alert('Harap isi semua kolom Tujuan Jangka Panjang dengan valid.');
      return;
    }

    try {
      await db.collection('longTermGoals').add({
        name: name,
        targetAmount: targetAmount,
        targetDate: targetDate, // Simpan dalam format YYYY-MM-DD
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      longTermGoalNameInput.value = '';
      longTermTargetAmountInput.value = '';
      longTermTargetDateInput.value = '';
      loadLongTermGoals(); // Muat ulang data setelah menambahkan
    } catch (error) {
      console.error('Error adding long-term goal:', error);
      alert('Gagal menambahkan tujuan jangka panjang. Coba lagi.');
    }
  };
  addLongTermGoalBtn.addEventListener('click', addLongTermGoalBtn.listener);

  // Perbarui addSinkingFundBtn event listener untuk memformat tanggal
  addSinkingFundBtn.removeEventListener('click', addSinkingFundBtn.listener);
  addSinkingFundBtn.listener = async () => {
    const name = sinkingFundNameInput.value.trim();
    const targetAmount = parseFloat(sinkingFundTargetAmountInput.value);
    const rawTargetDate = sinkingFundTargetDateInput.value;
    const targetDate = formatDateForFirestore(rawTargetDate);

    if (!name || isNaN(targetAmount) || targetAmount <= 0 || !rawTargetDate) {
      alert('Harap isi semua kolom Sinking Fund dengan valid.');
      return;
    }

    try {
      await db.collection('sinkingFunds').add({
        name: name,
        targetAmount: targetAmount,
        targetDate: targetDate, // Simpan dalam format YYYY-MM-DD
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      sinkingFundNameInput.value = '';
      sinkingFundTargetAmountInput.value = '';
      sinkingFundTargetDateInput.value = '';
      loadSinkingFunds(); // Muat ulang data setelah menambahkan
    } catch (error) {
      console.error('Error adding sinking fund:', error);
      alert('Gagal menambahkan dana sinking fund. Coba lagi.');
    }
  };
  addSinkingFundBtn.addEventListener('click', addSinkingFundBtn.listener);

  // Perbarui fungsi renderLongTermGoal untuk menampilkan tanggal yang diformat
  const originalRenderLongTermGoal = renderLongTermGoal;
  renderLongTermGoal = (doc) => {
    const data = doc.data();
    // Format tanggal dari YYYY-MM-DD menjadi DD/MM/YYYY untuk tampilan
    const displayDate = data.targetDate ? data.targetDate.split('-').reverse().join('/') : '';
    const row = longTermGoalsTableBody.insertRow();
    row.setAttribute('data-id', doc.id);

    row.insertCell(0).textContent = data.name;
    row.insertCell(1).textContent = `Rp ${data.targetAmount.toLocaleString('id-ID')}`;
    row.insertCell(2).textContent = displayDate; // Gunakan tanggal yang diformat

    const actionsCell = row.insertCell(3);
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('edit-btn');
    editBtn.addEventListener('click', () => editLongTermGoal(doc.id, data));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Hapus';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => deleteLongTermGoal(doc.id));

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
  };

  // Perbarui fungsi renderSinkingFund untuk menampilkan tanggal yang diformat
  const originalRenderSinkingFund = renderSinkingFund;
  renderSinkingFund = (doc) => {
    const data = doc.data();
    // Format tanggal dari YYYY-MM-DD menjadi DD/MM/YYYY untuk tampilan
    const displayDate = data.targetDate ? data.targetDate.split('-').reverse().join('/') : '';
    const row = sinkingFundTableBody.insertRow();
    row.setAttribute('data-id', doc.id);

    row.insertCell(0).textContent = data.name;
    row.insertCell(1).textContent = `Rp ${data.targetAmount.toLocaleString('id-ID')}`;
    row.insertCell(2).textContent = displayDate; // Gunakan tanggal yang diformat

    const actionsCell = row.insertCell(3);
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('edit-btn');
    editBtn.addEventListener('click', () => editSinkingFund(doc.id, data));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Hapus';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => deleteSinkingFund(doc.id));

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
  };

  // Perbarui fungsi editLongTermGoal untuk menggunakan Flatpickr
  const originalEditLongTermGoal = editLongTermGoal;
  editLongTermGoal = async (id, currentData) => {
    const editLongTermGoalModal = document.getElementById('edit-long-term-goal-modal');
    const editLongTermGoalIdInput = document.getElementById('edit-long-term-goal-id');
    const editLongTermGoalNameInput = document.getElementById('edit-long-term-goal-name');
    const editLongTermTargetAmountInput = document.getElementById('edit-long-term-target-amount');
    const editLongTermTargetDateInput = document.getElementById('edit-long-term-target-date');
    const saveLongTermGoalBtn = document.getElementById('save-long-term-goal-btn');
    const cancelLongTermGoalBtn = document.getElementById('cancel-long-term-goal-btn');

    editLongTermGoalIdInput.value = id;
    editLongTermGoalNameInput.value = currentData.name;
    editLongTermTargetAmountInput.value = currentData.targetAmount;
    // Format tanggal dari YYYY-MM-DD menjadi DD/MM/YYYY untuk tampilan di modal
    editLongTermTargetDateInput.value = currentData.targetDate ? currentData.targetDate.split('-').reverse().join('/') : '';

    flatpickr(editLongTermTargetDateInput, {
      dateFormat: "d/m/Y",
      allowInput: true,
      locale: "id"
    });

    editLongTermGoalModal.style.display = 'flex';

    const oldSaveBtn = saveLongTermGoalBtn.cloneNode(true);
    saveLongTermGoalBtn.parentNode.replaceChild(oldSaveBtn, saveLongTermGoalBtn);
    const oldCancelBtn = cancelLongTermGoalBtn.cloneNode(true);
    cancelLongTermGoalBtn.parentNode.replaceChild(oldCancelBtn, cancelLongTermGoalBtn);

    oldSaveBtn.addEventListener('click', async () => {
      const newName = editLongTermGoalNameInput.value.trim();
      const newTargetAmount = parseFloat(editLongTermTargetAmountInput.value);
      const newRawTargetDate = editLongTermTargetDateInput.value;
      const newTargetDate = formatDateForFirestore(newRawTargetDate);

      if (!newName || isNaN(newTargetAmount) || newTargetAmount <= 0 || !newRawTargetDate) {
        alert('Input tidak valid. Harap isi semua kolom dengan valid.');
        return;
      }
      try {
        await db.collection('longTermGoals').doc(id).update({
          name: newName,
          targetAmount: newTargetAmount,
          targetDate: newTargetDate,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        editLongTermGoalModal.style.display = 'none';
        loadLongTermGoals();
      } catch (error) {
        console.error('Error updating long-term goal:', error);
        alert('Gagal mengedit tujuan jangka panjang. Coba lagi.');
      }
    });

    oldCancelBtn.addEventListener('click', () => {
      editLongTermGoalModal.style.display = 'none';
    });

    editLongTermGoalModal.addEventListener('click', function(event) {
        if (event.target === editLongTermGoalModal) {
            editLongTermGoalModal.style.display = 'none';
        }
    });
  };

  // Perbarui fungsi editSinkingFund untuk menggunakan Flatpickr
  const originalEditSinkingFund = editSinkingFund;
  editSinkingFund = async (id, currentData) => {
    const editSinkingFundModal = document.getElementById('edit-sinking-fund-modal');
    const editSinkingFundIdInput = document.getElementById('edit-sinking-fund-id');
    const editSinkingFundNameInput = document.getElementById('edit-sinking-fund-name');
    const editSinkingFundTargetAmountInput = document.getElementById('edit-sinking-fund-target-amount');
    const editSinkingFundTargetDateInput = document.getElementById('edit-sinking-fund-target-date');
    const saveSinkingFundBtn = document.getElementById('save-sinking-fund-btn');
    const cancelSinkingFundBtn = document.getElementById('cancel-sinking-fund-btn');

    editSinkingFundIdInput.value = id;
    editSinkingFundNameInput.value = currentData.name;
    editSinkingFundTargetAmountInput.value = currentData.targetAmount;
    // Format tanggal dari YYYY-MM-DD menjadi DD/MM/YYYY untuk tampilan di modal
    editSinkingFundTargetDateInput.value = currentData.targetDate ? currentData.targetDate.split('-').reverse().join('/') : '';

    flatpickr(editSinkingFundTargetDateInput, {
      dateFormat: "d/m/Y",
      allowInput: true,
      locale: "id"
    });

    editSinkingFundModal.style.display = 'flex';

    const oldSaveBtn = saveSinkingFundBtn.cloneNode(true);
    saveSinkingFundBtn.parentNode.replaceChild(oldSaveBtn, saveSinkingFundBtn);
    const oldCancelBtn = cancelSinkingFundBtn.cloneNode(true);
    cancelSinkingFundBtn.parentNode.replaceChild(oldCancelBtn, cancelSinkingFundBtn);

    oldSaveBtn.addEventListener('click', async () => {
      const newName = editSinkingFundNameInput.value.trim();
      const newTargetAmount = parseFloat(editSinkingFundTargetAmountInput.value);
      const newRawTargetDate = editSinkingFundTargetDateInput.value;
      const newTargetDate = formatDateForFirestore(newRawTargetDate);

      if (!newName || isNaN(newTargetAmount) || newTargetAmount <= 0 || !newRawTargetDate) {
        alert('Input tidak valid. Harap isi semua kolom dengan valid.');
        return;
      }
      try {
        await db.collection('sinkingFunds').doc(id).update({
          name: newName,
          targetAmount: newTargetAmount,
          targetDate: newTargetDate,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        editSinkingFundModal.style.display = 'none';
        loadSinkingFunds();
      } catch (error) {
        console.error('Error updating sinking fund:', error);
        alert('Gagal mengedit dana sinking fund. Coba lagi.');
      }
    });

    oldCancelBtn.addEventListener('click', () => {
      editSinkingFundModal.style.display = 'none';
    });

    editSinkingFundModal.addEventListener('click', function(event) {
        if (event.target === editSinkingFundModal) {
            editSinkingFundModal.style.display = 'none';
        }
    });
  };

  // Panggil fungsi untuk memuat data saat halaman dimuat
  loadLongTermGoals();
  loadSinkingFunds();
}); 