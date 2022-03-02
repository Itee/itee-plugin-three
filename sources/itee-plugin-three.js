/**
 *
 * __/\\\\\\\\\\\____________________________________________________/\\\\\\\\\\\\\____/\\\\\\__________________________________________________________/\\\\\\\\\\\\\\\__/\\\_____________________________________________________________
 * __\/////\\\///____________________________________________________\/\\\/////////\\\_\////\\\_________________________________________________________\///////\\\/////__\/\\\____________________________________________________________
 * _______\/\\\_________/\\\__________________________________________\/\\\_______\/\\\____\/\\\____________________/\\\\\\\\___/\\\___________________________\/\\\_______\/\\\___________________________________________________________
 * ________\/\\\______/\\\\\\\\\\\_____/\\\\\\\\______/\\\\\\\\________\/\\\\\\\\\\\\\/_____\/\\\_____/\\\____/\\\__/\\\////\\\_\///___/\\/\\\\\\_______________\/\\\_______\/\\\__________/\\/\\\\\\\______/\\\\\\\\______/\\\\\\\\_______
 * _________\/\\\_____\////\\\////____/\\\/////\\\___/\\\/////\\\_______\/\\\/////////_______\/\\\____\/\\\___\/\\\_\//\\\\\\\\\__/\\\_\/\\\////\\\______________\/\\\_______\/\\\\\\\\\\__\/\\\/////\\\___/\\\/////\\\___/\\\/////\\\_____
 * __________\/\\\________\/\\\_______/\\\\\\\\\\\___/\\\\\\\\\\\________\/\\\________________\/\\\____\/\\\___\/\\\__\///////\\\_\/\\\_\/\\\__\//\\\_____________\/\\\_______\/\\\/////\\\_\/\\\___\///___/\\\\\\\\\\\___/\\\\\\\\\\\_____
 * ___________\/\\\________\/\\\_/\\__\//\\///////___\//\\///////_________\/\\\________________\/\\\____\/\\\___\/\\\__/\\_____\\\_\/\\\_\/\\\___\/\\\_____________\/\\\_______\/\\\___\/\\\_\/\\\_________\//\\///////___\//\\///////_____
 * _________/\\\\\\\\\\\____\//\\\\\____\//\\\\\\\\\\__\//\\\\\\\\\\__/\\\_\/\\\______________/\\\\\\\\\_\//\\\\\\\\\__\//\\\\\\\\__\/\\\_\/\\\___\/\\\__/\\\_______\/\\\_______\/\\\___\/\\\_\/\\\__________\//\\\\\\\\\\__\//\\\\\\\\\\__
 * _________\///////////______\/////______\//////////____\//////////__\///__\///______________\/////////___\/////////____\////////___\///__\///____\///__\///________\///________\///____\///__\///____________\//////////____\//////////__
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file
 * @desc This module is specifically intented to be use in conjunction with TMongoDBDatabase. It is composed by two main parts.
 * One is design for backend usage under nodejs process as autoregistering plugins, the other for frontend usage in client side.
 *
 * @example {@lang javascript}
 * // For nodejs usage you just need to declare plugin in itee.config.js like this:
 * // It will automatically performe a require('itee-plugin-three') of itee-plugin-three.cjs build
 *
 * databases: [
 *      {
 *          type:            'TMongoDBDatabase',
 *          name:            'MongoDB',
 *          databaseUrl:     `mongodb://localhost:27017/rw4d`,
 *          databaseOptions: {
 *              useNewUrlParser:    true,
 *              useUnifiedTopology: true,
 *              useCreateIndex:     true,
 *              useFindAndModify:   false
 *          },
 *          plugins:         {
 *              'itee-plugin-three': {}
 *          }
 *      }
 * ]
 *
 * @example {@lang javascript}
 * // In case you are bundling your package you should use import statement
 *
 * import { ObjectsManager } from 'itee-plugin-three'
 *
 * var objectsManager = new ObjectsManager( options )
 * objectsManager.read( query, projection, onSuccess, onProgress, onError )
 *
 * @example {@lang xml}
 * <!-- For client usage you could directly import iife script using script tag like this -->
 *
 * <script src="resources/scripts/itee-plugin-three.iife.min.js" type="text/javascript"></script>
 *
 */

