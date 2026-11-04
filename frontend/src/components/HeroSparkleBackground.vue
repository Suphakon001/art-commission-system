<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const containerRef = ref(null)
const canvasRef = ref(null)

// Celestial Palette: Sky Blue, Purple, Pastel Violet, Pink, White
const PALETTE = [
  { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.8)' },  // Sky Blue
  { color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.8)' },  // Soft Blue
  { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.8)' },  // Purple
  { color: '#c084fc', glow: 'rgba(192, 132, 252, 0.8)' }, // Pastel Violet
  { color: '#d8b4fe', glow: 'rgba(216, 180, 254, 0.8)' }, // Light Lavender
  { color: '#f472b6', glow: 'rgba(244, 114, 182, 0.8)' }, // Pink
  { color: '#fb7185', glow: 'rgba(251, 113, 133, 0.8)' }, // Rose Pink
  { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.9)' }, // Pure White
]

let animationFrameId = null
let width = 0
let height = 0

// Parallax target (-1 to 1) & current smoothed values
let targetParallaxX = 0
let targetParallaxY = 0
let currentParallaxX = 0
let currentParallaxY = 0

// Mouse pointer inside hero for local fluid repulsion
let mouseLocalX = -9999
let mouseLocalY = -9999
let isMouseInside = false

// Particles array
let particles = []

class ParallaxParticle {
  constructor(w, h) {
    this.init(w, h)
  }

  init(w, h) {
    // Distribute across the hero section
    this.baseX = Math.random() * w
    this.baseY = Math.random() * h

    // Independent continuous floating velocity
    this.driftAngle = Math.random() * Math.PI * 2
    this.driftSpeed = Math.random() * 0.35 + 0.15
    this.driftRadius = Math.random() * 25 + 10
    this.driftPhase = Math.random() * Math.PI * 2

    // Parallax Depth (0.2 = Far, 0.6 = Mid, 1.0 = Near)
    this.depth = Math.random() * 0.8 + 0.2

    // Star Type:
    // 0 = Soft glowing orb (50%)
    // 1 = 4-Point sparkling star (38%)
    // 2 = Radiant 8-point celestial star (12%)
    const rand = Math.random()
    if (rand < 0.50) {
      this.type = 0
      this.baseSize = (Math.random() * 2.2 + 1.2) * (0.6 + this.depth * 0.6)
    } else if (rand < 0.88) {
      this.type = 1
      this.baseSize = (Math.random() * 4.5 + 4.0) * (0.6 + this.depth * 0.7)
    } else {
      this.type = 2
      this.baseSize = (Math.random() * 5.0 + 8.0) * (0.6 + this.depth * 0.7)
    }

    const colorObj = PALETTE[Math.floor(Math.random() * PALETTE.length)]
    this.color = colorObj.color
    this.glowColor = colorObj.glow

    // Twinkling cycle
    this.twinklePhase = Math.random() * Math.PI * 2
    this.twinkleSpeed = Math.random() * 0.035 + 0.015
    this.minAlpha = Math.random() * 0.25 + 0.20
    this.maxAlpha = Math.random() * 0.35 + 0.65

    // Rotation
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * 0.012

    // Fluid displacement
    this.dispX = 0
    this.dispY = 0
  }

  update(w, h, pX, pY, mX, mY, mouseIn) {
    // Continuous orbital float
    this.driftPhase += this.driftSpeed * 0.03
    this.twinklePhase += this.twinkleSpeed
    this.rotation += this.rotationSpeed

    const naturalFloatX = Math.cos(this.driftPhase) * this.driftRadius
    const naturalFloatY = Math.sin(this.driftPhase * 1.3) * (this.driftRadius * 0.7)

    // Parallax movement based on depth: Near particles move more, far particles move less
    const maxParallax = 55 // maximum pixel displacement at screen corners
    const parallaxOffsetX = pX * this.depth * maxParallax
    const parallaxOffsetY = pY * this.depth * maxParallax

    // Interactive mouse repulsion if cursor is close
    if (mouseIn) {
      const currentX = this.baseX + naturalFloatX + parallaxOffsetX + this.dispX
      const currentY = this.baseY + naturalFloatY + parallaxOffsetY + this.dispY
      const dx = currentX - mX
      const dy = currentY - mY
      const dist = Math.hypot(dx, dy)
      const repulseRadius = 160 * this.depth

      if (dist < repulseRadius && dist > 1) {
        const force = (1 - dist / repulseRadius) * 28 * this.depth
        this.dispX += (dx / dist) * force
        this.dispY += (dy / dist) * force
      }
    }

    // Smooth return from fluid displacement
    this.dispX *= 0.90
    this.dispY *= 0.90

    // Final render coordinates
    this.renderX = this.baseX + naturalFloatX + parallaxOffsetX + this.dispX
    this.renderY = this.baseY + naturalFloatY + parallaxOffsetY + this.dispY

    // Wrap smoothly within hero boundaries
    if (this.renderX < -40) this.baseX += w + 80
    if (this.renderX > w + 40) this.baseX -= (w + 80)
    if (this.renderY < -40) this.baseY += h + 80
    if (this.renderY > h + 40) this.baseY -= (h + 80)
  }

