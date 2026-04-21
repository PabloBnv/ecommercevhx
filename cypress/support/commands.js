// ***********************************************
// Custom commands for Ecommerce Template E2E tests
// ***********************************************

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/api/auth/login`,
    body: { email, password },
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token)
    window.localStorage.setItem('user', JSON.stringify(response.body))
  })
})

// Register command
Cypress.Commands.add('register', (userData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/api/auth/register`,
    body: userData,
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token)
    window.localStorage.setItem('user', JSON.stringify(response.body))
  })
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Add product to cart via UI
Cypress.Commands.add('addToCartByUI', (productName) => {
  cy.contains('.product-card, [class*="ProductCard"]', productName)
    .find('button:contains("Agregar")')
    .click()
})

// Set cart in localStorage
Cypress.Commands.add('setCart', (items) => {
  window.localStorage.setItem('sabores_cart', JSON.stringify(items))
})

// Get cart from localStorage
Cypress.Commands.add('getCart', () => {
  return cy.window().then(() => {
    return JSON.parse(window.localStorage.getItem('sabores_cart') || '[]')
  })
})

// Clear cart
Cypress.Commands.add('clearCart', () => {
  window.localStorage.removeItem('sabores_cart')
})

// Wait for loading to finish
Cypress.Commands.add('waitForLoading', () => {
  cy.get('.animate-spin').should('not.exist')
})

// Check if user is logged in
Cypress.Commands.add('isLoggedIn', () => {
  return cy.window().then(() => {
    return !!window.localStorage.getItem('token')
  })
})

// Intercept API calls
Cypress.Commands.add('interceptAPI', () => {
  const API_URL = Cypress.env('API_URL')
  
  cy.intercept('GET', `${API_URL}/api/products/**`).as('getProducts')
  cy.intercept('POST', `${API_URL}/api/auth/login`).as('loginRequest')
  cy.intercept('POST', `${API_URL}/api/auth/register`).as('registerRequest')
  cy.intercept('POST', `${API_URL}/api/orders`).as('createOrder')
})

// Data test ID selector
Cypress.Commands.add('getByTestId', (testId) => {
  return cy.get(`[data-testid="${testId}"]`)
})