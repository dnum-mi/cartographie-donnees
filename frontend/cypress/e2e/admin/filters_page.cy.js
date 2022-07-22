describe('The filters admin page', () => {
  it('loads successfully', () => {
    cy.loginWithDefaultAdmin();
    cy.visit('/admin/enumerations');
    cy.get('.page-content').contains('Liste des filtres');
  });
});
