/*
 * Load in each component and make available as a list.
 */

const files = require.context('.', true, /\.vue$/);
const components = {};
files.keys().forEach(key => {
    if (key.match(/.\/index.vue/)) {
        //console.log(key.replace(/\.\/|\/index\.vue/g, ''))
        components[key.replace(/\.\/|\/index\.vue/g, '')] = files(key)
    }
});

export const shared = Object.values(components)
    .filter(module => module.shared)
    .map(module => module.shared);

export default components;
