/*
appends balance value to each item
returns the total balance
*/
function computeMacdSimulation(initialBalance, fees, data) {

    let eurBalance;
    let cryptoBalance;
    let totalBalance;
    let isEur = data[0].macdValue < data[0].signalValue;
    /* initial balance */
    if (isEur) {
      eurBalance = initialBalance;
      cryptoBalance = 0;
    } else {
      eurBalance = 0;
      cryptoBalance = initialBalance / data[0].closingPrice;
    }
    totalBalance = initialBalance;
  
    for (const item of data) {
      let newIsEur = item.macdValue < item.signalValue;
      /* case 1 : same state */
      if (newIsEur === isEur) {
        item.balance = totalBalance;
        continue;
      } else if (newIsEur) {
        /* case 2 : state change, SELL SIGNAL */
        let payedFees = cryptoBalance * item.closingPrice * fees;
        eurBalance = cryptoBalance * item.closingPrice - payedFees;
        totalBalance = eurBalance;
        cryptoBalance = 0;
      } else {
        /* case 3: state change, BUY SIGNAL */
        let payedFees = eurBalance * fees;
        eurBalance = eurBalance - payedFees;
        totalBalance = eurBalance;
        cryptoBalance = eurBalance / item.closingPrice;
        eurBalance = 0;
      }
      /* update portfolio State */
      isEur = newIsEur;
      item.balance = totalBalance;
    }
  
    return totalBalance;
  }

  function performance(from, to) {
    const perfString = (((to - from) / from) * 100).toFixed(0);
    return Number(perfString);
  }

  function formatPerf(performance) {
    if (performance > 0) {
      performance = "+" + performance;
    }
    return performance;
  }

  function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}