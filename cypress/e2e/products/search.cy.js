describe('Product Search', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.intercept('GET', '**/api/products*').as('getProducts')
    cy.wait('@getProducts', { timeout: 15000 })
  })

  describe('Search Input', () => {
    it('should display search input in filter sidebar', () => {
      cy.get('input[placeholder*="Nombre o descripción"]').should('be.visible')
    })

    it('should filter products by name', () => {
      cy.get('input[placeholder*="Nombre o descripción"]').type('quinoa')
      
      // Wait for filter to apply
      cy.wait(500)
      
      // Either products are filtered or "no results" message
      cy.get('body').then(($body) => {
        if ($body.find('.product-card, [class*="ProductCard"]').length > 0) {
          cy.get('.product-card, [class*="ProductCard"]').each(($card) => {
            cy.wrap($card).invoke('text').then((text) => {
              expect(text.toLowerCase()).to.contain('quinoa')
            })
          })
        } else {
          cy.contains(/no se encontraron productos/i).should('be.visible')
        }
      })
    })

    it('should clear search with X button', () => {
      cy.get('input[placeholder*="Nombre o descripción"]').type('quinoa')
      cy.wait(500)
      
      // Click clear button
      cy.get('input[placeholder*="Nombre o descripción"]').parent().find('button').click()
      
      // Input should be empty
      cy.get('input[placeholder*="Nombre o descripción"]').should('have.value', '')
    })

    it('should show no results for invalid search', () => {
      cy.get('input[placeholder*="Nombre o descripción"]').type('xyznonexistentproduct123')
      cy.wait(500)
      
      cy.contains(/no se encontraron productos/i, { timeout: 5000 }).should('be.visible')
    })
  })

  describe('Category Filter', () => {
    it('should display category dropdown', () => {
      cy.get('select').should('exist')
      cy.get('label').contains('Categoría').should('be.visible')
    })

    it('should filter by category', () => {
      cy.get('select').first().then(($select) => {
        const options = $select.find('option')
        if (options.length > 1) {
          // Select second option (not "Todas las categorías")
          cy.wrap($select).select(options.eq(1).val())
          cy.wait('@getProducts')
          cy.get('.product-card, [class*="ProductCard"]').should('exist')
        }
      })
    })

    it('should reset to all categories', () => {
      cy.get('select').first().then(($select) => {
        if ($select.find('option').length > 1) {
          // First select a category
          cy.wrap($select).select($select.find('option').eq(1).val())
          cy.wait(500)
          
          // Then reset to all
          cy.wrap($select).select('all')
          cy.wait('@getProducts')
        }
      })
    })
  })

  describe('Price Range Filter', () => {
    it('should display price range inputs', () => {
      cy.get('input[type="number"]').should('have.length.at.least', 2)
      cy.contains('Rango de precio').should('be.visible')
    })

    it('should filter by price range', () => {
      cy.get('input[type="number"]').first().clear().type('1000')
      cy.get('input[type="number"]').last().clear().type('3000')
      cy.wait(500)
      
      // Products should be within range
      cy.get('.product-card, [class*="ProductCard"]').each(($card) => {
        cy.wrap($card).contains(/\$\d+/).invoke('text').then((text) => {
          const price = parseInt(text.replace(/\D/g, ''))
          expect(price).to.be.gte(1000)
          expect(price).to.be.lte(3000)
        })
      })
    })

    it('should have quick price presets', () => {
      cy.contains('Hasta $1,000').should('be.visible')
      cy.contains('$1k-$3k').should('be.visible')
      cy.contains('$3k-$5k').should('be.visible')
    })

    it('should apply quick price preset', () => {
      cy.contains('Hasta $1,000').click()
      cy.wait(500)
      
      // Price inputs should be updated
      cy.get('input[type="number"]').first().should('have.value', '0')
      cy.get('input[type="number"]').last().should('have.value', '1000')
    })
  })

  describe('Clear Filters', () => {
    it('should clear all filters when clicking clear button', () => {
      // Apply some filters
      cy.get('input[placeholder*="Nombre o descripción"]').type('test')
      cy.get('input[type="number"]').first().clear().type('100')
      
      // Click clear filters
      cy.contains('Limpiar filtros').click()
      
      // All filters should be cleared
      cy.get('input[placeholder*="Nombre o descripción"]').should('have.value', '')
      cy.get('input[type="number"]').first().should('have.value', '0')
    })

    it('should show clear filters button only when filters are active', () => {
      // Initially no clear button (or disabled)
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Limpiar filtros")').length === 0) {
          // Apply a filter
          cy.get('input[placeholder*="Nombre o descripción"]').type('test')
          cy.wait(500)
          
          // Now clear button should appear
          cy.contains('Limpiar filtros').should('be.visible')
        }
      })
    })
  })
})