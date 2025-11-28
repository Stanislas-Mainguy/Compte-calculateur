const categories = [
  "Restaurants & Bars",
  "Abonnements",
  "Dépenses plaisirs",
  "Assurance téléphone",
  "Cadeaux",
  "Courses",
  "SNCF",
  "Frais bancaires",
  "Virement compte perso",
  "Virement sortant",
  "Voiture",
  "Formations",
  "Santé",
  "Autres",
];

const STORAGE_KEY = "budgetCalcStateV1";

// state sera rempli soit à partir du localStorage, soit vide
let state = [];

let tbody;
let totalSortiesEl;
let totalEntreesEl;
let totalFinalEl;

function createEmptyState() {
  return categories.map(cat => ({
    categorie: cat,
    sorties: 0,
    entrees: 0,
  }));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state = createEmptyState();
      return;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== categories.length) {
      state = createEmptyState();
      return;
    }

    // On recale bien les catégories au cas où
    state = parsed.map((row, index) => ({
      categorie: categories[index],
      sorties: Number(row.sorties) || 0,
      entrees: Number(row.entrees) || 0,
    }));
  } catch (e) {
    console.error("Erreur chargement state, réinit.", e);
    state = createEmptyState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Erreur sauvegarde state", e);
  }
}

function formatEuros(value) {
  return value.toFixed(2).replace(".", ",") + " €";
}

function renderTotals() {
  const totalSorties = state.reduce((sum, row) => sum + row.sorties, 0);
  const totalEntrees = state.reduce((sum, row) => sum + row.entrees, 0);
  const solde = totalEntrees - totalSorties;

  totalSortiesEl.textContent = formatEuros(totalSorties);
  totalEntreesEl.textContent = formatEuros(totalEntrees);
  totalFinalEl.textContent = formatEuros(solde);

  totalFinalEl.classList.toggle("positif", solde >= 0);
  totalFinalEl.classList.toggle("negatif", solde < 0);
}

function applyAmount(index, type) {
  const input = document.getElementById(`input-${index}`);
  if (!input) return;

  const raw = input.value.replace(",", ".");
  const amount = parseFloat(raw);

  if (isNaN(amount) || amount <= 0) {
    alert("Entre un montant strictement positif.");
    return;
  }

  if (type === "sortie") {
    state[index].sorties += amount;
    const sortieCell = document.getElementById(`sorties-${index}`);
    sortieCell.textContent = formatEuros(state[index].sorties);
  } else if (type === "entree") {
    state[index].entrees += amount;
    const entreeCell = document.getElementById(`entrees-${index}`);
    entreeCell.textContent = formatEuros(state[index].entrees);
  }

  input.value = "";
  saveState();
  renderTotals();
}

function renderTable() {
  tbody.innerHTML = "";

  state.forEach((row, index) => {
    const tr = document.createElement("tr");

    // Catégorie
    const tdCat = document.createElement("td");
    tdCat.textContent = row.categorie;
    tdCat.className = "category";

    // Sorties
    const tdSorties = document.createElement("td");
    tdSorties.className = "amount-cell";
    tdSorties.id = `sorties-${index}`;
    tdSorties.textContent = formatEuros(row.sorties);

    // Entrées
    const tdEntrees = document.createElement("td");
    tdEntrees.className = "amount-cell";
    tdEntrees.id = `entrees-${index}`;
    tdEntrees.textContent = formatEuros(row.entrees);

    // Input montant
    const tdInput = document.createElement("td");
    const input = document.createElement("input");
    input.type = "number";
    input.step = "0.01";
    input.min = "0";
    input.placeholder = "0,00";
    input.id = `input-${index}`;
    tdInput.appendChild(input);

    // Actions
    const tdActions = document.createElement("td");

    const btnSortie = document.createElement("button");
    btnSortie.textContent = "+ Sortie";
    btnSortie.className = "btn btn-sortie";
    btnSortie.addEventListener("click", () => applyAmount(index, "sortie"));

    const btnEntree = document.createElement("button");
    btnEntree.textContent = "+ Entrée";
    btnEntree.className = "btn btn-entree";
    btnEntree.addEventListener("click", () => applyAmount(index, "entree"));

    tdActions.appendChild(btnSortie);
    tdActions.appendChild(btnEntree);

    tr.appendChild(tdCat);
    tr.appendChild(tdSorties);
    tr.appendChild(tdEntrees);
    tr.appendChild(tdInput);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });

  renderTotals();
}

function resetAll() {
  const confirmReset = confirm(
    "Tu vas effacer toutes les données mémorisées sur ce navigateur pour ce calculateur. Continuer ?"
  );
  if (!confirmReset) return;

  state = createEmptyState();
  saveState();
  renderTable();
}

function init() {
  tbody = document.getElementById("categories-body");
  totalSortiesEl = document.getElementById("total-sorties");
  totalEntreesEl = document.getElementById("total-entrees");
  totalFinalEl = document.getElementById("total-final");

  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetAll);
  }

  loadState();
  renderTable();
}

// Grâce à `defer`, le DOM est prêt ici
init();
