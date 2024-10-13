import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SignatureVerifierService } from './signature-verifier.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env['SIGNATURE_VERIFIER_BASE_URL'],
    }),
  ],
  controllers: [],
  providers: [SignatureVerifierService],
  exports: [SignatureVerifierService],
})
export class DataAccessSignatureVerifierModule {}
