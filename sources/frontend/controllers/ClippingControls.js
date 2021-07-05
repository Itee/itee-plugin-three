/**
 * @module Controllers/ClippingController
 *
 * @author [Ahmed DCHAR]{@link https://github.com/Dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @example Todo
 *
 */

import {
    Keys,
    Mouse
}                            from 'itee-client'
import { toEnum }            from 'itee-utils'
import {
    isArray,
    isDefined,
    isNotDefined,
    isNull,
    isUndefined
}                            from 'itee-validators'
// Waiting three-shaking fix
import {
    Object3D,
    Raycaster,
    BoxBufferGeometry,
    EdgesGeometry,
    LineBasicMaterial,
    Box3,
    Euler,
    Plane,
    Vector2,
    Vector3,
    LineSegments
} from 'three-full'
import { TranslateGizmo }    from '../objects3d/gizmos/TranslateGizmo'
import { ScaleGizmo }        from '../objects3d/gizmos/ScaleGizmo'

// Basic Geometries
class ClippingBox extends LineSegments {

    constructor () {
        super()

        this.margin = 0.01

        this.geometry         = new EdgesGeometry( new BoxBufferGeometry( 2, 2, 2 ) )
        this.material         = new LineBasicMaterial( {
            color: 0xffffff
        } )
        this.matrixAutoUpdate = false

        // Planes
        this.normalPlanes = {
            normalRightSide:  new Vector3( -1, 0, 0 ),
            normalLeftSide:   new Vector3( 1, 0, 0 ),
            normalFrontSide:  new Vector3( 0, -1, 0 ),
            normalBackSide:   new Vector3( 0, 1, 0 ),
            normalTopSide:    new Vector3( 0, 0, -1 ),
            normalBottomSide: new Vector3( 0, 0, 1 )
        }

        this.planes = {
            rightSidePlane:  new Plane( this.normalPlanes.normalRightSide.clone(), 0 ),
            leftSidePlane:   new Plane( this.normalPlanes.normalLeftSide.clone(), 0 ),
            frontSidePlane:  new Plane( this.normalPlanes.normalFrontSide.clone(), 0 ),
            backSidePlane:   new Plane( this.normalPlanes.normalBackSide.clone(), 0 ),
            topSidePlane:    new Plane( this.normalPlanes.normalTopSide.clone(), 0 ),
            bottomSidePlane: new Plane( this.normalPlanes.normalBottomSide.clone(), 0 )
        }

        this._boundingBox = new Box3()

    }

    getBoundingSphere () {

        this.geometry.computeBoundingSphere()
        this.geometry.boundingSphere.applyMatrix4( this.matrixWorld )

        return this.geometry.boundingSphere

    }

    setColor ( color ) {

        this.material.color.set( color )

    }

    applyClippingTo ( state, objects ) {

        if ( isNotDefined( objects ) ) { return }

        let planes = []
        for ( let i in this.planes ) {
            planes.push( this.planes[ i ] )
        }

        objects.traverse( ( object ) => {

            if ( isNotDefined( object ) ) { return }
            if ( isNotDefined( object.geometry ) ) { return }
            if ( isNotDefined( object.material ) ) { return }

            const materials = isArray( object.material ) ? object.material : [ object.material ]

            for ( let materialIndex = 0, numberOfMaterial = materials.length ; materialIndex < numberOfMaterial ; materialIndex++ ) {
                let material = materials[ materialIndex ]
                if ( !material.clippingPlanes ) {
                    material.clippingPlanes = []
                }
                material.clippingPlanes = ( state ) ? planes : []
            }

        } )

    }

    updateSize ( size ) {

        this.scale.set( size.x, size.y, size.z )

    }

    update () {

        this._boundingBox.setFromObject( this )

        const margin = this.margin
        const min    = this._boundingBox.min
        const max    = this._boundingBox.max

        this.planes.rightSidePlane.constant  = max.x + margin
        this.planes.leftSidePlane.constant   = -min.x + margin
        this.planes.frontSidePlane.constant  = max.y + margin
        this.planes.backSidePlane.constant   = -min.y + margin
        this.planes.topSidePlane.constant    = max.z + margin
        this.planes.bottomSidePlane.constant = -min.z + margin

    }

}

// Controller
const ClippingModes = toEnum( {
    None:      'None',
    Translate: 'Translate',
    Rotate:    'Rotate',
    Scale:     'Scale'
} )

