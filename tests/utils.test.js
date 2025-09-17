// Test unitaire d'une fonction utilitaire
function formatMessage(pseudo, contenu) {
  return `[${pseudo}] ${contenu}`;
}

describe('formatMessage', () => {
  it('formate correctement le message', () => {
    expect(formatMessage('Alice', 'Hello')).toBe('[Alice] Hello');
  });
});
