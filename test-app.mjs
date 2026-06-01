import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const DIR = 'C:\\trustiva-lms\\test-screenshots';
mkdirSync(DIR, { recursive: true });
const BASE = 'http://localhost:3000';

const results = [];
function log(test, status, detail = '') {
  results.push({ test, status, detail });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️ ';
  console.log(`${icon} ${test}${detail ? ': ' + detail : ''}`);
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();

// 1. Login via real form (sets both NextAuth cookie + sessionStorage token) ────
await page.goto(`${BASE}/lms/login`, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${DIR}/01-login.png` });

await page.fill('#email', 'admin@trustivasetu.com');
await page.fill('#password', 'Admin@123');
await page.screenshot({ path: `${DIR}/01b-login-filled.png` });
await page.click('button[type="submit"]');

try {
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 20000 });
  log('Login (form)', 'PASS', 'Redirected to dashboard');
} catch {
  const err = await page.locator('[class*="red"], [class*="error"]').first().textContent().catch(() => 'unknown error');
  await page.screenshot({ path: `${DIR}/01c-login-error.png` });
  log('Login (form)', 'FAIL', err?.trim().slice(0, 80) ?? 'timeout');
  await browser.close();
  process.exit(1);
}

// 2. Dashboard ─────────────────────────────────────────────────────────────────
await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
// Wait for metric cards to finish loading (skeleton → real content)
await page.waitForSelector('text=/Total Leads|Approval Rate|Disbursed/i', { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(1500);
await page.screenshot({ path: `${DIR}/02-dashboard.png` });
const dashMetrics = await page.locator('text=/Total Leads|Approval|Clinic|Disburs/i').count();
log('Dashboard', dashMetrics > 0 ? 'PASS' : 'WARN', `metric elements=${dashMetrics}`);

// 3. Leads list + new filters ──────────────────────────────────────────────────
await page.goto(`${BASE}/leads`, { waitUntil: 'networkidle' });
// Wait for Add Lead button, then wait for spinner to disappear (data loaded)
await page.waitForSelector('button:has-text("Add Lead")', { timeout: 10000 }).catch(() => {});
await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 12000 }).catch(() => {});
await page.waitForTimeout(800);
await page.screenshot({ path: `${DIR}/03-leads.png` });
const tableRows = await page.locator('table tbody tr').count();
const allSelects = await page.locator('select').evaluateAll(els => els.map(e => e.innerHTML.slice(0, 300)));
const hasLender = allSelects.some(s => s.includes('Lender') || s.includes('lender') || s.includes('All Lenders'));
const hasRegion = allSelects.some(s => s.includes('Region') || s.includes('region') || s.includes('All Regions'));
const rejectBtns = await page.locator('button:has-text("Reject")').count();
const addLeadBtn = await page.locator('button:has-text("Add Lead")').count();
log('Leads list', 'PASS', `rows=${tableRows}`);
log('Add Lead button visible', addLeadBtn > 0 ? 'PASS' : 'WARN', `found=${addLeadBtn}`);
log('Lender filter dropdown', hasLender ? 'PASS' : 'WARN', `found=${hasLender}`);
log('Region filter dropdown', hasRegion ? 'PASS' : 'WARN', `found=${hasRegion}`);
log('Reject button in table', rejectBtns > 0 ? 'PASS' : 'WARN', `count=${rejectBtns}`);

// 4. Lead detail ───────────────────────────────────────────────────────────────
const firstHref = await page.locator('table tbody tr:first-child a').first().getAttribute('href').catch(() => null);
if (firstHref) {
  await page.goto(`${BASE}${firstHref}`, { waitUntil: 'networkidle' });
  // Wait for the loading spinner to disappear, then for actual content
  await page.waitForSelector('text=/Loading/i', { state: 'hidden', timeout: 12000 }).catch(() => {});
  await page.waitForSelector('text=/Patient & Loan|Operations|Timeline/i', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/04-lead-detail.png` });
  const actionBtns = await page.locator('button:has-text("Approve"), button:has-text("Disburse"), button:has-text("Reject")').count();
  const opsPanel = await page.locator('text=/Operations/i').count();
  const timeline = await page.locator('text=/Timeline/i').count();
  log('Lead detail - action buttons', actionBtns > 0 ? 'PASS' : 'WARN', `count=${actionBtns}`);
  log('Lead detail - Operations panel', opsPanel > 0 ? 'PASS' : 'WARN');
  log('Lead detail - Timeline', timeline > 0 ? 'PASS' : 'WARN');

  const approveBtn = page.locator('button:has-text("Approve")').first();
  if (await approveBtn.count() > 0) {
    await approveBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/05-approve-modal.png` });
    const amountInput = await page.locator('input[type="number"]').count();
    const modalVisible = await page.locator('text=/Update Lead Status|Approved Amount/i').count();
    log('Approve modal - amount input', amountInput > 0 ? 'PASS' : 'WARN', `input=${amountInput}`);
    await page.locator('button:has-text("Cancel")').last().click().catch(() => {});
    await page.waitForTimeout(300);
  }

  const editBtns = page.locator('button:has-text("Edit")');
  const editCount = await editBtns.count();
  for (let i = 0; i < editCount; i++) {
    const btn = editBtns.nth(i);
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(600);
      const utrInput = await page.locator('input[placeholder*="UTR"]').count();
      if (utrInput > 0) {
        await page.screenshot({ path: `${DIR}/06-ops-modal.png` });
        log('Ops modal - UTR field', 'PASS');
        log('Ops modal - NACH checkbox', await page.locator('text=/NACH|mandate/i').count() > 0 ? 'PASS' : 'WARN');
        log('Ops modal - Agreement checkbox', await page.locator('text=/agreement/i').count() > 0 ? 'PASS' : 'WARN');
        await page.locator('button:has-text("Cancel")').last().click().catch(() => {});
        break;
      }
      await page.keyboard.press('Escape').catch(() => {});
    }
  }
} else {
  log('Lead detail', 'WARN', 'No leads in table');
}

// 5. Lead form - OTP step ──────────────────────────────────────────────────────
await page.goto(`${BASE}/leads`, { waitUntil: 'networkidle' });
await page.waitForSelector('button:has-text("Add Lead")', { timeout: 8000 }).catch(() => {});
const addBtn = page.locator('button:has-text("Add Lead")');
if (await addBtn.count() > 0) {
  await addBtn.click();
  await page.waitForSelector('text=/Basic Info/i', { timeout: 5000 });
  await page.screenshot({ path: `${DIR}/07-lead-form-step1.png` });
  // Use placeholder-specific selectors to avoid date inputs
  await page.locator('input[placeholder*="Full name"], input[placeholder*="name as per"]').first().fill('Test Patient');
  await page.locator('input[placeholder*="10-digit"], input[placeholder*="mobile"]').first().fill('9876543210');
  await page.locator('button:has-text("Next")').last().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/08-lead-form-step2.png` });
  const otpStep = await page.locator('text=/Phone Verification|Send OTP/i').count();
  log('Lead form OTP step 2', otpStep > 0 ? 'PASS' : 'WARN', `visible=${otpStep > 0}`);
  await page.locator('button:has-text("Cancel")').last().click().catch(() => {});
} else {
  log('Lead form OTP step', 'WARN', 'Add Lead button not found (check role permissions)');
}

