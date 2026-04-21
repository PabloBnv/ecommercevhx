describe('Authentication - Register', () => {
  beforeEach(() => {
    cy.visit('/auth')
    cy.contains('¿No tienes cuenta? Regístrate').click()
  })

  describe('UI Elements', () => {
    it('should display registration form', () => {
      cy.get('h1').should('contain', 'Crear Cuenta')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('input[name="firstName"]').should('be.visible')
      cy.get('input[name="lastName"]').should('be.visible')
      cy.get('button[type="submit"]').should('contain', 'Registrarse')
    })

    it('should toggle back to login form', () => {
      cy.contains('¿Ya tienes cuenta? Inicia sesión').click()
      cy.get('h1').should('contain', 'Iniciar Sesión')
    })
  })

  describe('Registration Validation', () => {
    it('should require all mandatory fields', () => {
      cy.get('button[type="submit"]').click()
      
      cy.get('input[name="email"]').should('have.attr', 'required')
      cy.get('input[name="password"]').should('have.attr', 'required')
      cy.get('input[name="firstName"]').should('have.attr', 'required')
      cy.get('input[name="lastName"]').should('have.attr', 'required')
    })

    it('should enforce password minimum length', () => {
      cy.get('input[name="password"]').should('have.attr', 'minlength', '6')
    })

    it('should validate email format', () => {
      cy.get('input[name="email"]').type('not-an-email')
      cy.get('button[type="submit"]').click()
      cy.get('input[name="email"]').should('have.attr', 'type', 'email')
    })
  })

  describe('Registration Flow', () => {
    it('should show error for existing email', () => {
      cy.fixture('users.json').then((users) => {
        cy.get('input[name="email"]').type(users.customer.email)
        cy.get('input[name="password"]').type('TestPass123!')
        cy.get('input[name="firstName"]').type('Test')
        cy.get('input[name="lastName"]').type('User')
        cy.get('button[type="submit"]').click()
        
        cy.get('.bg-red-100, .error-message', { timeout: 10000 })
          .should('be.visible')
      })
    })

    it('should register new user successfully', function() {
      const uniqueEmail = `test${Date.now()}@test.com`
      
      cy.request({
        url: `${Cypress.env('API_URL')}/api/products`,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          this.skip()
        }
        
        cy.get('input[name="email"]').type(uniqueEmail)
        cy.get('input[name="password"]').type('TestPass123!')
        cy.get('input[name="firstName"]').type('New')
        cy.get('input[name="lastName"]').type('User')
        cy.get('button[type="submit"]').click()
        
        // Should redirect to home page after registration
        cy.url().should('eq', `${Cypress.config().baseUrl}/`)
        
        // Token should be stored
        cy.window().then(() => {
          expect(window.localStorage.getItem('token')).to.exist
        })
      })
    })
  })

  describe('Optional Fields', () => {
    it('should allow registration without optional fields', function() {
      const uniqueEmail = `test${Date.now()}@test.com`
      
      cy.request({
        url: `${Cypress.env('API_URL')}/api/products`,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          this.skip()
        }
        
        cy.get('input[name="email"]').type(uniqueEmail)
        cy.get('input[name="password"]').type('TestPass123!')
        cy.get('input[name="firstName"]').type('Minimal')
        cy.get('input[name="lastName"]').type('User')
        // Don't fill phone, address, city, postalCode
        cy.get('button[type="submit"]').click()
        
        cy.url().should('eq', `${Cypress.config().baseUrl}/`)
      })
    })
  })
})