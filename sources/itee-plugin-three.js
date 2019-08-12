/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

// #if IS_REMOVE_ON_FRONTEND_BUILD
export { default } from './backend/MongoDBThreePlugin'
// #endif

// #if IS_REMOVE_ON_BACKEND_BUILD
export * from './frontend/_frontend'
// #endif
