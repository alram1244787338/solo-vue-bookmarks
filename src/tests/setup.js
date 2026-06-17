import { config } from '@vue/test-utils'

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const localStorageMock = (function () {
  let store = {}
  return {
    getItem: function (key) {
      return store[key] || null
    },
    setItem: function (key, value) {
      store[key] = value.toString()
    },
    clear: function () {
      store = {}
    },
    removeItem: function (key) {
      delete store[key]
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

beforeEach(() => {
  window.localStorage.clear()
})
