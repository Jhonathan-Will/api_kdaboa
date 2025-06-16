import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CsrfService {
  generateToken(payload: any): string {
    const nonce = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now();
    const baseData = JSON.stringify({ ...payload, nonce, timestamp });

    return Buffer.from(baseData).toString('base64')+'.' +  crypto.createHmac('sha256', process.env.SECRET || 'default_csrf_secret')
                                                                 .update(baseData)
                                                                 .digest('hex');
  }

  validateToken(token: string): boolean {
    const [encodedData, sentHmac] = token.split('.');
    const decodedData = Buffer.from(encodedData, 'base64').toString();
    const expectedHmac = crypto
        .createHmac('sha256', process.env.SECRET || 'default_csrf_secret')
        .update(decodedData)
        .digest('hex');

    if (sentHmac !== expectedHmac) return false;

    const parsed = JSON.parse(decodedData);
    const now = Date.now();
    const maxAgeMs = 12 * 60 * 1000;

    if (!parsed.timestamp || now - parsed.timestamp > maxAgeMs) {
        return false;
    }

    return true;
  }
}