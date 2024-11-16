function updatePlaceholder() {
  const accountType = document.getElementById("accountType").value;
  const nameInput = document.getElementById("name");

  const placeholders = {
    ContaEmpresarial: "Nome da Empresa",
    ContaPremium: "Nome do Titular ou Empresa",
    default: "Nome do Titular",
  };

  nameInput.placeholder = placeholders[accountType] || placeholders.default;
}

window.onload = function () {
  document.getElementById("introModal").style.display = "flex";
};

function closeIntroModal() {
  document.getElementById("introModal").style.display = "none";
}

function showLoanButton(accountType) {
  const loanButton = document.getElementById("loanButton");
  if (accountType === "ContaEmpresarial" || accountType === "ContaPremium") {
    loanButton.style.display = "block";
  } else {
    loanButton.style.display = "none";
  }
}

function applyLoan() {
  const accountId = document.getElementById("accountId").value.trim();
  const loanAmount = parseFloat(
    document.getElementById("transactionAmount").value.trim()
  );

  if (isNaN(loanAmount) || loanAmount <= 0 || loanAmount > 10000) {
    displayErrorPopup(
      "Por favor, insira um valor válido para o empréstimo, até o limite de R$10.000."
    );
    return;
  }

  const loanWithInterest = loanAmount * 1.05;

  const loanMessage = document.getElementById("loanMessage");
  loanMessage.textContent = `O valor com juros será de R$${loanWithInterest.toFixed(
    2
  )}. Deseja confirmar o empréstimo?`;
  document.getElementById("loanConfirmation").style.display = "block";

  window.pendingLoan = { accountId, loanWithInterest };
}

function confirmLoan() {
  const { accountId, loanWithInterest } = window.pendingLoan;
  const accountData = getAccountData(accountId);

  if (!accountData) {
    displayErrorPopup(
      "Número da conta inválido. Por favor, verifique e tente novamente."
    );
    return;
  }

  accountData.balance += loanWithInterest;
  updateAccountData(accountId, accountData);
  updateBalanceMessage(accountData.balance);

  displayPopupMessage(
    "loanSuccessMessage",
    "Empréstimo realizado com sucesso!",
    "#4CAF50"
  );

  showDownloadConfirmation();

  document.getElementById("transactionAmount").value = "";
  document.getElementById("loanConfirmation").style.display = "none";
  window.pendingLoan = null;
}

function cancelLoan() {
  document.getElementById("loanConfirmation").style.display = "none";
  window.pendingLoan = null;
}

function validateName() {
  const nameInput = document.getElementById("name");
  const nameError = document.getElementById("nameError");
  const nameCheckmark = document.getElementById("nameCheckmark");
  const nameValue = nameInput.value.trim();
  const nameRegex = /^[A-Za-zÀ-ÖØ-ÿ\s]+$/;
  const accountHolders =
    JSON.parse(localStorage.getItem("accountHolders")) || [];

  if (!nameValue) {
    hideElement(nameError);
    hideElement(nameCheckmark);
    return true;
  }

  if (!nameRegex.test(nameValue)) {
    displayError(nameError, "Nome inválido. Apenas letras são permitidas.");
    hideElement(nameCheckmark);
    return false;
  }

  if (accountHolders.includes(nameValue)) {
    displayError(
      nameError,
      "Uma conta com esse nome de titular já foi criada. Por favor, use um nome diferente."
    );
    hideElement(nameCheckmark);
    return false;
  }

  hideElement(nameError);
  showElement(nameCheckmark);
  return true;
}

function validatePassword() {
  const passwordInput = document.getElementById("accountNumber");
  const passwordError = document.getElementById("passwordError");
  const passwordCheckmark = document.getElementById("passwordCheckmark");
  const passwordValue = passwordInput.value.trim();
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6}$/;

  if (
    passwordValue &&
    (!passwordRegex.test(passwordValue) || passwordValue.length < 6)
  ) {
    displayError(
      passwordError,
      "Senha deve ter 6 caracteres, incluindo letras, números e caracteres especiais."
    );
    hideElement(passwordCheckmark);
    return false;
  }

  hideElement(passwordError);
  if (passwordValue) showElement(passwordCheckmark);
  return true;
}

