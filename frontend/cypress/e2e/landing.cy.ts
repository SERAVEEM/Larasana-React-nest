describe('Larasana Landing Page E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the brand title', () => {
    // Verifies that the brand title is displayed on page load
    cy.get('h1').contains('LARASANA').should('be.visible');
  });

  it('can open and close the mobile hamburger navigation menu', () => {
    // Set mobile viewport width
    cy.viewport('iphone-6');

    // Open menu
    cy.get('#hamburger-trigger').should('be.visible').click();

    // Check navigation links inside overlay are visible
    cy.get('.hamburger-overlay').should('be.visible');
    cy.get('nav').contains('Story').should('be.visible');
    cy.get('nav').contains('Impact').should('be.visible');
    cy.get('nav').contains('About Us', { matchCase: false }).should('be.visible');

    // Close menu
    cy.get('#hamburger-close').should('be.visible').click();
    cy.get('.hamburger-overlay').should('not.have.class', 'hamburger-overlay--open');
  });
});
