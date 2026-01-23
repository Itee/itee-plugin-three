/**
 * @module Controllers/CameraPathController
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @example Todo
 *
 */

// TODO: The path displacement logic need to be implemented under CameraControls

import { Keys }                     from '@itee/client'
import { DefaultLogger as TLogger } from '@itee/core'
import {
    isNull,
    isUndefined
}                                   from '@itee/validators'
import {
    Camera,
    EventDispatcher,
    MOUSE,
    Object3D,
    Quaternion,
    Vector3
}                                   from 'three-full'
import { CameraControlMode }        from './CameraControls.js'

const PI_2    = Math.PI / 2
const STATE   = {
    NONE:   -1,
    ROTATE: 0,
    ZOOM:   1,
    PAN:    2
}
const xVector = /*#__PURE__*/new Vector3( 1, 0, 0 )
const yVector = /*#__PURE__*/new Vector3( 0, 1, 0 )

/**
 *
 * @param camera
 * @param domElement
 * @constructor
 */
function CameraPathController( parameters = {} ) {

    const _parameters = {
        ...{
            camera:     null,
            target:     new Object3D(),
            mode:       CameraControlMode.Orbit,
            domElement: document
        }, ...parameters
    }

    const self = this

    let currentState = STATE.NONE

    this.camera     = _parameters.camera
    this.cameraJump = 0.0

    this.paths               = []
    this.pathsMap            = new Map()
    this.currentPath         = undefined
    this.currentPathIndex    = -1
    this.currentPathPosition = 0

    this.domElement      = _parameters.domElement
    this.forwardControl  = this.domElement.children[ 0 ].children[ 0 ].children[ 0 ]
    this.backwardControl = this.domElement.children[ 0 ].children[ 1 ].children[ 0 ]
    this.timeoutId       = undefined

    // Set to false to disable controls
    this.enabled = false

    // Set to false to disable zooming
    this.enableZoom = true
    this.zoomSpeed  = 1.0

    // Set to false to disable rotating
    this.enableRotate = true
    this.rotateSpeed  = 0.0025

    // Set to false to disable panning
    this.enablePan   = true
    this.keyPanSpeed = 7.0	// pixels moved per arrow key push

    this.verticalOffset = 1.5

    this.keysCodes = {
        forwardKeys:  [ Keys.Z, Keys.UP_ARROW ],
        backwardKeys: [ Keys.S, Keys.BOTTOM_ARROW ]
    }

    // Mouse
    let mouseQuat = {
        x: new Quaternion(),
        y: new Quaternion()
    }

    this.mouseButtons = {
        ORBIT: MOUSE.LEFT,
        ZOOM:  MOUSE.MIDDLE,
        PAN:   MOUSE.RIGHT
    }

    this.orientation = {
        x: 0,
        y: 0
    }

    // Private methods
    function moveForward() {

        self.currentPathPosition += self.cameraJump
        if ( self.currentPathPosition > 1 ) {

            TLogger.log( 'reachEnd' )
            var indexOfNextPath           = self.pathsMap.get( self.currentPathIndex ).indexOfNextPath
            var indexOfNextPathOfNextPath = self.pathsMap.get( indexOfNextPath ).indexOfNextPath

            // If next path of the next path is the current path that means flows are in the same direction
            // so we need to inverse the current path position to 1 to start at the right position
            if ( indexOfNextPathOfNextPath === self.currentPathIndex ) {
                self.currentPathPosition = 1
            } else {
                self.currentPathPosition = 0
            }

            self.currentPathIndex = indexOfNextPath
            self.currentPath      = self.paths[ indexOfNextPath ]

        }

        self.update()
        self.dispatchEvent( { type: 'move' } )

    }

    function moveBackward() {

        self.currentPathPosition -= self.cameraJump
        if ( self.currentPathPosition < 0 ) {

            TLogger.log( 'reachStart' )
            var indexOfPreviousPath               = self.pathsMap.get( self.currentPathIndex ).indexOfPreviousPath
            var indexOfPreviousPathOfPreviousPath = self.pathsMap.get( indexOfPreviousPath ).indexOfPreviousPath

            // If previous path of the previous path is the current path that means flows have the same origin
            // so we need to inverse the current path position to 0 to start at the right position
            if ( indexOfPreviousPathOfPreviousPath === self.currentPathIndex ) {
                self.currentPathPosition = 0
            } else {
                self.currentPathPosition = 1
            }

            self.currentPathIndex = indexOfPreviousPath
            self.currentPath      = self.paths[ indexOfPreviousPath ]

        }

        self.update()
        self.dispatchEvent( { type: 'move' } )

    }

    function rotate( event ) {

        //TLogger.log( 'handleMouseMoveRotate' )

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0

        var orientation = self.orientation
        orientation.y += movementX * self.rotateSpeed
        orientation.x += movementY * self.rotateSpeed
        orientation.x   = Math.max( -PI_2, Math.min( PI_2, orientation.x ) )

        self.update()
        self.dispatchEvent( { type: 'rotate' } )

    }

    // Handlers
    function onKeyDown( event ) {

        if ( self.enabled === false ) {
            return
        }

        var pathCurrentPoint = self.currentPath.getPointAt( self.currentPathPosition )
        var pathNextPoint    = undefined
        var pathDirection    = undefined
        if ( self.currentPathPosition + self.cameraJump > 1 ) { // end of path
            pathNextPoint = self.currentPath.getPointAt( self.currentPathPosition - self.cameraJump )
            pathDirection = pathNextPoint.sub( pathCurrentPoint ).normalize().negate()
        } else {
            pathNextPoint = self.currentPath.getPointAt( self.currentPathPosition + self.cameraJump )
            pathDirection = pathNextPoint.sub( pathCurrentPoint ).normalize()
        }

        var cameraDirection = self.camera.getWorldDirection().normalize()
        var dotProduct      = cameraDirection.dot( pathDirection )

        if ( dotProduct > 0 && self.keysCodes.forwardKeys.includes( event.keyCode ) ) {

            event.preventDefault()
            moveForward()

        } else if ( dotProduct < 0 && self.keysCodes.forwardKeys.includes( event.keyCode ) ) {

            event.preventDefault()
            moveBackward()

        } else if ( dotProduct > 0 && self.keysCodes.backwardKeys.includes( event.keyCode ) ) {

            event.preventDefault()
            moveBackward()

        } else if ( dotProduct < 0 && self.keysCodes.backwardKeys.includes( event.keyCode ) ) {

            event.preventDefault()
            moveForward()

        } else {

            TLogger.warn( `The key event is not implemented for key code: ${ event.keyCode }` )

        }

    }

    function onKeyUp( event ) {

        if ( self.enabled === false ) {
            return
        }

        if ( !self.keysCodes.forwardKeys.includes( event.keyCode ) && !self.keysCodes.backwardKeys.includes( event.keyCode ) ) {
            return
        }

        if ( event ) { event.preventDefault() }

        self.dispatchEvent( { type: 'moveEnd' } )

    }

    function onMouseDown( event ) {

        if ( self.enabled === false ) {
            return
        }

        event.preventDefault()

        if ( self.enableRotate === true && event.button === self.mouseButtons.ORBIT ) {

            currentState = STATE.ROTATE

        } else if ( self.enableZoom === true && event.button === self.mouseButtons.ZOOM ) {

            // state = STATE.DOLLY

        } else if ( self.enablePan === true && event.button === self.mouseButtons.PAN ) {

            // state = STATE.PAN

        }

    }

    function onMouseMove( event ) {

        if ( self.enabled === false ) {
            return
        }

        event.preventDefault()

        if ( currentState === STATE.ROTATE ) {

            rotate( event )

        } else if ( currentState === STATE.DOLLY ) {

            // handleMouseMoveDolly( event )

        } else if ( currentState === STATE.PAN ) {

            // handleMouseMovePan( event )

        }

    }

    function onMouseUp( event ) {

        if ( self.enabled === false ) {
            return
        }

        if ( event ) { event.preventDefault() }

        currentState = STATE.NONE

        self.dispatchEvent( { type: 'rotateEnd' } )

    }

    function onForward( event ) {

        clearTimeout( self.timeoutId )

        event.keyCode = Keys.UP_ARROW
        onKeyDown( event )

        self.timeoutId = setTimeout( onKeyUp.bind( self ), 750 )

    }

    function onBackward( event ) {

        clearTimeout( self.timeoutId )

        event.keyCode = Keys.BOTTOM_ARROW
        onKeyDown( event )

        self.timeoutId = setTimeout( onKeyUp.bind( self ), 750 )

    }

    // Public function that access private methods
    this.update = function () {

        if ( this.enabled === false ) {
            return
        }

        // Update position
        var newPosition        = this.currentPath.getPointAt( this.currentPathPosition )
        this.camera.position.x = newPosition.x
        this.camera.position.y = newPosition.y + this.verticalOffset
        this.camera.position.z = newPosition.z

        // Update rotation
        mouseQuat.x.setFromAxisAngle( xVector, this.orientation.x )
        mouseQuat.y.setFromAxisAngle( yVector, this.orientation.y )
        this.camera.quaternion.copy( mouseQuat.y ).multiply( mouseQuat.x )

    }

    this.dispose = function () {

        this.domElement.removeEventListener( 'mousedown', onMouseDown, false )
        this.domElement.removeEventListener( 'mousemove', onMouseMove, false )
        this.domElement.removeEventListener( 'mouseup', onMouseUp, false )

        window.removeEventListener( 'keydown', onKeyDown, false )
        window.removeEventListener( 'keyup', onKeyUp, false )

    }

    this.domElement.addEventListener( 'mousedown', onMouseDown, false )
    this.domElement.addEventListener( 'mousemove', onMouseMove, false )
    this.domElement.addEventListener( 'mouseup', onMouseUp, false )

    window.addEventListener( 'keydown', onKeyDown, false )
    window.addEventListener( 'keyup', onKeyUp, false )

    this.forwardControl.addEventListener( 'click', onForward, false )
    this.backwardControl.addEventListener( 'click', onBackward, false )

}

