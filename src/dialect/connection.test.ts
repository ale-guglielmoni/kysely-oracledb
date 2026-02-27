it('should properly stream rows from a query using an async iterator', async () => {
  const stream = connection.streamQuery('SELECT * FROM users');
  const results = [];

  for await (const row of stream) {
    results.push(row);
    expect(row).toHaveProperty('rows'); // Verify that each result is wrapped with the rows property
  }

  expect(results.length).toBeGreaterThan(0); // Ensure that we received rows
});