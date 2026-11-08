(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const year = $(".year");
  if (year) year.textContent = new Date().getFullYear();

  const menuBtn = $(".nav__menu");
  const menu = $(".menu");
  const setMenu = open => {
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  };
  menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));

  const nav = $(".nav");
  const darks = $$("[data-dark]");
  const paintNav = () => nav.classList.toggle("is-light", darks.some(s => { const r = s.getBoundingClientRect(); return r.top <= 36 && r.bottom >= 36; }));

  const big = $("[data-split]");
  if (big) {
    const parts = [];
    big.childNodes.forEach(n => {
      const it = n.nodeType === 1;
      n.textContent.trim().split(/\s+/).filter(Boolean).forEach(w => parts.push(it ? `<em class="w"><span>${w}</span></em>` : `<span class="w"><span>${w}</span></span>`));
    });
    big.innerHTML = parts.join(" ");
  }

  const cursor = $(".cursor");
  const label = $(".cursor__label");
  if (cursor && window.matchMedia("(hover:hover)").matches) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("mousemove", e => { x = e.clientX; y = e.clientY; });
    const loop = () => {
      cx += (x - cx) * .2; cy += (y - cy) * .2;
      cursor.style.transform = `translate(${cx}px,${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    $$("[data-cursor]").forEach(el => {
      el.addEventListener("mouseenter", () => { label.textContent = el.dataset.cursor; cursor.classList.add("is-big"); });
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-big"));
    });
  }

  const track = $(".acc__track");
  if (track && window.matchMedia("(min-width:801px)").matches) {
    let down = false, sx = 0, pos = 0, target = 0;
    const max = () => Math.max(0, track.scrollWidth - innerWidth);
    track.addEventListener("pointerdown", e => { down = true; sx = e.clientX - target; track.classList.add("is-drag"); track.setPointerCapture(e.pointerId); });
    track.addEventListener("pointermove", e => { if (down) target = Math.min(0, Math.max(-max(), e.clientX - sx)); });
    const up = () => { down = false; track.classList.remove("is-drag"); };
    track.addEventListener("pointerup", up);
    track.addEventListener("pointercancel", up);
    const tick = () => { pos += (target - pos) * .1; track.style.transform = `translateX(${pos}px)`; requestAnimationFrame(tick); };
    tick();
  }

  const loader = $(".loader");
  const desk = window.matchMedia("(min-width:801px)").matches;

  if (!hasGsap || reduce) {
    loader.remove();
    addEventListener("scroll", paintNav, { passive: true });
    paintNav();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("is-loading");

  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: .085, smoothWheel: true });
    lenis.stop();
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const t = $(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      setMenu(false);
      lenis ? lenis.scrollTo(t, { duration: 1.8 }) : t.scrollIntoView({ behavior: "smooth" });
    });
  });

  gsap.set(".loader", { clipPath: "inset(0% 0% 0% 0%)" });
  gsap.set(".hero__row>span", { yPercent: 105 });
  gsap.set(".hero__p", { clipPath: "inset(100% 0% 0% 0%)" });
  gsap.set(".hero__sub span,.hero__hint", { opacity: 0, y: 12 });

  gsap.timeline({
    onComplete: () => {
      loader.remove();
      document.body.classList.remove("is-loading");
      lenis && lenis.start();
      ScrollTrigger.refresh();
    }
  })
    .to(".loader__mono span", { opacity: 1, y: 0, yPercent: 0, rotate: 0, duration: 1.2, ease: "expo.out", stagger: .18 })
    .to(".loader__mono i", { opacity: 1, duration: .4 }, "-=.5")
    .to(".loader__line", { opacity: .8, duration: .6 }, "-=.4")
    .to(".loader__mono,.loader__line", { opacity: 0, y: -30, duration: .6, ease: "power3.in", delay: .4 })
    .to(".loader", { clipPath: "inset(0% 0% 100% 0%)", duration: 1.2, ease: "expo.inOut" }, "-=.15")
    .to(".hero__p", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut", stagger: { each: .12, from: "center" } }, "-=1")
    .to(".hero__p img", { scale: 1, duration: 2.4, ease: "expo.out", stagger: { each: .12, from: "center" } }, "<")
    .to(".hero__row>span", { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: .12 }, "-=1.6")
    .to(".hero__sub span,.hero__hint", { opacity: 1, y: 0, duration: 1, stagger: .1 }, "-=1");

  const heroST = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
  if (desk) gsap.to(".hero__p--l", { yPercent: 12, ease: "none", scrollTrigger: heroST });
  gsap.to(".hero__p--r", { yPercent: 18, ease: "none", scrollTrigger: heroST });
  gsap.to(".hero__p--c", { yPercent: 6, ease: "none", scrollTrigger: heroST });
  gsap.to(".hero__title", { yPercent: -40, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "70% top", scrub: true } });

  gsap.set(".maison__big .w>span", { yPercent: 110 });
  gsap.to(".maison__big .w>span", { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: .05, scrollTrigger: { trigger: ".maison__big", start: "top 80%" } });

  $$("[data-reveal]").forEach(el => {
    gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });

  $$("[data-parallax]").forEach(el => {
    const amt = parseFloat(el.dataset.parallax) || .1;
    if (desk) gsap.fromTo(el, { y: () => innerHeight * amt * .5 }, { y: () => -innerHeight * amt * .5, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    const img = el.querySelector("img");
    if (img) gsap.fromTo(img, { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  const wrap = $(".chapters");
  $$(".ch").forEach(ch => {
    const to = { backgroundColor: ch.dataset.bg, color: ch.dataset.fg, duration: .9, ease: "power2.out", overwrite: "auto" };
    ScrollTrigger.create({ trigger: ch, start: "top 55%", end: "bottom 55%", onEnter: () => gsap.to(wrap, to), onEnterBack: () => gsap.to(wrap, to) });
    const word = ch.querySelector(".ch__word");
    if (desk) gsap.fromTo(word, { xPercent: ch.matches(".ch--or,.ch--terre") ? 12 : -12 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: ch, start: "top bottom", end: "top top", scrub: true } });
    gsap.from(ch.querySelectorAll(".ch__cap,.ch__quote"), { y: 40, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ch, start: "top 40%" } });
  });

  gsap.from(".acc__title,.acc__text", { y: 50, opacity: 0, duration: 1.3, ease: "expo.out", stagger: .1, scrollTrigger: { trigger: ".acc", start: "top 70%" } });
  gsap.from(".acc__item", { y: 80, opacity: 0, duration: 1.3, ease: "expo.out", stagger: .1, scrollTrigger: { trigger: ".acc__track", start: "top 85%" } });

  $$(".cmd__steps li").forEach(li => {
    gsap.from(li, { y: 40, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: li, start: "top 88%" } });
  });

  gsap.fromTo(".contact__mono", { scale: .8, rotate: -8 }, { scale: 1.1, rotate: 4, ease: "none", scrollTrigger: { trigger: ".contact", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".contact__title,.contact__info,.contact__cta", { y: 50, opacity: 0, duration: 1.3, ease: "expo.out", stagger: .1, scrollTrigger: { trigger: ".contact", start: "top 60%" } });
  gsap.from(".foot__big", { yPercent: 60, opacity: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".foot", start: "top 85%" } });

  ScrollTrigger.create({ start: 0, end: "max", onUpdate: paintNav });
  paintNav();
  addEventListener("load", () => ScrollTrigger.refresh());
})();
