/**
 * @module Controllers/CameraControls
 * @desc This module export CameraControls class and CameraControlMode enum values.
 *
 * @requires {@link module: [itee-client]{@link https://github.com/Itee/itee-client}}
 * @requires {@link module: [itee-utils]{@link https://github.com/Itee/itee-utils}}
 * @requires {@link module: [itee-validators]{@link https://github.com/Itee/itee-validators}}
 * @requires {@link module: [three-full]{@link https://github.com/Itee/three-full}}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @example
 *
 * import { CameraControls, CameraControlMode } from 'itee-plugin-three'
 *
 */

import {
    Keys,
    Mouse
}                        from 'itee-client'
import { DefaultLogger } from 'itee-core'
import {
    degreesToRadians,
    toEnum
}                        from 'itee-utils'
import {
    isEmptyArray,
    isNotBoolean,
    isNotDefined,
    isNull,
    isUndefined
}                        from 'itee-validators'
//import { EventDispatcher } from 'three-full/sources/core/EventDispatcher'
//import { Object3D }        from 'three-full/sources/core/Object3D'
//import { Spherical }       from 'three-full/sources/math/Spherical'
//import { Vector2 }         from 'three-full/sources/math/Vector2'
//import { Vector3 }         from 'three-full/sources/math/Vector3'
// Waiting three-shaking fix
import {
    EventDispatcher,
    Object3D,
    Spherical,
    Vector2,
    Vector3
}                        from 'three-full'

const FRONT = new Vector3( 0, 0, -1 )
const BACK  = new Vector3( 0, 0, 1 )
const UP    = new Vector3( 0, 1, 0 )
const DOWN  = new Vector3( 0, -1, 0 )
const RIGHT = new Vector3( 1, 0, 0 )
const LEFT  = new Vector3( -1, 0, 0 )

/**
 * Enum values to define the internal state of CameraControl
 *
 * @type {Enum}
 * @name State
 * @property {number} [None=0] - The default state when nothing happen.
 * @property {number} [Rotating=1] - The state when current action is interpreted as Rotating.
 * @property {number} [Panning=2] - The state when current action is interpreted as Panning.
 * @property {number} [Rolling=3] - The state when current action is interpreted as Rolling.
 * @property {number} [Zooming=4] - The state when current action is interpreted as Zooming.
 * @property {number} [Moving=5] - The state when current action is interpreted as Moving.
 * @constant
 * @private
 */
const State = toEnum( {
    None:     0,
    Rotating: 1,
    Panning:  2,
    Rolling:  3,
    Zooming:  4,
    Moving:   5
} )

/**
 * Enum values to set the current mode of displacement for Camera.
 *
 * @typedef {Enum} module:Controllers/CameraControls.CameraControlMode
 * @property {number} [FirstPerson=1] - The state when current action is interpreted as Rotating.
 * @property {number} [Orbit=2] - The state when current action is interpreted as Panning.
 * @property {number} [Fly=3] - The state when current action is interpreted as Rolling.
 * @property {number} [Path=4] - The state when current action is interpreted as Zooming.
 * @constant
 * @public
 */
const CameraControlMode = toEnum( {
    FirstPerson: 1,
    Orbit:       2,
    Fly:         3,
    Path:        4
} )

function isInWorker () {
    return typeof importScripts === 'function'
}

/**
 * @class
 * @classdesc The CameraControls allow to manage all camera type, in all displacement mode.
 * It manage keyboard and mouse binding to different camera actions.
 * @augments EventDispatcher
 */
class CameraControls extends EventDispatcher {

    // Internal events
    /**
     * Move event.
     *
     * @event module:Controllers/CameraControls~CameraControls#move
     * @type {object}
     * @property {String} [type=move] - Indicates the type of fired event
     */

    /**
     * Scale event.
     *
     * @event module:Controllers/CameraControls~CameraControls#scale
     * @type {object}
     * @property {String} [type=scale] - Indicates the type of fired event
     */

    /**
     * Rotate event.
     *
     * @event module:Controllers/CameraControls~CameraControls#rotate
     * @type {object}
     * @property {String} [type=rotate] - Indicates the type of fired event
     */

    /**
     * Change event.
     *
     * @event module:Controllers/CameraControls~CameraControls#change
     * @type {object}
     * @property {String} [type=change] - Indicates the type of fired event
     */

    /**
     * @constructor
     * @param {Object} parameters - A parameters object containing properties initialization
     * @param {THREE~Camera} parameters.camera - The camera to use
     * @param {Object} [parameters.logger=DefaultLogger] - A logger for output
     * @param {THREE~Object3D} [parameters.target=THREE~Object3D] - A target to look, or used as pivot point
     * @param {module:Controllers/CameraControls.CameraControlMode} [parameters.mode=CameraControlMode.Orbit] - The current controller mode
     * @param {Window|HTMLDocument|HTMLDivElement|HTMLCanvasElement} [parameters.domElement=window] - The DOMElement to listen for mouse and keyboard inputs
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                logger:     DefaultLogger,
                camera:     null,
                target:     new Object3D(),
                mode:       CameraControlMode.Orbit,
                domElement: ( isInWorker() ) ? null : window
            }, ...parameters
        }

        super()

        // Need to be defined before domElement to make correct binding events
        this._handlers = {
            onMouseEnter:  this._onMouseEnter.bind( this ),
            onMouseLeave:  this._onMouseLeave.bind( this ),
            onMouseDown:   this._onMouseDown.bind( this ),
            onMouseMove:   this._onMouseMove.bind( this ),
            onMouseWheel:  this._onMouseWheel.bind( this ),
            onMouseUp:     this._onMouseUp.bind( this ),
            onDblClick:    this._onDblClick.bind( this ),
            onTouchStart:  this._onTouchStart.bind( this ),
            onTouchEnd:    this._onTouchEnd.bind( this ),
            onTouchCancel: this._onTouchCancel.bind( this ),
            onTouchLeave:  this._onTouchLeave.bind( this ),
            onTouchMove:   this._onTouchMove.bind( this ),
            onKeyDown:     this._onKeyDown.bind( this ),
            onKeyUp:       this._onKeyUp.bind( this )
        }

        this.logger     = _parameters.logger
        this.camera     = _parameters.camera
        this.target     = _parameters.target
        this.mode       = _parameters.mode
        this.domElement = _parameters.domElement

        // Set to false to disable controls
        this.enabled = true

        this._paths               = []
        this._trackPath           = false
        this._cameraJump          = 0.1 // = 1 / path.getLength()
        this._currentPathPosition = null
        this._currentPathOffset   = 0
        this._currentPathIndex    = 0
        this._currentPath         = null
        this._maxJump             = 1.0

        this._lockedTarget = true

        // Touches events specific
        this.previousTouches = []

        // Set to false to disable all/specific displacement
        this.canMove   = true
        this.moveSpeed = 1.0

        this.canFront          = true
        this.frontMinimum      = -Infinity
        this.frontMaximum      = -Infinity
        this.frontMinSpeed     = 0.0
        this.frontSpeed        = 1.0
        this.frontMaxSpeed     = Infinity
        this.frontAcceleration = 1.0

        this.canBack          = true
        this.backMinimum      = -Infinity
        this.backMaximum      = -Infinity
        this.backMinSpeed     = 0.0
        this.backSpeed        = 1.0
        this.backMaxSpeed     = Infinity
        this.backAcceleration = 1.0

        this.canUp          = true
        this.upMinimum      = -Infinity
        this.upMaximum      = -Infinity
        this.upMinSpeed     = 0.0
        this.upSpeed        = 1.0
        this.upMaxSpeed     = Infinity
        this.upAcceleration = 1.0

        this.canDown          = true
        this.downMinimum      = -Infinity
        this.downMaximum      = -Infinity
        this.downMinSpeed     = 0.0
        this.downSpeed        = 1.0
        this.downMaxSpeed     = Infinity
        this.downAcceleration = 1.0

        this.canLeft          = true
        this.leftMinimum      = -Infinity
        this.leftMaximum      = -Infinity
        this.leftMinSpeed     = 0.0
        this.leftSpeed        = 1.0
        this.leftMaxSpeed     = Infinity
        this.leftAcceleration = 1.0

        this.canRight          = true
        this.rightMinimum      = -Infinity
        this.rightMaximum      = -Infinity
        this.rightMinSpeed     = 0.0
        this.rightSpeed        = 1.0
        this.rightMaxSpeed     = Infinity
        this.rightAcceleration = 1.0

        this.canRotate = true

        /**
         * How far you can orbit vertically, upper and lower limits.
         * Range is 0 to Math.PI radians.
         * @type {number}
         */
        this.minPolarAngle = 0.001