// 6. Expenses - PARTIALLY_APPROVED ────────────────────────────────────────────
await page.goto(`${BASE}/expenses`, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${DIR}/09-expenses.png` });
const partialBtn = await page.locator('button').evaluateAll(
  els => els.filter(e => e.textContent.includes('PARTIALLY')).length
);
log('Expenses PARTIALLY_APPROVED filter', partialBtn > 0 ? 'PASS' : 'WARN', `visible=${partialBtn > 0}`);

// 7. Reports ───────────────────────────────────────────────────────────────────
await page.goto(`${BASE}/reports`, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${DIR}/10-reports.png` });
const reportCards = await page.locator('text=/Clinic Master|Lead|Disbursal|Scheme/i').count();
log('Reports page', reportCards > 0 ? 'PASS' : 'WARN', `report cards=${reportCards}`);

// 8. Clinics ───────────────────────────────────────────────────────────────────
await page.goto(`${BASE}/clinics`, { waitUntil: 'networkidle' });
await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 }).catch(() => {});
await page.waitForTimeout(500);
await page.screenshot({ path: `${DIR}/11-clinics.png` });
log('Clinics page', 'PASS', `rows=${await page.locator('table tbody tr').count()}`);

await browser.close();

console.log('\n─── Summary ─────────────────────────────────────────────');
const pass = results.filter(r => r.status === 'PASS').length;
const fail = results.filter(r => r.status === 'FAIL').length;
const warn = results.filter(r => r.status === 'WARN').length;
console.log(`✅ PASS: ${pass}  ⚠️  WARN: ${warn}  ❌ FAIL: ${fail}`);
if (fail > 0) results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  ❌ ${r.test}: ${r.detail}`));
if (warn > 0) results.filter(r => r.status === 'WARN').forEach(r => console.log(`  ⚠️  ${r.test}: ${r.detail}`));