///////////////
// Externals //
///////////////

/**
 * The js-bson package.
 *
 * @external "mongodb/js-bson"
 * @see {@link https://github.com/mongodb/js-bson/|BSON Parser}
 */
/**
 * @typedef {Number}
 */

/**
 * The itee-client package.
 *
 * @external "Itee.Client"
 * @see {@link https://github.com/Itee/itee-client/|Itee.Client}
 */

/**
 * The itee-database package.
 *
 * @external "Itee.Database"
 * @see {@link https://github.com/Itee/itee-database/|Itee.Database}
 */

/**
 * The itee-mongodb package.
 *
 * @external "Itee.MongoDB"
 * @see {@link https://github.com/Itee/itee-mongodb/|Itee.MongoDB}
 */

/**
 * The itee-utils package.
 *
 * @external "Itee.Utils"
 * @see {@link https://github.com/Itee/itee-utils/|Itee.Utils}
 */

/**
 * The itee-validators package.
 *
 * @external "Itee.Validators"
 * @see {@link https://github.com/Itee/itee-validators/|Itee.Validators}
 */

/**
 * The three-full package.
 *
 * @external "Three Full"
 * @see {@link https://github.com/Itee/three-full/|Three Full}
 */

////////////////
// Namespaces //
////////////////

// Itee
/**
 *
 */

/**
 * @interface Enum
 * @description Act as an Enum value with some helpers function
 * @example
 * import { toEnum } from 'itee-utils'
 * const MyEnum = toEnum( {
 *     Foo: 0,
 *     Bar: 1,
 *     Baz: 2
 * } )
 */
/**
 * @method toString
 * @memberOf Enum
 * @description Get a formated string of availables enum keys.
 * @returns {String} A formated string of availables enum keys.
 */
/**
 * @method includes
 * @memberOf Enum
 * @description Check if the given value could be considered as a valid Enum value.
 * @param {(number|string)} value - A value to check if it could be considered as a valid enum value.
 * @returns {boolean} True if value could be one of the enum, false otherwise.
 */
/**
 * @method types
 * @memberOf Enum
 * @description Get availables Enum Keys as an array of strings.
 * @returns {Array<String>} The availables keys.
 */

// Mongoose
/**
 * Mongoose namespace.
 *
 * @external Mongoose
 */

/**
 * Base class for Mongoose errors.
 *
 * @typedef {Error} external:Mongoose~Error
 * @see https://mongoosejs.com/docs/api.html#error_Error
 */

/**
 * An instance of this error class will be returned when mongoose failed to cast a value.
 *
 * @typedef {external:Mongoose~Error} external:Mongoose~CastError
 * @see https://mongoosejs.com/docs/api.html#error_Error-CastError
 */

/**
 * The options defined on a schematype.
 *
 * @typedef {Object} external:Mongoose~SchemaTypeOptions
 * @see https://mongoosejs.com/docs/api/schematypeoptions.html
 */

// Three
/**
 * @external THREE
 * @description The three-full package based on THREE
 * @see {@link https://github.com/Itee/three-full/|Three Full}
 */
/**
 * A class representing a color.
 *
 * @typedef {Object} external:THREE~Color
 * @property {Number} [r=0] - red channel
 * @property {Number} [g=0] - green channel
 * @property {Number} [b=0] - blue channel
 * @see https://threejs.org/docs/index.html#api/en/math/Color
 */
/**
 * A class representing Euler angles.
 *
 * @typedef {Object} external:THREE~Euler
 * @property {Number} [x=0] - The angle of the x axis in radians
 * @property {Number} [y=0] - The angle of the y axis in radians
 * @property {Number} [z=0] - The angle of the z axis in radians
 * @property {String} [order=XYZ] - A string representing the order that the rotations are applied, defaults to 'XYZ' (must be upper case).
 * @see https://threejs.org/docs/index.html#api/en/math/Euler
 */