class ClippingControls extends Object3D {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                camera:        null,
                domElement:    window,
                mode:          ClippingModes.None,
                objectsToClip: new Object3D()
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

        this._events = {
            impose:     { type: 'impose' },
            dispose:    { type: 'dispose' },
            change:     { type: 'change' },
            translate:  { type: 'translate' },
            rotate:     { type: 'rotate' },
            scale:      { type: 'scale' },
            mouseEnter: { type: 'mouseEnter' },
            mouseLeave: { type: 'mouseLeave' },
            mouseDown:  { type: 'mouseDown' },
            mouseUp:    { type: 'mouseUp' }
        }

        // Could/Should(?) use the objectsToClip boundingbox if exist ! [only in case we are sure that boundingbox (is/must be) implemented for each object3D.]
        this._objectsToClipBoundingBox = new Box3()
        this._objectsToClipSize        = new Vector3()
        this._objectsToClipCenter      = new Vector3()

        this._clippingBox = new ClippingBox()
        this.add( this._clippingBox )

        this.camera           = _parameters.camera
        this.domElement       = _parameters.domElement
        this.mode             = _parameters.mode
        this.objectsToClip    = _parameters.objectsToClip
        this.translationSnap  = 0.1
        this.scaleSnap        = 0.1
        this.rotationSnap     = 0.1
        this.matrixAutoUpdate = false

        this.enabled = false // Should be true by default

        this.size = 1

        this._dragging          = false
        this._firstPoint        = new Vector3()
        this._secondPoint       = new Vector3()
        this._mouseDisplacement = new Vector3()
        this._offset            = new Vector3()
        this._raycaster         = new Raycaster()
        this._pointerVector     = new Vector2()
        this._directionToMouse  = new Vector3()
        this._cameraPosition    = new Vector3()
        this._cameraDirection   = new Vector3()
        this._worldPosition     = new Vector3()
        this._worldRotation     = new Euler()

        this._gizmos = {
            //            'None':      null,
            'Translate': new TranslateGizmo(),
            'Scale':     new ScaleGizmo()
            //            'Rotate':    new RotateGizmo(),
        }
        for ( let mode in this._gizmos ) {
            this.add( this._gizmos[ mode ] )
        }
        this._currentGizmo  = null
        this._currentHandle = null

