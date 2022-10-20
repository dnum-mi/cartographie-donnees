export function homePageShouldLoadWithSuccess(asAdmin = false) {
  cy.url().should('include', '/search')
  // cy.get('.page-content').contains('Bienvenue dans l’outil de cartographie des données du ministère de l’intérieur !')
  if (asAdmin) {
    cy.get('header').contains('button[data-test="nav-admin-btn"]', 'Administration')
  }
}

describe('The Home Page', () => {
  it('successfully loads', () => {
    cy.visit('/');
    homePageShouldLoadWithSuccess();
  });
});
