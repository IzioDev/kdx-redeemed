import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable()
export class SignatureVerifierService {
  constructor(private readonly http: HttpService) {}

  /**
   * @returns address if message is valid
   */
  verify(
    message: string,
    publicKey: string,
    signature: string
  ): Observable<string | null> {
    return this.http
      .post<{ address: string }>('/message/verify', {
        message,
        public_key: publicKey,
        signature,
      })
      .pipe(
        map((response) => {
          if (response.status !== 200) {
            throw new Error("status isn't success");
          }

          if (!response.data?.address) {
            throw new Error('address is not present in response');
          }

          return response.data.address;
        }),
        catchError(() => of(null))
      );
  }
}
