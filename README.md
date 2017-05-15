[![npm](https://img.shields.io/npm/l/require-extension-vue.svg)](https://www.npmjs.org/package/require-extension-vue)
[![npm](https://img.shields.io/npm/v/require-extension-vue.svg)](https://www.npmjs.org/package/require-extension-vue)
[![npm](https://img.shields.io/npm/dm/require-extension-vue.svg)](https://www.npmjs.org/package/require-extension-vue)
[![Travis CI](https://img.shields.io/travis/lixinliang/require-extension-vue.svg)](https://travis-ci.org/lixinliang/mrequire-extension-vue)
[![bitHound Code](https://www.bithound.io/github/lixinliang/require-extension-vue/badges/code.svg)](https://www.bithound.io/github/lixinliang/require-extension-vue)
[![Greenkeeper badge](https://badges.greenkeeper.io/lixinliang/require-extension-vue.svg)](https://greenkeeper.io/)
[![Twitter](https://img.shields.io/badge/twitter-@qq393464140-blue.svg)](http://twitter.com/qq393464140)

# require-extension-vue
> A require hook for loading single-file vue component in Node with Browser environment.

## What's it?

#### 1. Your project is running in Node with Browser environment. ([Electron](https://electron.atom.io/) etc.)

#### 2. The expected feature you want, like runtime:

```vue
// app.vue
<script>
export default {
    // ...
};
</script>
<template>
    // ...
</template>
<style>
    // ...
</style>
```

```js
import 'require-extension-vue';
// From now on, you can import or require a single-file vue component.
import app from './app.vue';
// This object is what you export. (include attributes: data, computed, created etc.)
// <template> will be exported in app.template as String.
// <style> will be appended to document.head, if you have Browser environment.
```

#### 3. Do what you like.

```js
new Vue(app).$mount('app');
```

## Getting started

```
$ npm install --save require-extension-vue
```

or, You want a quick start. ([use-vue](https://www.npmjs.com/package/use-vue))

## Usage

### Simple

```js
import 'require-extension-vue';
import app from './app.vue';

new Vue(app).$mount('app');
```

### Config

```js
import loader from 'require-extension-vue';
```

#### #loader.style.register
> Register language to compile style.

```js
loader.style.register('scss', ( content, filePath, index ) => {
    // compile
    return content;
});
```

```vue
<style lang="scss">
    // sass code
</style>
```

#### #loader.style.set
> Set a default language.

```js
loader.style.set('scss');
```

```vue
<style>
    // No need to Declare lang="scss" any more
    // sass code
</style>
```

#### #loader.style.exports
> Append styles to where you like.

```js
loader.style.exports(function ( style, { index, styles, filePath } ) {
    document.head.appendChild(style);
});
```

#### #sync
> Compile handler should return content sync, includes `<template>`, `<script>` and `<style>`.

#### #<del>async<del>
> Deprecated, [@see](https://github.com/lixinliang/require-extension-vue/issues/4)

## API

#### #Register
> register ( *lang* : `String`, *handler* : `Function` ) => `this`

> handler ( *content* : `String`, *filePath* : `String`, *index* : `Number` ) => *content* : `String`

loader.style.register / loader.script.register / loader.template.register

#### #Set
> set ( *lang* : `String` ) => `this`

loader.style.set / loader.script.set / loader.template.set

#### #Exports
> exports ( *handler* : `Function` ) => `this`

> handler ( *style* : `Element`, *options* : `Object` ) { *this* : `Vue` } => `void`

> options { *index* : `Number`, *styles* : `Array<Element>`, *filePath* : `String` }

loader.style.exports

## Notice

In the following case, as the `import` synax like `Variable Hosting`:

```js
import loader from 'require-extension-vue';
loader.script.register('babel', handler).set('babel');
import app from './app.vue';
```

The above case is equal to the following case:

```js
import loader from 'require-extension-vue';
import app from './app.vue';
// Your config behavior is after require, so it is not working.
loader.script.register('babel', handler).set('babel');
```

There're two way to avoid:

> You can use `require` instead of `import`.

```js
import loader from 'require-extension-vue';
loader.script.register('babel', handler).set('babel');
let app  = require('./app.vue');
```

> Put the config behavior in one file.

```js
import 'require-extension-vue';
import './require-extension-vue-config.js';
import app from './app.vue';
```

```js
// require-extension-vue-config.js
let loader = require.extensions['.vue'];
loader.script.register('babel', handler).set('babel');
```

## Scoped

Support `scoped`, like `vue-loader`. [@see](https://github.com/vuejs/vue-loader/blob/master/docs/en/features/scoped-css.md)

#### #Mind you

This feature require `css-what`.

But, it is `defective`. [@see](https://github.com/fb55/css-what/blob/master/stringify.js#L53)

If your class name includes `#` (`>`, etc), it can not parse to correct `AST` selector.

## Todo

* `source map`.

## License

MIT
