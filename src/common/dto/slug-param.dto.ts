import { IsString, Matches } from 'class-validator';

export class SlugParamDto {
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;
}
