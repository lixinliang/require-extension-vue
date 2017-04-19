[![npm](https://img.shields.io/npm/l/require-extension-vue.svg?style=flat-square)](https://www.npmjs.org/package/require-extension-vue)
[![npm](https://img.shields.io/npm/v/require-extension-vue.svg?style=flat-square)](https://www.npmjs.org/package/require-extension-vue)
[![npm](https://img.shields.io/npm/dm/require-extension-vue.svg?style=flat-square)](https://www.npmjs.org/package/require-extension-vue)
[![Travis CI](https://img.shields.io/travis/lixinliang/require-extension-vue.svg?style=flat-square)](https://travis-ci.org/lixinliang/mrequire-extension-vue)
[![bitHound Code](https://www.bithound.io/github/lixinliang/require-extension-vue/badges/code.svg)](https://www.bithound.io/github/lixinliang/require-extension-vue)
[![Greenkeeper badge](https://badges.greenkeeper.io/lixinliang/require-extension-vue.svg)](https://greenkeeper.io/)

# require-extension-vue
> A require hook for loading single-file vue component in Node with Browser environment.

## What's it?

#### 1. Your project is running in Node with Browser environment. ([Electron](https://electron.atom.io/) etc.)

#### 2. The expected feature you want:

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
// This object is what you export. (data, computed, created etc.)
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
> register language to compile style

```js
loader.style.register('scss', ( content, filePath ) => {
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
> set a default language

```js
loader.style.set('scss');
```

```vue
<style>
    // No need to Declare lang="scss" any more
    // sass code
</style>
```

## API

#### #Register
> ( content : String, filePath : String ) => this

loader.style.register / loader.script.register / loader.template.register

#### #Set
> ( lang : String ) => this

loader.style.set / loader.script.set / loader.template.set

## Notice

In the following case, as the `import` synax like `Variable Hosting`:

```js
import loader from 'require-extension-vue';
loader.script.register('babel', handler).set('babel');
import app from './app.vue';
```

That should be:

```js
import loader from 'require-extension-vue';
import app from './app.vue';
// Your config behavior is after require.
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

## Todo

* `scoped` feature.
* `source map`.

## License

MIT
