import type {
  RouteLocationNormalized,
  RouteRecordNormalized,
} from 'vue-router';

import type { App, Component } from 'vue';
import { unref } from 'vue';

import {
  intersectionWith,
  isArray,
  isEqual,
  isObject,
  mergeWith,
  unionWith,
} from 'lodash-es';

export const noop = () => {};

/**
 * @description:  Set ui mount node
 */
export function getPopupContainer(node?: HTMLElement): HTMLElement {
  return (node?.parentNode as HTMLElement) ?? document.body;
}

/**
 * Add the object as a parameter to the URL
 * @param baseUrl url
 * @param obj
 * @returns {string}
 * eg:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: any): string {
  let parameters = '';
  for (const key in obj) {
    parameters += `${key}=${encodeURIComponent(obj[key])}&`;
  }
  parameters = parameters.replace(/&$/, '');
  return /\?$/.test(baseUrl)
    ? baseUrl + parameters
    : baseUrl.replace(/\/?$/, '?') + parameters;
}

/**
 * Recursively merge two objects.
 * 递归合并两个对象。
 *
 * @param source The source object to merge from. 要合并的源对象。
 * @param target The target object to merge into. 目标对象，合并后结果存放于此。
 * @param mergeArrays How to merge arrays. Default is "replace".
 *        如何合并数组。默认为replace。
 *        - "union": Union the arrays. 对数组执行并集操作。
 *        - "intersection": Intersect the arrays. 对数组执行交集操作。
 *        - "concat": Concatenate the arrays. 连接数组。
 *        - "replace": Replace the source array with the target array. 用目标数组替换源数组。
 * @returns The merged object. 合并后的对象。
 */
export function deepMerge<
  T extends null | object | undefined,
  U extends null | object | undefined,
>(
  source: T,
  target: U,
  mergeArrays: 'concat' | 'intersection' | 'replace' | 'union' = 'replace',
): T & U {
  if (!target) {
    return source as T & U;
  }
  if (!source) {
    return target as T & U;
  }
  return mergeWith({}, source, target, (sourceValue, targetValue) => {
    if (isArray(targetValue) && isArray(sourceValue)) {
      switch (mergeArrays) {
        case 'concat': {
          return [...sourceValue, ...targetValue];
        }
        case 'intersection': {
          return intersectionWith(sourceValue, targetValue, isEqual);
        }
        case 'replace': {
          return targetValue;
        }
        case 'union': {
          return unionWith(sourceValue, targetValue, isEqual);
        }
        default: {
          throw new Error(
            `Unknown merge array strategy: ${mergeArrays as string}`,
          );
        }
      }
    }
    if (isObject(targetValue) && isObject(sourceValue)) {
      return deepMerge(sourceValue, targetValue, mergeArrays);
    }
  });
}

export function openWindow(
  url: string,
  opt?: {
    noopener?: boolean;
    noreferrer?: boolean;
    target?: '_blank' | '_self' | string;
  },
) {
  const { noopener = true, noreferrer = true, target = '__blank' } = opt || {};
  const feature: string[] = [];

  noopener && feature.push('noopener=yes');
  noreferrer && feature.push('noreferrer=yes');

  window.open(url, target, feature.join(','));
}

// dynamic use hook props
export function getDynamicProps<T extends Record<string, unknown>, U>(
  props: T,
): Partial<U> {
  const ret: Record<string, any> = {};

  Object.keys(props).forEach((key) => {
    ret[key] = unref((props as Record<string, any>)[key]);
  });

  return ret as Partial<U>;
}

export function getRawRoute(
  route: RouteLocationNormalized,
): RouteLocationNormalized {
  if (!route) return route;
  const { matched, ...opt } = route;
  return {
    ...opt,
    matched: (matched
      ? matched.map((item) => ({
          meta: item.meta,
          name: item.name,
          path: item.path,
        }))
      : undefined) as RouteRecordNormalized[],
  };
}

// https://github.com/vant-ui/vant/issues/8302
interface EventShim {
  new (...args: any[]): {
    $props: {
      onClick?: (...args: any[]) => void;
    };
  };
}

export type WithInstall<T> = {
  install(app: App): void;
} & EventShim &
  T;

export type CustomComponent = { displayName?: string } & Component;

export const withInstall = <T extends CustomComponent>(
  component: T,
  alias?: string,
) => {
  (component as Record<string, unknown>).install = (app: App) => {
    const compName = component.name || component.displayName;
    if (!compName) return;
    app.component(compName, component);
    if (alias) {
      app.config.globalProperties[alias] = component;
    }
  };
  return component as WithInstall<T>;
};
