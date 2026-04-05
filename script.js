import { Gradient } from "./Gradient.js"

let homeInitialized = false
document.body.classList.remove("is-loaded")

document.addEventListener("DOMContentLoaded", () => {
  initPreloader()
})

/* -----------------------------
   BARBA: body classes
----------------------------- */
barba.hooks.afterEnter((data) => {
  requestAnimationFrame(() => {
    gsap.set(data.next.container, { clearProps: "all" })
    gsap.set("[data-shared='media']", { clearProps: "all" })
    ScrollTrigger.refresh()
  })

  if (data.next.namespace === "home") {
    initHome() // ✅ zpět, ale jen tady
  }

  if (data.next.namespace === "about") {
    initAbout()
  }

  if (data.next.namespace === "befit") {
    initProjectContent()
  }
})
barba.hooks.beforeEnter((data) => {
  const ns = data.next.namespace

  document.body.classList.remove("is-home", "is-project")

  if (ns === "home") document.body.classList.add("is-home")
  if (ns === "befit") document.body.classList.add("is-project")
    if (ns !== "home") {
  homeInitialized = false
}
})

function initAbout() {
  const tl = gsap.timeline()

  tl.from(".about-label", {
    opacity: 0,
    y: 20,
    duration: 0.6
  })

  .from(".about-title", {
    opacity: 0,
    y: 40,
    duration: 1,
    ease: "power3.out"
  }, "-=0.3")

  .from(".about-text p", {
    opacity: 0,
    y: 20,
    stagger: 0.2,
    duration: 0.8
  }, "-=0.6")

  .from(".about-image", {
    opacity: 0,
    y: 60,
    scale: 0.98,
    duration: 1,
    ease: "power3.out"
  }, "-=0.6")
}

/* -----------------------------
   GRADIENT
----------------------------- */
const isMobile = window.matchMedia("(max-width: 768px)").matches

if (!isMobile) {
  const gradient = new Gradient()
  gradient.initGradient("#gradient-canvas")
  window.gradientInstance = gradient
} else {
  const canvas = document.getElementById("gradient-canvas")
  if (canvas) canvas.style.display = "none"
}

/* -----------------------------
   COLORS
----------------------------- */
const palettes = [
  // warm gold
  ["#ffffff", "#f9f5ee", "#efe3c8", "#d4af37"],

  // soft bronze
  ["#ffffff", "#f8f4ec", "#e8d8c0", "#b8962e"],

  // slightly rosy beige
  ["#ffffff", "#faf6f2", "#ecd9cc", "#caa27a"],

  // neutral sand
  ["#ffffff", "#f7f3ed", "#e4d6c6", "#a88f6c"],

  // cooler ivory (still white but different feel)
  ["#ffffff", "#f6f7f5", "#dde2db", "#9fa89c"]
]

function hexToRGB(hex) {
  hex = hex.replace("#", "")
  return [
    parseInt(hex.substring(0, 2), 16) / 255,
    parseInt(hex.substring(2, 4), 16) / 255,
    parseInt(hex.substring(4, 6), 16) / 255
  ]
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function lerpColor(c0, c1, t) {
  const a = hexToRGB(c0)
  const b = hexToRGB(c1)
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t)
  ]
}

function updateShaderColors(floatIndex) {
  const gradient = window.gradientInstance
  if (!gradient || !gradient.material || !gradient.material.uniforms) return

  const uniforms = gradient.material.uniforms

  const i0 = Math.floor(floatIndex)
  const i1 = i0 + 1
  const t = floatIndex - i0

  const p0 = palettes[((i0 % palettes.length) + palettes.length) % palettes.length]
  const p1 = palettes[((i1 % palettes.length) + palettes.length) % palettes.length]

  if (uniforms.u_baseColor) {
    uniforms.u_baseColor.value = lerpColor(p0[0], p1[0], t)
  }

  if (uniforms.u_waveLayers && Array.isArray(uniforms.u_waveLayers.value)) {
    uniforms.u_waveLayers.value.forEach((layer, index) => {
      const c0 = p0[index + 1] || p0[p0.length - 1]
      const c1 = p1[index + 1] || p1[p1.length - 1]
      if (layer?.value?.color) {
        layer.value.color.value = lerpColor(c0, c1, t)
      }
    })
  }
}

/* -----------------------------
   HOME CARDS
----------------------------- */
// ==============================
// CARDS ENGINE (SMOOTH VERSION)
// ==============================

let cards = []
let total = 0

let current = 0   // smooth interpolated
let target = 0    // target index

let introOffset = 200
let lastWheelTime = 0

