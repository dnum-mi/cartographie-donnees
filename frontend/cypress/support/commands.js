import defaultAdmin from '../fixtures/default_admin.json';

Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:5000/api/login',
    body: {
      email,
      password,
    },
  })
    .then((response) => {
      window.localStorage.setItem('ACCESS_TOKEN', response.body.token);
    })
})

Cypress.Commands.add('loginWithDefaultAdmin', () => {
  cy.login(defaultAdmin.email, defaultAdmin.password)
})
