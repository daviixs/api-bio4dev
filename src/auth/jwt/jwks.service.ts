import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { createPublicKey } from 'crypto';
import { join } from 'path';

export interface JWK {
  kid: string;
  kty: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

export interface JWKSResponse {
  keys: JWK[];
}

@Injectable()
export class JwksService implements OnModuleInit {
  private keys: JWK[] = [];

  async onModuleInit() {
    await this.loadKeys();
  }

  private async loadKeys(): Promise<void> {
    try {
      const publicKeyPath = process.env.JWT_PUBLIC_KEY || './keys/public.pem';
      const resolvedPath = publicKeyPath.startsWith('./')
        ? join(process.cwd(), publicKeyPath)
        : publicKeyPath;

      const publicKeyPem = await readFile(resolvedPath, 'utf-8');
      const keyObject = createPublicKey(publicKeyPem);

      // Export as JWK
      const jwk = keyObject.export({ format: 'jwk' });

      this.keys = [
        {
          kid: 'current',
          kty: 'RSA',
          use: 'sig',
          alg: 'RS256',
          n: jwk.n as string,
          e: jwk.e as string,
        },
      ];

      console.log('JWKS keys loaded successfully');
    } catch (error) {
      console.error('Error loading JWKS keys:', error);
      throw new Error('Failed to initialize JWKS service');
    }
  }

  getJwks(): JWKSResponse {
    return { keys: this.keys };
  }

  async rotateKeys(): Promise<void> {
    // In production, you would generate new keys and update the JWKS
    // For now, we just reload the existing keys
    await this.loadKeys();
  }
}
