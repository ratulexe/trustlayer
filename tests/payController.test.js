const { test, describe } = require('node:test');
const assert = require('node:assert');
const { buildUpiUri, handlePay, parseUpiQr } = require('../src/controllers/payController');

describe('TrustLayer UPI Intent URI & Pay Rail Compliance', () => {

  test('P2P personal VPA: omits tr and mc parameters to avoid bank limit rejections', () => {
    const uri = buildUpiUri({
      upiId: 'theratulkole@okhdfcbank',
      payeeName: 'Ratul Kole',
      amount: 150.00,
      note: 'Dinner share',
      isMerchant: false
    });

    assert.ok(uri.startsWith('upi://pay?'), 'URI must begin with upi://pay?');
    assert.ok(uri.includes('pa=theratulkole%40okhdfcbank'), 'Must include properly encoded payee address');
    assert.ok(uri.includes('pn=Ratul%20Kole'), 'Must use %20 instead of + for spaces');
    assert.ok(uri.includes('am=150.00'), 'Must include 2-decimal formatted amount');
    assert.ok(uri.includes('cu=INR'), 'Must include INR currency');
    assert.ok(uri.includes('tn=Dinner%20share'), 'Must include encoded note');
    assert.strictEqual(uri.includes('tr='), false, 'P2P payments MUST NOT contain tr parameter');
    assert.strictEqual(uri.includes('mc='), false, 'P2P payments MUST NOT contain mc parameter');
  });

  test('Verified Merchant: includes alphanumeric tr and mc without underscores', () => {
    const uri = buildUpiUri({
      upiId: 'ramu.tea@upi',
      payeeName: 'Ramu Tea Stall',
      amount: 45.00,
      note: 'Tea & Snacks',
      txnRef: 'TL_1731583800000_A1B2',
      merchantCode: '5499',
      isMerchant: true
    });

    assert.ok(uri.includes('pa=ramu.tea%40upi'));
    assert.ok(uri.includes('mc=5499'), 'Merchant payments must include mc');
    assert.ok(uri.includes('tr='), 'Merchant payments must include tr');
    assert.ok(!uri.includes('_'), 'NPCI mandate: tr must NOT contain underscores or special chars');
    assert.match(uri, /tr=[A-Za-z0-9]{1,35}/, 'tr must be strictly alphanumeric up to 35 chars');
  });

  test('Zero or invalid amount is omitted so payer can specify amount in UPI app', () => {
    const uri = buildUpiUri({
      upiId: 'grocer@okaxis',
      payeeName: 'Sharma Groceries',
      amount: 0,
      note: 'Grocery bill'
    });

    assert.strictEqual(uri.includes('am='), false, 'Zero amount should not be appended');
    assert.ok(uri.includes('pa=grocer%40okaxis'));
  });

  test('parseUpiQr correctly extracts parameters from raw UPI intent', () => {
    const raw = 'upi://pay?pa=theratulkole@okhdfcbank&pn=Ratul%20Kole&am=50.00&cu=INR&tn=Test';
    const parsed = parseUpiQr(raw);

    assert.strictEqual(parsed.upiId, 'theratulkole@okhdfcbank');
    assert.strictEqual(parsed.payeeName, 'Ratul Kole');
    assert.strictEqual(parsed.amount, 50.00);
    assert.strictEqual(parsed.currency, 'INR');
    assert.strictEqual(parsed.note, 'Test');
  });

  test('handlePay rejects known mule VPAs with 403 PAYMENT_BLOCKED', () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = {
      body: {
        upiId: 'kyc-update99@okaxis',
        payeeName: 'Fake Desk',
        amount: 500
      }
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      }
    };

    handlePay(req, res);

    assert.strictEqual(statusCode, 403);
    assert.strictEqual(jsonResponse.error, 'PAYMENT_BLOCKED');
    assert.strictEqual(jsonResponse.verdict, 'SCAM');
  });

  test('handlePay generates P2P deep link without tr for unverified personal VPA', () => {
    let jsonResponse = null;

    const req = {
      body: {
        upiId: 'theratulkole@okhdfcbank',
        payeeName: 'Ratul Kole',
        amount: 200,
        note: 'Personal test'
      }
    };
    const res = {
      status() { return this; },
      json(data) {
        jsonResponse = data;
        return this;
      }
    };

    handlePay(req, res);

    assert.strictEqual(jsonResponse.success, true);
    assert.strictEqual(jsonResponse.isMerchant, false);
    assert.ok(jsonResponse.upiDeepLink.includes('pa=theratulkole%40okhdfcbank'));
    assert.strictEqual(jsonResponse.upiDeepLink.includes('tr='), false, 'Personal VPA deep link must not contain tr');
  });

  test('handlePay generates merchant deep link with mc and clean tr for verified merchant', () => {
    let jsonResponse = null;

    const req = {
      body: {
        upiId: 'ramu.tea@upi',
        payeeName: 'Ramu Tea & Snacks',
        amount: 45,
        note: 'Tea'
      }
    };
    const res = {
      status() { return this; },
      json(data) {
        jsonResponse = data;
        return this;
      }
    };

    handlePay(req, res);

    assert.strictEqual(jsonResponse.success, true);
    assert.strictEqual(jsonResponse.isMerchant, true);
    assert.ok(jsonResponse.upiDeepLink.includes('pa=ramu.tea%40upi'));
    assert.ok(jsonResponse.upiDeepLink.includes('tr='), 'Verified merchant deep link must contain tr');
    assert.ok(!jsonResponse.upiDeepLink.includes('_'), 'tr must not contain underscores');
  });

});
