import * as crypto from 'crypto';
import { MidtransService } from './midtrans.service';

describe('MidtransService.verifySignature', () => {
  let service: MidtransService;
  const TEST_SERVER_KEY = 'test-server-key-for-unit-tests';

  beforeEach(() => {
    process.env.MIDTRANS_SERVER_KEY = TEST_SERVER_KEY;
    service = new MidtransService();
  });

  afterEach(() => {
    delete process.env.MIDTRANS_SERVER_KEY;
  });

  it('accepts a correctly computed signature', () => {
    const orderId = 'LRS-20260620-1234';
    const statusCode = '200';
    const grossAmount = '150000.00';

    const expected = crypto
      .createHash('sha512')
      .update(orderId + statusCode + grossAmount + TEST_SERVER_KEY)
      .digest('hex');

    expect(service.verifySignature(orderId, statusCode, grossAmount, expected)).toBe(true);
  });

  it('rejects a tampered signature', () => {
    expect(
      service.verifySignature('LRS-20260620-1234', '200', '150000.00', 'not-the-real-hash'),
    ).toBe(false);
  });

  it('rejects an empty signature', () => {
    expect(service.verifySignature('LRS-20260620-1234', '200', '150000.00', '')).toBe(false);
  });

  it('is sensitive to grossAmount differences', () => {
    const orderId = 'LRS-20260620-1234';
    const statusCode = '200';

    const hashForOriginal = crypto
      .createHash('sha512')
      .update(orderId + statusCode + '150000.00' + TEST_SERVER_KEY)
      .digest('hex');

    // Same hash but different grossAmount on verify call — must reject
    expect(service.verifySignature(orderId, statusCode, '999999.00', hashForOriginal)).toBe(false);
  });
});
