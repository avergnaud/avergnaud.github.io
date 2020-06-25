fetch("https://macd-definition.herokuapp.com/macd/?macdDefinitionId=1")
  .then((data) => data.json())
  .then((json) => {

    /* skip the first incomplete items (before 12+26+9) */
    json = json.filter((item) => item.macdValue && item.signalValue);

    let macdData = json.map((item) => ({
      ...item,
      date: new Date(item.timeEpochTimestamp * 1000),
    }));

    macdData.sort((a, b) => a.timeEpochTimestamp - b.timeEpochTimestamp);

    document.getElementById("range-from").innerHTML = formatDate(macdData[0].date);
    document.getElementById("range-to").innerHTML = formatDate(macdData[macdData.length - 1].date);
    document.getElementById("number-sims").innerHTML = macdData.length - 365;

    const initialBalance = 100;
    const fees = 0.0026;

    let sumBeatMarket = 0;
    let sumMakeProfit = 0;
    const tableRef = document.getElementById("results-tbody");
    tableRef.innerHTML = '';
    let i;
    for(i = 0; i < macdData.length - 365; i++) {
        let simulationData = macdData.slice(i, i + 365);
        let totalBalance = computeMacdSimulation(initialBalance, fees, simulationData);
        /* simulation performance */
        let simulationPerformance = performance(initialBalance, totalBalance);
        /* market performance */
        const initialClosingPrice = simulationData[0].closingPrice;
        const finalClosingPrice = simulationData[simulationData.length - 1].closingPrice;
        let marketPerformance = performance(initialClosingPrice, finalClosingPrice);
        
        /* update the table */
        // new row
        let newRow = document.createElement('tr');
        // from
        let fromTd = document.createElement('td');
        fromTd.innerHTML = formatDate(simulationData[0].date);
        newRow.appendChild(fromTd);
        // to
        let toTd = document.createElement('td');
        toTd.innerHTML = formatDate(simulationData[simulationData.length - 1].date);
        newRow.appendChild(toTd);
        // market perf
        let marketPerfTd = document.createElement('td');
        marketPerfTd.innerHTML = formatPerf(marketPerformance) + '%';
        newRow.appendChild(marketPerfTd);
        // trading perf
        let tradingPerfTd = document.createElement('td');
        tradingPerfTd.innerHTML = formatPerf(simulationPerformance) + '%';
        newRow.appendChild(tradingPerfTd);
        // beats the market
        let beatsTd = document.createElement('td');
        if(simulationPerformance > marketPerformance) {
            beatsTd.innerHTML = '&#10003;';
            beatsTd.classList.add("table-success");
            sumBeatMarket++;
        } else {
            beatsTd.innerHTML = 'X';
            beatsTd.classList.add("table-danger");
        }
        newRow.appendChild(beatsTd);
        // makes a profit
        let profitTd = document.createElement('td');
        if(simulationPerformance > 0) {
            profitTd.innerHTML = '&#10003;';
            profitTd.classList.add("table-success");
            sumMakeProfit++;
        } else {
            profitTd.innerHTML = 'X';
            profitTd.classList.add("table-danger");
        }
        newRow.appendChild(profitTd);
        tableRef.appendChild(newRow);
    }


    document.getElementById("result-beat-market").innerHTML = sumBeatMarket;
    document.getElementById("result-make-profit").innerHTML = sumMakeProfit;
  });
