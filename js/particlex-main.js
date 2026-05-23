const app = Vue.createApp({
    mixins: Object.values(mixins),
    data() {
        return {
            loading: true,
            hiddenMenu: false,
            showMenuItems: false,
            menuColor: false,
            scrollTop: 0,
            renderers: [],
        };
    },
    created() {
        window.addEventListener("load", () => {
            this.loading = false;
        });
    },
    mounted() {
        window.addEventListener("scroll", this.handleScroll, true);
        this.render();
        this.bindCopyEmail();
        this.applyRandomTagColors();
    },
    methods: {
        render() {
            for (let i of this.renderers) i();
        },
        showCopyToast(text) {
            let toast = document.getElementById("copy-toast");
            if (!toast) {
                toast = document.createElement("div");
                toast.id = "copy-toast";
                toast.style.cssText = [
                    "position: fixed",
                    "left: 50%",
                    "bottom: 32px",
                    "transform: translateX(-50%) translateY(10px)",
                    "background: rgba(40, 44, 52, 0.92)",
                    "color: #fff",
                    "padding: 10px 16px",
                    "border-radius: 10px",
                    "font-size: 14px",
                    "z-index: 99999",
                    "opacity: 0",
                    "pointer-events: none",
                    "box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18)",
                    "transition: opacity 0.2s ease, transform 0.2s ease",
                ].join(";");
                document.body.appendChild(toast);
            }
            toast.textContent = text;
            toast.style.opacity = "1";
            toast.style.transform = "translateX(-50%) translateY(0)";
            clearTimeout(window.__particlexCopyToastTimer);
            window.__particlexCopyToastTimer = setTimeout(() => {
                toast.style.opacity = "0";
                toast.style.transform = "translateX(-50%) translateY(10px)";
            }, 1400);
        },
        async copyText(text) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch {
                try {
                    const input = document.createElement("input");
                    input.value = text;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand("copy");
                    document.body.removeChild(input);
                    return true;
                } catch {
                    return false;
                }
            }
        },
        bindCopyEmail() {
            if (document.body.dataset.copyEmailBound === "1") return;
            document.body.dataset.copyEmailBound = "1";
            document.body.addEventListener("click", async (event) => {
                const target = event.target.closest(".copy-email-link");
                if (!target) return;
                event.preventDefault();
                const email = target.getAttribute("data-email") || "";
                if (!email) return;
                const ok = await this.copyText(email);
                this.showCopyToast(
                    ok ? "\u90ae\u7bb1\u5df2\u590d\u5236" : "\u590d\u5236\u5931\u8d25\uff0c\u8bf7\u624b\u52a8\u590d\u5236"
                );
            });
        },
        applyRandomTagColors() {
            const palette = ["#ffa2c4", "#00bcd4", "#03a9f4", "#00a596", "#ff7d73"];
            const mapping = new Map();
            const shuffled = palette
                .map((color) => ({ color, sort: Math.random() }))
                .sort((left, right) => left.sort - right.sort)
                .map((item) => item.color);

            const pickColor = (tagName) => {
                if (!mapping.has(tagName)) {
                    const color = shuffled[mapping.size % shuffled.length];
                    mapping.set(tagName, color);
                }
                return mapping.get(tagName);
            };

            document.querySelectorAll("[data-tag-name]").forEach((element) => {
                const tagName = element.getAttribute("data-tag-name") || "";
                const role = element.getAttribute("data-tag-color-role") || "text";
                const color = pickColor(tagName);
                if (role === "bg") {
                    element.style.background = color;
                    element.style.color = "#fff";
                } else {
                    element.style.color = color;
                }
            });
        },
        handleScroll() {
            let wrap = this.$refs.homePostsWrap;
            let newScrollTop = document.documentElement.scrollTop;
            if (this.scrollTop < newScrollTop) {
                this.hiddenMenu = true;
                this.showMenuItems = false;
            } else this.hiddenMenu = false;
            if (wrap) {
                if (newScrollTop <= window.innerHeight - 100) this.menuColor = true;
                else this.menuColor = false;
                if (newScrollTop <= 400) wrap.style.top = "-" + newScrollTop / 5 + "px";
                else wrap.style.top = "-80px";
            }
            this.scrollTop = newScrollTop;
        },
    },
});
app.mount("#layout");
