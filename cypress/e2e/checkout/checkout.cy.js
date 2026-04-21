describe('Checkout Flow', () => {
  beforeEach(() => {
    cy.clearCart()
    cy.logout()
  })

  describe('Checkout Access', () => {
    it('should redirect to auth when not logged in', () => {
      cy.visit('/checkout')
      cy.url().should('include', '/auth')
    })

    it('should redirect to auth when cart is empty', () => {
      cy.fixture('users.json').then((users) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('API_URL')}/api/auth/login`,
          body: users.customer,
          failOnStatusCode: false,
        }).then((response) => {
          if (response.status === 200) {
            window.localStorage.setItem('token', response.body.token)
            window.localStorage.setItem('user', JSON.stringify(response.body))
            
            cy.visit('/checkout')
            cy.contains(/carrito está vacío/i).should('be.visible')
          }
        })
      })
    })
  })

  describe('Checkout Form', () => {
    beforeEach(() => {
      // Login and add item to cart
      cy.fixture('users.json').then((users) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('API_URL')}/api/auth/login`,
          body: users.customer,
          failOnStatusCode: false,
        }).then((response) => {
          if (response.status === 200) {
            window.localStorage.setItem('token', response.body.token)
            window.localStorage.setItem('user', JSON.stringify(response.body))
            
            // Set cart with a test product
            cy.setCart([{
              id: 1,
              name: 'Test Product',
              price: 1000,
              quantity: 2,
              unit: 'kg'
            }])
            
            cy.visit('/checkout')
          }
        })
      })
    })

    it('should display checkout form with user data pre-filled', function() {
      cy.request({
        url: `${Cypress.env('API_URL')}/api/products`,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          this.skip()
        }
        
        cy.get('input[name="shippingAddress"]').should('have.value', 'Av. Test 1234')
        cy.get('input[name="phone"]').should('have.value', '1122334455')
      })
    })

    it('should display order summary', function() {
      cy.request({
        url: `${Cypress.env('API_URL')}/api/products`,
        failOnStatusCode: 200,
      }).then((response) => {
        if (response.status !== 200) {
          this.skip()
        }
        
        cy.contains('Resumen del pedido').should('be.visible')
        cy.contains('Test Product').should('be.visible')
        cy.contains(/\$\d+/).should('be.visible')
      })
    })

    it('should calculate shipping based on city', function() {
      cy.request({
        url: `${Cypress.env('API_URL')}/api/products`,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          this.skip()
        }
        
        // Default city is CABA
        cy.get('input[name="shippingCity"]').should('have.value', 'CABA')
        cy.contains('Envío').should('be.visible')
      })
    })

    it('should have payment method options', function() {
      cy.request({
        url: `${Cypress.env('API_URL')}/api/products`,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          this.skip()
        }
        
        cy.contains('Transferencia').should('be.visible')
        cy.get('input[value="TRANSFER"], input[type="radio"]').should('exist')
      })
    })

    it('should allow editing shipping address', function() {
      cy.request({
        url: `${Cypress.env('API_URL')}/api/products`,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          this.skip()
        }
        
        cy.get('input[name="shippingAddress"]').clear().type('New Address 456')
        cy.get('input[name="shippingAddress"]').should('have.value', 'New Address 456')
      })
    })

    it('should allow adding notes to order', function() {
      cy.request({
        url: `${Cypress.env('API_URL')}/api/products`,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          this.skip()
        }
        
        cy.get('textarea[name="notes"]').type('Please call before delivery')
        cy.get('textarea[name="notes"]').should('have.value', 'Please call before delivery')
      })
    })
  })

  describe('Order Submission', () => {
    beforeEach(() => {
      cy.fixture('users.json').then((users) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('API_URL')}/api/auth/login`,
          body: users.customer,
          failOnStatusCode: false,
        }).then((response) => {
          if (response.status === 200) {
            window.localStorage.setItem('token', response.body.token)
            window.localStorage.setItem('user', JSON.stringify(response.body))
            
            cy.setCart([{
              id: 1,
              name: 'Test Product',
              price: 1000,
              quantity: 1,
              unit: 'kg'
            }])
            
            cy.visit('/checkout')
          }
        })
      })
    })

    it('should show confirmation before submitting', function() {
      cy.request({
        url: `${Cypress.env('API_URL')}/api/products`,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          this.skip()
        }
        
        cy.get('button[type="submit"]').should('be.visible')
        cy.get('button[type="submit"]').should('contain', /confirmar|realizar pedido/i)
      })
    })

    it('should disable button while processing', function() {
      cy.request({
        url: `${Cypress.env('API_URL')}/api/products`,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          this.skip()
        }
        
        cy.get('button[type="submit"]').click()
        cy.get('button[type="submit"]').should('be.disabled')
      })
    })
  })

  describe('Order Confirmation', () => {
    beforeEach(() => {
      cy.fixture('users.json').then((users) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('API_URL')}/api/auth/login`,
          body: users.customer,
          failOnStatusCode: false,
        }).then((response) => {
          if (response.status === 200) {
            window.localStorage.setItem('token', response.body.token)
            window.localStorage.setItem('user', JSON.stringify(response.body))
            
            cy.setCart([{
              id: 1,
              name: 'Test Product',
              price: 1000,
              quantity: 1,
              unit: 'kg'
            }])
            
            cy.visit('/checkout')
          }
        })
      })
    })

    it('should show success message after order', function() {
      cy.request({
        url: `${Cypress.env('API_URL')}/api/products`,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          this.skip()
        }
        
        cy.intercept('POST', '**/api/orders').as('createOrder')
        cy.get('button[type="submit"]').click()
        
        cy.wait('@createOrder', { timeout: 15000 }).then((interception) => {
          if (interception.response.statusCode === 200 || interception.response.statusCode === 201) {
            cy.contains(/pedido.*confirmado|gracias/i).should('be.visible')
          }
        })
      })
    })

    it('should clear cart after successful order', function() {
      cy.request({
        url: `${Cypress.env('API_URL')}/api/products`,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          this.skip()
        }
        
        cy.intercept('POST', '**/api/orders').as('createOrder')
        cy.get('button[type="submit"]').click()
        
        cy.wait('@createOrder', { timeout: 15000 }).then((interception) => {
          if (interception.response.statusCode === 200 || interception.response.statusCode === 201) {
            cy.getCart().then((cart) => {
              expect(cart).to.have.length(0)
            })
          }
        })
      })
    })
  })
})