function validatePasswordOnInput() {
  const passwordInput = document.getElementById("accountNumber");
  const passwordError = document.getElementById("passwordError");
  const passwordCheckmark = document.getElementById("passwordCheckmark");
  const passwordValue = passwordInput.value.trim();
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6}$/;

  hideElement(passwordError);

  if (passwordRegex.test(passwordValue)) {
    showElement(passwordCheckmark);
  } else {
    hideElement(passwordCheckmark);
  }
}

function validateForm() {
  return validateName() && validatePassword();
}

function createAccount() {
  if (!validateForm()) return false;

  const nameInput = document.getElementById("name").value.trim();
  const accountHolders =
    JSON.parse(localStorage.getItem("accountHolders")) || [];

  if (accountHolders.includes(nameInput)) {
    displayPopupMessage(
      "errorMessage",
      "Uma conta com esse nome já existe.",
      "red"
    );
    return false;
  }

  const accountNumber = generateAccountNumber();
  const accountType = document.getElementById("accountType").value;
  const accountData = { name: nameInput, type: accountType, balance: 0 };

  localStorage.setItem(`account_${accountNumber}`, JSON.stringify(accountData));
  accountHolders.push(nameInput);
  localStorage.setItem("accountHolders", JSON.stringify(accountHolders));

  displayPopupMessage(
    "successMessage",
    `Conta criada com sucesso! Número da conta: ${accountNumber}`,
    "#4CAF50"
  );

  if (accountType === "ContaEmpresarial") {
    document.getElementById("loanButton").style.display = "none";
  }

  resetForm();
  return true;
}

function showBalance() {
  const accountId = document.getElementById("accountId").value.trim();
  const accountData = getAccountData(accountId);

  if (!accountData) {
    displayErrorPopup("Número da conta inválido.");
    return;
  }

  const welcomeMessage = document.getElementById("welcomeMessage");
  welcomeMessage.textContent = `Bem-vindo(a), ${accountData.name}!`;
  welcomeMessage.style.display = "block";

  if (
    accountData.type === "ContaEmpresarial" ||
    accountData.type === "ContaPremium"
  ) {
    document.getElementById("loanButton").style.display = "block";
  } else {
    document.getElementById("loanButton").style.display = "none";
  }

  document.getElementById("depositButton").style.display = "block";
  document.getElementById("sacarButton").style.display = "block";
  document.getElementById("transactionContainer").style.display = "block";
  document.getElementById("balanceContainer").style.display = "block";
  updateBalanceMessage(accountData.balance);

  document.getElementById("showBalanceButton").style.display = "none";
}

function toggleBalanceVisibility() {
  const balanceAmount = document.getElementById("balanceAmount");
  const toggleIcon = document.getElementById("toggleBalanceIcon");

  if (balanceAmount.style.display === "none") {
    balanceAmount.style.display = "inline";
    toggleIcon.textContent = "👁️";
  } else {
    balanceAmount.style.display = "none";
    toggleIcon.textContent = "🚫";
  }
}

function deposit() {
  const accountId = document.getElementById("accountId").value.trim();
  const depositAmount = parseFloat(
    document.getElementById("transactionAmount").value.trim()
  );

  if (!isValidAmount(depositAmount)) {
    displayErrorPopup("Por favor, insira um valor de depósito válido.");
    return;
  }

  const accountData = getAccountData(accountId);
  if (!accountData) {
    displayErrorPopup(
      "Número da conta inválido. Por favor, verifique e tente novamente."
    );
    return;
  }

  accountData.balance += depositAmount;
  updateAccountData(accountId, accountData);
  updateBalanceMessage(accountData.balance);

  displayPopupMessage(
    "depositSuccessMessage",
    "Depósito realizado com sucesso!",
    "#4CAF50"
  );

  showDownloadConfirmation();

  document.getElementById("transactionAmount").value = "";
}

function withdraw() {
  const accountId = document.getElementById("accountId").value.trim();
  const withdrawAmount = parseFloat(
    document.getElementById("transactionAmount").value.trim()
  );

  const accountData = getAccountData(accountId);

  if (
    !accountData ||
    !isValidAmount(withdrawAmount) ||
    withdrawAmount > accountData.balance
  ) {
    displayErrorPopup(
      "Operação inválida: verifique o valor e o saldo disponível."
    );
    return;
  }

  accountData.balance -= withdrawAmount;
  updateAccountData(accountId, accountData);
  updateBalanceMessage(accountData.balance);

  displayPopupMessage(
    "withdrawSuccessMessage",
    "Saque realizado com sucesso!",
    "#4CAF50"
  );

  showDownloadConfirmation();

  document.getElementById("transactionAmount").value = "";
}

