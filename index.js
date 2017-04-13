'use strict';

const fs = require('fs');
const stripBom = require('strip-bom');
const compiler = require('vue-template-compiler');

let browserEnv = false;
try {
    document;
    browserEnv = true;
} catch (e) {}

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

require.extensions['.vue'] = require.extensions['.vue'] || function ( module, filePath ) {

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
};

function set ( type, lang ) {
    store[type].defaults = lang;
}

function register ( type, lang, handler ) {
    store[type].langs[lang] = handler;
}

['style', 'script', 'template'].forEach(( type ) => {
    exports[type] = {
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
