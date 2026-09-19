(() => {
    const rightside = document.getElementById("rightside");
    if (!rightside) return;

    const configBtn = document.getElementById("rightside-config");
    const hideBox = document.getElementById("rightside-config-hide");

    configBtn.addEventListener("click", () => {
        if (hideBox.classList.contains("show")) {
            hideBox.classList.add("status");
            setTimeout(() => hideBox.classList.remove("status"), 300);
        }
        hideBox.classList.toggle("show");
    });

    const darkBtn = document.getElementById("rightside-darkmode");
    const storageKey = "particlex-color-theme";
    darkBtn.addEventListener("click", () => {
        const next =
            document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try {
            localStorage.setItem(storageKey, next);
        } catch (e) {}
    });

    const hideAsideBtn = document.getElementById("rightside-hide-aside");
    if (hideAsideBtn) {
        hideAsideBtn.addEventListener("click", () => {
            const root = document.documentElement;
            const willHide = !root.classList.contains("hide-aside");
            root.classList.toggle("hide-aside", willHide);
            try {
                localStorage.setItem("particlex-aside-status", willHide ? "hide" : "show");
            } catch (e) {}
        });
    }

    const goUp = document.getElementById("rightside-go-up");
    const percentEl = goUp.querySelector(".scroll-percent");
    goUp.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    let insidePanel = false;
    let panelShown = null;
    const syncState = () => {
        const shouldShow = insidePanel || window.scrollY > 300;
        if (shouldShow === panelShown) return;
        panelShown = shouldShow;
        rightside.classList.toggle("rightside-show", shouldShow);
        if (!shouldShow) hideBox.classList.remove("show");
    };
    rightside.addEventListener("mouseenter", () => {
        insidePanel = true;
        syncState();
    });
    rightside.addEventListener("mouseleave", () => {
        insidePanel = false;
        syncState();
    });

    let lastPercent = null;
    const updatePercent = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const percent = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
        if (percent !== lastPercent) {
            lastPercent = percent;
            if (percent > 0 && percent < 95) {
                goUp.classList.add("show-percent");
                percentEl.textContent = percent;
            } else {
                goUp.classList.remove("show-percent");
            }
        }
        syncState();
    };
    window.addEventListener("scroll", updatePercent, { passive: true });
    updatePercent();
})();
