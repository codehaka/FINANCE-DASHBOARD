const transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];

console.log(transactions);

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");
const transactionList = document.getElementById("transaction-list");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");

let editingTransactionId = null;
let currentFilter = "all";

function filterTransactions(type) {
    currentFilter = type;
    applyFilters();
    }

function applyFilters(){
    const keyword = searchInput.value.toLowerCase();

    const filteredTransactions = transactions.filter(transaction => {

        const matchesSearch = 
            transaction.name.toLowerCase().includes(keyword);
        
        const matchesFilter = 
        currentFilter === "all" || 
        transaction.type === currentFilter;

        return matchesSearch && matchesFilter;
    });

    renderTransactions(filteredTransactions);
}


filterButtons.forEach(button => {
    button.addEventListener("click", () => {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        const filterType = button.dataset.filter;

        filterTransactions(filterType);
    });
});



function saveTransactions() {
    localStorage.setItem(
        "transactions", JSON.stringify(transactions)
    );
}
searchInput.addEventListener("input", applyFilters);

const addTransactionBtn = 
    document.getElementById("add-transaction-btn");
const transactionModal = 
    document.getElementById("transaction-modal");
const closeModalBtn = 
    document.getElementById("close-modal-btn");
const transactionForm = 
    document.getElementById("transaction-form");

transactionForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name =
        document.getElementById("name").value;

    const amount =
        Number(document.getElementById("amount").value);

    const type =
        document.getElementById("type").value;

    const category =
        document.getElementById("category").value;


    if (editingTransactionId === null) {
        const newTransaction = {
            id: Date.now(),
            name: name,
            amount: amount,
            type: type,
            category: category
        };

        transactions.push(newTransaction);

    } else {

        const transaction = transactions.find(
            transaction => transaction.id === editingTransactionId
        );

        transaction.name = name;
        transaction.amount = amount;
        transaction.type = type;
        transaction.category = category;

        editingTransactionId = null;
    }

    saveTransactions();
    updateSummary();
    renderTransactions();

    transactionModal.style.display = "none";
    transactionForm.reset();

    document.querySelector(".modal-content h2").textContent = 
        "Add Transaction";
});

addTransactionBtn.addEventListener("click", () =>{

    editingTransactionId = null;

    transactionForm.reset();

    document.querySelector(".modal-content h2").textContent =
        "Add Transaction";
        
    transactionModal.style.display = "flex";
});

closeModalBtn.addEventListener("click", () =>{
    transactionModal.style.display = "none";
});

function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(amount);
}

function updateSummary() {
const totalIncome = transactions
    .filter(transaction => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

const totalExpense = transactions
    .filter(transaction => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);


const balance = totalIncome - totalExpense;


incomeElement.textContent = formatRupiah (totalIncome);
expenseElement.textContent = formatRupiah (totalExpense);
balanceElement.textContent = formatRupiah (balance);

}

function renderTransactions(transactionData = transactions) {
    transactionList.innerHTML = "";

    transactionData.forEach(transaction => {
        const transactionElement = document.createElement("div");

        transactionElement.classList.add("transaction",transaction.type);

        transactionElement.innerHTML = `
        <div>
            <h3>${transaction.name}</h3>
            <p>${transaction.category}</p>
            </div>
            
            <strong>
                ${transaction.type === "income" ? "+" : "-"}
                ${formatRupiah(transaction.amount)}
                
            </strong>

            <button class="edit-btn" data-id="${transaction.id}">
                Edit
            </button>
            <button class="delete-btn" data-id="${transaction.id}">
                Delete
            </button>
            `;
        transactionList.appendChild(transactionElement);
    });
}

transactionList.addEventListener("click", (event) => {

    if (event.target.classList.contains("edit-btn")) {
        const id = Number(event.target.dataset.id);

        const transaction = transactions.find(
            transaction => transaction.id === id
        );

        editingTransactionId = id;

        document.getElementById("name").value = transaction.name;
        document.getElementById("amount").value = transaction.amount;
        document.getElementById("type").value = transaction.type;
        document.getElementById("category").value = transaction.category;

        document.querySelector(".modal-content h2").textContent = 
            "Edit Trasaction";

            transactionModal.style.display = "flex";
    }

    if (event.target.classList.contains("delete-btn")) {
        const id= Number(event.target.dataset.id);

        const transactionIndex = transactions.findIndex(
            transaction => transaction.id === id
        );

        transactions.splice(transactionIndex, 1);

        saveTransactions();

        updateSummary();
        renderTransactions();
        
    }
});

updateSummary();
renderTransactions();