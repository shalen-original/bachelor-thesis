document.getElementById("gasPriceInGwei").appendChild(document.createTextNode(globals.GAS_PRICE_IN_GWEI));
document.getElementById("ethToEur").appendChild(document.createTextNode(globals.ETHER_TO_EUR));

globals.updateConstants.addEventListener("click", evt => {
    fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR")
        .then(res => res.json())
        .then(obj => {
            globals.ETHER_TO_EUR = obj.EUR;
            document.getElementById("ethToEur").innerHTML = "";
            document.getElementById("ethToEur").appendChild(document.createTextNode(globals.ETHER_TO_EUR));
        });
});

globals.computeEstimate.addEventListener("click", evt => {
    fetch("/api/estimate")
        .then(res => res.json())
        .then(obj => {
            globals.estimateSection.querySelectorAll("[data-method]").forEach(el => {
                let content;

                if (el.dataset.type === "gas"){
                    content = obj.gases[el.dataset.method];
                    content += " gas";
                }

                if (el.dataset.type === "gwei"){
                    content = obj.gases[el.dataset.method] * globals.GAS_PRICE_IN_GWEI;
                    content += " gwei";
                }

                if (el.dataset.type === "eur"){
                    content = obj.gases[el.dataset.method] * globals.GAS_PRICE_IN_GWEI;
                    content /= 1000000000; // Converting from gwei to Ether
                    content *= globals.ETHER_TO_EUR; // Converting from Ether to EUR
                    content += " EUR";
                }

                el.innerHTML = "";
                let txtNode = document.createTextNode(content);
                el.appendChild(txtNode);
            });
        });
});

