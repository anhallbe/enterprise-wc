describe('Ids Process Indicator e2e Tests', () => {
  const exampleUrl = 'http://localhost:4444/ids-process-indicator';
  const emptyLabelExampleUrl = `${exampleUrl}/empty-label.html`;

  it('should not have errors', async () => {
    await page.goto(exampleUrl, { waitUntil: ['domcontentloaded', 'networkidle0'] });
    await expect(page.title()).resolves.toMatch('IDS Process Indicator Component');
    await page.goto(emptyLabelExampleUrl, { waitUntil: ['domcontentloaded', 'networkidle0'] });
  });

  it('should pass Axe accessibility tests', async () => {
    await page.setBypassCSP(true);
    await page.goto(exampleUrl, { waitUntil: ['networkidle2', 'load'] });
    await expect(page).toPassAxeTests({ disabledRules: ['color-contrast'] });
  });
});
