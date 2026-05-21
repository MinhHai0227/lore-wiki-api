import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => {
  const accountId = process.env.R2_ACCOUNT_ID ?? '';
  const endpoint = nonEmpty(process.env.R2_ENDPOINT);

  return {
    accountId,
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    bucket: process.env.R2_BUCKET ?? '',
    region: process.env.R2_REGION ?? 'auto',
    endpoint:
      endpoint ??
      (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined),
    publicUrl: trimTrailingSlash(process.env.R2_PUBLIC_URL ?? ''),
  };
});

function nonEmpty(value: string | undefined) {
  return value && value.trim().length > 0 ? value : undefined;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}
