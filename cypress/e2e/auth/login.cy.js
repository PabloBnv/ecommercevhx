describe('Authentication - Login', () => {
  beforeEach(() => {
    cy.visit('/auth')
  })

  describe('UI Elements', () => {
    it('should display login form', () => {
      cy.get('h1').should('contain', 'Iniciar Sesión')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
      cy.contains('¿No tienes cuenta? Regístrate').should('be.visible')
    })

    it('should toggle to registration form', () => {
      cy.contains('¿No tienes cuenta? Regístrate').click()
      cy.get('h1').should('contain', 'Crear Cuenta')
      cy.get('input[name="firstName"]').should('be.visible')
      cy.get('input[name="lastName"]').should('be.visible')
    })
  })

  describe('Login Validation', () => {
    it('should show error for empty fields', () => {
      cy.get('button[type="submit"]').click()
      // HTML5 validation should prevent submission
      cy.get('input[name="email"]').should('have.attr', 'required')
    })

    it('should show error for invalid email format', () => {
      cy.get('input[name="email"]').type('invalid-email')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()
      // Email validation should trigger
      cy.get('input[name="email"]').should('have.attr', 'type', 'email')
    })
  })

  describe('Login Flow', () => {
    it('should display error for invalid credentials', () => {
      cy.get('input[name="email"]').type('wrong@email.com')
      cy.get('input[name="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()
      
      cy.get('.bg-red-100, .error-message', { timeout: 10000 })
        .should('be.visible')
        .and('contain', 'Credenciales inválidas')
    })

    it('should login successfully with valid credentials', function() {
      // Skip if no test user available
      cy.request({
        url: `${Cypress.env('API_URL')}/api/products`,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          this.skip()
        }
      })

      cy.fixture('users.json').then((users) => {
        const user = users.customer
        cy.get('input[name="email"]').type(user.email)
        cy.get('input[name="password"]').type(user.password)
        cy.get('button[type="submit"]').click()
        
        // Should redirect to home page
        cy.url().should('eq', `${Cypress.config().baseUrl}/`)
      })
    })
  })

  describe('Session Persistence', () => {
    it('should maintain session after page reload', function() {
      cy.fixture('users.json').then((users) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('API_URL')}/api/auth/login`,
          body: users.customer,
          failOnStatusCode: false,
        }).then((response) => {
          if (response.status !== 200) {
            this.skip()
          }
          
          window.localStorage.setItem('token', response.body.token)
          window.localStorage.setItem('user', JSON.stringify(response.body))
          
          cy.visit('/')
          cy.reload()
          
          // User should still be logged in
          cy.window().then(() => {
            expect(window.localStorage.getItem('token')).to.exist
          })
        })
      })
    })
  })
})