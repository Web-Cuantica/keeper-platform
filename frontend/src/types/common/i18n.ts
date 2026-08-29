/**
 * Firma mínima de la función de traducción, para las fábricas `getX(t)`.
 *
 * El `TFunction` de i18next declara su retorno como `TFunctionResult`
 * (`string | object | Array | null | undefined`), que TypeScript no acepta ni donde se
 * espera un `string` ni donde se espera un `ReactNode`. En la práctica el `t` que devuelve
 * `useTranslation()` siempre entrega `string`, así que se tipa solo lo que estas fábricas
 * necesitan: clave, `defaultValue` y las variables de interpolación.
 *
 * Existe porque las constantes a nivel de módulo (configs de columnas, filtros, opciones)
 * no pueden usar el hook `useTranslation`: se evalúan al importar el archivo, antes de que
 * i18next cargue los recursos. La traducción tiene que recibirse por parámetro.
 */
export type TraducirFn = (
	key: string,
	opts?: { defaultValue?: string } & Record<string, unknown>,
) => string;
