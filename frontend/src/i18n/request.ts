import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const locales = ["en", "fr"] as const;
type Locale = (typeof locales)[number];

function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

function getBrowserLocale(acceptLanguage: string | null): Locale {
  const browserLocales = acceptLanguage
    ?.split(",")
    .map((value, index) => {
      const [language, ...parameters] = value.trim().split(";");
      const quality = Number(
        parameters
          .find((parameter) => parameter.trim().startsWith("q="))
          ?.trim()
          .slice(2) ?? "1",
      );

      return {
        language: language.toLowerCase(),
        quality: Number.isNaN(quality) ? 0 : quality,
        index,
      };
    })
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
    .map(({ language }) => language);

  for (const browserLocale of browserLocales ?? []) {
    if (isLocale(browserLocale)) {
      return browserLocale;
    }

    const language = browserLocale.split("-")[0];
    if (isLocale(language)) {
      return language;
    }
  }

  return "en";
}

export default getRequestConfig(async () => {
  const requestCookies = await cookies();
  const cookieLocale = requestCookies.get("NEXT_LOCALE")?.value;
  const hasManualLocale = requestCookies.get("NEXT_LOCALE_MANUAL")?.value === "1";
  const browserLocale = getBrowserLocale(
    (await headers()).get("accept-language"),
  );
  const locale =
    hasManualLocale && isLocale(cookieLocale) ? cookieLocale : browserLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
