'use strict';

const fs = require('fs');
const stripBom = require('strip-bom');
const compiler = require('vue-template-compiler');

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
 * @param {String} type | style | script | template |
 * @param {String} lang scss, ts, jade etc.
 * @param {Function} handler handler
 */
function register ( type, lang, handler ) {
    store[type].langs[lang] = handler;
}

/**
 * Require extension vue hook
 * @param {Module} module module
 * @param {String} filePath file path
 * @export {Vue} Vue Component after compile
 */
function loader ( module, filePath ) {

    let content = fs.readFileSync(filePath, 'utf8');

    let vueTemplate = '';
    let vueComponent = compiler.parseComponent(stripBom(content));

    let script = vueComponent.script;
    let styles = vueComponent.styles;
    let template = vueComponent.template;

    [].concat(script, template, styles).forEach(( tag ) => {
        if (tag) {
            let type = tag.type;
            let content = tag.content;
            let lang = tag.attrs.lang || store[type].defaults;
            let handler = store[type].langs[lang];
            if (handler) {
                content = handler(content, filePath);
            }
            switch (type) {
                case 'style':
                    if (browserEnv) {
                        /**
                         * Only in Browser Environment, append style to head
                         */
                        let style = document.createElement('style');
                        style.innerHTML = content;
                        document.head.appendChild(style);
                    }
                    break;
                case 'script':
                    module._compile(content, filePath);
                    break;
                case 'template':
                    vueTemplate = content;
                    break;
            }
        }
    });

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
 * Register Loader as default .vue hook
 */
require.extensions['.vue'] = require.extensions['.vue'] || loader;

/**
 * @export {Function} loader
 */
module.exports = loader;