function showDownloadConfirmation() {
  document.getElementById("downloadConfirmation").style.display = "block";
  document.getElementById("confirmDownload").onclick = function () {
    generatePDF();
    document.getElementById("downloadConfirmation").style.display = "none";
  };
  document.getElementById("cancelDownload").onclick = function () {
    document.getElementById("downloadConfirmation").style.display = "none";
  };
}

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const accountId = document.getElementById("accountId").value.trim();
  const accountData = getAccountData(accountId);

  if (!accountData) {
    alert("Dados da conta não encontrados.");
    return;
  }

  doc.setFillColor(36, 87, 103);
  doc.rect(
    0,
    0,
    doc.internal.pageSize.getWidth(),
    doc.internal.pageSize.getHeight(),
    "F"
  );

  doc.setFontSize(16);
  doc.setTextColor(17, 202, 145);
  doc.setFont("Helvetica", "bold");
  doc.text("Extrato da Conta", 10, 10);

  doc.setFont("Helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text(`Número da Conta: ${accountId}`, 10, 20);
  doc.text(`Nome: ${accountData.name}`, 10, 30);
  doc.text(`Tipo de Conta: ${accountData.type}`, 10, 40);
  doc.text(`Saldo Atual: R$${accountData.balance.toFixed(2)}`, 10, 50);

  doc.save(`extrato_${accountId}.pdf`);
}

function getAccountData(accountId) {
  return JSON.parse(localStorage.getItem(`account_${accountId}`));
}

function updateAccountData(accountId, accountData) {
  localStorage.setItem(`account_${accountId}`, JSON.stringify(accountData));
}

function isValidAmount(amount) {
  return !isNaN(amount) && amount > 0;
}

function generateAccountNumber() {
  return Math.floor(1000 + Math.random() * 9000);
}

function displayPopupMessage(id, message, bgColor) {
  const popup = document.createElement("div");
  popup.id = id;
  popup.className = "popup-message";
  popup.style.backgroundColor = bgColor;
  popup.textContent = message;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 2000);
}

function displayErrorPopup(message) {
  const errorContainer = document.getElementById("errorContainer");

  errorContainer.innerHTML = "";

  const errorPopup = document.createElement("div");
  errorPopup.className = "error-popup";
  errorPopup.textContent = message;

  errorContainer.appendChild(errorPopup);

  setTimeout(() => {
    errorPopup.remove();
  }, 2000);
}

function updateBalanceMessage(balance) {
  const balanceAmount = document.getElementById("balanceAmount");
  if (balanceAmount) {
    balanceAmount.textContent = `R$${balance.toFixed(2)}`;
  }
}

function hideElement(element) {
  element.style.display = "none";
}

function showElement(element) {
  element.style.display = "block";
}

function displayError(element, message) {
  element.textContent = message;
  showElement(element);
}

function clearMessages() {
  const messages = ["balanceMessage", "errorMessage", "welcomeMessage"];
  messages.forEach((id) => document.getElementById(id)?.remove());
}

function resetForm() {
  document.getElementById("accountForm").reset();
  hideElement(document.getElementById("nameCheckmark"));
  hideElement(document.getElementById("passwordCheckmark"));
}

document.getElementById("accountType").addEventListener("change", () => {
  updatePlaceholder();
});
document.getElementById("name").addEventListener("input", validateName);
document
  .getElementById("accountNumber")
  .addEventListener("blur", validatePassword);
document
  .getElementById("accountNumber")
  .addEventListener("input", validatePasswordOnInput);
document
  .getElementById("showBalanceButton")
  .addEventListener("click", showBalance);
document.getElementById("accountForm").addEventListener("submit", (e) => {
  e.preventDefault();
  createAccount();
});
document.getElementById("depositButton").addEventListener("click", deposit);
document.getElementById("sacarButton").addEventListener("click", withdraw);
document.getElementById("loanButton").addEventListener("click", applyLoan);
document
  .getElementById("toggleBalanceIcon")
  .addEventListener("click", toggleBalanceVisibility);

updatePlaceholder();
