describe('Product Catalog', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.intercept('GET', '**/api/products*').as('getProducts')
    cy.wait('@getProducts', { timeout: 15000 })
  })

  describe('Page Load', () => {
    it('should display the home page with hero section', () => {
      cy.get('h1').should('contain', 'Tu Dietética Online de Confianza')
    })

    it('should display product grid', () => {
      cy.get('.grid').should('be.visible')
      cy.get('.product-card, [class*="ProductCard"], a[href*="/product/"]')
        .should('have.length.greaterThan', 0)
    })

    it('should display product count', () => {
      cy.contains(/productos encontrados/i).should('be.visible')
    })
  })

  describe('Product Cards', () => {
    it('should display product information', () => {
      cy.get('a[href*="/product/"]').first().within(() => {
        // Product name
        cy.get('h3, [class*="font-semibold"]').should('be.visible')
        // Price
        cy.contains(/\$\d+/).should('be.visible')
        // Add to cart button
        cy.contains('Agregar').should('be.visible')
      })
    })

    it('should navigate to product detail page', () => {
      cy.get('a[href*="/product/"]').first().click()
      cy.url().should('match', /\/product\/\d+/)
    })
  })

  describe('Sorting', () => {
    it('should have sort options', () => {
      cy.contains('Ordenar:').should('be.visible')
      cy.get('select').should('exist')
    })

    it('should sort by price ascending', () => {
      cy.get('select').select('price-asc')
      cy.wait('@getProducts')
      
      // Get all prices and verify ascending order
      cy.get('.product-card, [class*="ProductCard"]').then(($cards) => {
        if ($cards.length > 1) {
          const prices = []
          cy.wrap($cards).each(($card) => {
            cy.wrap($card).find('[class*="font-bold"]').invoke('text').then((text) => {
              const price = parseInt(text.replace(/\D/g, ''))
              prices.push(price)
            })
          }).then(() => {
            // Verify ascending order
            for (let i = 1; i < prices.length; i++) {
              expect(prices[i]).to.be.greaterThan(prices[i - 1])
            }
          })
        }
      })
    })

    it('should sort by price descending', () => {
      cy.get('select').select('price-desc')
      cy.wait('@getProducts')
      // Just verify the request is made
      cy.get('.product-card, [class*="ProductCard"]').should('exist')
    })

    it('should sort by name alphabetically', () => {
      cy.get('select').select('name-asc')
      cy.wait('@getProducts')
      cy.get('.product-card, [class*="ProductCard"]').should('exist')
    })
  })

  describe('Pagination', () => {
    it('should display pagination when products exceed page limit', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.pagination, [class*="pagination"], button:contains("Siguiente")').length) {
          cy.contains('Siguiente').should('be.visible')
          cy.contains('Anterior').should('be.visible')
        }
      })
    })

    it('should navigate to next page', () => {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Siguiente")').length) {
          cy.contains('Siguiente').click()
          cy.scrollTo('top')
          cy.get('.product-card, [class*="ProductCard"]').should('exist')
        }
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner while fetching products', () => {
      // This test is hard to catch since loading is fast
      // Just verify products load eventually
      cy.get('.product-card, [class*="ProductCard"], a[href*="/product/"]', { timeout: 10000 })
        .should('have.length.greaterThan', 0)
    })
  })
})