'use strict';

const fs = require('fs');
const css = require('css');
const hash = require('hash-sum');
const cssWhat = require('css-what');
const stripBom = require('strip-bom');
const compiler = require('vue-template-compiler');

/**
 * @fork https://github.com/fb55/css-what/blob/master/stringify.js
 * @type {Function} stringify
 */
cssWhat.stringify = require('./css-what/stringify');

/**
 * In Browser Environment
 * @type {Boolean} browserEnv
 */
let browserEnv = false;
try {
    document;
    browserEnv = true;
} catch (e) {}

/**
 * Save Loaders of different Language
 * @type {Object} store
 */
let store = {
    style : {
        defaults : '',
        langs : {},
        exports ( style ) {
            document.head.appendChild(style);
        },
    },
    script : {
        defaults : '',
        langs : {},
    },
    template : {
        defaults : '',
        langs : {},
    },
};

/**
 * Set default Loader of different Language
 * @param {String} type | style | script | template |
 * @param {String} lang scss, ts, jade etc.
 */
function set ( type, lang ) {
    store[type].defaults = lang;
}

/**
 * Register Loader of different Language
 * @param {String | String[]} type | style | script | template |
 * @param {String} lang scss, ts, jade etc.
 * @param {Function} handler
 */
function register ( type, lang, handler ) {
    if (Array.isArray(lang)) {
        lang.forEach((v) => store[type].langs[v] = handler);
        return;
    }
    store[type].langs[lang] = handler;
}

/**
 * Require extension vue hook
 * @param {Module} module
 * @param {String} filePath file path
 * @export {Vue} Vue Component after compile
 */
function loader ( module, filePath ) {

    let content = fs.readFileSync(filePath, 'utf8');
    let moduleId = `data-v-${ hash(filePath) }`;

    let vueTemplate = '';
    let vueComponent = compiler.parseComponent(stripBom(content));

    let script = vueComponent.script;
    let styles = vueComponent.styles;
    let template = vueComponent.template;

    let scoped = styles.some(({ attrs }) => attrs.scoped);

    [].concat(script, template, styles).forEach(( tag, index ) => {
        if (tag) {
            let type = tag.type;
            let content = tag.content;
            let lang = tag.attrs.lang || store[type].defaults;
            let handler = store[type].langs[lang];
            if (handler) {
                content = handler(content, filePath, index, module);
            }
            switch (type) {
                case 'style':
                    if (browserEnv) {
                        /**
                         * Only in Browser Environment, append style to head
                         */
                        if (tag.attrs.scoped) {
                            let ast = css.parse(content);
                            ast.stylesheet.rules.forEach(( rule ) => {
                                rule.selectors = rule.selectors.map(( selector ) => {
                                    let [ patterns ] = cssWhat(selector);
                                    let index = patterns.length - 1;
                                    for (; index >= 0; index--) {
                                        let { type } = patterns[index];
                                        if (type !== 'pseudo' && type !== 'pseudo-element') {
                                            break;
                                        }
                                    }
                                    patterns.splice(index + 1, 0, {
                                        value : '',
                                        name : moduleId,
                                        action : 'exists',
                                        type : 'attribute',
                                        ignoreCase : false,
                                    });
                                    return cssWhat.stringify([patterns]);
                                });
                            });
                            content = css.stringify(ast);
                        }
                        let style = document.createElement('style');
                        style.innerHTML = content;
                        store.style.exports.call(module.exports, style, {
                            index,
                            styles,
                            filePath,
                        });
                    }
                    break;
                case 'script':
                    module._compile(content, filePath);
                    break;
                case 'template':
                    if (browserEnv) {
                        /**
                         * Only in Browser Environment, set Attribute for each element
                         */
                        if (scoped) {
                            let div = document.createElement('div');
                            div.innerHTML = content;
                            let root = div.firstElementChild;
                            let walk = function walk ( element, handler ) {
                                handler(element);
                                let children = element.children || [];
                                [].forEach.call(children, ( child ) => {
                                    walk(child, handler);
                                });
                            };
                            walk(root, ( element ) => {
                                element.setAttribute(moduleId, '');
                            });
                            content = div.innerHTML;
                        }
                    }
                    vueTemplate = content;
                    break;
            }
        }
    });

    module.exports.vueComponent = vueComponent;
    module.exports.template = vueTemplate;
}

/**
 * Exports API to expand
 */
['style', 'script', 'template'].forEach(( type ) => {
    loader[type] = {
        set ( lang ) {
            set(type, lang);
            return this;
        },
        register ( lang, handler ) {
            register(type, lang, handler);
            return this;
        },
    };
});

/**
 * Handler of creating styles
 * @param {Function} handler
 */
loader.style.exports = ( handler ) => {
    store.style.exports = handler;
    return this;
};

/**
 * Register Loader as default .vue hook
 */
require.extensions['.vue'] = require.extensions['.vue'] || loader;

/**
 * @export {Function} loader
 */
module.exports = loader;