const SCROLL_DELAY = 400
const LERP = 0.08

let cardHeight = 0

function initHome() {
    if (homeInitialized) return
  homeInitialized = true
  cards = gsap.utils.toArray(".c-cards__card:not(.c-cards__card--dummy)")
  total = cards.length

  if (!total) return

  cardHeight = cards[0].offsetHeight

  current = 0
  target = 0

  introOffset = 200

  render(current)
  initEvents()
  introAnimation()
  animate()
}

// ==============================
// POSITION LOGIC
// ==============================

function getOffset(i, indexValue, totalValue) {
  let offset = i - indexValue
  offset = ((offset + totalValue / 2) % totalValue + totalValue) % totalValue - totalValue / 2
  return offset
}

function introAnimation() {
  // start state
  cards.forEach((card) => {
    card.style.opacity = 0
    card.style.transform += " scale(0.96)"
  })

  const tl = gsap.timeline()

  // stack rise (globální pohyb nahoru)
  tl.to({ offset: 200 }, {
    offset: 0,
    duration: 1.2,
    ease: "expo.out",
    onUpdate: function () {
      introOffset = this.targets()[0].offset
    }
  })

  // fade in one by one
  tl.to(cards, {
    opacity: 1,
    duration: 0.6,
    stagger: 0.08,
    ease: "power2.out"
  }, "-=1")

  // subtle scale finish
  tl.to(cards, {
    scale: 1,
    duration: 0.8,
    stagger: 0.06,
    ease: "power3.out"
  }, "-=0.8")
}

// ==============================
// RENDER (FAST AF)
// ==============================

function render(indexValue) {
  if (!document.body.classList.contains("is-loaded")) return
  const centerY = window.innerHeight / 2 - cardHeight / 2

  for (let i = 0; i < total; i++) {
    const card = cards[i]

    const offset = getOffset(i, indexValue, total)
    const abs = Math.abs(offset)

    const maxVisible = 4
    const t = Math.min(abs / maxVisible, 1)

    const opacity = Math.pow(1 - t, 2)
    const scale = offset === 0 ? 1 : 1 - abs * 0.08
    const rotation = offset * 2.5
    // LOGIKA DELAYE REFRESH ANIMATION KARET
    const delay = Math.abs(offset) * 0.12

// simulace progressu pro každou kartu
const localProgress = Math.max(0, 1 - (introOffset / 200) - delay)

// clamp
const p = Math.min(localProgress, 1)

// easing (luxury feel)
const eased = 1 - Math.pow(2, -10 * p)

// vlastní offset pro každou kartu
const localOffset = (1 - eased) * 200

const y = centerY + offset * 70 + localOffset

card.style.transform = `
  translate3d(-50%, ${y}px, 0)
  rotate(${rotation}deg)
  scale(${scale})
`
    card.style.opacity = opacity * eased
    card.style.zIndex = Math.round(100 - abs * 10)

    // light blur only far cards (cheap)
    card.style.filter = abs > 2 ? "blur(8px)" : "none"

    const media = card.querySelector("img, video")
    if (media) {
      media.style.transform = `translateY(${-offset * 20}px)`
    }
  }

  updateShaderColors(indexValue)
}

// ==============================
// SMOOTH LOOP (NO GSAP)
// ==============================

function animate() {
  if (!document.body.classList.contains("is-loaded")) {
    requestAnimationFrame(animate)
    return
  }

  current += (target - current) * LERP
  render(current)

  requestAnimationFrame(animate)
}

// ==============================
// NAVIGATION
// ==============================

function goTo(indexDelta) {
  target += indexDelta
}

// ==============================
// INPUT EVENTS
// ==============================

function initEvents() {
  window.addEventListener("wheel", (e) => {
    const now = Date.now()

    if (Math.abs(e.deltaY) < 10) return
    if (now - lastWheelTime < SCROLL_DELAY) return

    lastWheelTime = now

    const direction = e.deltaY > 0 ? 1 : -1
    goTo(direction)
  }, { passive: true })

  let touchStartY = 0

  window.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY
  }, { passive: true })

  window.addEventListener("touchend", (e) => {
    const delta = touchStartY - e.changedTouches[0].clientY
    if (Math.abs(delta) < 30) return

    const direction = delta > 0 ? 1 : -1
    goTo(direction)
  }, { passive: true })

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") goTo(1)
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") goTo(-1)
  })

  window.addEventListener("resize", () => {
    cardHeight = cards[0].offsetHeight
  })
}

// ==============================
// SCROLL FREEZE
// ==============================

let scrollY = 0
let clone = null

