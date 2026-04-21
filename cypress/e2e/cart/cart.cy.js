describe('Shopping Cart', () => {
  beforeEach(() => {
    cy.clearCart()
    cy.visit('/')
    cy.intercept('GET', '**/api/products*').as('getProducts')
    cy.wait('@getProducts', { timeout: 15000 })
  })

  describe('Add to Cart', () => {
    it('should add product to cart', () => {
      cy.get('a[href*="/product/"]').first().within(() => {
        cy.contains('Agregar').click()
      })
      
      // Cart count should update in navbar
      cy.get('.bg-red-500, [class*="cart-count"]').should('contain', '1')
    })

    it('should add multiple different products', () => {
      // Add first product
      cy.get('a[href*="/product/"]').first().within(() => {
        cy.contains('Agregar').click()
      })
      cy.wait(300)
      
      // Add second product
      cy.get('a[href*="/product/"]').eq(1).within(() => {
        cy.contains('Agregar').click()
      })
      
      // Cart count should be 2
      cy.get('.bg-red-500, [class*="cart-count"]').should('contain', '2')
    })

    it('should increment quantity when adding same product', () => {
      // Add first product twice
      cy.get('a[href*="/product/"]').first().within(() => {
        cy.contains('Agregar').click()
      })
      cy.wait(300)
      
      cy.get('a[href*="/product/"]').first().within(() => {
        cy.contains('Agregar').click()
      })
      
      // Cart count should be 2
      cy.get('.bg-red-500, [class*="cart-count"]').should('contain', '2')
      
      // Verify in localStorage
      cy.getCart().then((cart) => {
        expect(cart).to.have.length(1)
        expect(cart[0].quantity).to.equal(2)
      })
    })
  })

  describe('Cart Modal', () => {
    beforeEach(() => {
      // Add a product first
      cy.get('a[href*="/product/"]').first().within(() => {
        cy.contains('Agregar').click()
      })
      cy.wait(500)
    })

    it('should open cart modal when clicking cart button', () => {
      cy.get('button[aria-label*="carrito"], button:has(svg)').first().click()
      cy.get('.modal, [class*="modal"], [role="dialog"]').should('be.visible')
    })

    it('should display cart items in modal', () => {
      cy.get('button[aria-label*="carrito"], button:has(svg)').first().click()
      
      cy.get('.modal, [class*="modal"], [role="dialog"]').within(() => {
        cy.get('.product-card, [class*="CartProduct"], [class*="cart-item"]').should('have.length', 1)
      })
    })

    it('should display correct total', () => {
      cy.get('button[aria-label*="carrito"], button:has(svg)').first().click()
      
      // Get product price from cart
      cy.get('.modal, [class*="modal"], [role="dialog"]').within(() => {
        cy.get('[class*="font-bold"]').contains(/\$/).should('be.visible')
      })
    })

    it('should close modal when clicking X', () => {
      cy.get('button[aria-label*="carrito"], button:has(svg)').first().click()
      cy.get('.modal, [class*="modal"], [role="dialog"]').should('be.visible')
      
      // Close modal
      cy.get('button[aria-label*="close"], button:has(svg.lucide-x)').first().click()
      cy.get('.modal, [class*="modal"], [role="dialog"]').should('not.exist')
    })
  })

  describe('Cart Operations', () => {
    beforeEach(() => {
      // Add a product
      cy.get('a[href*="/product/"]').first().within(() => {
        cy.contains('Agregar').click()
      })
      cy.wait(500)
      cy.get('button[aria-label*="carrito"], button:has(svg)').first().click()
    })

    it('should increase quantity', () => {
      cy.get('.modal, [class*="modal"], [role="dialog"]').within(() => {
        cy.get('button').contains('+').first().click()
        cy.contains('2').should('be.visible')
      })
    })

    it('should decrease quantity', () => {
      // First increase
      cy.get('.modal, [class*="modal"], [role="dialog"]').within(() => {
        cy.get('button').contains('+').first().click()
        cy.wait(200)
        cy.get('button').contains('-').first().click()
        cy.contains('1').should('be.visible')
      })
    })

    it('should not decrease below 1', () => {
      cy.get('.modal, [class*="modal"], [role="dialog"]').within(() => {
        cy.get('button').contains('-').first().click()
        // Should still show 1
        cy.contains('1').should('be.visible')
      })
    })

    it('should remove item from cart', () => {
      cy.get('.modal, [class*="modal"], [role="dialog"]').within(() => {
        cy.get('button[aria-label*="eliminar"], button:has(svg.trash)').first().click()
        cy.contains(/carrito está vacío/i).should('be.visible')
      })
      
      // Cart count should be 0 or empty
      cy.getCart().then((cart) => {
        expect(cart).to.have.length(0)
      })
    })
  })

  describe('Empty Cart', () => {
    it('should show empty cart message', () => {
      cy.get('button[aria-label*="carrito"], button:has(svg)').first().click()
      cy.get('.modal, [class*="modal"], [role="dialog"]').within(() => {
        cy.contains(/carrito está vacío/i).should('be.visible')
      })
    })

    it('should show continue shopping button', () => {
      cy.get('button[aria-label*="carrito"], button:has(svg)').first().click()
      cy.get('.modal, [class*="modal"], [role="dialog"]').within(() => {
        cy.contains(/continuar comprando/i).should('be.visible')
      })
    })
  })

  describe('Cart Persistence', () => {
    it('should persist cart after page reload', () => {
      // Add product
      cy.get('a[href*="/product/"]').first().within(() => {
        cy.contains('Agregar').click()
      })
      
      // Reload page
      cy.reload()
      
      // Cart should still have the product
      cy.get('.bg-red-500, [class*="cart-count"]').should('contain', '1')
    })

    it('should persist cart after navigation', () => {
      // Add product
      cy.get('a[href*="/product/"]').first().within(() => {
        cy.contains('Agregar').click()
      })
      
      // Navigate to another page
      cy.get('a[href*="/product/"]').first().click()
      cy.go('back')
      
      // Cart should still have the product
      cy.get('.bg-red-500, [class*="cart-count"]').should('contain', '1')
    })
  })
})