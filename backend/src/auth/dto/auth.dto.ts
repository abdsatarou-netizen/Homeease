import { IsString, Matches, Length } from 'class-validator';

export class RequestOtpDto {
  // Format attendu : +229XXXXXXXX (Bénin) — adaptable aux autres pays plus tard
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'Numéro de téléphone invalide (format international requis).' })
  phone: string;
}

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phone: string;

  @IsString()
  @Length(4, 6)
  code: string;
}
