const { ipcRenderer } = require('electron')

document.querySelector('#submit').addEventListener('click', buttonClicked)
document.querySelector('#clear-fields').addEventListener('click', clearFields)

function buttonClicked() {
  const risk = document.getElementById('risk')
  const portfolio = document.getElementById('portfolio')
  const price = document.getElementById('price')
  const stop = document.getElementById('stop')

  const riskAmt = parseFloat(risk.value)
  const portfolioAmt = parseFloat(portfolio.value)
  const priceAmt = parseFloat(price.value)
  const stopAmt = parseFloat(stop.value)

  // Saadan andmed ipcMainile
  ipcRenderer.send('andmed:form', {
    riskAmt,
    portfolioAmt,
    priceAmt,
    stopAmt,
  })
}

function showError(msg) {
    document.getElementById('results').style.display = 'none';

    const errorDiv = document.createElement('div');

    const cardContent = document.querySelector('.card-content');
    const cardTitle = document.querySelector('.card-title');
    errorDiv.className = 'alert alert-danger';

    errorDiv.appendChild(document.createTextNode(msg));

    // cardContent on parent ja cardTitle child. errorDiv läheb nende vahele.
    cardContent.insertBefore(errorDiv, cardTitle);

    // Clear error after 3 seconds
    setTimeout(clearError, 3000);
}

function clearError() {
    document.querySelector('.alert').remove();
}

function clearFields(e) {
    document.getElementById('results').style.display = 'none';

    document.getElementById('risk').value = '';
    document.getElementById('portfolio').value = '';
    document.getElementById('price').value = '';
    document.getElementById('stop').value = '';

    e.target.style.visibility = 'hidden';
}

// Saab main processilt vastuse tagasi.
ipcRenderer.on('vastus', (e, args) => {
  console.log(args)
  if (isFinite(args.posiSize)) {
    document.getElementById('results').style.display = 'block'
    document.getElementById('clear-fields').style.visibility = 'visible'
    document.getElementById(
      'result-number'
    ).innerHTML = `Position size: <span id="dollar-amount">${args.posiSize.toFixed(
      1
    )}</span> dollars which equals <span id="stock-amount">${args.posiSizeStocks.toFixed(2)}</span> stocks.`
  } else {
    showError('Please check your numbers')
    // console.log('Please check your numbers')
  }
})