Object.assign( CameraPathController.prototype, EventDispatcher.prototype, {

    get camera() {

        return this._camera

    },

    set camera( value ) {

        if ( isNull( value ) ) { throw new Error( 'Camera cannot be null ! Expect an instance of Camera' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Camera cannot be undefined ! Expect an instance of Camera' ) }
        if ( !( value instanceof Camera ) ) { throw new Error( `Camera cannot be an instance of ${ value.constructor.name }. Expect an instance of Camera.` ) }

        this._camera = value

    },

    setCamera( value ) {

        this.camera = value
        return this

    },

    /**
     *
     * @param path
     */
    setPath( path ) {

        this.currentPath = path
        this.cameraJump  = 1 / path.getLength()

    },

    /**
     *
     * @param paths
     * @param nameOfFirstPathToFollow
     */
    setPaths( paths, nameOfFirstPathToFollow ) {

        this.paths            = paths
        this.currentPathIndex = 0

        var pathToFollow = this.paths[ this.currentPathIndex ]

        var numberOfPaths = this.paths.length

        var firstPath      = undefined
        var startFirstPath = undefined
        var endFirstPath   = undefined

        var secondPath      = undefined
        var startSecondPath = undefined
        var endSecondPath   = undefined

        for ( var firstPathIndex = 0 ; firstPathIndex < numberOfPaths ; firstPathIndex++ ) {

            firstPath      = this.paths[ firstPathIndex ]
            startFirstPath = firstPath.getPointAt( 0 )
            endFirstPath   = firstPath.getPointAt( 1 )

            if ( nameOfFirstPathToFollow && firstPath.name === nameOfFirstPathToFollow ) {
                pathToFollow          = firstPath
                this.currentPathIndex = firstPathIndex
            }

            var closestStartDistance    = Infinity
            var closestEndDistance      = Infinity
            var indexOfClosestStartPath = undefined
            var indexOfClosestEndPath   = undefined

            for ( var secondPathIndex = 0 ; secondPathIndex < numberOfPaths ; secondPathIndex++ ) {

                if ( firstPathIndex === secondPathIndex ) {
                    continue
                }

                secondPath      = this.paths[ secondPathIndex ]
                startSecondPath = secondPath.getPointAt( 0 )
                endSecondPath   = secondPath.getPointAt( 1 )

                if ( startFirstPath.distanceTo( startSecondPath ) < closestStartDistance ) {

                    closestStartDistance    = startFirstPath.distanceTo( startSecondPath )
                    indexOfClosestStartPath = secondPathIndex

                }

                if ( startFirstPath.distanceTo( endSecondPath ) < closestStartDistance ) {

                    closestStartDistance    = startFirstPath.distanceTo( endSecondPath )
                    indexOfClosestStartPath = secondPathIndex

                }

                if ( endFirstPath.distanceTo( startSecondPath ) < closestEndDistance ) {

                    closestEndDistance    = endFirstPath.distanceTo( startSecondPath )
                    indexOfClosestEndPath = secondPathIndex

                }

                if ( endFirstPath.distanceTo( endSecondPath ) < closestEndDistance ) {

                    closestEndDistance    = endFirstPath.distanceTo( endSecondPath )
                    indexOfClosestEndPath = secondPathIndex

                }

            }

            this.pathsMap.set( firstPathIndex, {
                indexOfPreviousPath: indexOfClosestStartPath,
                indexOfNextPath:     indexOfClosestEndPath
            } )

        }

        //        TLogger.log( this.pathsMap )

        this.setPath( pathToFollow )

    },

    /**
     *
     * @param quat
     */
    setMouseQuat( quat ) {

        this.orientation.y = Math.asin( quat.y ) * 2
        this.orientation.x = 0

    },

    /**
     *
     */
    getCurrentPathPosition() {

        return this.currentPath.getPointAt( this.currentPathPosition )

    },

    /**
     *
     * @return {undefined}
     */
    getNextPathPosition() {

        var nextPosition = undefined

        if ( this.currentPathPosition + this.cameraJump > 1 ) { // end of path
            nextPosition = this.currentPath.getPointAt( this.currentPathPosition - this.cameraJump ).negate()
        } else {
            nextPosition = this.currentPath.getPointAt( this.currentPathPosition + this.cameraJump )
        }

        return nextPosition

    },

    /**
     *
     * @return {number}
     */
    getDistanceFromStart() {

        //Linear distance
        //		var firstPosition = this.currentPath.getPointAt( 0 )
        //		var currentPosition = this.currentPath.getPointAt( this.currentPathPosition )
        //
        //		return firstPosition.distanceTo( currentPosition )

        // Accordingly to the fact than currentPathPosition is an multiple of cameraJump that is equals to 1 / path.getLength()
        // Todo: need to go the projection to Tronçon
        return this.currentPathPosition * this.currentPath.getLength()

    },

    /**
     *
     */
    lookAtPath() {

        // Set lookup point at the camera height
        var nextPosition = this.getNextPathPosition()
        nextPosition.y   = this.camera.position.y

        this.camera.lookAt( nextPosition )

        // We need to update local orientation else on first move event the camera will return to default position !
        this.setMouseQuat( this.camera.quaternion )

    },

    /**
     *
     * @param position
     */
    goTo( position ) {

        //Todo: Should use 2D instead of 3D !

        var numberOfPoints    = undefined
        var currentPath       = undefined
        var currentPathPoints = undefined
        var closestPointIndex = undefined
        var closestPath       = undefined
        var closestPathIndex  = undefined
        var currentDistance   = undefined
        var closestDistance   = Infinity

        for ( var pathIndex = 0, numberOfPath = this.paths.length ; pathIndex < numberOfPath ; pathIndex++ ) {

            currentPath       = this.paths[ pathIndex ]
            numberOfPoints    = Math.floor( currentPath.getLength() )
            currentPathPoints = currentPath.getSpacedPoints( numberOfPoints )

            for ( var pointIndex = 0 ; pointIndex < numberOfPoints ; pointIndex++ ) {

                currentDistance = position.distanceTo( currentPathPoints[ pointIndex ] )

                if ( currentDistance < closestDistance ) {

                    closestDistance   = currentDistance
                    closestPathIndex  = pathIndex
                    closestPath       = currentPath
                    closestPointIndex = pointIndex

                }

            }

        }

        this.setPath( closestPath )
        this.currentPathIndex    = closestPathIndex
        this.currentPathPosition = this.cameraJump * closestPointIndex

        this.lookAtPath()
        this.update()

        this.dispatchEvent( { type: 'moveEnd' } )
        this.dispatchEvent( { type: 'rotateEnd' } )

    }

} )

export { CameraPathController }
