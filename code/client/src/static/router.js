const links = document.querySelectorAll("a.navbar-item");
const fixLocation = (url) => {
    let split = url.split("#");
    let route;

    if (split.length === 1) 
        route = "/";
    else
        route = url.split("#")[1];

    if (route === "/"){
        globals.computationsSection.classList = "section";
        globals.publishSection.classList = "section hidden";
        globals.estimateSection.classList = "section hidden";
    }

    if (route === "/publish"){
        globals.computationsSection.classList = "section hidden";
        globals.publishSection.classList = "section";
        globals.estimateSection.classList = "section hidden";
    }

    if (route === "/estimate"){
        globals.computationsSection.classList = "section hidden";
        globals.publishSection.classList = "section hidden";
        globals.estimateSection.classList = "section";
    }

    history.pushState(null, null, "#" + route);
};

links.forEach(l => l.addEventListener("click", (evt) => {
    evt.preventDefault();
    fixLocation(evt.target.href);
}));

window.addEventListener("popstate", () => fixLocation(window.location + ""));
fixLocation(window.location + "");
