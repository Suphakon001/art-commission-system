// src/stores/cart.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const FEE_RATE = 0.05

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('cart') || '[]'))

  const subtotal    = computed(() => items.value.reduce((s, i) => s + parseFloat(i.price), 0))
  const serviceFee  = computed(() => parseFloat((subtotal.value * FEE_RATE).toFixed(2)))
  const shippingFee = computed(() => items.value.length > 0 ? 50.00 : 0)
  const totalAmount = computed(() => parseFloat((subtotal.value + serviceFee.value + shippingFee.value).toFixed(2)))
  const count       = computed(() => items.value.length)

  function persist() {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  function addItem(artwork) {
    if (artwork.status === 'sold_out') {
      alert('ขออภัย ผลงานนี้มีผู้สั่งซื้อไปแล้ว (สินค้าหมด)')
      return
    }
    if (items.value.find(i => i.artwork_id === artwork.artwork_id)) return
    items.value.push({
      artwork_id:    artwork.artwork_id,
      title:         artwork.title,
      price:         artwork.price,
      preview_image: artwork.preview_image,
      file_format:   artwork.file_format,
    })
    persist()
  }

  function removeItem(artwork_id) {
    items.value = items.value.filter(i => i.artwork_id !== artwork_id)
    persist()
  }

  function clearCart() {
    items.value = []
    localStorage.removeItem('cart')
  }

  function isInCart(artwork_id) {
    return items.value.some(i => i.artwork_id === artwork_id)
  }

  return { items, subtotal, serviceFee, shippingFee, totalAmount, count, addItem, removeItem, clearCart, isInCart }
})

