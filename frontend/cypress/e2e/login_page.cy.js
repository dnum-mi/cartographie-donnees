import defaultAdmin from '../fixtures/default_admin.json'
import {adminPageShouldLoadWithSuccess} from "./admin/admin_page.cy";

describe('The login page', () => {
  it('fails without a password', () => {
    cy.visit('/login');
    cy.get('input[data-test=email]').type(defaultAdmin.email)
    cy.get('button[data-test="login-btn"]').click()
    cy.get('form[data-test="login-form"]').contains("Merci de renseigner votre mot de passe")
  });

  it('fails without an email', () => {
    cy.visit('/login');
    cy.get('input[data-test=password]').type(defaultAdmin.password)
    cy.get('button[data-test="login-btn"]').click()
    cy.get('form[data-test="login-form"]').contains("Merci de renseigner l'email de l'administrateur")
  });

  it('successfully logs in after form submission with enter', () => {
    cy.visit('/login');
    cy.get('input[data-test=email]').type(defaultAdmin.email)
    cy.get('input[data-test=password]').type(`${defaultAdmin.password}{enter}`)
    adminPageShouldLoadWithSuccess();
  });

  it('successfully logs in after form submission with button click', () => {
    cy.visit('/login');
    cy.get('input[data-test=email]').type(defaultAdmin.email)
    cy.get('input[data-test=password]').type(defaultAdmin.password)
    cy.get('button[data-test="login-btn"]').click()
    adminPageShouldLoadWithSuccess();
  });
});
