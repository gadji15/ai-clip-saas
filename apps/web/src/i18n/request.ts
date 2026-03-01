import { getRequestConfig } from 'next-intl/server';

import { getMessages } from './getMessages';
import { defaultLocale, isLocale } from './locales';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: getMessages(locale),
  };
});
