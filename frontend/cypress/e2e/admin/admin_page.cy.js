describe('The admin page', () => {
  it('returns 404 when not logged in', () => {
    cy.visit('/admin');
    cy.contains('Page introuvable');
  });

  it('successfully loads when logged in', () => {
    cy.loginWithDefaultAdmin();
    cy.visit('/admin');
    cy.get('.page-content').contains('Espace d\'administration');
  });
});