  draw(ctx) {
    const wave = 0.5 + 0.5 * Math.sin(this.twinklePhase)
    const alpha = this.minAlpha + (this.maxAlpha - this.minAlpha) * wave
    const currentSize = this.baseSize * (0.85 + 0.25 * wave)

    if (this.type === 0) {
      drawGlowingDot(ctx, this.renderX, this.renderY, currentSize, this.color, this.glowColor, alpha)
    } else if (this.type === 1) {
      drawFourPointStar(ctx, this.renderX, this.renderY, currentSize, this.color, this.glowColor, alpha, this.rotation)
    } else {
      drawRadiantStar(ctx, this.renderX, this.renderY, currentSize, this.color, this.glowColor, alpha, this.rotation)
    }
  }
}

// ─── Drawing Primitives ──────────────────────────────────────────────

function drawFourPointStar(ctx, x, y, size, color, glow, alpha, rotation) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha))

  ctx.shadowBlur = size * 2.5
  ctx.shadowColor = glow

  ctx.fillStyle = color
  ctx.beginPath()
  const outer = size
  const inner = size * 0.20

  ctx.moveTo(0, -outer)
  ctx.quadraticCurveTo(0, -inner, inner, -inner)
  ctx.quadraticCurveTo(0, -inner, outer, 0)
  ctx.quadraticCurveTo(0, inner, inner, inner)
  ctx.quadraticCurveTo(0, inner, 0, outer)
  ctx.quadraticCurveTo(0, inner, -inner, inner)
  ctx.quadraticCurveTo(0, inner, -outer, 0)
  ctx.quadraticCurveTo(0, -inner, -inner, -inner)
  ctx.quadraticCurveTo(0, -inner, 0, -outer)
  ctx.closePath()
  ctx.fill()

  // Radiant white core
  ctx.shadowBlur = size * 1.2
  ctx.shadowColor = '#ffffff'
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.24, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawRadiantStar(ctx, x, y, size, color, glow, alpha, rotation) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha))

  // Radiant halo
  ctx.shadowBlur = size * 3.5
  ctx.shadowColor = glow
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2)
  ctx.fill()

  // 4 Primary rays
  drawStarRays(ctx, size, size * 0.16, color)

  // 4 Diagonal minor rays (45 deg)
  ctx.save()
  ctx.rotate(Math.PI / 4)
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.55))
  drawStarRays(ctx, size * 0.55, size * 0.12, color)
  ctx.restore()

  // Bright white core
  ctx.shadowBlur = size * 1.5
  ctx.shadowColor = '#ffffff'
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawStarRays(ctx, outer, inner, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, -outer)
  ctx.quadraticCurveTo(0, -inner, inner, -inner)
  ctx.quadraticCurveTo(0, -inner, outer, 0)
  ctx.quadraticCurveTo(0, inner, inner, inner)
  ctx.quadraticCurveTo(0, inner, 0, outer)
  ctx.quadraticCurveTo(0, inner, -inner, inner)
  ctx.quadraticCurveTo(0, inner, -outer, 0)
  ctx.quadraticCurveTo(0, -inner, -inner, -inner)
  ctx.quadraticCurveTo(0, -inner, 0, -outer)
  ctx.closePath()
  ctx.fill()
}

