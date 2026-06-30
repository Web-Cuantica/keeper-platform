// Devuelve el titulo traducido de la tabla "Operaciones clave".
// Como es config a nivel de modulo, no puede usar hooks: recibe 't' por parametro.
// Tipamos 't' de forma laxa para no depender del tipo TFunction.
export const getTitle = (
	t: (key: string, options?: Record<string, unknown>) => string,
) => (): string => t('svc_key_operations', { defaultValue: 'Key Operations' });
