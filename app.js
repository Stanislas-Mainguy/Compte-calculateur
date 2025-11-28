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
  "Virement maman",
  "Voiture",
  "Formations",
  "Santé",
  "Autres",
];

// Chaque catégorie a un total sorties et entrées
const state = categories.map(cat => ({
  categorie: cat,
  sorties: 0,
  entrees: 0,
}));

const tbody = document.getElementById("categories-body");
const totalSortiesEl = document.getElementById("total-sorties");
const totalEntreesEl = document.getElementById("total-entrees");
const totalFinalEl = document.getElementById("total-final");

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

function renderTable() {
  tbody.innerHTML = "";

  state.forEach((row, index) => {
    const tr = document.createElement("tr");

    const tdCat = document.createElement("td");
    tdCat.textContent = row.categorie;
    tdCat.className = "category";

    const tdSorties = document.createElement("td");
    tdSorties.className = "amount-cell";
    tdSorties.id = `sorties-${index}`;
    tdSorties.textContent = formatEuros(row.sorties);

    const tdEntrees = document.createElement("td");
    tdEntrees.className = "amount-cell";
    tdEntrees.id = `entrees-${index}`;
    tdEntrees.textContent = formatEuros(row.entrees);

    const tdInput = document.createElement("td");
    const input = document.createElement("input");
    input.type = "number";
    input.step = "0.01";
    input.min = "0";
    input.placeholder = "0,00";
    input.id = `input-${index}`;
    tdInput.appendChild(input);

    const tdActions = document.createElement("td");
    const btnSortie = document.createElement("button");
    btnSortie.textContent = "+ Sortie";
    btnSortie.className = "btn btn-sortie";
    btnSortie.add.addEventListener("click", () => applyAmount(index, "sortie"));

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
    document.getElementById(`sorties-${index}`).textContent = formatEuros(state[index].sorties);
  } else if (type === "entree") {
    state[index].entrees += amount;
    document.getElementById(`entrees-${index}`).textContent = formatEuros(state[index].entrees);
  }

  input.value = "";
  renderTotals();
}

renderTable();