        /**
         * How far you can orbit horizontally, upper and lower limits.
         * If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
         * @type {number}
         */
        this.maxPolarAngle = ( Math.PI - 0.001 )
        this.minAzimuthAngle    = -Infinity
        this.maxAzimuthAngle    = Infinity
        this.rotateMinSpeed     = 0.0
        this.rotateSpeed        = 1.0
        this.rotateMaxSpeed     = Infinity
        this.rotateAcceleration = 1.0

        this.canPan          = true
        this.panMinimum      = -Infinity
        this.panMaximum      = -Infinity
        this.panMinSpeed     = 0.0
        this.panSpeed        = 0.001
        this.panMaxSpeed     = Infinity
        this.panAcceleration = 1.0

        this.canRoll          = true
        this.rollMinimum      = -Infinity
        this.rollMaximum      = -Infinity
        this.rollMinSpeed     = 0.0
        this.rollSpeed        = 0.1
        this.rollMaxSpeed     = Infinity
        this.rollAcceleration = 1.0

        this.canZoom          = true
        this.zoomMinimum      = 0
        this.zoomMaximum      = Infinity
        this.zoomMinSpeed     = 0.0
        this.zoomSpeed        = 0.001
        this.zoomMaxSpeed     = Infinity
        this.zoomAcceleration = 1.0

        this.canLookAt = true

        // The actions map about input events
        this.actionsMap = {
            front:            [ Keys.Z.value, Keys.UP_ARROW.value ],
            back:             [ Keys.S.value, Keys.DOWN_ARROW.value ],
            up:               [ Keys.A.value, Keys.PAGE_UP.value ],
            down:             [ Keys.E.value, Keys.PAGE_DOWN.value ],
            left:             [ Keys.Q.value, Keys.LEFT_ARROW.value ],
            right:            [ Keys.D.value, Keys.RIGHT_ARROW.value ],
            rotate:           [ Mouse.Left.value ],
            pan:              [ Mouse.Middle.value ],
            roll:             {
                left:  [ Keys.R.value ],
                right: [ Keys.T.value ]
            },
            zoom:             [ Mouse.Wheel.value ],
            lookAtFront:      [ Keys.NUMPAD_2.value ],
            lookAtFrontLeft:  [ Keys.NUMPAD_3.value ],
            lookAtFrontRight: [ Keys.NUMPAD_1.value ],
            lookAtBack:       [ Keys.NUMPAD_8.value ],
            lookAtBackLeft:   [ Keys.NUMPAD_9.value ],
            lookAtBackRight:  [ Keys.NUMPAD_7.value ],
            lookAtUp:         [ Keys.NUMPAD_5.value ],
            lookAtDown:       [ Keys.NUMPAD_0.value ],
            lookAtLeft:       [ Keys.NUMPAD_6.value ],
            lookAtRight:      [ Keys.NUMPAD_4.value ]
        }