function freezeScroll() {
  scrollY = window.scrollY

  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth

  Object.assign(document.body.style, {
    position: "fixed",
    top: `-${scrollY}px`,
    left: "0",
    right: "0",
    width: "100%",
    paddingRight: `${scrollbarWidth}px`
  })
}

function unfreezeScroll() {
  Object.assign(document.body.style, {
    position: "",
    top: "",
    left: "",
    right: "",
    width: "",
    paddingRight: ""
  })

  window.scrollTo(0, scrollY)
}

barba.init({
  transitions: [
    {
      async leave(data) {
        freezeScroll()

        const trigger = data.trigger
        const card = trigger ? trigger.closest(".c-cards__card") : null
        const image = card?.querySelector("[data-shared='media']")


        if (!card || !image) {
          await gsap.to(data.current.container, {
            opacity: 0,
            duration: 0.3
          })
          return
        }

        const rect = image.getBoundingClientRect()

        clone = image.cloneNode(true)

        Object.assign(clone.style, {
          position: "fixed",
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          zIndex: 10,
          objectFit: "cover",
          pointerEvents: "none",
          borderRadius: "20px",
          willChange: "transform, width, height"
        })

        document.body.appendChild(clone)

        await gsap.to(data.current.container, {
          opacity: 0,
          duration: 0.7
        })
      },

      async enter(data) {
        const container = data.next.container
        const target = container.querySelector("[data-shared='media']")
        const targetContent = container.querySelector("[data-shared='content']")

                gsap.set(target, { opacity: 0 })

        // 👉 fallback
        if (!clone || !target) {
          await gsap.from(container, {
            opacity: 0,
            duration: 0.4
          })
          unfreezeScroll()
          return
        }

        // ==============================
        // FIX: container nahoře + visible
        // ==============================
        Object.assign(container.style, {
          position: "fixed",
          inset: "0",
          zIndex: "1000",
          opacity: "1",
          pointerEvents: "none"
        })

        if (targetContent) {
          const elements = targetContent.querySelectorAll(
            ".project-label, .project-title, .project-desc"
          )

          // 👉 KLÍČOVÉ: nastavit hned
          gsap.set(elements, {
            opacity: 0,
            y: 80
          })
        }

        gsap.set(target, { opacity: 1 })

        const hero = target.closest(".project-hero")
        if (hero) hero.style.transform = "none"
        target.style.transform = "none"

        target.style.visibility = "hidden"

        const rect = target.getBoundingClientRect()

        if (targetContent) {
          const elements = targetContent.querySelectorAll(
            ".project-label, .project-title, .project-desc"
          )

          gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: "power3.out",
            stagger: 0.05
          })
        }

        // ==============================
        // IMAGE TRANSITION + UNFREEZE
        // ==============================

        await gsap.to(clone, {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          borderRadius: "20px",
          duration: 0.8,
          ease: "power3.inOut",
        })

        target.style.visibility = "visible"

        clone.remove()
        clone = null

        unfreezeScroll()

        if (hero) hero.style.transform = ""
        target.style.transform = ""

        Object.assign(container.style, {
          position: "",
          inset: "",
          zIndex: "",
          pointerEvents: ""
        })
      }
    }
  ]
})

// BEFIT PAGE 
function initProjectContent() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".project-content",
      start: "top 80%",   // když přijde do viewportu
      toggleActions: "play none none none"
    }
  })

  tl.from(".project-label", {
    opacity: 0,
    y: 20,
    duration: 0.6
  })

  .from(".project-title", {
    opacity: 0,
    y: 40,
    duration: 1,
    ease: "power3.out"
  }, "-=0.3")

  .from(".project-text p", {
    opacity: 0,
    y: 30,
    stagger: 0.2,
    duration: 0.8,
    ease: "power2.out"
  }, "-=0.6")
}
// INIT PRELOADER
function initPreloader() {
  const text = new SplitType(".preloader-text", { types: "chars" })

  const tl = gsap.timeline()

  tl.to(text.chars, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power2.out",
    stagger: 0.04
  })

  .to(".preloader-text", {
    letterSpacing: "0.12em",
    duration: 0.6,
    ease: "power1.out"
  }, "-=0.6")

  .to({}, { duration: 0.4 })

  .to(".preloader", {
    y: "-100%",
    duration: 0.9,
    ease: "power3.inOut"
  })

  .set(".preloader", {
    display: "none"
  })

  // ✅ nejdřív unlock
  .add(() => {
    document.body.classList.add("is-loaded")
  }, "-=0.2")

  // ✅ pak init
  .add(() => {
    initHome()
  }, "+=0.05")
}