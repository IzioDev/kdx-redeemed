import { IsString } from 'class-validator';

export class SignInDto {
  @IsString()
  type!: 'kasware';

  @IsString()
  signature!: string;

  @IsString()
  publicKey!: string;
}
