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
            this.$nextTick(() => {
                this.initHomeTyped();
            });
        });
    },
    mounted() {
        window.addEventListener("scroll", this.handleScroll, true);
        this.render();
        this.bindCopyEmail();
        this.applyRandomTagColors();
        this.initTabTitleSwap();
        this.initHomeTyped();
        this.initHomeOrbit();
    },
    methods: {
        render() {
            for (let i of this.renderers) i();
        },
        initTabTitleSwap() {
            const configElement = document.getElementById("tab-title-config");
            if (!configElement || configElement.dataset.enable !== "1") return;
            const activeTitle = configElement.dataset.activeTitle || document.title;
            const defaultTitle =
                configElement.dataset.defaultTitle || activeTitle;
            const inactiveTitle =
                configElement.dataset.inactiveTitle || defaultTitle;
            const activeDelay = Number(configElement.dataset.activeDelay || 2600);
            const inactiveScrollSpeed = Number(
                configElement.dataset.inactiveScrollSpeed || 180
            );

            const titleState =
                window.__particlexTitleSwapState ||
                (window.__particlexTitleSwapState = {
                    activeTimer: 0,
                    scrollTimer: 0,
                    scrollIndex: 0,
                });

            titleState.activeTitle = activeTitle;
            titleState.defaultTitle = defaultTitle;
            titleState.inactiveTitle = inactiveTitle;
            titleState.activeDelay = activeDelay;
            titleState.inactiveScrollSpeed = inactiveScrollSpeed;

            const stopInactiveScroll = () => {
                if (titleState.scrollTimer) {
                    window.clearInterval(titleState.scrollTimer);
                    titleState.scrollTimer = 0;
                }
                titleState.scrollIndex = 0;
            };

            const stopActiveTimer = () => {
                window.clearTimeout(titleState.activeTimer);
                titleState.activeTimer = 0;
            };

            const startActivePhase = () => {
                stopInactiveScroll();
                stopActiveTimer();
                document.title = titleState.activeTitle;
                titleState.activeTimer = window.setTimeout(() => {
                    if (!document.hidden) {
                        document.title = titleState.defaultTitle;
                    }
                }, titleState.activeDelay);
            };

            const startInactiveScroll = () => {
                stopActiveTimer();
                stopInactiveScroll();
                document.title = titleState.inactiveTitle;
            };

            const syncTitle = () => {
                if (document.hidden) {
                    startInactiveScroll();
                    return;
                }
                startActivePhase();
            };

            const handleBlur = () => {
                startInactiveScroll();
            };

            const handleFocus = () => {
                if (!document.hidden) {
                    startActivePhase();
                }
            };

            syncTitle();

            if (window.__particlexTitleSwapBound) return;

            document.addEventListener("visibilitychange", syncTitle);
            window.addEventListener("focus", handleFocus);
            window.addEventListener("blur", handleBlur);
            window.__particlexTitleSwapBound = true;
            window.__particlexTitleSwapSync = syncTitle;
        },
        createTypedFallback(target, options) {
            const settings = {
                strings: [],
                startDelay: 300,
                typeSpeed: 150,
                backSpeed: 50,
                backDelay: 1000,
                loop: true,
                ...options,
            };
            const strings = Array.isArray(settings.strings)
                ? settings.strings.filter((item) => typeof item === "string")
                : [];
            let stringIndex = 0;
            let charIndex = 0;
            let deleting = false;
            let timer = 0;
            let destroyed = false;

            const clearCursor = () => {
                target.parentElement
                    ?.querySelector(".typed-cursor.fallback")
                    ?.remove();
            };

            const ensureCursor = () => {
                let cursor = target.parentElement?.querySelector(
                    ".typed-cursor.fallback"
                );
                if (!cursor) {
                    cursor = document.createElement("span");
                    cursor.className = "typed-cursor fallback";
                    cursor.textContent = "|";
                    target.insertAdjacentElement("afterend", cursor);
                }
            };

            const nextTick = (delay) => {
                window.clearTimeout(timer);
                timer = window.setTimeout(step, delay);
            };

            const step = () => {
                if (destroyed || !strings.length) return;
                const current = strings[stringIndex] || "";

                if (!deleting) {
                    charIndex += 1;
                    target.textContent = current.slice(0, charIndex);
                    if (charIndex >= current.length) {
                        if (!settings.loop && stringIndex === strings.length - 1) {
                            return;
                        }
                        deleting = true;
                        nextTick(settings.backDelay);
                        return;
                    }
                    nextTick(settings.typeSpeed);
                    return;
                }

                charIndex -= 1;
                target.textContent = current.slice(0, Math.max(charIndex, 0));
                if (charIndex <= 0) {
                    deleting = false;
                    stringIndex = (stringIndex + 1) % strings.length;
                    nextTick(settings.typeSpeed);
                    return;
                }
                nextTick(settings.backSpeed);
            };

            ensureCursor();
            target.textContent = "";
            nextTick(settings.startDelay);

            return {
                destroy() {
                    destroyed = true;
                    window.clearTimeout(timer);
                    clearCursor();
                },
            };
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
        initHomeTyped() {
            window.__particlexHomeSubtitleCleanup?.();

            const subtitleHost = document.getElementById("home-site-subtitle");
            const subtitleElement = document.getElementById("subtitle");
            if (!subtitleHost || !subtitleElement) return;

            let subtitleConfig = {};
            try {
                subtitleConfig = JSON.parse(
                    decodeURIComponent(subtitleHost.dataset.typedConfig || "")
                );
            } catch {
                subtitleConfig = {};
            }

            const subtitles = Array.isArray(subtitleConfig.subtitles)
                ? subtitleConfig.subtitles.filter(
                      (item) => typeof item === "string" && item.trim()
                  )
                : [];
            const fallbackText = subtitles[0] || "";
            subtitleElement.textContent = fallbackText;

            if (!subtitleConfig.enable || !subtitles.length) {
                subtitleElement.textContent = fallbackText;
                return;
            }

            const typedOptions = {
                strings: subtitles,
                startDelay: 300,
                typeSpeed: 150,
                backSpeed: 50,
                backDelay: 1000,
                loop: true,
                ...(subtitleConfig.typedOption || {}),
            };

            const fallbackInstance = this.createTypedFallback(
                subtitleElement,
                typedOptions
            );

            window.__particlexHomeSubtitleCleanup = () => {
                fallbackInstance?.destroy?.();
                subtitleElement.textContent = fallbackText;
            };
        },
        initHomeOrbit() {
            const backCanvas = document.getElementById("home-orbit-canvas-back");
            const frontCanvas = document.getElementById("home-orbit-canvas-front");
            const host = document.getElementById("home-info");
            const core = host?.querySelector(".info");
            if (!backCanvas || !frontCanvas || !host || backCanvas.dataset.bound === "1") return;
            backCanvas.dataset.bound = "1";
            frontCanvas.dataset.bound = "1";

            const backCtx = backCanvas.getContext("2d");
            const frontCtx = frontCanvas.getContext("2d");
            if (!backCtx || !frontCtx) return;

            let orbitConfig = {
                thickness: 1,
                brightness: 1,
                opacity: 1,
            };
            try {
                orbitConfig = {
                    ...orbitConfig,
                    ...(JSON.parse(
                        decodeURIComponent(host.dataset.orbitConfig || "{}")
                    ) || {}),
                };
            } catch {
                orbitConfig = {
                    thickness: 1,
                    brightness: 1,
                    opacity: 1,
                };
            }

            const clamp = (value, min, max, fallback) => {
                const number = Number(value);
                if (!Number.isFinite(number)) return fallback;
                return Math.min(Math.max(number, min), max);
            };
            const thickness = clamp(orbitConfig.thickness, 0.2, 5, 1);
            const brightness = clamp(orbitConfig.brightness, 0.2, 2, 1);
            const opacity = clamp(orbitConfig.opacity, 0.1, 1.5, 1);

            const tunedRgb = (rgb, factor) =>
                rgb.map((channel) => {
                    if (factor >= 1) {
                        return Math.round(
                            Math.min(255, channel + (255 - channel) * (factor - 1))
                        );
                    }
                    return Math.round(Math.max(0, channel * factor));
                });
            const rgba = (rgb, alpha, factor = brightness) => {
                const tuned = tunedRgb(rgb, factor);
                return `rgba(${tuned[0]}, ${tuned[1]}, ${tuned[2]}, ${Math.min(
                    Math.max(alpha * opacity, 0),
                    1
                )})`;
            };

            const baseOrbitConfigs = [
                {
                    radiusRatio: 0.18,
                    plane: { x: 0.12, y: 0.08, z: 0.0 },
                    precession: 0.0021,
                    particles: [
                        { angle: 0, speed: 0.034, size: 3.7 },
                        { angle: Math.PI, speed: 0.034, size: 2.8 },
                    ],
                },
                {
                    radiusRatio: 0.42,
                    plane: { x: 1.02, y: 0.18, z: 0.42 },
                    precession: -0.0027,
                    particles: [
                        { angle: Math.PI * 0.4, speed: -0.0285, size: 4.2 },
                        { angle: Math.PI * 1.5, speed: -0.0285, size: 3.1 },
                    ],
                },
                {
                    radiusRatio: 0.68,
                    plane: { x: 0.34, y: 1.14, z: 1.18 },
                    precession: 0.0022,
                    particles: [
                        { angle: Math.PI * 0.1, speed: 0.023, size: 4.8 },
                        { angle: Math.PI * 1.1, speed: 0.023, size: 4.1 },
                    ],
                },
                {
                    radiusRatio: 0.96,
                    plane: { x: 0.86, y: -0.76, z: 2.12 },
                    precession: -0.00195,
                    particles: [
                        { angle: Math.PI * 0.5, speed: -0.0198, size: 5.3 },
                        { angle: Math.PI * 1.6, speed: -0.0198, size: 3.6 },
                    ],
                },
            ];

            const deepClone = (value) => JSON.parse(JSON.stringify(value));
            const orbits = baseOrbitConfigs.map((orbit) => ({
                radius: 0,
                angles: deepClone(orbit.plane),
                plane: deepClone(orbit.plane),
                precession: orbit.precession,
                spin: 0,
                particles: orbit.particles.map((particle) => ({
                    angle: particle.angle,
                    speed: particle.speed,
                    size: particle.size,
                })),
                radiusRatio: orbit.radiusRatio,
            }));

            let width = 0;
            let height = 0;
            let dpr = 1;
            let perspective = 1000;
            let rafId = 0;
            let time = 0;
            let resizeObserver = null;
            let coreCenter = { x: 0, y: 0 };
            let coreRadius = 0;
            let orbitBand = 0;

            const transformPoint = (x, y, z, angles) => {
                const cx = Math.cos(angles.x);
                const sx = Math.sin(angles.x);
                const y1 = y * cx - z * sx;
                const z1 = y * sx + z * cx;

                const cy = Math.cos(angles.y);
                const sy = Math.sin(angles.y);
                const x2 = x * cy + z1 * sy;
                const z2 = -x * sy + z1 * cy;

                const cz = Math.cos(angles.z);
                const sz = Math.sin(angles.z);
                const x3 = x2 * cz - y1 * sz;
                const y3 = x2 * sz + y1 * cz;

                const scale = perspective / (perspective + z2);
                return { x: x3 * scale, y: y3 * scale, z: z2, scale };
            };

            const syncCoreMetrics = () => {
                const hostRect = host.getBoundingClientRect();
                const coreRect = core?.getBoundingClientRect() || hostRect;
                coreCenter = {
                    x: coreRect.left - hostRect.left + coreRect.width / 2,
                    y: coreRect.top - hostRect.top + coreRect.height / 2,
                };
                coreRadius = Math.min(coreRect.width, coreRect.height) / 2;
                const edgeLimit = Math.max(
                    24,
                    Math.min(
                        coreCenter.x,
                        width - coreCenter.x,
                        coreCenter.y,
                        height - coreCenter.y
                    ) - 8
                );
                const maxOrbitRadius = Math.max(coreRadius + 36, edgeLimit);
                orbitBand = Math.max(28, maxOrbitRadius - coreRadius - 12);
                orbits.forEach((orbit) => {
                    orbit.radius = coreRadius + 12 + orbitBand * orbit.radiusRatio;
                });
            };

            const resizeCanvas = () => {
                const hostRect = host.getBoundingClientRect();
                width = Math.max(1, Math.round(hostRect.width));
                height = Math.max(1, Math.round(hostRect.height));
                dpr = Math.min(window.devicePixelRatio || 1, 2);
                [backCanvas, frontCanvas].forEach((canvas) => {
                    canvas.width = Math.round(width * dpr);
                    canvas.height = Math.round(height * dpr);
                    canvas.style.width = `${width}px`;
                    canvas.style.height = `${height}px`;
                });
                [backCtx, frontCtx].forEach((ctx) => {
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                });
                perspective = Math.max(width, height) * 1.95;
                syncCoreMetrics();
            };

            const drawOrbitRoute = (orbit, cx, cy) => {
                const segments = 240;
                const points = [];
                for (let i = 0; i <= segments; i += 1) {
                    const theta = (Math.PI * 2 * i) / segments;
                    const x = orbit.radius * Math.cos(theta);
                    const y = orbit.radius * Math.sin(theta);
                    points.push(transformPoint(x, y, 0, orbit.angles));
                }

                const drawLayer = (ctx, isFront) => {
                    ctx.save();
                    ctx.beginPath();
                    let drawing = false;
                    points.forEach((point) => {
                        const visible = isFront ? point.z >= 0 : point.z < 0;
                        const px = cx + point.x;
                        const py = cy + point.y;
                        if (visible) {
                            if (!drawing) {
                                ctx.moveTo(px, py);
                                drawing = true;
                            } else {
                                ctx.lineTo(px, py);
                            }
                        } else {
                            drawing = false;
                        }
                    });
                    ctx.strokeStyle = isFront
                        ? rgba([214, 224, 244], 0.42)
                        : rgba([188, 198, 220], 0.34);
                    ctx.lineWidth =
                        Math.max(2.2, Math.min(width, height) * 0.0085) * thickness;
                    ctx.shadowBlur = (isFront ? 12 : 7) * (0.75 + brightness * 0.45);
                    ctx.shadowColor = isFront
                        ? rgba([168, 184, 220], 0.28)
                        : rgba([120, 138, 172], 0.18);
                    ctx.stroke();
                    ctx.restore();
                };

                drawLayer(backCtx, false);
                drawLayer(frontCtx, true);
            };

            const collectParticles = (cx, cy) => {
                const backParticles = [];
                const frontParticles = [];
                orbits.forEach((orbit) => {
                    orbit.particles.forEach((particle) => {
                        const x = orbit.radius * Math.cos(particle.angle);
                        const y = orbit.radius * Math.sin(particle.angle);
                        const pos = transformPoint(x, y, 0, orbit.angles);
                        const depthFactor = (pos.z + orbit.radius) / (orbit.radius * 2);
                        const alpha = 0.34 + (1 - depthFactor) * 0.66;
                        const rendered = {
                            x: cx + pos.x,
                            y: cy + pos.y,
                            z: pos.z,
                            alpha: Math.min(Math.max(alpha, 0.24), 1),
                            size: particle.size * pos.scale,
                        };
                        if (pos.z >= 0) frontParticles.push(rendered);
                        else backParticles.push(rendered);
                    });
                });
                return {
                    back: backParticles.sort((left, right) => left.z - right.z),
                    front: frontParticles.sort((left, right) => left.z - right.z),
                };
            };

            const drawParticles = (ctx, particles, isFront) => {
                particles.forEach((particle) => {
                    ctx.save();
                    ctx.shadowBlur = (isFront ? 16 : 10) * (0.75 + brightness * 0.45);
                    ctx.shadowColor = isFront
                        ? rgba([255, 255, 255], 0.88)
                        : rgba([255, 255, 255], 0.42);
                    ctx.fillStyle = rgba([255, 255, 255], particle.alpha);
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });
            };

            const drawCoreGlow = (ctx, cx, cy) => {
                const pulse = Math.sin(time) * 0.7;
                ctx.save();
                ctx.shadowBlur = 22 * (0.7 + brightness * 0.3);
                ctx.shadowColor = rgba([255, 255, 255], 0.82);
                ctx.fillStyle = rgba([255, 255, 255], 0.18);
                ctx.beginPath();
                ctx.arc(cx, cy, Math.max(18, coreRadius * 0.2) + pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            };

            const animate = () => {
                rafId = window.requestAnimationFrame(animate);
                time += 0.01;
                syncCoreMetrics();
                const cx = coreCenter.x;
                const cy = coreCenter.y;

                backCtx.clearRect(0, 0, width, height);
                frontCtx.clearRect(0, 0, width, height);
                backCtx.save();
                backCtx.globalAlpha = 0.85;
                drawCoreGlow(backCtx, cx, cy);
                backCtx.restore();

                orbits.forEach((orbit) => {
                    orbit.spin += orbit.precession;
                    orbit.angles.x = orbit.plane.x;
                    orbit.angles.y = orbit.plane.y;
                    orbit.angles.z = orbit.plane.z + orbit.spin;
                    orbit.particles.forEach((particle) => {
                        particle.angle += particle.speed;
                    });
                    drawOrbitRoute(orbit, cx, cy);
                });

                const particleLayers = collectParticles(cx, cy);
                drawParticles(backCtx, particleLayers.back, false);
                drawParticles(frontCtx, particleLayers.front, true);
            };

            resizeCanvas();
            animate();
            window.addEventListener("resize", resizeCanvas);
            if ("ResizeObserver" in window) {
                resizeObserver = new ResizeObserver(resizeCanvas);
                resizeObserver.observe(host);
                if (core) resizeObserver.observe(core);
            }

            window.__particlexOrbitCleanup?.();
            window.__particlexOrbitCleanup = () => {
                window.cancelAnimationFrame(rafId);
                window.removeEventListener("resize", resizeCanvas);
                resizeObserver?.disconnect();
            };
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
