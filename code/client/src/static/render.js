function renderComputations(computations) {
    const container = document.getElementById("computations-container");
    const computationTemplate = document.getElementById("computation");

    const newUl = document.createElement("ul");
    newUl.id = "computations";
    computations.forEach(comp => {
        let newComp = document.importNode(computationTemplate.content, true);
        newComp.querySelectorAll("[data-field]").forEach(el => {
            let content = comp[el.dataset.field];

            if (el.dataset.field.includes("Timestamp")){
                content = (new Date(content * 1000)).toLocaleDateString();
            }

            let txtNode = document.createTextNode(content);
            el.appendChild(txtNode);
        });

        newComp.getElementById("perform").addEventListener("click", () => {
            fetch(`/api/computations/${comp.id}/perform`)
                .catch(err => console.log("Cannot ask server to perform computation"));
        });

        newComp.getElementById("accept").addEventListener("click", () => {
            fetch(`/api/computations/${comp.id}/accept`)
                .catch(err => console.log("Cannot ask server to accept result"));
        });

        newComp.getElementById("reject").addEventListener("click", () => {
            fetch(`/api/computations/${comp.id}/reject`)
                .catch(err => console.log("Cannot ask server to reject result"));
        });

        newComp.getElementById("challenge-farmer-disappeared").addEventListener("click", () => {
            fetch(`/api/computations/${comp.id}/challenge-farmer-disappeared`)
                .catch(err => console.log("Cannot challenge farmer successfully"));
        });

        newComp.getElementById("challenge-result-ignored").addEventListener("click", () => {
            fetch(`/api/computations/${comp.id}/challenge-result-ignored`)
                .catch(err => console.log("Cannot challenge for result ignored successfully"));
        });

        if (comp.status !== "CREATED")
            newComp.getElementById("perform").className += " hidden";

        if (comp.status === "ASSIGNED" && comp.assignedTo !== globals.CLIENT_ADDRESS)
            newComp.getElementById("challenge-farmer-disappeared").classList.remove("hidden");

        if (comp.status === "DONE" && comp.publisher.toLowerCase() === globals.CLIENT_ADDRESS){
            newComp.getElementById("accept").classList.remove("hidden");
            newComp.getElementById("reject").classList.remove("hidden");
        }

        if (comp.status === "DONE" && comp.assignedTo.toLowerCase() === globals.CLIENT_ADDRESS){
            newComp.getElementById("challenge-result-ignored").classList.remove("hidden");
        }

        newUl.appendChild(newComp);
    });

    let oldUl = document.getElementById("computations");
    container.replaceChild(newUl, oldUl);
};