        // The actions map about input events
        this.actionsMap = {
            setMode: {
                translate: [ Keys.T.value ],
                rotate:    [ Keys.R.value ],
                scale:     [ Keys.S.value ]
            },
            translate: {
                front: [ Keys.Z.value, Keys.UP_ARROW.value ],
                back:  [ Keys.S.value, Keys.DOWN_ARROW.value ],
                up:    [ Keys.A.value, Keys.PAGE_UP.value ],
                down:  [ Keys.E.value, Keys.PAGE_DOWN.value ],
                left:  [ Keys.Q.value, Keys.LEFT_ARROW.value ],
                right: [ Keys.D.value, Keys.RIGHT_ARROW.value ]
            },
            scale: {
                widthPlus:   [ Keys.LEFT_ARROW.value ],
                widthMinus:  [ Keys.RIGHT_ARROW.value ],
                heightPlus:  [ Keys.PAGE_UP.value ],
                heightMinus: [ Keys.PAGE_DOWN.value ],
                depthPlus:   [ Keys.UP_ARROW.value ],
                depthMinus:  [ Keys.DOWN_ARROW.value ]
            },
            rotate: {
                xAxis: [ Keys.X.value ],
                yAxis: [ Keys.Y.value ],
                zAxis: [ Keys.Z.value ]
            }
        }

    }

    get objectsToClip () {
        return this._objectsToClip
    }

    set objectsToClip ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Objects to clip cannot be null ! Expect an instance of Object3D' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Objects to clip cannot be undefined ! Expect an instance of Object3D' ) }
        if ( !( value instanceof Object3D ) ) { throw new Error( `Objects to clip cannot be an instance of ${ value.constructor.name }. Expect an instance of Object3D.` ) }

        this._objectsToClip = value
        this.updateClipping()

    }

    get camera () {
        return this._camera
    }

    set camera ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Camera cannot be null ! Expect an instance of Camera' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Camera cannot be undefined ! Expect an instance of Camera' ) }
        if ( !value.isCamera && !value.isPerspectiveCamera && !value.isOrthographicCamera ) { throw new Error( `Camera cannot be an instance of ${ value.constructor.name }. Expect an instance of Camera, PerspectiveCamera, or OrthographicCamera.` ) }

        this._camera = value

    }

    get domElement () {
        return this._domElement
    }

    set domElement ( value ) {

        if ( isNull( value ) ) { throw new Error( 'DomElement cannot be null ! Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'DomElement cannot be undefined ! Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.' ) }
        if ( !( ( value instanceof Window ) || ( value instanceof HTMLDocument ) || ( value instanceof HTMLDivElement ) || ( value instanceof HTMLCanvasElement ) ) ) { throw new Error( `Target cannot be an instance of ${ value.constructor.name }. Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.` ) }

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

    get mode () {
        return this._mode
    }

    set mode ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Mode cannot be null ! Expect a value from ClippingModes enum.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Mode cannot be undefined ! Expect a value from ClippingModes enum.' ) }
        //        if ( !( value instanceof ClippingModes ) ) { throw new Error( `Mode cannot be an instance of ${value.constructor.name}. Expect a value from TClippingModes enum.` ) }

        this._mode = value

        // Reset gizmos visibility
        for ( let mode in this._gizmos ) {
            this._gizmos[ mode ].visible = false
        }

        if ( this._mode === ClippingModes.None ) {

            this._currentGizmo = null

        } else {

            this._currentGizmo         = this._gizmos[ this._mode ]
            this._currentGizmo.visible = true

        }

        this.updateGizmo()

    }

    setCamera ( value ) {

        this.camera = value
        return this

    }

    setDomElement ( value ) {

        this.domElement = value
        return this

    }

    setMode ( value ) {

        this.mode = value
        return this

    }

    setObjectsToClip ( objects ) {

        this.objectsToClip = objects
        return this

    }

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

        this.dispatchEvent( this._events.impose )

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

        this.dispatchEvent( this._events.dispose )

    }

    setTranslationSnap ( translationSnap ) {
        this.translationSnap = translationSnap
    }

    setRotationSnap ( rotationSnap ) {
        this.rotationSnap = rotationSnap
    }

    enable () {

        this.visible = true
        this.enabled = true

        // Init size and position
        if ( isDefined( this._objectsToClip ) ) {

            this._objectsToClipBoundingBox.setFromObject( this._objectsToClip )

            this._objectsToClipBoundingBox.getSize( this._objectsToClipSize )
            this._objectsToClipSize.divideScalar( 2 )
            this.scale.set( this._objectsToClipSize.x, this._objectsToClipSize.y, this._objectsToClipSize.z )

            this._objectsToClipBoundingBox.getCenter( this._objectsToClipCenter )
            this.position.set( this._objectsToClipCenter.x, this._objectsToClipCenter.y, this._objectsToClipCenter.z )

            // update...
            this.updateMatrix()
            this.updateMatrixWorld()
        }

        this.updateClipping()
        this.updateGizmo()

    }

    disable () {

        this.visible = false
        this.enabled = false
        this.updateClipping()

    }

    updateClipping () {

        if ( isNotDefined( this._objectsToClip ) ) { return }

        this._clippingBox.update()
        this._clippingBox.applyClippingTo( this.enabled, this._objectsToClip )

    }

    updateGizmo () {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        if ( isNotDefined( this._currentGizmo ) ) { return }

        this._camera.getWorldPosition( this._cameraPosition )
        this._camera.getWorldDirection( this._cameraDirection )
        this._currentGizmo.update( this._cameraPosition, this._cameraDirection )

    }

    /// Handlers
    _consumeEvent ( event ) {

        if ( !event.cancelable ) {
            return
        }

        event.stopImmediatePropagation()

    }

    // Keyboard
    _onKeyDown ( keyEvent ) {

        if ( !this.enabled ) { return }
        keyEvent.preventDefault()

        const actionMap  = this.actionsMap
        const key        = keyEvent.keyCode
        //        const altActive   = keyEvent.altKey
        const ctrlActive = keyEvent.ctrlKey
        //        const metaActive  = keyEvent.metaKey
        //        const shiftActive = keyEvent.shiftKey

        /* if ( altActive ) {

         } else */
        if ( ctrlActive ) {

            switch ( this._mode ) {

                case ClippingModes.Translate:

                    if ( actionMap.translate.front.includes( key ) ) {

                        this._translateZ( this.translationSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.change )

                    } else if ( actionMap.translate.back.includes( key ) ) {

                        this._translateZ( -this.translationSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.change )

                    } else if ( actionMap.translate.right.includes( key ) ) {

                        this._translateX( this.translationSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.change )

                    } else if ( actionMap.translate.left.includes( key ) ) {

                        this._translateX( -this.translationSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.change )

                    } else if ( actionMap.translate.up.includes( key ) ) {

                        this._translateY( this.translationSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.change )

                    } else if ( actionMap.translate.down.includes( key ) ) {

                        this._translateY( -this.translationSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.change )

                    }

                    break

                case ClippingModes.Rotate:

                    break

                case ClippingModes.Scale:

                    if ( actionMap.scale.depthPlus.includes( key ) ) {

                        this._scaleZ( this.scaleSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.change )

                    } else if ( actionMap.scale.depthMinus.includes( key ) ) {

                        this._scaleZ( -this.scaleSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.change )

                    } else if ( actionMap.scale.widthPlus.includes( key ) ) {

                        this._scaleX( this.scaleSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.change )

                    } else if ( actionMap.scale.widthMinus.includes( key ) ) {

                        this._scaleX( -this.scaleSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.change )

                    } else if ( actionMap.scale.heightPlus.includes( key ) ) {

                        this._scaleY( this.scaleSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.change )

                    } else if ( actionMap.scale.heightMinus.includes( key ) ) {

                        this._scaleY( -this.scaleSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.change )

                    }

                    break

                default:
                    break

            }

            //        } else if ( metaActive ) {
            //        } else if ( shiftActive ) {
        } else if ( actionMap.setMode.translate.includes( key ) ) {

            this.setMode( ClippingModes.Translate )
            this.updateClipping()
            this._consumeEvent( keyEvent )

        } else if ( actionMap.setMode.rotate.includes( key ) ) {

            this.setMode( ClippingModes.Rotate )
            this.updateClipping()
            this._consumeEvent( keyEvent )

        } else if ( actionMap.setMode.scale.includes( key ) ) {

            this.setMode( ClippingModes.Scale )
            this.updateClipping()
            this._consumeEvent( keyEvent )

        }

    }

    _onKeyUp ( keyEvent ) {

        if ( !this.enabled || keyEvent.defaultPrevented ) { return }
        keyEvent.preventDefault()

        // Todo...

    }

    // Mouse
    _onDblClick ( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        mouseEvent.preventDefault()

        // Todo...

    }

    _onMouseDown ( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        if ( mouseEvent.button !== Mouse.Left.value ) { return }
        if ( isNotDefined( this._currentHandle ) ) { return }

        mouseEvent.preventDefault()

        this._dragging = true

        // Set the current plane to intersect with mouse
        // Add first reference to mouse position for next usage under mouse move
        const planeIntersect = this.intersectObjects( mouseEvent, [ this._currentGizmo.intersectPlane ] )
        if ( planeIntersect ) {
            this._firstPoint = planeIntersect.point
        }

        this._consumeEvent( mouseEvent )
        this.dispatchEvent( this._events.mouseDown )

    }

    _onMouseEnter ( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        mouseEvent.preventDefault()

        this.impose()
        if ( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.focus()
        }

    }

    _onMouseLeave ( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        mouseEvent.preventDefault()

        this._dragging = false

        if ( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.blur()
        }
        this.dispose()

    }

    _onMouseMove ( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }

        mouseEvent.preventDefault()

        // Check for hovering or not
        if ( this._dragging === false ) {

            // Check mouseIn
            const intersect = this.intersectObjects( mouseEvent, [this._currentGizmo] )
//            const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.children )
//            const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.handles.children )
            if ( intersect ) {

                const handle = intersect.object

                // Check if a previous handle is already selected
                if ( this._currentHandle && handle !== this._currentHandle ) {
                    this._currentHandle.highlight( false )
                    this.dispatchEvent( this._events.mouseLeave )
                }

                this._currentHandle = handle
                this._currentHandle.highlight( true )
                this.dispatchEvent( this._events.mouseEnter )

                this._consumeEvent( mouseEvent )

            } else if ( isDefined( this._currentHandle ) ) {

                this._currentHandle.highlight( false )
                this._currentHandle = null
                this.dispatchEvent( this._events.mouseLeave )

            }

        } else {

            const currentHandle     = this._currentHandle
            const currentHandleName = currentHandle.name

            const planeIntersect = this.intersectObjects( mouseEvent, [ this._currentGizmo.intersectPlane ] )
            if ( planeIntersect ) {

                this._secondPoint = planeIntersect.point

            }

            // Update the mouse displacement in world coordinates
            this._mouseDisplacement.subVectors( this._secondPoint, this._firstPoint )
            this._firstPoint.copy( this._secondPoint )

            // Apply change
            switch ( this._mode ) {

                case ClippingModes.Translate:

                    if ( currentHandleName === 'X' ) {

                        this._offset.set( 1, 0, 0 )

                    } else if ( currentHandleName === 'Y' ) {

                        this._offset.set( 0, 1, 0 )

                    } else if ( currentHandleName === 'Z' ) {

                        this._offset.set( 0, 0, 1 )

                    } else if ( currentHandleName === 'XY' ) {

                        this._offset.set( 1, 1, 0 )

                    } else if ( currentHandleName === 'YZ' ) {

                        this._offset.set( 0, 1, 1 )

                    } else if ( currentHandleName === 'XZ' ) {

                        this._offset.set( 1, 0, 1 )

                    } else if ( currentHandleName === 'XYZ' ) {

                        this._offset.set( 1, 1, 1 )

                    }

                    this._offset.multiply( this._mouseDisplacement )
                    this._translate( this._offset )
                    break

                case ClippingModes.Rotate:
                    /*
                     if ( currentHandle.isRotateHandle ) {

                     } else if ( currentHandle.isPlaneHandle ) {

                     } else if ( currentHandle.isOmnidirectionalHandle ) {

                     }
                     */
                    break

                case ClippingModes.Scale:

                    if ( currentHandle.isScaleHandle ) {

                        this._offset
                            .copy( this._currentHandle.direction )
                            .multiply( this._mouseDisplacement )

                    } else if ( currentHandle.isPlaneHandle ) {

                        const xDot = this._currentHandle.xDirection.dot( this._mouseDisplacement )
                        if ( xDot > 0 ) {
                            this._offset.setX( Math.abs( this._mouseDisplacement.x ) )
                        } else if ( xDot < 0 ) {
                            this._offset.setX( -Math.abs( this._mouseDisplacement.x ) )
                        } else {
                            this._offset.setX( 0 )
                        }

                        const yDot = this._currentHandle.yDirection.dot( this._mouseDisplacement )
                        if ( yDot > 0 ) {
                            this._offset.setY( Math.abs( this._mouseDisplacement.y ) )
                        } else if ( yDot < 0 ) {
                            this._offset.setY( -Math.abs( this._mouseDisplacement.y ) )
                        } else {
                            this._offset.setY( 0 )
                        }

                        const zDot = this._currentHandle.zDirection.dot( this._mouseDisplacement )
                        if ( zDot > 0 ) {
                            this._offset.setZ( Math.abs( this._mouseDisplacement.z ) )
                        } else if ( zDot < 0 ) {
                            this._offset.setZ( -Math.abs( this._mouseDisplacement.z ) )
                        } else {
                            this._offset.setZ( 0 )
                        }

                    } else if ( currentHandle.isOmnidirectionalHandle ) {

                        this.getWorldPosition( this._worldPosition )
                        this._directionToMouse.subVectors( this._firstPoint, this._worldPosition )
                        const worldDot = this._directionToMouse.dot( this._mouseDisplacement )
                        const length   = ( worldDot > 0 ) ? this._mouseDisplacement.length() : -this._mouseDisplacement.length()
                        this._offset.set( length, length, length )

                    }

                    this._scale( this._offset )
                    break

                default:
                    throw new RangeError( `Invalid switch parameter: ${ this._mode }` )

            }

            this.updateClipping()
            this._consumeEvent( mouseEvent )
            this.dispatchEvent( this._events.change )

        }

    }

    _onMouseUp ( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        if ( mouseEvent.button !== Mouse.Left.value ) { return }
        // todo isActive when mouse enter

        mouseEvent.preventDefault()

        this._dragging = false
        this.dispatchEvent( this._events.mouseUp )

        // Check mouseIn
        const intersect = this.intersectObjects( mouseEvent, [this._currentGizmo] )
//        const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.children )
//        const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.handles.children )
        if ( intersect ) {

            this._currentHandle = intersect.object
            this._currentHandle.highlight( true )

            this._consumeEvent( mouseEvent )
            this.dispatchEvent( this._events.mouseEnter )

        } else if ( isDefined( this._currentHandle ) ) {

            this._currentHandle.highlight( false )
            this._currentHandle = null

            this.dispatchEvent( this._events.mouseLeave )

        }

        this.updateGizmo()

    }

    _onMouseWheel ( mouseEvent ) {

        if ( !this.enabled ) { return }
        mouseEvent.preventDefault()

        // Todo...

    }

    // Touche
    _onTouchCancel ( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault()

        // Todo...

    }

    _onTouchEnd ( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault()

        // Todo...

    }

    _onTouchLeave ( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault()

        // Todo...

    }

    _onTouchMove ( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault()

        // Todo...

    }

    _onTouchStart ( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault()

        // Todo...

    }

    /// Utils
    // eslint-disable-next-line no-unused-vars
    getActiveHandle ( pointer ) {

    }

    intersectObjects ( pointer, objects ) {

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        /*
         const mousePositionX  = mouseEvent.layerX || mouseEvent.offsetX || 1
         const mousePositionY  = mouseEvent.layerY || mouseEvent.offsetY || 1
         const containerWidth  = this._domElement.offsetWidth
         const containerHeight = this._domElement.offsetHeight
         const x               = ( mousePositionX / containerWidth ) * 2 - 1
         const y               = -( mousePositionY / containerHeight ) * 2 + 1
         */

        const clientRect = this._domElement.getBoundingClientRect()
        const x          = ( ( ( pointer.clientX - clientRect.left ) / clientRect.width ) * 2 ) - 1
        const y          = ( -( ( pointer.clientY - clientRect.top ) / clientRect.height ) * 2 ) + 1

        this._pointerVector.set( x, y )
        this._raycaster.setFromCamera( this._pointerVector, this._camera )

        const intersections = this._raycaster.intersectObjects( objects, false )
        return intersections[ 0 ] ? intersections[ 0 ] : null

    }

    // Methods

    // Moving
    _translate ( displacement ) {

        this.position.add( displacement )
        this.updateMatrix()

    }

    _translateX ( deltaX ) {

        this.position.setX( this.position.x + deltaX )
        this.updateMatrix()

    }

    _translateY ( deltaY ) {

        this.position.setY( this.position.y + deltaY )
        this.updateMatrix()

    }

    _translateZ ( deltaZ ) {

        this.position.setZ( this.position.z + deltaZ )
        this.updateMatrix()

    }

    _translateXY ( deltaX, deltaY ) {

        this.position.setX( this.position.x + deltaX )
        this.position.setY( this.position.y + deltaY )
        this.updateMatrix()

    }

    _translateXZ ( deltaX, deltaZ ) {

        this.position.setX( this.position.x + deltaX )
        this.position.setZ( this.position.z + deltaZ )
        this.updateMatrix()

    }

    _translateYZ ( deltaY, deltaZ ) {

        this.position.setY( this.position.y + deltaY )
        this.position.setZ( this.position.z + deltaZ )
        this.updateMatrix()

    }

    _translateXYZ ( deltaX, deltaY, deltaZ ) {

        this.position.set( this.position.x + deltaX, this.position.y + deltaY, this.position.z + deltaZ )
        this.updateMatrix()

    }

    // Rotating
    // eslint-disable-next-line no-unused-vars
    _rotateX ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateY ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateZ ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateXY ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateXZ ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateYZ ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateXYZ ( delta ) {}

    // Scaling
    _scale ( changeAmout ) {

        this.scale.add( changeAmout )
        this.updateMatrix()

    }

    _scaleX ( deltaX ) {

        this.scale.setX( this.scale.x + deltaX )
        this.updateMatrix()

    }

    _scaleY ( deltaY ) {

        this.scale.setY( this.scale.y + deltaY )
        this.updateMatrix()

    }

    _scaleZ ( deltaZ ) {

        this.scale.setZ( this.scale.z + deltaZ )
        this.updateMatrix()

    }

    _scaleXY ( deltaX, deltaY ) {

        this.scale.setX( this.scale.x + deltaX )
        this.scale.setY( this.scale.y + deltaY )
        this.updateMatrix()

    }

    _scaleXZ ( deltaX, deltaZ ) {

        this.scale.setX( this.scale.x + deltaX )
        this.scale.setZ( this.scale.z + deltaZ )
        this.updateMatrix()

    }

    _scaleYZ ( deltaY, deltaZ ) {

        this.scale.setY( this.scale.y + deltaY )
        this.scale.setZ( this.scale.z + deltaZ )
        this.updateMatrix()

    }

    _scaleXYZ ( deltaX, deltaY, deltaZ ) {

        this.scale.set( this.scale.x + deltaX, this.scale.y + deltaY, this.scale.z + deltaZ )
        this.updateMatrix()

    }

}

export {
    ClippingBox,
    ClippingControls,
    ClippingModes
}
