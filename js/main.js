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
    },
    methods: {
        render() {
            for (let i of this.renderers) i();
        },
        bindCopyEmail() {
            const links = document.querySelectorAll(".copy-email-link");
            for (const link of links) {
                link.addEventListener("click", async () => {
                    const email = link.getAttribute("data-email") || "";
                    if (!email) return;
                    try {
                        await navigator.clipboard.writeText(email);
                        const oldTitle = link.getAttribute("title") || "";
                        link.setAttribute("title", "邮箱已复制");
                        setTimeout(() => link.setAttribute("title", oldTitle), 1500);
                    } catch {
                        const input = document.createElement("input");
                        input.value = email;
                        document.body.appendChild(input);
                        input.select();
                        document.execCommand("copy");
                        document.body.removeChild(input);
                    }
                });
            }
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