/**
 * A class representing a 3x3 matrix.
 *
 * @typedef {Object} external:THREE~Matrix3
 * @property {Array<Number>} [elements=[1, 0, 0, 0, 1, 0, 0, 0, 1]] - A column-major list of matrix values.
 * @see https://threejs.org/docs/index.html#api/en/math/Matrix3
 */
/**
 * A class representing a 4x4 matrix.
 *
 * @typedef {Object} external:THREE~Matrix4
 * @property {Array<Number>} [elements=[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]] - A column-major list of matrix values.
 * @see https://threejs.org/docs/index.html#api/en/math/Matrix4
 */
/**
 * Implementation of a Vector2.
 *
 * @typedef {Object} external:THREE~Vector2
 * @property {Number} [x=0] - x float coordinate
 * @property {Number} [y=0] - y float coordinate
 * @see https://threejs.org/docs/index.html#api/en/math/Vector2
 */
/**
 * Implementation of a Vector3.
 *
 * @typedef {Object} external:THREE~Vector3
 * @property {Number} [x=0] - x float coordinate
 * @property {Number} [y=0] - y float coordinate
 * @property {Number} [z=0] - z float coordinate
 * @see https://threejs.org/docs/index.html#api/en/math/Vector3
 */
/**
 * Implementation of a Vector4.
 *
 * @typedef {Object} external:THREE~Vector4
 * @property {Number} [x=0] - x float coordinate
 * @property {Number} [y=0] - y float coordinate
 * @property {Number} [z=0] - z float coordinate
 * @property {Number} [w=1] - w float coordinate
 * @see https://threejs.org/docs/index.html#api/en/math/Vector4
 */
/**
 * Implementation of a Quaternion.
 *
 * @typedef {Object} external:THREE~Quaternion
 * @property {Number} [x=0] - x float coordinate
 * @property {Number} [y=0] - y float coordinate
 * @property {Number} [z=0] - z float coordinate
 * @property {Number} [w=1] - w float coordinate
 * @see https://threejs.org/docs/index.html#api/en/math/Quaternion
 */
/**
 * Implementation of a Object3D.
 *
 * @typedef {Object} external:THREE.Object3D
 * @see https://threejs.org/docs/index.html#api/en/core/Object3D
 */
/**
 * Implementation of a Camera.
 *
 * @typedef {Object} external:THREE.Camera
 * @property {external:THREE~Layers} layers - The layers that the camera is a member of. This is an inherited property from Object3D.
 * @property {external:THREE~Matrix4} matrixWorldInverse - This is the inverse of matrixWorld. MatrixWorld contains the Matrix which has the world transform of the Camera.
 * @property {external:THREE~Matrix4} projectionMatrix - This is the matrix which contains the projection.
 * @property {external:THREE~Matrix4} projectionMatrixInverse - The inverse of projectionMatrix.
 * @see https://threejs.org/docs/index.html#api/en/cameras/Camera
 */


///////////////////////
// Globals Types Def //
///////////////////////

/**
 * The onSuccessCallback is design to handle result from successful task
 *
 * @callback onSuccessCallback
 * @param  {*} element - Any value return by the calling method
 */

/**
 * The onProgressCallback is design to handle progress from running task
 *
 * @callback onProgressCallback
 * @param  {ProgressEvent} progress - The current progress event of running task
 */

/**
 * The onProgressCallback is design to handle result from errored task
 *
 * @callback onErrorCallback
 * @param  {ErrorEvent|Error} error - An error event or event object that happen during running task
 */


// #if IS_REMOVE_ON_FRONTEND_BUILD
export { registerPlugin } from './backend/MongoDBThreePlugin'
// #endif

export * from './common/_common'

// #if IS_REMOVE_ON_BACKEND_BUILD
export * from './frontend/_frontend'
// #endif
