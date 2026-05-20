import slugifyLib from 'slugify';

export function slugify(value: string) {
  return slugifyLib(value, {
    lower: true,
    strict: true,
    locale: 'vi',
    trim: true,
  });
}