        // The current internal state of controller
        this._state = State.None

    }

    /**
     * The camera getter
     * @function module:Controllers/CameraControls~CameraControls#get camera
     * @returns {THREE~Camera}
     */
    get camera () {

        return this._camera

    }

    /**
     * The camera setter
     * @function module:Controllers/CameraControls~CameraControls#set camera
     * @param {THREE~Camera} value
     * @throws Will throw an error if the argument is null.
     */
    set camera ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Camera cannot be null ! Expect an instance of Camera' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Camera cannot be undefined ! Expect an instance of Camera' ) }
        if ( !value.isCamera ) { throw new Error( `Camera cannot be an instance of ${ value.constructor.name }. Expect an instance of Camera.` ) }

        this._camera = value

    }

    /**
     * The target getter
     * @type {THREE~Object3D}
     * @throws {Error} if the argument is null.
     */
    get target () {

        return this._target

    }

    set target ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Target cannot be null ! Expect an instance of Object3D.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Target cannot be undefined ! Expect an instance of Object3D.' ) }
        if ( !value.isObject3D ) { throw new Error( `Target cannot be an instance of ${ value.constructor.name }. Expect an instance of Object3D.` ) }

        this._target = value

    }

    /**
     * @property {module:Controllers/CameraControls#CameraControlMode} mode - The current displacement mode
     * @throws {Error} if the argument is null.
     */
    get mode () {
        return this._mode
    }

    set mode ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Mode cannot be null ! Expect a value from CameraControlMode enum.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Mode cannot be undefined ! Expect a value from CameraControlMode enum.' ) }
        if ( !CameraControlMode.includes( value ) ) { throw new Error( `Mode cannot be an instance of ${ value.constructor.name }. Expect a value from TCameraControlMode enum.` ) }

        this._mode = value

        if ( this._trackPath ) {
            this._initPathDisplacement()
        }

    }

    get paths () {
        return this._paths
    }

    set paths ( value ) {

        this._paths = value

    }

    get trackPath () {
        return this._trackPath
    }

    set trackPath ( value ) {

        if ( isNotBoolean( value ) ) { throw new Error( `Track path cannot be an instance of ${ value.constructor.name }. Expect a boolean.` ) }

        this._trackPath = value

        if ( this._trackPath ) {
            this._initPathDisplacement()
        }

    }

    get domElement () {

        return this._domElement

    }

    set domElement ( value ) {

        if ( isNull( value ) ) { throw new Error( 'DomElement cannot be null ! Expect an instance of HTMLDocument.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'DomElement cannot be undefined ! Expect an instance of HTMLDocument.' ) }
        if ( ![ 'Window',
                'HTMLDocument',
                'HTMLDivElement',
                'HTMLCanvasElement',
                'OffscreenCanvas' ].includes( value.constructor.name ) ) { throw new Error( `DomElement cannot be an instance of ${ value.constructor.name }. Expect an instance of Window, HTMLDocument or HTMLDivElement.` ) }

        // Check focusability of given dom element because in case the element is not focusable
        // the keydown event won't work !

        // Clear previous element
        if ( this._domElement ) {
            this._domElement.removeEventListener( 'mouseenter', this._handlers.onMouseEnter, false )
            this._domElement.removeEventListener( 'mouseleave', this._handlers.onMouseLeave, false )
            this.dispose()
        }

        this._domElement = value
        this._domElement.addEventListener( 'mouseenter', this._handlers.onMouseEnter, false )
        this._domElement.addEventListener( 'mouseleave', this._handlers.onMouseLeave, false )
        this.impose()

    }

    get handlers () {
        return this._handlers
    }

    /**
     * Chainable setter for camera property
     *
     * @param {THREE~Camera} value - The camera to manage
     * @return {module:Controllers/CameraControls~CameraControls} The current instance (this, chainable)
     */
    setCamera ( value ) {

        this.camera = value
        return this

    }

    /**
     * Chainable setter for target property
     *
     * @param {THREE~Object3D} value - The target to use
     * @return {CameraControls} The current instance (this, chainable)
     */
    setTarget ( value ) {

        this.target = value
        return this

    }

    /**
     * Chainable setter for mode property
     *
     * @param {Enum.State} value - The target to use
     * @return {CameraControls} The current instance (this, chainable)
     */
    setMode ( value ) {

        this.mode = value
        return this

    }

    /**
     * Chainable setter for mode
     *
     * @param {State} value - The target to use
     * @throws {BadERROR} a bad error
     * @return {CameraControls} The current instance (this, chainable)
     */
    setPaths ( value ) {

        this.paths = value
        return this

    }

    addPath ( value ) {

        this._paths.push( value )
        return this

    }

    setTrackPath ( value ) {

        this.trackPath = value
        return this

    }

    setDomElement ( value ) {

        this.domElement = value
        return this

    }

    ///////////////

    impose () {

        this._domElement.addEventListener( 'keydown', this._handlers.onKeyDown, false )
        this._domElement.addEventListener( 'keyup', this._handlers.onKeyUp, false )

        this._domElement.addEventListener( 'dblclick', this._handlers.onDblClick, false )
        this._domElement.addEventListener( 'mousedown', this._handlers.onMouseDown, false )
        this._domElement.addEventListener( 'mousemove', this._handlers.onMouseMove, false )
        this._domElement.addEventListener( 'mouseup', this._handlers.onMouseUp, false )
        this._domElement.addEventListener( 'wheel', this._handlers.onMouseWheel, {
            capture: true,
            once:    false,
            passive: false
        } )

        this._domElement.addEventListener( 'touchcancel', this._handlers.onTouchCancel, false )
        this._domElement.addEventListener( 'touchend', this._handlers.onTouchEnd, false )
        this._domElement.addEventListener( 'touchleave', this._handlers.onTouchLeave, false )
        this._domElement.addEventListener( 'touchmove', this._handlers.onTouchMove, {
            capture: true,
            once:    false,
            passive: false
        } )
        this._domElement.addEventListener( 'touchstart', this._handlers.onTouchStart, {
            capture: true,
            once:    false,
            passive: false
        } )

        this.dispatchEvent( { type: 'impose' } )

    }

    dispose () {

        this._domElement.removeEventListener( 'keydown', this._handlers.onKeyDown, false )
        this._domElement.removeEventListener( 'keyup', this._handlers.onKeyUp, false )

        this._domElement.removeEventListener( 'dblclick', this._handlers.onDblClick, false )
        this._domElement.removeEventListener( 'mousedown', this._handlers.onMouseDown, false )
        this._domElement.removeEventListener( 'mousemove', this._handlers.onMouseMove, false )
        this._domElement.removeEventListener( 'mouseup', this._handlers.onMouseUp, false )
        this._domElement.removeEventListener( 'wheel', this._handlers.onMouseWheel, {
            capture: true,
            once:    false,
            passive: false
        } )

        this._domElement.removeEventListener( 'touchcancel', this._handlers.onTouchCancel, false )
        this._domElement.removeEventListener( 'touchend', this._handlers.onTouchEnd, false )
        this._domElement.removeEventListener( 'touchleave', this._handlers.onTouchLeave, false )
        this._domElement.removeEventListener( 'touchmove', this._handlers.onTouchMove, {
            capture: true,
            once:    false,
            passive: false
        } )
        this._domElement.removeEventListener( 'touchstart', this._handlers.onTouchStart, {
            capture: true,
            once:    false,
            passive: false
        } )

        this.dispatchEvent( { type: 'dispose' } )

    }

    update () {

    }

    setCameraPosition ( newCameraPosition ) {

        this._camera.position.copy( newCameraPosition )
        this._camera.lookAt( this._target.position )

        return this

    }

    /**
     * Mon blablabla...
     * @param {external:THREE~Vector3} newTargetPosition - The new target position
     * @return {CameraControls} The current instance (this, chainable)
     */
    setTargetPosition ( newTargetPosition ) {

        this._target.position.copy( newTargetPosition )
        this._camera.lookAt( this._target.position )

        return this

    }

    // Handlers
    _preventEvent ( event ) {
        if ( !event.preventDefault ) { return }

        event.preventDefault()
    }

    _consumeEvent ( event ) {
        if ( !event.cancelable ) { return }
        if ( !event.stopImmediatePropagation ) { return }

        event.stopImmediatePropagation()
    }

    // Keys
    _onKeyDown ( keyEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( keyEvent )

        const actionMap = this.actionsMap
        const key       = keyEvent.keyCode

        //todo
        //        const altActive   = keyEvent.altKey
        //        const ctrlActive  = keyEvent.ctrlKey
        //        const metaActive  = keyEvent.metaKey
        //        const shiftActive = keyEvent.shiftKey

        if ( actionMap.front.includes( key ) ) {

            this._front()
            this._consumeEvent( keyEvent )

        } else if ( actionMap.back.includes( key ) ) {

            this._back()
            this._consumeEvent( keyEvent )

        } else if ( actionMap.up.includes( key ) ) {

            this._up()
            this._consumeEvent( keyEvent )

        } else if ( actionMap.down.includes( key ) ) {

            this._down()
            this._consumeEvent( keyEvent )

        } else if ( actionMap.left.includes( key ) ) {

            this._left()
            this._consumeEvent( keyEvent )

        } else if ( actionMap.right.includes( key ) ) {

            this._right()
            this._consumeEvent( keyEvent )

        } else if ( actionMap.rotate.includes( key ) ) {

            this._rotate( 1.0 )
        } else if ( actionMap.pan.includes( key ) ) {

            this._pan( 1.0 )
            this._consumeEvent( keyEvent )

        } else if ( actionMap.roll.left.includes( key ) ) {

            this._roll( 1.0 )
            this._consumeEvent( keyEvent )

        } else if ( actionMap.roll.right.includes( key ) ) {

            this._roll( -1.0 )
            this._consumeEvent( keyEvent )

        } else if ( actionMap.zoom.includes( key ) ) {

            this._zoom( 1.0 )
            this._consumeEvent( keyEvent )

        } else if ( actionMap.lookAtFront.includes( key ) ) {

            this._lookAt( FRONT )
            this._consumeEvent( keyEvent )

        } else if ( actionMap.lookAtFrontLeft.includes( key ) ) {

            this._lookAt( new Vector3( -1, 0, -1 ).normalize() )
            this._consumeEvent( keyEvent )

        } else if ( actionMap.lookAtFrontRight.includes( key ) ) {

            this._lookAt( new Vector3( 1, 0, -1 ).normalize() )
            this._consumeEvent( keyEvent )

        } else if ( actionMap.lookAtBack.includes( key ) ) {

            this._lookAt( BACK )
            this._consumeEvent( keyEvent )

        } else if ( actionMap.lookAtBackLeft.includes( key ) ) {

            this._lookAt( new Vector3( -1, 0, 1 ).normalize() )
            this._consumeEvent( keyEvent )

        } else if ( actionMap.lookAtBackRight.includes( key ) ) {

            this._lookAt( new Vector3( 1, 0, 1 ).normalize() )
            this._consumeEvent( keyEvent )

        } else if ( actionMap.lookAtUp.includes( key ) ) {

            this._lookAt( UP )
            this._consumeEvent( keyEvent )

        } else if ( actionMap.lookAtDown.includes( key ) ) {

            this._lookAt( DOWN )
            this._consumeEvent( keyEvent )

        } else if ( actionMap.lookAtLeft.includes( key ) ) {

            this._lookAt( LEFT )
            this._consumeEvent( keyEvent )

        } else if ( actionMap.lookAtRight.includes( key ) ) {

            this._lookAt( RIGHT )
            this._consumeEvent( keyEvent )

        } else {
            // Unmapped key, just ignore it ! May be this is for an other controls.
        }

    }

    _onKeyUp ( keyEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( keyEvent )

    }

    // Touches
    _onTouchStart ( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent )

        this.previousTouches = touchEvent.touches

    }

    _onTouchEnd ( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent )

        this.previousTouches = []
        this._state          = State.None

    }

    _onTouchCancel ( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent )

        this.previousTouches = []
        this._state          = State.None

    }

    _onTouchLeave ( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent )

        this.previousTouches = []
        this._state          = State.None

    }

    _onTouchMove ( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent )

        const previousTouches         = this.previousTouches
        const currentTouches          = touchEvent.changedTouches
        const numberOfPreviousTouches = previousTouches.length
        const numberOfCurrentTouches  = currentTouches.length

        if ( numberOfPreviousTouches === 2 && numberOfCurrentTouches === 2 ) {

            const previousTouchA    = new Vector2( previousTouches[ 0 ].clientX, previousTouches[ 0 ].clientY )
            const previousTouchB    = new Vector2( previousTouches[ 1 ].clientX, previousTouches[ 1 ].clientY )
            const previousGap       = previousTouchA.distanceTo( previousTouchB )
            const previousCenter    = new Vector2().addVectors( previousTouchA, previousTouchB ).divideScalar( 2 )
            const previousDirection = new Vector2().subVectors( previousTouchA, previousTouchB ).normalize()

            const currentTouchA    = new Vector2( currentTouches[ 0 ].clientX, currentTouches[ 0 ].clientY )
            const currentTouchB    = new Vector2( currentTouches[ 1 ].clientX, currentTouches[ 1 ].clientY )
            const currentGap       = currentTouchA.distanceTo( currentTouchB )
            const currentCenter    = new Vector2().addVectors( currentTouchA, currentTouchB ).divideScalar( 2 )
            const currentDirection = new Vector2().subVectors( previousTouchA, previousTouchB ).normalize()

            const deltaPan  = new Vector2().subVectors( currentCenter, previousCenter )
            const deltaZoom = currentGap - previousGap
            const deltaRoll = currentDirection.dot( previousDirection )

            this._pan( deltaPan )
            this._zoom( deltaZoom )
            this._roll( deltaRoll )
            this._consumeEvent( touchEvent )

        } else if ( numberOfPreviousTouches === 1 && numberOfCurrentTouches === 1 ) {

            const deltaRotate = new Vector2(
                currentTouches[ 0 ].clientX - previousTouches[ 0 ].clientX,
                currentTouches[ 0 ].clientY - previousTouches[ 0 ].clientY
            ).divideScalar( 10 ) //todo: to high sensibility else !!!

            this._rotate( deltaRotate )
            this._consumeEvent( touchEvent )

        } else {

            this.logger.warn( 'Ignoring inconsistent touches event.' )

        }

        this.previousTouches = currentTouches

    }

    // Mouse
    _onMouseEnter ( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent )

        this.impose()
        if ( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.focus()
        }

    }

    _onMouseLeave ( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent )

        if ( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.blur()
        }
        this.dispose()
        this._state = State.None

    }

    _onMouseDown ( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent )

        const actionMap = this.actionsMap
        const button    = mouseEvent.button

        if ( actionMap.front.includes( button ) ) {

            this._state = State.Moving
            this._front()
            this._consumeEvent( mouseEvent )

        } else if ( actionMap.back.includes( button ) ) {

            this._state = State.Moving
            this._back()
            this._consumeEvent( mouseEvent )

        } else if ( actionMap.up.includes( button ) ) {

            this._state = State.Moving
            this._up()
            this._consumeEvent( mouseEvent )

        } else if ( actionMap.down.includes( button ) ) {

            this._state = State.Moving
            this._down()
            this._consumeEvent( mouseEvent )

        } else if ( actionMap.left.includes( button ) ) {

            this._state = State.Moving
            this._left()
            this._consumeEvent( mouseEvent )

        } else if ( actionMap.right.includes( button ) ) {

            this._state = State.Moving
            this._right()
            this._consumeEvent( mouseEvent )

        } else if ( actionMap.rotate.includes( button ) ) {

            this._state = State.Rotating
            this._consumeEvent( mouseEvent )

        } else if ( actionMap.pan.includes( button ) ) {

            this._state = State.Panning
            this._consumeEvent( mouseEvent )

        } else if ( actionMap.roll.left.includes( button ) ) {

            this._state = State.Rolling
            this._consumeEvent( mouseEvent )

        } else if ( actionMap.roll.right.includes( button ) ) {

            this._state = State.Rolling
            this._consumeEvent( mouseEvent )

        } else if ( actionMap.zoom.includes( button ) ) {

            this._state = State.Zooming
            this._consumeEvent( mouseEvent )

        } else {

            this._state = State.None

        }

    }

    _onMouseMove ( mouseEvent ) {

        if ( !this.enabled || this._state === State.None ) { return }
        this._preventEvent( mouseEvent )

        const state = this._state
        const delta = {
            x: mouseEvent.movementX || mouseEvent.mozMovementX || mouseEvent.webkitMovementX || 0,
            y: mouseEvent.movementY || mouseEvent.mozMovementY || mouseEvent.webkitMovementY || 0
        }

        switch ( state ) {

            case State.Moving:
                break

            case State.Rotating:
                this._rotate( delta )
                this._consumeEvent( mouseEvent )
                break

            case State.Panning:
                this._pan( delta )
                this._consumeEvent( mouseEvent )
                break

            case State.Rolling:
                this._roll( delta )
                this._consumeEvent( mouseEvent )
                break

            case State.Zooming:
                this._zoom( delta )
                this._consumeEvent( mouseEvent )
                break

            default:
                throw new RangeError( `Unknown state: ${ state }` )

        }

    }

    //todo allow other displacement from wheel
    _onMouseWheel ( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent )

        const delta = mouseEvent.wheelDelta || mouseEvent.deltaY
        this._zoom( delta )
        this._consumeEvent( mouseEvent )

    }

    _onMouseUp ( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent )

        this._state = State.None
        this._consumeEvent( mouseEvent )

    }

    _onDblClick ( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent )

        this.logger.warn( 'CameraControls: Double click events is not implemented yet, sorry for the disagreement.' )

    }

    // Positional methods
    _front () {

        if ( !this.canMove || !this.canFront ) { return }

        if ( this._camera.isPerspectiveCamera ) {

            const cameraDirection = FRONT.clone().applyQuaternion( this._camera.quaternion )
            const displacement    = ( this._trackPath ) ? this._getPathDisplacement( cameraDirection ) : cameraDirection.multiplyScalar( this.frontSpeed )

            this._camera.position.add( displacement )
            this._target.position.add( displacement )

        } else if ( this._camera.isOrthographicCamera ) {

            const cameraDirection = FRONT.clone().applyQuaternion( this._camera.quaternion )
            const displacement    = ( this._trackPath ) ? this._getPathDisplacement( cameraDirection ) : cameraDirection.multiplyScalar( this.frontSpeed )

            this._camera.position.add( displacement )
            this._target.position.add( displacement )

            //            const halfOffsetWidth = this.domElement.offsetWidth / 2
            //            const halfOffsetHeight = this.domElement.offsetHeight / 2
            //            this._camera.top -= halfOffsetHeight * this.frontSpeed
            //            this._camera.bottom += halfOffsetHeight * this.frontSpeed
            //            this._camera.right -= halfOffsetWidth * this.frontSpeed
            //            this._camera.left += halfOffsetWidth * this.frontSpeed

            const zoomDisplacement = this.frontSpeed * this.zoomSpeed
            this._camera.zoom += zoomDisplacement

            this._camera.updateProjectionMatrix()

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` )

        }

        this.dispatchEvent( { type: 'move' } )
        this.dispatchEvent( { type: 'change' } )

    }

    /**
     * @method
     * @private
     * @return {void}
     */
    _back () {

        if ( !this.canMove || !this.canBack ) { return }

        if ( this._camera.isPerspectiveCamera ) {

            const cameraDirection = BACK.clone().applyQuaternion( this._camera.quaternion )
            const displacement    = ( this._trackPath ) ? this._getPathDisplacement( cameraDirection ) : cameraDirection.multiplyScalar( this.backSpeed )

            this._camera.position.add( displacement )
            this._target.position.add( displacement )

        } else if ( this._camera.isOrthographicCamera ) {

            const cameraDirection = BACK.clone().applyQuaternion( this._camera.quaternion )
            const displacement    = ( this._trackPath ) ? this._getPathDisplacement( cameraDirection ) : cameraDirection.multiplyScalar( this.backSpeed )

            this._camera.position.add( displacement )
            this._target.position.add( displacement )

            //            const halfOffsetWidth = this.domElement.offsetWidth / 2
            //            const halfOffsetHeight = this.domElement.offsetHeight / 2
            //            this._camera.top += halfOffsetHeight * this.frontSpeed
            //            this._camera.bottom -= halfOffsetHeight * this.frontSpeed
            //            this._camera.right += halfOffsetWidth * this.frontSpeed
            //            this._camera.left -= halfOffsetWidth * this.frontSpeed

            const zoomDisplacement = this.backSpeed * this.zoomSpeed
            if ( this._camera.zoom - zoomDisplacement <= 0.0 ) {
                this._camera.zoom = 0.01
            } else {
                this._camera.zoom -= zoomDisplacement
            }

            this._camera.updateProjectionMatrix()

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` )

        }

        this.dispatchEvent( { type: 'move' } )
        this.dispatchEvent( { type: 'change' } )

    }

    /**
     * @method
     * @private
     * @return {void}
     * @fires module:Controllers/CameraControls~CameraControls#move
     * @fires module:Controllers/CameraControls~CameraControls#change
     */
    _up () {

        if ( !this.canMove || !this.canUp ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const displacement = UP.clone()
                                   .applyQuaternion( this._camera.quaternion )
                                   .multiplyScalar( this.upSpeed )

            this._camera.position.add( displacement )
            this._target.position.add( displacement )

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` )

        }

        this.dispatchEvent( { type: 'move' } )
        this.dispatchEvent( { type: 'change' } )

    }

    /**
     * @method
     * @private
     * @return {void}
     */
    _down () {

        if ( !this.canMove || !this.canDown ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const displacement = DOWN.clone()
                                     .applyQuaternion( this._camera.quaternion )
                                     .multiplyScalar( this.downSpeed )

            this._camera.position.add( displacement )
            this._target.position.add( displacement )

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` )

        }

        this.dispatchEvent( { type: 'move' } )
        this.dispatchEvent( { type: 'change' } )

    }

    /**
     *
     * @private
     * @return {void}
     */
    _left () {

        if ( !this.canMove || !this.canLeft ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const displacement = LEFT.clone()
                                     .applyQuaternion( this._camera.quaternion )
                                     .multiplyScalar( this.leftSpeed )

            this._camera.position.add( displacement )
            this._target.position.add( displacement )

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` )

        }

        this.dispatchEvent( { type: 'move' } )
        this.dispatchEvent( { type: 'change' } )

    }

    _right () {

        if ( !this.canMove || !this.canRight ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const displacement = RIGHT.clone()
                                      .applyQuaternion( this._camera.quaternion )
                                      .multiplyScalar( this.rightSpeed )

            this._camera.position.add( displacement )
            this._target.position.add( displacement )

        } else {

            // Todo: ...

        }

        this.dispatchEvent( { type: 'move' } )
        this.dispatchEvent( { type: 'change' } )

    }

    _rotate ( delta ) {

        if ( !this.canRotate ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const cameraPosition = this._camera.position
            const targetPosition = this._target.position
            const distanceTo     = cameraPosition.distanceTo( targetPosition )
            const targetToCamera = new Vector3().subVectors( cameraPosition, targetPosition ).normalize()
            const rotateSpeed    = this.rotateSpeed

            switch ( this._mode ) {

                case CameraControlMode.FirstPerson: {

                    //        const normalizedX = (delta.x / this._domElement.clientWidth) - 1.0
                    //        const normalizedY = (delta.y / this._domElement.clientHeight) - 1.0
                    const normalizedX = delta.x
                    const normalizedY = delta.y

                    const newTargetPosition = new Vector3( -normalizedX, normalizedY, 0 )
                        .applyQuaternion( this._camera.quaternion )
                        .multiplyScalar( rotateSpeed )
                        .add( targetPosition )

                    // Protect against owl head
                    const cameraToTargetDirection = new Vector3().subVectors( newTargetPosition, cameraPosition ).normalize()
                    const dotProductUp            = UP.clone().dot( cameraToTargetDirection )
                    const dotProductRight         = RIGHT.clone().dot( cameraToTargetDirection )

                    const max = 0.97
                    if ( dotProductUp < -max || dotProductUp > max || dotProductRight < -2 || dotProductRight > 2 ) {
                        return
                    }

                    // Care the target distance will change the sensitivity of mouse move
                    // and
                    // We need to set target at pre-defined distance of camera
                    // because if we use newTargetPosition the distance between
                    // camera and target will increase silently over the time
                    const lockedTargetPostion = cameraToTargetDirection.multiplyScalar( 1.0 ) // Todo: option
                                                                       .add( cameraPosition )
                    this.setTargetPosition( lockedTargetPostion )
                }
                    break

                case CameraControlMode.Orbit: {

                    // restrict theta and phi between desired limits
                    const spherical = new Spherical().setFromVector3( targetToCamera )

                    const newTheta  = spherical.theta + ( degreesToRadians( -delta.x ) * rotateSpeed )
                    const newPhi    = spherical.phi + ( degreesToRadians( -delta.y ) * rotateSpeed )
                    spherical.theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, newTheta ) )
                    spherical.phi   = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, newPhi ) )

                    const newPosition = new Vector3().setFromSpherical( spherical )
                                                     .multiplyScalar( distanceTo )
                                                     .add( targetPosition )

                    this.setCameraPosition( newPosition )
                }
                    break

                default:
                    throw new RangeError( `Unamanaged rotation for camera mode ${ this._mode }` )

            }

        } /*else {

         // Todo: ...

         }*/

        this.dispatchEvent( { type: 'rotate' } )
        this.dispatchEvent( { type: 'change' } )

    }

    _pan ( delta ) {

        if ( !this.canPan ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            // Take into account the distance between the camera and his target
            const cameraPosition = this._camera.position
            const targetPosition = this._target.position
            const distanceTo     = cameraPosition.distanceTo( targetPosition )
            const displacement   = new Vector3( -delta.x, delta.y, 0 ).applyQuaternion( this._camera.quaternion )
                                                                      .multiplyScalar( this.panSpeed * distanceTo )

            this._camera.position.add( displacement )
            this._target.position.add( displacement )

        } else {

            // Todo: ...

        }

        this.dispatchEvent( { type: 'pan' } )
        this.dispatchEvent( { type: 'change' } )

    }

    _roll ( delta ) {

        if ( !this.canRoll ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const cameraPosition = this._camera.position
            const targetPosition = this._target.position
            const targetToCamera = new Vector3().subVectors( cameraPosition, targetPosition ).normalize()
            const angle          = delta * this.rollSpeed

            this._camera.up.applyAxisAngle( targetToCamera, angle )
            this._camera.lookAt( targetPosition )
            //or
            //        this._camera.rotateOnAxis( targetToCamera, angle )

        } else {

            // Todo: ...

        }

        this.dispatchEvent( { type: 'roll' } )
        this.dispatchEvent( { type: 'change' } )

    }

    _zoom ( delta ) {

        if ( !this.canZoom ) { return }

        if ( this._camera.isPerspectiveCamera ) {

            switch ( this._mode ) {

                case CameraControlMode.FirstPerson: {

                    if ( delta > 0 ) {
                        this._camera.fov--
                    } else {
                        this._camera.fov++
                    }

                    this._camera.updateProjectionMatrix()
                }
                    break

                case CameraControlMode.Orbit: {

                    const cameraPosition                 = this._camera.position
                    const targetPosition                 = this._target.position
                    const distanceBetweenCameraAndTarget = cameraPosition.distanceTo( targetPosition )
                    const displacement                   = FRONT.clone()
                                                                .applyQuaternion( this._camera.quaternion )
                                                                .multiplyScalar( delta * this.zoomSpeed * distanceBetweenCameraAndTarget )

                    let cameraNextPosition                   = cameraPosition.clone().add( displacement )
                    const currentCameraToNextCameraDirection = new Vector3().subVectors( cameraNextPosition, cameraPosition ).normalize()
                    const targetToCurrentCameraDirection     = new Vector3().subVectors( cameraPosition, targetPosition ).normalize()
                    const targetToNextCameraDirection        = new Vector3().subVectors( cameraNextPosition, targetPosition ).normalize()
                    const dotCurrentDirection                = currentCameraToNextCameraDirection.dot( targetToCurrentCameraDirection )
                    const dotNextDirection                   = currentCameraToNextCameraDirection.dot( targetToNextCameraDirection )
                    const nextCameraToTargetSquaredDistance  = cameraNextPosition.distanceToSquared( targetPosition )

                    if ( dotCurrentDirection < 0 && ( ( nextCameraToTargetSquaredDistance < ( this.zoomMinimum * this.zoomMinimum ) ) || dotNextDirection > 0 ) ) {

                        cameraNextPosition = targetToCurrentCameraDirection.clone()
                                                                           .multiplyScalar( this.zoomMinimum )
                                                                           .add( targetPosition )

                    }

                    this._camera.position.copy( cameraNextPosition )
                }
                    break

                default:
                    throw new RangeError( `Invalid camera control mode parameter: ${ this._mode }` )

            }

        } else if ( this._camera.isOrthographicCamera ) {

            const containerWidth                 = this.domElement.offsetWidth
            const containerHeight                = this.domElement.offsetHeight
            const aspect                         = containerWidth / containerHeight
            const cameraPosition                 = this._camera.position
            const targetPosition                 = this._target.position
            const distanceBetweenCameraAndTarget = cameraPosition.distanceTo( targetPosition )
            const direction                      = ( delta > 0 ) ? FRONT.clone() : BACK.clone()
            const cameraDirection                = direction.applyQuaternion( this._camera.quaternion ).normalize()
            const displacement                   = cameraDirection.multiplyScalar( this.zoomSpeed * distanceBetweenCameraAndTarget )

            cameraPosition.add( displacement )

            const newDistance = cameraPosition.distanceTo( targetPosition )
            const zoomHeight  = ( newDistance / 2 )
            const zoomWidth   = ( ( newDistance * aspect ) / 2 )

            this._camera.top    = zoomHeight
            this._camera.bottom = -zoomHeight
            this._camera.right  = zoomWidth
            this._camera.left   = -zoomWidth

            this._camera.updateProjectionMatrix()

            // OR

            //            const deltaZoom = this.zoomSpeed * 100
            //            if ( delta > 0 ) {
            //
            //                if ( this._camera.zoom + deltaZoom >= 100.0 ) {
            //                    this._camera.zoom = 100.0
            //                } else {
            //                    this._camera.zoom += deltaZoom
            //                }
            //
            //            } else {
            //
            //                if ( this._camera.zoom - deltaZoom <= 0.0 ) {
            //                    this._camera.zoom = 0.01
            //                } else {
            //                    this._camera.zoom -= deltaZoom
            //                }
            //
            //            }
            //
            //            this._camera.updateProjectionMatrix()

            // OR

            //            const zoomFactor = this.zoomSpeed * 1000
            //            const width      = this._camera.right * 2
            //            const height     = this._camera.top * 2
            //            const aspect     = width / height
            //
            //            const distance                      = this._camera.position.distanceTo( this._target.position )
            //
            //            const zoomHeight = ( delta < 0 ) ? height + zoomFactor : height - zoomFactor
            //            const zoomWidth  = ( delta < 0 ) ? width + ( zoomFactor * aspect ) : width - ( zoomFactor * aspect )
            //
            //            this._camera.top    = ( zoomHeight / 2 )
            //            this._camera.bottom = -( zoomHeight / 2 )
            //            this._camera.right  = ( zoomWidth / 2 )
            //            this._camera.left   = -( zoomWidth / 2 )
            //
            //            this._camera.updateProjectionMatrix()

        }

        this.dispatchEvent( { type: 'zoom' } )
        this.dispatchEvent( { type: 'change' } )

    }

    _lookAt ( direction ) {

        if ( !this.canLookAt ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const _direction     = direction.clone()
            const cameraPosition = this._camera.position
            const targetPosition = this._target.position
            const distanceTo     = cameraPosition.distanceTo( targetPosition )

            switch ( this.mode ) {

                // The result is inverted in front of Orbit type but is correct in FP mode except up and down so invert y axis
                case CameraControlMode.FirstPerson: {
                    _direction.y            = -( _direction.y )
                    const newTargetPosition = _direction.multiplyScalar( distanceTo ).add( cameraPosition )
                    this.setTargetPosition( newTargetPosition )
                }
                    break

                case CameraControlMode.Orbit: {
                    const newCameraPosition = _direction.multiplyScalar( distanceTo ).add( targetPosition )
                    this.setCameraPosition( newCameraPosition )
                }
                    break

                default:
                    throw new RangeError( `Invalid camera control mode parameter: ${ this._mode }` )

            }

        }/* else {

         // Todo: ...

         }*/

        this.dispatchEvent( { type: 'lookAt' } )
        this.dispatchEvent( { type: 'change' } )

    }

    // Helpers
    _initPathDisplacement () {

        //todo: project on closest path position
        //todo: move on path in the FRONT camera direction

        if ( isEmptyArray( this._paths ) ) {
            this.logger.warn( 'Try to init path displacement without any paths' )
            return
        }

        if ( isNotDefined( this._currentPath ) ) {

            this._currentPathIndex  = 0
            this._currentPathOffset = 0
            this._currentPath       = this._paths[ 0 ]

        }

        this._currentPathPosition = this._currentPath.getPointAt( this._currentPathOffset )

        switch ( this._mode ) {

            case CameraControlMode.FirstPerson: {

                if ( this._lockedTarget ) {

                    const displacement = new Vector3().subVectors( this._currentPathPosition, this.camera.position )
                    this._camera.position.add( displacement )
                    this._target.position.add( displacement )

                } else {

                    this.setCameraPosition( this._currentPathPosition )

                }
            }
                break

            case CameraControlMode.Orbit: {

                if ( this._lockedTarget ) {

                    const displacement = new Vector3().subVectors( this._currentPathPosition, this.target.position )
                    this._camera.position.add( displacement )
                    this._target.position.add( displacement )

                } else {

                    this.setTargetPosition( this._currentPathPosition )

                }
            }
                break

            default:
                throw new RangeError( `Invalid camera control _mode parameter: ${ this._mode }` )

        }

    }

    _getPathDisplacement ( cameraDirection ) {

        let displacement = null

        //Todo: add options to move in camera direction or not
        // try a default positive progress on path
        const currentPathPosition = this._currentPathPosition

        const nextPositiveOffset   = this._currentPathOffset + this._cameraJump
        const positiveOffset       = ( nextPositiveOffset < 1 ) ? nextPositiveOffset : 1
        const positivePathPosition = this._currentPath.getPointAt( positiveOffset )
        const positiveDisplacement = new Vector3().subVectors( positivePathPosition, currentPathPosition )
        const positiveDirection    = positiveDisplacement.clone().normalize()
        const positiveDot          = cameraDirection.dot( positiveDirection )

        const nextNegativeOffset   = this._currentPathOffset - this._cameraJump
        const negativeOffset       = ( nextNegativeOffset > 0 ) ? nextNegativeOffset : 0
        const negativePathPosition = this._currentPath.getPointAt( negativeOffset )
        const negativeDisplacement = new Vector3().subVectors( negativePathPosition, currentPathPosition )
        const negativeDirection    = negativeDisplacement.clone().normalize()
        const negativeDot          = cameraDirection.dot( negativeDirection )

        if ( positiveDot === 0 && negativeDot < 0 ) {

            // Search closest path
            const pathExtremityMap = this._getDirectionsMap()

            let indexOfBestPath  = undefined
            let bestDisplacement = undefined
            let bestDotProduct   = -1
            let isFromStart      = undefined
            pathExtremityMap.forEach( ( pathExtremity ) => {

                const pathIndex = pathExtremity.index

                const startDisplacement = pathExtremity.startDisplacement
                if ( startDisplacement ) {

                    const startDirection = startDisplacement.clone().normalize()
                    const startDot       = cameraDirection.dot( startDirection )

                    if ( startDot > bestDotProduct ) {

                        indexOfBestPath  = pathIndex
                        bestDisplacement = startDisplacement
                        bestDotProduct   = startDot
                        isFromStart      = true

                    }

                }

                const endDisplacement = pathExtremity.endDisplacement
                if ( endDisplacement ) {

                    const endDirection = endDisplacement.clone().normalize()
                    const endDot       = cameraDirection.dot( endDirection )

                    if ( endDot > bestDotProduct ) {
                        indexOfBestPath  = pathIndex
                        bestDisplacement = endDisplacement
                        bestDotProduct   = endDot
                        isFromStart      = false
                    }

                }

            } )

            if ( indexOfBestPath !== undefined ) {

                this._currentPathIndex    = indexOfBestPath
                this._currentPath         = this._paths[ this._currentPathIndex ]
                this._currentPathOffset   = ( isFromStart ) ? this._cameraJump : 1 - this._cameraJump
                this._currentPathPosition = this._currentPath.getPointAt( this._currentPathOffset )
                displacement              = bestDisplacement

            } else {

                this.logger.warn( 'Reach path end.' )
                displacement = new Vector3()

            }

        } else if ( positiveDot > 0 && negativeDot <= 0 ) {

            displacement              = positiveDisplacement
            this._currentPathOffset   = positiveOffset
            this._currentPathPosition = positivePathPosition

        } else if ( positiveDot <= 0 && negativeDot > 0 ) {

            displacement              = negativeDisplacement
            this._currentPathOffset   = negativeOffset
            this._currentPathPosition = negativePathPosition

        } else if ( positiveDot < 0 && negativeDot === 0 ) {

            // Search closest path
            const pathExtremityMap = this._getDirectionsMap()

            let indexOfBestPath  = undefined
            let bestDisplacement = undefined
            let bestDotProduct   = -1
            let isFromStart      = undefined
            pathExtremityMap.forEach( ( pathExtremity ) => {

                const pathIndex = pathExtremity.index

                const startDisplacement = pathExtremity.startDisplacement
                if ( startDisplacement ) {

                    const startDirection = startDisplacement.clone().normalize()
                    const startDot       = cameraDirection.dot( startDirection )

                    if ( startDot > bestDotProduct ) {

                        indexOfBestPath  = pathIndex
                        bestDisplacement = startDisplacement
                        bestDotProduct   = startDot
                        isFromStart      = true

                    }

                }

                const endDisplacement = pathExtremity.endDisplacement
                if ( endDisplacement ) {

                    const endDirection = endDisplacement.clone().normalize()
                    const endDot       = cameraDirection.dot( endDirection )

                    if ( endDot > bestDotProduct ) {
                        indexOfBestPath  = pathIndex
                        bestDisplacement = endDisplacement
                        bestDotProduct   = endDot
                        isFromStart      = false
                    }

                }

            } )

            if ( indexOfBestPath !== undefined ) {

                this._currentPathIndex    = indexOfBestPath
                this._currentPath         = this._paths[ this._currentPathIndex ]
                this._currentPathOffset   = ( isFromStart ) ? this._cameraJump : 1 - this._cameraJump
                this._currentPathPosition = this._currentPath.getPointAt( this._currentPathOffset )
                displacement              = bestDisplacement

            } else {

                this.logger.warn( 'Reach path start.' )
                displacement = new Vector3()

            }

        } else if ( ( positiveDot < 0 && negativeDot < 0 ) || ( positiveDot > 0 && negativeDot > 0 ) ) { // Could occurs in high sharp curve with big move step

            if ( positiveDot > negativeDot ) {

                displacement              = positiveDisplacement
                this._currentPathOffset   = positiveOffset
                this._currentPathPosition = positivePathPosition

            } else {

                displacement              = negativeDisplacement
                this._currentPathOffset   = negativeOffset
                this._currentPathPosition = negativePathPosition

            }

        } else {

            this.logger.warn( 'Unable to find correct next path position.' )
            displacement = new Vector3()

        }

        return displacement

    }

    _getDirectionsMap () {

        //todo: use cache !!! Could become a complet map with nodes on path network

        const currentPathPosition = this._currentPathPosition
        const currentIndex        = this._currentPathIndex
        const jump                = this._cameraJump
        const maxDistance         = this._maxJump

        return this._paths.reduce( ( array, path, index ) => {

            if ( index === currentIndex ) { return array }

            const start           = path.getPointAt( 0 )
            const distanceToStart = currentPathPosition.distanceToSquared( start )
            let startDisplacement = undefined
            if ( distanceToStart < maxDistance ) {
                startDisplacement = new Vector3().subVectors( path.getPointAt( jump ), start )
            }

            const end           = path.getPointAt( 1 )
            const distanceToEnd = currentPathPosition.distanceToSquared( end )
            let endDisplacement = undefined
            if ( distanceToEnd < maxDistance ) {
                endDisplacement = new Vector3().subVectors( path.getPointAt( 1 - jump ), end )
            }

            if ( startDisplacement || endDisplacement ) {
                array.push( {
                    index,
                    startDisplacement,
                    endDisplacement
                } )
            }

            return array

        }, [] )

    }

}

export {
    CameraControls,
    CameraControlMode
}

//// Extra work

//
//// t: current time, b: begInnIng value, c: change In value, d: duration
//const ease = {
//    def:              'easeOutQuad',
//    easeInQuad:       function ( x, t, b, c, d ) {
//        return c * (t /= d) * t + b;
//    },
//    easeOutQuad:      function ( x, t, b, c, d ) {
//        return -c * (t /= d) * (t - 2) + b;
//    },
//    easeInOutQuad:    function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t + b;
//        }
//        return -c / 2 * ((--t) * (t - 2) - 1) + b;
//    },
//    easeInCubic:      function ( x, t, b, c, d ) {
//        return c * (t /= d) * t * t + b;
//    },
//    easeOutCubic:     function ( x, t, b, c, d ) {
//        return c * ((t = t / d - 1) * t * t + 1) + b;
//    },
//    easeInOutCubic:   function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t * t + b;
//        }
//        return c / 2 * ((t -= 2) * t * t + 2) + b;
//    },
//    easeInQuart:      function ( x, t, b, c, d ) {
//        return c * (t /= d) * t * t * t + b;
//    },
//    easeOutQuart:     function ( x, t, b, c, d ) {
//        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
//    },
//    easeInOutQuart:   function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t * t * t + b;
//        }
//        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
//    },
//    easeInQuint:      function ( x, t, b, c, d ) {
//        return c * (t /= d) * t * t * t * t + b;
//    },
//    easeOutQuint:     function ( x, t, b, c, d ) {
//        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
//    },
//    easeInOutQuint:   function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t * t * t * t + b;
//        }
//        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
//    },
//    easeInSine:       function ( x, t, b, c, d ) {
//        return -c * Math.cos( t / d * (Math.PI / 2) ) + c + b;
//    },
//    easeOutSine:      function ( x, t, b, c, d ) {
//        return c * Math.sin( t / d * (Math.PI / 2) ) + b;
//    },
//    easeInOutSine:    function ( x, t, b, c, d ) {
//        return -c / 2 * (Math.cos( Math.PI * t / d ) - 1) + b;
//    },
//    easeInExpo:       function ( x, t, b, c, d ) {
//        return (t == 0) ? b : c * Math.pow( 2, 10 * (t / d - 1) ) + b;
//    },
//    easeOutExpo:      function ( x, t, b, c, d ) {
//        return (t == d) ? b + c : c * (-Math.pow( 2, -10 * t / d ) + 1) + b;
//    },
//    easeInOutExpo:    function ( x, t, b, c, d ) {
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( t == d ) {
//            return b + c;
//        }
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * Math.pow( 2, 10 * (t - 1) ) + b;
//        }
//        return c / 2 * (-Math.pow( 2, -10 * --t ) + 2) + b;
//    },
//    easeInCirc:       function ( x, t, b, c, d ) {
//        return -c * (Math.sqrt( 1 - (t /= d) * t ) - 1) + b;
//    },
//    easeOutCirc:      function ( x, t, b, c, d ) {
//        return c * Math.sqrt( 1 - (t = t / d - 1) * t ) + b;
//    },
//    easeInOutCirc:    function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return -c / 2 * (Math.sqrt( 1 - t * t ) - 1) + b;
//        }
//        return c / 2 * (Math.sqrt( 1 - (t -= 2) * t ) + 1) + b;
//    },
//    easeInElastic:    function ( x, t, b, c, d ) {
//        var s = 1.70158;
//        var p = 0;
//        var a = c;
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( (t /= d) == 1 ) {
//            return b + c;
//        }
//        if ( !p ) {
//            p = d * .3;
//        }
//        if ( a < Math.abs( c ) ) {
//            a     = c;
//            var s = p / 4;
//        }
//        else {
//            var s = p / (2 * Math.PI) * Math.asin( c / a );
//        }
//        return -(a * Math.pow( 2, 10 * (t -= 1) ) * Math.sin( (t * d - s) * (2 * Math.PI) / p )) + b;
//    },
//    easeOutElastic:   function ( x, t, b, c, d ) {
//        var s = 1.70158;
//        var p = 0;
//        var a = c;
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( (t /= d) == 1 ) {
//            return b + c;
//        }
//        if ( !p ) {
//            p = d * .3;
//        }
//        if ( a < Math.abs( c ) ) {
//            a     = c;
//            var s = p / 4;
//        }
//        else {
//            var s = p / (2 * Math.PI) * Math.asin( c / a );
//        }
//        return a * Math.pow( 2, -10 * t ) * Math.sin( (t * d - s) * (2 * Math.PI) / p ) + c + b;
//    },
//    easeInOutElastic: function ( x, t, b, c, d ) {
//        var s = 1.70158;
//        var p = 0;
//        var a = c;
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( (t /= d / 2) == 2 ) {
//            return b + c;
//        }
//        if ( !p ) {
//            p = d * (.3 * 1.5);
//        }
//        if ( a < Math.abs( c ) ) {
//            a     = c;
//            var s = p / 4;
//        }
//        else {
//            var s = p / (2 * Math.PI) * Math.asin( c / a );
//        }
//        if ( t < 1 ) {
//            return -.5 * (a * Math.pow( 2, 10 * (t -= 1) ) * Math.sin( (t * d - s) * (2 * Math.PI) / p )) + b;
//        }
//        return a * Math.pow( 2, -10 * (t -= 1) ) * Math.sin( (t * d - s) * (2 * Math.PI) / p ) * .5 + c + b;
//    },
//    easeInBack:       function ( x, t, b, c, d, s ) {
//        if ( s == undefined ) {
//            s = 1.70158;
//        }
//        return c * (t /= d) * t * ((s + 1) * t - s) + b;
//    },
//    easeOutBack:      function ( x, t, b, c, d, s ) {
//        if ( s == undefined ) {
//            s = 1.70158;
//        }
//        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
//    },
//    easeInOutBack:    function ( x, t, b, c, d, s ) {
//        if ( s == undefined ) {
//            s = 1.70158;
//        }
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
//        }
//        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
//    },
//    easeInBounce:     function ( x, t, b, c, d ) {
//        return c - jQuery.easing.easeOutBounce( x, d - t, 0, c, d ) + b;
//    },
//    easeOutBounce:    function ( x, t, b, c, d ) {
//        if ( (t /= d) < (1 / 2.75) ) {
//            return c * (7.5625 * t * t) + b;
//        } else if ( t < (2 / 2.75) ) {
//            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
//        } else if ( t < (2.5 / 2.75) ) {
//            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
//        } else {
//            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
//        }
//    },
//    easeInOutBounce:  function ( x, t, b, c, d ) {
//        if ( t < d / 2 ) {
//            return jQuery.easing.easeInBounce( x, t * 2, 0, c, d ) * .5 + b;
//        }
//        return jQuery.easing.easeOutBounce( x, t * 2 - d, 0, c, d ) * .5 + c * .5 + b;
//    }
//}
//
////const accelerations = {
////    Linear: function( speed ) {
////        return speed + acceleration
////    }
////}
//
//class Movement {
//
//    constructor ( min, max, minSpeed, currentSpeed, maxSpeed, acceleration ) {
//
//        this.bounds   = {
//            min: -Infinity,
//            max: Infinity
//        }
//        this.speed    = {
//            min:     0,
//            current: 1.0,
//            max:     Infinity
//        }
//        this.minSpeed = 0.0
//        this.speed    = 1.0
//        this.maxSpeed = Infinity
//
//        this.acceleration = function ( timer ) {
//            return speed += 0.1
//        }
//
//        this.deceleration = function ( timer, speed ) {
//            return speed -= 0.1
//        }
//    }
//
//}
