import type * as Kit from '@sveltejs/kit';

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
// @ts-ignore
type MatcherParam<M> = M extends (param : string) => param is infer U ? U extends string ? U : string : string;
type RouteParams = {  };
type RouteId = '/';
type MaybeWithVoid<T> = {} extends T ? T | void : T;
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K; }[keyof T];
type OutputDataShape<T> = MaybeWithVoid<Omit<App.PageData, RequiredKeys<T>> & Partial<Pick<App.PageData, keyof T & keyof App.PageData>> & Record<string, any>>
type EnsureDefined<T> = T extends null | undefined ? {} : T;
type OptionalUnion<U extends Record<string, any>, A extends keyof U = U extends U ? keyof U : never> = U extends unknown ? { [P in Exclude<A, keyof U>]?: never } & U : never;
export type Snapshot<T = any> = Kit.Snapshot<T>;
type PageParentData = EnsureDefined<LayoutData>;
type LayoutRouteId = RouteId | "/" | "/admin" | "/admin/monetization" | "/admin/monetization/[id]" | "/admin/products" | "/admin/products/[id]" | "/admin/products/new" | "/admin/roles" | "/admin/sites" | "/admin/sites/[id]" | "/admin/sites/new" | "/admin/slas" | "/admin/slas/[id]" | "/admin/slas/new" | "/admin/users" | "/admin/users/[id]" | "/home" | "/mission" | "/partners" | "/pricing" | "/privacy" | "/products/[id]" | "/register" | "/register/email" | "/sign-in" | "/sign-in/email" | "/user" | "/user/approval" | "/user/apps" | "/user/apps/api" | "/user/apps/api/[id]" | "/user/apps/api/new" | "/user/apps/bigquery" | "/user/apps/bigquery/new" | "/user/apps/storage" | "/user/apps/storage/new" | "/user/billing" | "/user/usage" | null
type LayoutParams = RouteParams & { id?: string }
type LayoutParentData = EnsureDefined<{}>;

export type PageServerData = null;
export type PageData = Expand<PageParentData>;
export type LayoutServerData = null;
export type LayoutData = Expand<LayoutParentData>;