function drawGlowingDot(ctx, x, y, size, color, glow, alpha) {
  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
  ctx.shadowBlur = size * 3.0
  ctx.shadowColor = glow

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, size * 0.65, 0, Math.PI * 2)
  ctx.fill()

  // White core center
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(x, y, size * 0.28, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// ─── Mouse & Touch Parallax Tracking ─────────────────────────────────

function handleMouseMove(e) {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  mouseLocalX = mouseX
  mouseLocalY = mouseY
  isMouseInside = true

  // Normalize relative to hero center: -1.0 (left/top) to +1.0 (right/bottom)
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  targetParallaxX = (mouseX - centerX) / centerX
  targetParallaxY = (mouseY - centerY) / centerY
}

function handleMouseLeave() {
  isMouseInside = false
  mouseLocalX = -9999
  mouseLocalY = -9999
  // Gently glide back to center/rest position
  targetParallaxX = 0
  targetParallaxY = 0
}

function handleTouchMove(e) {
  if (!containerRef.value || !e.touches || e.touches.length === 0) return
  const rect = containerRef.value.getBoundingClientRect()
  const touch = e.touches[0]
  const touchX = touch.clientX - rect.left
  const touchY = touch.clientY - rect.top

  mouseLocalX = touchX
  mouseLocalY = touchY
  isMouseInside = true

  const centerX = rect.width / 2
  const centerY = rect.height / 2
  targetParallaxX = (touchX - centerX) / centerX
  targetParallaxY = (touchY - centerY) / centerY
}

function handleTouchEnd() {
  handleMouseLeave()
}

// ─── Setup & Resize ──────────────────────────────────────────────────

function initParticles(w, h) {
  // Density: ~1 particle per 9,000 px^2 (around 60 - 85 particles for Hero)
  const count = Math.min(Math.max(Math.floor((w * h) / 9000), 60), 85)
  particles = []
  for (let i = 0; i < count; i++) {
    particles.push(new ParallaxParticle(w, h))
  }
}

function updateSize() {
  if (!containerRef.value || !canvasRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  width = rect.width
  height = rect.height

  if (width === 0 || height === 0) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const canvas = canvasRef.value
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)

  if (particles.length === 0) {
    initParticles(width, height)
  }
}

// ─── Animation Loop ──────────────────────────────────────────────────

function animate() {
  if (canvasRef.value && width > 0 && height > 0) {
    const ctx = canvasRef.value.getContext('2d')
    ctx.clearRect(0, 0, width, height)

    // Smooth lerp damping for parallax (soft gliding transition)
    currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05
    currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.update(width, height, currentParallaxX, currentParallaxY, mouseLocalX, mouseLocalY, isMouseInside)
      p.draw(ctx)
    }
  }

  animationFrameId = requestAnimationFrame(animate)
}

let heroElement = null
let resizeObserver = null

onMounted(() => {
  heroElement = containerRef.value?.closest('section') || containerRef.value
  if (heroElement) {
    heroElement.addEventListener('mousemove', handleMouseMove)
    heroElement.addEventListener('mouseleave', handleMouseLeave)
    heroElement.addEventListener('touchmove', handleTouchMove, { passive: true })
    heroElement.addEventListener('touchend', handleTouchEnd, { passive: true })
  }

  updateSize()

  if (containerRef.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      updateSize()
    })
    resizeObserver.observe(containerRef.value)
  }

  window.addEventListener('resize', updateSize, { passive: true })
  animationFrameId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (heroElement) {
    heroElement.removeEventListener('mousemove', handleMouseMove)
    heroElement.removeEventListener('mouseleave', handleMouseLeave)
    heroElement.removeEventListener('touchmove', handleTouchMove)
    heroElement.removeEventListener('touchend', handleTouchEnd)
  }
  if (resizeObserver && containerRef.value) {
    resizeObserver.unobserve(containerRef.value)
  }
  window.removeEventListener('resize', updateSize)
  particles = []
})
</script>

<template>
  <div
    ref="containerRef"
    class="hero-parallax-container"
  >
    <canvas
      ref="canvasRef"
      class="hero-parallax-canvas"
      aria-hidden="true"
    ></canvas>
  </div>
</template>

<style scoped>
.hero-parallax-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none !important;
  z-index: 1;
}

.hero-parallax-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none !important;
  mix-blend-mode: screen;
}
</style>
