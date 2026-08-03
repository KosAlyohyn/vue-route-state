import type { ComputedRef, WritableComputedRef } from 'vue'
import type {
  LocationQuery,
  LocationQueryValue,
  LocationQueryValueRaw,
  RouteLocationNormalizedLoaded,
  Router,
} from 'vue-router'

export type UrlStateHistoryMode = 'replace' | 'push'

export type UrlStateInvalidValuesMode = 'filter' | 'default'

export type UrlStateType =
  | 'array'
  | 'boolean'
  | 'custom'
  | 'date'
  | 'number'
  | 'string'

export interface UrlStateActionOptions {
  history?: UrlStateHistoryMode
}

export interface UrlRouterContextOptions {
  route?: RouteLocationNormalizedLoaded
  router?: Router
}

export interface UrlQueryParamOptions<Value = unknown>
  extends UrlRouterContextOptions {
  defaultValue?: Value
  parse?: (
    value: LocationQueryValue | LocationQueryValue[] | undefined,
    defaultValue: Value,
  ) => Value
  serialize?: (
    value: Value,
    defaultValue: Value,
  ) => LocationQueryValueRaw | LocationQueryValueRaw[] | undefined
  history?: UrlStateHistoryMode
  replace?: boolean
}

export interface UrlStateEnabledWhenContext<
  Values extends Record<string, unknown> = Record<string, unknown>,
> {
  field: string
  values: Partial<Values>
  query: LocationQuery
  route: RouteLocationNormalizedLoaded
}

export interface UrlStateGroupEnabledWhenContext<
  Values extends Record<string, unknown> = Record<string, unknown>,
> extends UrlStateEnabledWhenContext<Values> {
  group: string
}

export interface UrlStateGroupOptions<
  Schema extends UrlStateSchema,
  Values extends Record<string, unknown> = UrlStateValues<Schema>,
> {
  fields: readonly (keyof Schema & string)[]
  enabledWhen?: (context: UrlStateGroupEnabledWhenContext<Values>) => boolean
  clearWhenDisabled?: boolean
}

export interface UrlStateFieldOptions<
  Type extends UrlStateType = UrlStateType,
  Value = unknown,
  Values extends Record<string, unknown> = Record<string, unknown>,
> {
  type: Type
  key?: string
  aliases?: readonly string[]
  defaultValue: Value
  allowedValues?: readonly unknown[]
  positive?: boolean
  omitDefault?: boolean
  enabledWhen?: (context: UrlStateEnabledWhenContext<Values>) => boolean
  transform?: (
    value: Value,
    field: UrlStateFieldOptions<Type, Value, Values>,
  ) => Value
}

export type StringUrlStateFieldOptions<
  Value extends string = string,
  Values extends Record<string, unknown> = Record<string, unknown>,
> = UrlStateFieldOptions<'string', Value, Values> & {
  allowedValues?: readonly Value[]
}

export type NumberUrlStateFieldOptions<
  Value extends number = number,
  Values extends Record<string, unknown> = Record<string, unknown>,
> = UrlStateFieldOptions<'number', Value, Values> & {
  allowedValues?: readonly Value[]
  positive?: boolean
  integer?: boolean
}

export type BooleanUrlStateFieldOptions<
  Value extends boolean = boolean,
  Values extends Record<string, unknown> = Record<string, unknown>,
> = UrlStateFieldOptions<'boolean', Value, Values> & {
  trueValue?: string
  falseValue?: string
}

export interface CustomUrlStateFieldOptions<
  Value = unknown,
  Values extends Record<string, unknown> = Record<string, unknown>,
> extends UrlStateFieldOptions<'custom', Value, Values> {
  parse: (
    value: LocationQueryValue | LocationQueryValue[] | undefined,
    field: CustomUrlStateFieldOptions<Value, Values>,
  ) => Value
  serialize: (
    value: Value,
    field: CustomUrlStateFieldOptions<Value, Values>,
  ) => LocationQueryValueRaw | LocationQueryValueRaw[] | undefined
}

export type DateUrlStateValue = string | Date | null

export type DateUrlStateFieldOptions<
  Value extends DateUrlStateValue = DateUrlStateValue,
  Values extends Record<string, unknown> = Record<string, unknown>,
> = UrlStateFieldOptions<'date', Value, Values>

export type ArrayUrlStateFieldOptions<
  Value extends readonly string[] = readonly string[],
  Values extends Record<string, unknown> = Record<string, unknown>,
> = UrlStateFieldOptions<'array', Value, Values> & {
  allowedValues?: readonly Value[number][]
  invalidValues?: UrlStateInvalidValuesMode
}

export type AnyUrlStateFieldOptions<
  Values extends Record<string, unknown> = Record<string, unknown>,
> =
  | StringUrlStateFieldOptions<string, Values>
  | NumberUrlStateFieldOptions<number, Values>
  | BooleanUrlStateFieldOptions<boolean, Values>
  | CustomUrlStateFieldOptions<unknown, Values>
  | DateUrlStateFieldOptions<DateUrlStateValue, Values>
  | ArrayUrlStateFieldOptions<readonly string[], Values>

export type UrlStateSchema<
  Values extends Record<string, unknown> = Record<string, unknown>,
> = Record<string, AnyUrlStateFieldOptions<Values>>

export interface UrlStateOptions<Schema extends UrlStateSchema>
  extends UrlRouterContextOptions {
  history?: UrlStateHistoryMode
  order?: readonly (keyof Schema & string)[]
  groups?: Record<string, UrlStateGroupOptions<Schema>>
}

export type UrlStateFieldValue<Option> =
  Option extends UrlStateFieldOptions<'array', infer Value>
    ? Value extends readonly string[]
      ? string[]
      : Value
    : Option extends UrlStateFieldOptions<'date', unknown>
      ? DateUrlStateValue
      : Option extends CustomUrlStateFieldOptions<infer Value>
        ? Value
      : Option extends UrlStateFieldOptions<UrlStateType, infer Value>
        ? Value
        : unknown

export type UrlStateValues<Schema extends UrlStateSchema> = {
  [Name in keyof Schema]: UrlStateFieldValue<Schema[Name]>
}

export type UrlStateRefs<Schema extends UrlStateSchema> = {
  [Name in keyof Schema]: WritableComputedRef<UrlStateFieldValue<Schema[Name]>>
}

export type UrlState<Schema extends UrlStateSchema> = UrlStateRefs<Schema> & {
  patch(
    values: Partial<UrlStateValues<Schema>>,
    options?: UrlStateActionOptions,
  ): Promise<unknown>
  clear(
    names?: readonly (keyof Schema & string)[],
    options?: UrlStateActionOptions,
  ): Promise<unknown>
  reset(
    names?: readonly (keyof Schema & string)[],
    options?: UrlStateActionOptions,
  ): Promise<unknown>
  hasQueryValue(name: keyof Schema & string): boolean
  snapshot(): UrlStateValues<Schema>
  values: ComputedRef<UrlStateValues<Schema>>
}

export function useUrlParam<Option extends AnyUrlStateFieldOptions>(
  name: string,
  options: Option & UrlRouterContextOptions,
): WritableComputedRef<UrlStateFieldValue<Option>>

export function useUrlQueryParam<Value = unknown>(
  key: string,
  options?: UrlQueryParamOptions<Value>,
): WritableComputedRef<Value>

export function useUrlState<Schema extends UrlStateSchema>(
  schema: Schema,
  options?: UrlStateOptions<Schema>,
): UrlState<Schema>
