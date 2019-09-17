import camelCase from 'lodash/camelCase'
// Storing in variable a context with all files in this folder
// ending with `.js`.

/**
 * The file enables `@/store/index.js` to import all vuex modules
 * in a one-shot manner. There should not be any reason to edit this file.
 */

const files = require.context('.', false, /\.js$/)
const modules = {}

files.keys().forEach(fileName => {
    if (fileName === './index.js') return
    // filter fullstops and extension 
    // and return a camel-case name for the file
    const moduleName = camelCase(
        fileName.replace(/(\.\/|\.js)/g, '')
    )
    // create a dynamic object with all modules
    modules[moduleName] = {
    // add namespace here
        namespaced: true,
        ...files(fileName).default
    // if you have exported the object with name in the module `js` file
    // e.g., export const name = {};
    // uncomment this line and comment the above
        // ...files(fileName)[moduleName]
    }
})
console.log("store modules for state", modules)
export default modules