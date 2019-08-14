/**
 * @author [Ahmed DCHAR]{@link https://github.com/Dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import {
    Keys,
    Mouse
} from 'itee-client'
import {
    degreesToRadians,
    toEnum
} from 'itee-utils'
import {
    isArray,
    isDefined,
    isNotArray,
    isNotDefined,
    isNull,
    isUndefined
} from 'itee-validators'
import {
    Box3,
    BoxBufferGeometry,
    BufferGeometry,
    Camera,
    ConeBufferGeometry,
    CylinderBufferGeometry,
    DoubleSide,
    EdgesGeometry,
    Euler,
    Float32BufferAttribute,
    Line,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    OctahedronBufferGeometry,
    Plane,
    PlaneBufferGeometry,
    Quaternion,
    Raycaster,
    SphereBufferGeometry,
    TorusBufferGeometry,
    Vector2,
    Vector3
} from 'three-full'

// Basic Geometries

class LineGeometry extends BufferGeometry {

    constructor ( pointA = new Vector3( 0, 0, 0 ), pointB = new Vector3( 1, 0, 0 ) ) {
        super()

        this.type = 'LineGeometry'
        this.addAttribute( 'position', new Float32BufferAttribute( [ pointA.x, pointA.y, pointA.z, pointB.x, pointB.y, pointB.z ], 3 ) )

    }

}

class ClippingBox extends LineSegments {

    constructor () {
        super()

        this.geometry = new EdgesGeometry( new BoxBufferGeometry( 2, 2, 2 ) )
        this.material = new LineBasicMaterial( {
            color: 0xffffff
        } )

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

        const margin = 0.0
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

// Materials

class HighlightableMaterial extends MeshBasicMaterial {

    constructor ( parameters ) {
        super( parameters )
        this.isHighlightableMaterial = true
        //        this.type                    = 'HighlightableMaterial'

        this.depthTest   = false
        this.depthWrite  = false
        this.fog         = false
        this.side        = DoubleSide
        this.transparent = true
        this.oldColor    = this.color.clone()

    }

    highlight ( highlighted ) {

        if ( highlighted ) {

            const lum = 0.35
            const _r  = this.color.r
            const _g  = this.color.g
            const _b  = this.color.b
            const r   = Math.min( Math.max( 0, _r + ( _r * lum ) ), 1.0 )
            const g   = Math.min( Math.max( 0, _g + ( _g * lum ) ), 1.0 )
            const b   = Math.min( Math.max( 0, _b + ( _b * lum ) ), 1.0 )
            this.color.setRGB( r, g, b )

        } else {

            this.color.copy( this.oldColor )

        }

    }

}

class HighlightableLineMaterial extends LineBasicMaterial {

    constructor ( parameters ) {
        super( parameters )
        this.isHighlightableMaterial = true
        //        this.type                    = 'HighlightableLineMaterial'

        this.depthTest   = false
        this.depthWrite  = false
        this.fog         = false
        this.transparent = true
        this.linewidth   = 1
        this.oldColor    = this.color.clone()

    }

    highlight ( highlighted ) {

        if ( highlighted ) {

            const lum = 0.35
            const _r  = this.color.r
            const _g  = this.color.g
            const _b  = this.color.b
            const r   = Math.min( Math.max( 0, _r + ( _r * lum ) ), 1.0 )
            const g   = Math.min( Math.max( 0, _g + ( _g * lum ) ), 1.0 )
            const b   = Math.min( Math.max( 0, _b + ( _b * lum ) ), 1.0 )
            this.color.setRGB( r, g, b )

        } else {

            this.color.copy( this.oldColor )

        }

    }

}

// Pickers

class AbstractHitbox extends Mesh {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new BufferGeometry(),
                material: new MeshBasicMaterial( {
                    visible:    false,
                    depthTest:  false,
                    depthWrite: false,
                    fog:        false,
                    side:       DoubleSide
                    //                    opacity:     0.0,
                    //                    transparent: true
                } )
            }, ...parameters
        }

        super( _parameters.geometry, _parameters.material )
        this.isHitbox = true
        this.type     = 'Hitbox'

    }
}

class CylindricaHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const cylinderGeometry = new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false )
        cylinderGeometry.translate( 0, 0.5, 0 )
        const _parameters = {
            ...{
                geometry: cylinderGeometry
            }, ...parameters
        }

        super( _parameters )
        this.isCylindricaHitbox = true
        this.type               = 'CylindricaHitbox'

    }

}

class PlanarHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const planePositions      = [
            0.0, 0.0, 0.0,
            1.1, 0.0, 0.0,
            1.1, 1.1, 0.0,
            0.0, 1.1, 0.0
        ]
        const planeIndexes        = [
            0, 1, 2,
            2, 3, 0
        ]
        const planeBufferGeometry = new BufferGeometry()
        planeBufferGeometry.addAttribute( 'position', new Float32BufferAttribute( planePositions, 3 ) )
        planeBufferGeometry.setIndex( planeIndexes )

        const _parameters = {
            ...{
                geometry: planeBufferGeometry
            }, ...parameters
        }

        super( _parameters )
        this.isPlanarHitbox = true
        this.type           = 'PlanarHitbox'

    }

}

class LozengeHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        // Lozenge
        const lozengePositions        = [
            0.0, 0.0, 0.0,
            0.85, 0.0, 0.0,
            1.1, 1.1, 0.0,
            0.0, 0.85, 0.0
        ]
        const lozengeIndexes          = [
            0, 1, 2,
            2, 3, 0
        ]
        const positionBufferAttribute = new Float32BufferAttribute( lozengePositions, 3 )
        const lozengeBufferGeometry   = new BufferGeometry()
        lozengeBufferGeometry.addAttribute( 'position', positionBufferAttribute )
        lozengeBufferGeometry.setIndex( lozengeIndexes )

        const _parameters = {
            ...{
                geometry: lozengeBufferGeometry
            }, ...parameters
        }

        super( _parameters )
        this.isPlanarHitbox = true
        this.type           = 'PlanarHitbox'

    }

}

class OctahedricalHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new OctahedronBufferGeometry( 1.2, 0 )
            }, ...parameters
        }

        super( _parameters )
        this.isOctahedricalHitbox = true
        this.type                 = 'OctahedricalHitbox'

    }

}

class SphericalHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new SphereBufferGeometry( 1, 8, 6, 0, 2 * Math.PI, 0, Math.PI )
            }, ...parameters
        }

        super( _parameters )
        this.isSphericalHitbox = true
        this.type              = 'SphericalHitbox'

    }

}

class TorusHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI )
            }, ...parameters
        }

        super( _parameters )
        this.isTorusHitbox = true
        this.type          = 'TorusHitbox'

    }

}

// Handles
class AbstractHandle extends Object3D {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                color:  0xffffff,
                hitbox: null
            }, ...parameters
        }

        super()
        this.isHandle = true
        this.type     = 'Handle'

        this.color  = _parameters.color
        this.hitbox = _parameters.hitbox

        this.baseQuaternion = new Quaternion()

    }

    get color () {

        return this.line.material.color.clone()

    }

    set color ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Color cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Color cannot be undefined ! Expect an instance of Color.' ) }
        //        if ( !( value instanceof Color ) ) { throw new Error( `Color cannot be an instance of ${value.constructor.name}. Expect an instance of Color.` ) }

        this.traverse( ( child ) => {

            let materials = child.material
            if ( !materials ) { return }

            materials.color.setHex( value )

        } )

    }

    get hitbox () {
        return this._hitbox
    }

    set hitbox ( value ) {
        this._hitbox = value
        this.add( value )
    }

    setColor ( value ) {

        this.color = value
        return this

    }

    setHitbox ( value ) {
        this.hitbox = value
        return this
    }

    setScale ( x, y, z ) {

        this.scale.set( x, y, z )
        return this

    }

    setPosition ( x, y, z ) {
        this.position.set( x, y, z )
        return this
    }

    highlight ( value ) {

        for ( let childIndex = 0, numberOfChildren = this.children.length ; childIndex < numberOfChildren ; childIndex++ ) {
            const child = this.children[ childIndex ]
            if ( child.isHitbox ) { continue }

            const childMaterial = child.material
            if ( isUndefined( childMaterial ) || !childMaterial.isHighlightableMaterial ) { continue }

            childMaterial.highlight( value )
        }

    }

    raycast ( raycaster, intersects ) {

        const intersections = raycaster.intersectObject( this._hitbox, false )
        if ( intersections.length > 0 ) {
            intersects.push( {
                distance: intersections[ 0 ].distance,
                object:   this
            } )
        }

    }

    setRotationFromAxisAndAngle ( axis, angle ) {

        this.quaternion.setFromAxisAngle( axis, angle )
        this.baseQuaternion.copy( this.quaternion )
        return this

    }

    // eslint-disable-next-line no-unused-vars
    update ( cameraDirection ) {}

}

class TranslateHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                color:     0xffffff,
                hitbox:    new CylindricaHitbox(),
                direction: new Vector3( 0, 1, 0 )
            }, ...parameters
        }

        super( _parameters )
        this.isTranslateHandle = true
        this.type              = 'TranslateHandle'

        const lineGeometry = new LineGeometry( new Vector3( 0, 0, 0 ), new Vector3( 0, 0.8, 0 ) )
        const lineMaterial = new HighlightableLineMaterial( { color: _parameters.color } )
        const line         = new Line( lineGeometry, lineMaterial )
        this.add( line )

        const coneGeometry = new ConeBufferGeometry( 0.05, 0.2, 12, 1, false )
        coneGeometry.translate( 0, 0.9, 0 )
        const coneMaterial = new HighlightableMaterial( { color: _parameters.color } )
        const cone         = new Mesh( coneGeometry, coneMaterial )
        this.add( cone )

        this.direction = _parameters.direction

    }

    get direction () {

        return this._direction

    }

    set direction ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
        if ( !( value instanceof Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${value.constructor.name}. Expect an instance of Vector3.` ) }

        this._direction = value

        if ( value.y > 0.99999 ) {

            this.quaternion.set( 0, 0, 0, 1 )

        } else if ( value.y < -0.99999 ) {

            this.quaternion.set( 1, 0, 0, 0 )

        } else {

            const axis    = new Vector3( value.z, 0, -value.x ).normalize()
            const radians = Math.acos( value.y )

            this.quaternion.setFromAxisAngle( axis, radians )

        }

    }

    update ( cameraDirection ) {

        super.update( cameraDirection )

        const dotProduct = this._direction.dot( cameraDirection )
        if ( dotProduct >= 0 ) {
            this.flipDirection()
        }

    }

    setDirection ( direction ) {

        this.direction = direction
        return this

    }

    flipDirection () {

        this.direction = this._direction.negate()

    }

}

class ScaleHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                color:     0xffffff,
                hitbox:    new CylindricaHitbox(),
                direction: new Vector3( 0, 1, 0 )
            }, ...parameters
        }

        super( _parameters )
        this.isScaleHandle = true
        this.type          = 'ScaleHandle'

        const lineGeometry = new LineGeometry( new Vector3( 0, 0, 0 ), new Vector3( 0, 0.88, 0 ) )
        const lineMaterial = new HighlightableLineMaterial( { color: _parameters.color } )
        const line         = new Line( lineGeometry, lineMaterial )
        this.add( line )

        const boxGeometry = new BoxBufferGeometry( 0.12, 0.12, 0.12 )
        boxGeometry.translate( 0, 0.94, 0 )
        const boxMaterial = new HighlightableMaterial( { color: _parameters.color } )
        const box         = new Mesh( boxGeometry, boxMaterial )
        this.add( box )

        this.direction = _parameters.direction

    }

    get direction () {

        return this._direction

    }

    set direction ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
        if ( !( value instanceof Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${value.constructor.name}. Expect an instance of Vector3.` ) }

        this._direction = value

        if ( value.y > 0.99999 ) {

            this.quaternion.set( 0, 0, 0, 1 )

        } else if ( value.y < -0.99999 ) {

            this.quaternion.set( 1, 0, 0, 0 )

        } else {

            const axis    = new Vector3( value.z, 0, -value.x ).normalize()
            const radians = Math.acos( value.y )

            this.quaternion.setFromAxisAngle( axis, radians )

        }

    }

    update ( cameraDirection ) {

        super.update( cameraDirection )

        const dotProduct = this._direction.dot( cameraDirection )
        if ( dotProduct >= 0 ) {
            this.flipDirection()
        }

    }

    setDirection ( direction ) {

        this.direction = direction
        return this

    }

    flipDirection () {

        this.direction = this._direction.negate()

    }

}

class RotateHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{}, ...parameters
        }

        super( _parameters )
        this.isRotateHandle = true
        this.type           = 'RotateHandle'

    }

    update ( cameraDirection ) {
        super.update( cameraDirection )
    }

}

class PlaneHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                color:     0xffffff,
                hitbox:    new PlanarHitbox(),
                direction: new Vector3( 0, 1, 0 )
            }, ...parameters
        }

        super( _parameters )
        this.isPlaneHandle = true
        this.type          = 'PlaneHandle'

        // Edge line
        const lineBufferGeometry = new BufferGeometry()
        lineBufferGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0.75, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.75, 0.0 ], 3 ) )

        const lineMaterial = new HighlightableLineMaterial( {
            color: _parameters.color
        } )

        const line = new Line( lineBufferGeometry, lineMaterial )
        this.add( line )

        // Plane
        const planePositions      = [
            0.1, 0.1, 0.0,
            1.0, 0.1, 0.0,
            1.0, 1.0, 0.0,
            0.1, 1.0, 0.0
        ]
        const planeIndexes        = [
            0, 1, 2,
            2, 3, 0
        ]
        const planeBufferGeometry = new BufferGeometry()
        planeBufferGeometry.addAttribute( 'position', new Float32BufferAttribute( planePositions, 3 ) )
        planeBufferGeometry.setIndex( planeIndexes )

        const planeMaterial = new HighlightableMaterial( {
            color:       _parameters.color,
            transparent: true,
            opacity:     0.35
        } )
        const plane         = new Mesh( planeBufferGeometry, planeMaterial )
        this.add( plane )

        this.xAxis = new Vector3( 1, 0, 0 )
        this.yAxis = new Vector3( 0, 1, 0 )
        this.zAxis = new Vector3( 0, 0, 1 )

        this.xDirection = new Vector3( _parameters.direction.x, 0, 0 )
        this.yDirection = new Vector3( 0, _parameters.direction.y, 0 )
        this.zDirection = new Vector3( 0, 0, _parameters.direction.z )
        this.direction  = _parameters.direction

    }

    get direction () {

        return this._direction

    }

    set direction ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
        if ( !( value instanceof Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${value.constructor.name}. Expect an instance of Vector3.` ) }

        this._direction = value

    }

    update ( cameraDirection ) {

        super.update( cameraDirection )

        // Decompose direction by main orientation
        const xDirection = new Vector3( this._direction.x, 0, 0 )
        const yDirection = new Vector3( 0, this._direction.y, 0 )
        const zDirection = new Vector3( 0, 0, this._direction.z )
        const xDot       = xDirection.dot( cameraDirection )
        const yDot       = yDirection.dot( cameraDirection )
        const zDot       = zDirection.dot( cameraDirection )

        this.quaternion.copy( this.baseQuaternion )

        // XY Plane
        if ( xDot > 0 && yDot > 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) )
            this.xDirection.setX( -1 )
            this.yDirection.setY( -1 )
            this.zDirection.setZ( 0 )

        } else if ( xDot > 0 && yDot < 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) )
            this.xDirection.setX( -1 )
            this.yDirection.setY( 1 )
            this.zDirection.setZ( 0 )

        } else if ( xDot < 0 && yDot > 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) )
            this.xDirection.setX( 1 )
            this.yDirection.setY( -1 )
            this.zDirection.setZ( 0 )

        } else if ( xDot < 0 && yDot < 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) )
            this.xDirection.setX( 1 )
            this.yDirection.setY( 1 )
            this.zDirection.setZ( 0 )

        }

        // XZ Plane
        else if ( xDot > 0 && yDot === 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) )
            this.xDirection.setX( -1 )
            this.yDirection.setY( 0 )
            this.zDirection.setZ( -1 )

        } else if ( xDot > 0 && yDot === 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) )
            this.xDirection.setX( -1 )
            this.yDirection.setY( 0 )
            this.zDirection.setZ( 1 )

        } else if ( xDot < 0 && yDot === 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) )
            this.xDirection.setX( 1 )
            this.yDirection.setY( 0 )
            this.zDirection.setZ( -1 )

        } else if ( xDot < 0 && yDot === 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) )
            this.xDirection.setX( 1 )
            this.yDirection.setY( 0 )
            this.zDirection.setZ( 1 )

        }

        // YZ Plane
        else if ( xDot === 0 && yDot > 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) )
            this.xDirection.setX( 0 )
            this.yDirection.setY( -1 )
            this.zDirection.setZ( -1 )

        } else if ( xDot === 0 && yDot > 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) )
            this.xDirection.setX( 0 )
            this.yDirection.setY( -1 )
            this.zDirection.setZ( 1 )

        } else if ( xDot === 0 && yDot < 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) )
            this.xDirection.setX( 0 )
            this.yDirection.setY( 1 )
            this.zDirection.setZ( -1 )

        } else if ( xDot === 0 && yDot < 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) )
            this.xDirection.setX( 0 )
            this.yDirection.setY( 1 )
            this.zDirection.setZ( 1 )

        }

    }

    setDirection ( direction ) {

        this.direction = direction
        return this

    }

    flipXDirection () {

        this.xDirection.setX( -this.xDirection.x )

    }

    flipYDirection () {

        this.yDirection.setY( -this.yDirection.y )

    }

    flipZDirection () {

        this.zDirection.setZ( -this.zDirection.z )

    }

}

class LozengeHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                color:     0xffffff,
                hitbox:    new LozengeHitbox(),
                direction: new Vector3( 1, 1, 0 )
            }, ...parameters
        }

        super( _parameters )
        this.isPlaneHandle = true
        this.type          = 'PlaneHandle'

        // Edge line
        const lineBufferGeometry = new BufferGeometry()
        lineBufferGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0.1, 0.75, 0.0, 1.0, 1.0, 0.0, 0.75, 0.1, 0.0 ], 3 ) )

        const lineMaterial = new HighlightableLineMaterial( {
            color: _parameters.color
        } )

        const line = new Line( lineBufferGeometry, lineMaterial )
        this.add( line )

        // Lozenge
        const lozengePositions      = [
            0.1, 0.1, 0.0,
            0.75, 0.1, 0.0,
            1.0, 1.0, 0.0,
            0.1, 0.75, 0.0
        ]
        const lozengeIndexes        = [
            0, 1, 2,
            2, 3, 0
        ]
        const lozengeBufferGeometry = new BufferGeometry()
        lozengeBufferGeometry.addAttribute( 'position', new Float32BufferAttribute( lozengePositions, 3 ) )
        lozengeBufferGeometry.setIndex( lozengeIndexes )

        const lozengeMaterial = new HighlightableMaterial( {
            color:       _parameters.color,
            transparent: true,
            opacity:     0.35
        } )
        const lozenge         = new Mesh( lozengeBufferGeometry, lozengeMaterial )
        this.add( lozenge )

        this.direction  = _parameters.direction
        this.xDirection = new Vector3( _parameters.direction.x, 0, 0 )
        this.yDirection = new Vector3( 0, _parameters.direction.y, 0 )
        this.zDirection = new Vector3( 0, 0, _parameters.direction.z )
        this.xAxis      = new Vector3( 1, 0, 0 )
        this.yAxis      = new Vector3( 0, 1, 0 )
        this.zAxis      = new Vector3( 0, 0, 1 )
    }

    get direction () {

        return this._direction

    }

    set direction ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
        if ( !( value instanceof Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${value.constructor.name}. Expect an instance of Vector3.` ) }

        this._direction = value

    }

    update ( cameraDirection ) {

        super.update( cameraDirection )

        const xDot = this.xDirection.dot( cameraDirection )
        const yDot = this.yDirection.dot( cameraDirection )
        const zDot = this.zDirection.dot( cameraDirection )

        this.quaternion.copy( this.baseQuaternion )

        // XY Plane
        if ( xDot > 0 && yDot > 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) )

        } else if ( xDot > 0 && yDot < 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) )

        } else if ( xDot < 0 && yDot > 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) )

        } else if ( xDot < 0 && yDot < 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) )

        }

        // XZ Plane
        else if ( xDot > 0 && yDot === 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) )

        } else if ( xDot > 0 && yDot === 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) )

        } else if ( xDot < 0 && yDot === 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) )

        } else if ( xDot < 0 && yDot === 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) )

        }

        // YZ Plane
        else if ( xDot === 0 && yDot > 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) )

        } else if ( xDot === 0 && yDot > 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) )

        } else if ( xDot === 0 && yDot < 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) )

        } else if ( xDot === 0 && yDot < 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) )

        }

    }

    setDirection ( direction ) {

        this.direction = direction
        return this

    }

    flipXAxis () {

        const tempDirection = this._direction.clone()
        tempDirection.x     = -tempDirection.x

        this.direction = tempDirection

    }

    flipYAxis () {

        const tempDirection = this._direction.clone()
        tempDirection.y     = -tempDirection.y

        this.direction = tempDirection

    }

    flipZAxis () {

        const tempDirection = this._direction.clone()
        tempDirection.z     = -tempDirection.z

        this.direction = tempDirection

    }

}

class OctahedricalHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                color:  0xffffff,
                hitbox: new OctahedricalHitbox()
            }, ...parameters
        }

        super( _parameters )
        this.isOmnidirectionalHandle = true
        this.type                    = 'OmnidirectionalHandle'

        const octahedronGeometry = new OctahedronBufferGeometry( 1, 0 )
        const octahedronMaterial = new HighlightableMaterial( {
            color:       _parameters.color,
            transparent: true,
            opacity:     0.55
        } )
        const octahedron         = new Mesh( octahedronGeometry, octahedronMaterial )
        this.add( octahedron )

        const edgesGeometry = new EdgesGeometry( octahedronGeometry )
        const edgesMaterial = new HighlightableLineMaterial( {
            color:     _parameters.color,
            linewidth: 4
        } )
        const edges         = new LineSegments( edgesGeometry, edgesMaterial )
        this.add( edges )

    }

    update ( cameraDirection ) {
        super.update( cameraDirection )
    }

}

// Gizmos

class AbstractGizmo extends Object3D {

    constructor () {

        super()
        this.isGizmo = true
        this.type    = 'AbstractGizmo'

    }

    init () {

        this.handles = new Object3D()

        this.add( this.handles )

        //// PLANES
        const planeGeometry = new PlaneBufferGeometry( 50, 50, 2, 2 )
        const planeMaterial = new MeshBasicMaterial( {
            side:    DoubleSide,
            visible: false
            //            transparent: true,
            //            opacity:     0.1
        } )
        this.intersectPlane = new Mesh( planeGeometry, planeMaterial )
        this.add( this.intersectPlane )

        //// HANDLES

        const setupGizmos = ( gizmoMap, parent ) => {

            for ( let name in gizmoMap ) {

                const element = gizmoMap[ name ]
                if ( isNotArray( element ) ) {

                    element.name        = name
                    element.renderOrder = Infinity

                    parent.add( element )

                } else {

                    for ( let i = element.length ; i-- ; ) {

                        const object   = gizmoMap[ name ][ i ][ 0 ]
                        const position = gizmoMap[ name ][ i ][ 1 ]
                        const rotation = gizmoMap[ name ][ i ][ 2 ]
                        const scale    = gizmoMap[ name ][ i ][ 3 ]
                        const tag      = gizmoMap[ name ][ i ][ 4 ]

                        // name and tag properties are essential for picking and updating logic.
                        object.name = name
                        object.tag  = tag

                        // avoid being hidden by other transparent objects
                        object.renderOrder = Infinity

                        if ( position ) {
                            object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] )
                        }
                        if ( rotation ) {
                            object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] )
                        }
                        if ( scale ) {
                            object.scale.set( scale[ 0 ], scale[ 1 ], scale[ 2 ] )
                        }

                        object.updateMatrix()

                        const tempGeometry = object.geometry.clone()
                        tempGeometry.applyMatrix( object.matrix )
                        object.geometry = tempGeometry

                        object.position.set( 0, 0, 0 )
                        object.rotation.set( 0, 0, 0 )
                        object.scale.set( 1, 1, 1 )

                        parent.add( object )

                    }

                }

            }

        }

        setupGizmos( this.handleGizmos, this.handles )

    }

    highlight ( axis ) {

        // Reset highlight for all of them
        for ( let key in this.handleGizmos ) {
            this.handleGizmos[ key ].highlight( false )
        }

        // Highlight the picked (if exist)
        const currentHandle = this.handleGizmos[ axis ]
        if ( currentHandle ) {
            currentHandle.highlight( true )
        }

    }

    update ( cameraPosition, cameraDirection ) {

        this.traverse( ( child ) => {

            if ( !child.isHandle ) { return }

            child.update( cameraDirection )

        } )

        this.updateIntersectPlane( cameraPosition )

    }

    updateIntersectPlane ( cameraPosition ) {

        this.intersectPlane.lookAt( cameraPosition )

    }

}

class TranslateGizmo extends AbstractGizmo {

    constructor () {

        super()
        this.isTranslateGizmo = true
        this.type             = 'TranslateGizmo'

        this.handleGizmos = {

            X: new TranslateHandle( {
                color:     0xaa0000,
                direction: new Vector3( 1, 0, 0 )
            } ),

            Y: new TranslateHandle( {
                color:     0x00aa00,
                direction: new Vector3( 0, 1, 0 )
            } ),

            Z: new TranslateHandle( {
                color:     0x0000aa,
                direction: new Vector3( 0, 0, 1 )
            } ),

            XY: new LozengeHandle( {
                color:     0xaaaa00,
                direction: new Vector3( 1, 1, 0 )
            } ).setScale( 0.33, 0.33, 1.0 ),

            YZ: new LozengeHandle( {
                color:     0x00aaaa,
                direction: new Vector3( 0, 1, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3( 0, 1, 0 ), degreesToRadians( -90 ) ),

            XZ: new LozengeHandle( {
                color:     0xaa00aa,
                direction: new Vector3( 1, 0, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3( 1, 0, 0 ), degreesToRadians( 90 ) ),

            XYZ: new OctahedricalHandle( {
                color: 0xaaaaaa
            } ).setScale( 0.15, 0.15, 0.15 )

        }

        this.init()

    }

}

class RotateGizmo extends AbstractGizmo {

    constructor () {

        super()
        this.isRotateGizmo = true
        this.type          = 'RotateGizmo'

        const CircleGeometry = ( radius, facing, arc ) => {

            const geometry = new BufferGeometry()
            let vertices   = []
            arc            = arc ? arc : 1

            for ( let i = 0 ; i <= 64 * arc ; ++i ) {

                if ( facing === 'x' ) {
                    vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius )
                }
                if ( facing === 'y' ) {
                    vertices.push( Math.cos( i / 32 * Math.PI ) * radius, 0, Math.sin( i / 32 * Math.PI ) * radius )
                }
                if ( facing === 'z' ) {
                    vertices.push( Math.sin( i / 32 * Math.PI ) * radius, Math.cos( i / 32 * Math.PI ) * radius, 0 )
                }

            }

            geometry.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) )
            return geometry

        }

        this.handleGizmos = {

            X: [
                [ new Line( new CircleGeometry( 1, 'x', 0.5 ), new HighlightableLineMaterial( { color: 0xff0000 } ) ) ],
                [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), new HighlightableMaterial( { color: 0xff0000 } ) ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ] ]
            ],

            Y: [
                [ new Line( new CircleGeometry( 1, 'y', 0.5 ), new HighlightableLineMaterial( { color: 0x00ff00 } ) ) ],
                [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), new HighlightableMaterial( { color: 0x00ff00 } ) ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ] ]
            ],

            Z: [
                [ new Line( new CircleGeometry( 1, 'z', 0.5 ), new HighlightableLineMaterial( { color: 0x0000ff } ) ) ],
                [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), new HighlightableMaterial( { color: 0x0000ff } ) ), [ 0.99, 0, 0 ], null, [ 1, 3, 1 ] ]
            ],

            E: [
                [ new Line( new CircleGeometry( 1.25, 'z', 1 ), new HighlightableLineMaterial( { color: 0xcccc00 } ) ) ]
            ],

            XYZ: [
                [ new Line( new CircleGeometry( 1, 'z', 1 ), new HighlightableLineMaterial( { color: 0x787878 } ) ) ]
            ]

        }

        this.pickerGizmos = {

            X: [
                [ new TorusHitbox(), [ 0, 0, 0 ], [ 0, -Math.PI / 2, -Math.PI / 2 ] ]
            ],

            Y: [
                [ new TorusHitbox(), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            Z: [
                [ new TorusHitbox(), [ 0, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ]
            ],

            E: [
                [
                    new TorusHitbox( {
                        radius:          1.25,
                        tube:            0.12,
                        radialSegments:  2,
                        tubularSegments: 24
                    } )
                ]
            ],

            XYZ: [
                [ new TorusHitbox() ]
            ]

        }

        //        this.pickerGizmos.XYZ[ 0 ][ 0 ].visible = false // disable XYZ picker gizmo

        this.init()

    }

    /*
     update ( rotation, eye2 ) {

     super.update( rotation, eye2 )

     const tempMatrix     = new Matrix4()
     const worldRotation  = new Euler( 0, 0, 1 )
     const tempQuaternion = new Quaternion()
     const unitX          = new Vector3( 1, 0, 0 )
     const unitY          = new Vector3( 0, 1, 0 )
     const unitZ          = new Vector3( 0, 0, 1 )
     const quaternionX    = new Quaternion()
     const quaternionY    = new Quaternion()
     const quaternionZ    = new Quaternion()
     const eye            = eye2.clone()

     worldRotation.copy( this.planes[ 'XY' ].rotation )
     tempQuaternion.setFromEuler( worldRotation )

     tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix )
     eye.applyMatrix4( tempMatrix )

     this.traverse( child => {

     tempQuaternion.setFromEuler( worldRotation )

     if ( child.name === 'X' ) {

     quaternionX.setFromAxisAngle( unitX, Math.atan2( -eye.y, eye.z ) )
     tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX )
     child.quaternion.copy( tempQuaternion )

     }

     if ( child.name === 'Y' ) {

     quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) )
     tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY )
     child.quaternion.copy( tempQuaternion )

     }

     if ( child.name === 'Z' ) {

     quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) )
     tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ )
     child.quaternion.copy( tempQuaternion )

     }

     } )

     }
     */

}

class ScaleGizmo extends AbstractGizmo {

    constructor () {

        super()
        this.isScaleGizmo = true
        this.type         = 'ScaleGizmo'

        this.handleGizmos = {

            XYZ: new OctahedricalHandle( {
                color: 0xaaaaaa
            } ).setScale( 0.15, 0.15, 0.15 ),

            XY: new PlaneHandle( {
                color:     0xaaaa00,
                direction: new Vector3( 1, 1, 0 )
            } ).setScale( 0.33, 0.33, 1.0 ),

            YZ: new PlaneHandle( {
                color:     0x00aaaa,
                direction: new Vector3( 0, 1, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3( 0, 1, 0 ), degreesToRadians( -90 ) ),

            XZ: new PlaneHandle( {
                color:     0xaa00aa,
                direction: new Vector3( 1, 0, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3( 1, 0, 0 ), degreesToRadians( 90 ) ),

            X: new ScaleHandle( {
                color:     0xaa0000,
                direction: new Vector3( 1, 0, 0 )
            } ),

            Y: new ScaleHandle( {
                color:     0x00aa00,
                direction: new Vector3( 0, 1, 0 )
            } ),

            Z: new ScaleHandle( {
                color:     0x0000aa,
                direction: new Vector3( 0, 0, 1 )
            } )

        }

        this.init()

    }

}

// Controller
const ClippingModes = toEnum( {
    None:      0,
    Translate: 1,
    Rotate:    2,
    Scale:     3
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
        this._handlers                 = {
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
        // Could/Should(?) use the objectsToClip boundingbox if exist ! [only in case we are sure that boundingbox (is/must be) implemented for each object3D.]
        this._objectsToClipBoundingBox = new Box3()

        this._clippingBox = new ClippingBox()
        this.add( this._clippingBox )

        this.camera          = _parameters.camera
        this.domElement      = _parameters.domElement
        this.mode            = _parameters.mode
        this.objectsToClip   = _parameters.objectsToClip
        this.translationSnap = 0.1
        this.scaleSnap       = 0.1
        this.rotationSnap    = 0.1

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

        this._events = {
            change:       { type: 'change' },
            mouseEnter:   { type: 'mouseEnter' },
            mouseLeave:   { type: 'mouseLeave' },
            mouseDown:    { type: 'mouseDown' },
            mouseUp:      { type: 'mouseUp' },
            objectChange: { type: 'objectChange' }
        }

        // The actions map about input events
        this.actionsMap = {
            setMode:   {
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
            scale:     {
                widthPlus:   [ Keys.LEFT_ARROW.value ],
                widthMinus:  [ Keys.RIGHT_ARROW.value ],
                heightPlus:  [ Keys.PAGE_UP.value ],
                heightMinus: [ Keys.PAGE_DOWN.value ],
                depthPlus:   [ Keys.UP_ARROW.value ],
                depthMinus:  [ Keys.DOWN_ARROW.value ]
            },
            rotate:    {
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
        if ( !( value instanceof Object3D ) ) { throw new Error( `Objects to clip cannot be an instance of ${value.constructor.name}. Expect an instance of Object3D.` ) }

        this._objectsToClip = value

        const size = new Vector3()
        this._objectsToClipBoundingBox
            .makeEmpty()
            .expandByObject( value )
            .getSize( size )

        const x = Math.round( size.x ) || 50
        const y = Math.round( size.y ) || 22
        const z = Math.round( size.z ) || 70
        this.scale.set( x, y, z )
        //        this.scale.set( 50, 22, 70 )

        this._clippingBox.update()

    }

    get camera () {
        return this._camera
    }

    set camera ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Camera cannot be null ! Expect an instance of Camera' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Camera cannot be undefined ! Expect an instance of Camera' ) }
        if ( !( value instanceof Camera ) ) { throw new Error( `Camera cannot be an instance of ${value.constructor.name}. Expect an instance of Camera.` ) }

        this._camera = value

    }

    get domElement () {
        return this._domElement
    }

    set domElement ( value ) {

        if ( isNull( value ) ) { throw new Error( 'DomElement cannot be null ! Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'DomElement cannot be undefined ! Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.' ) }
        if ( !( ( value instanceof Window ) || ( value instanceof HTMLDocument ) || ( value instanceof HTMLDivElement ) || ( value instanceof HTMLCanvasElement ) ) ) { throw new Error( `Target cannot be an instance of ${value.constructor.name}. Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.` ) }

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

            this._currentGizmo         = this._gizmos[ this._mode.name ]
            this._currentGizmo.visible = true

        }

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

    setTranslationSnap ( translationSnap ) {
        this.translationSnap = translationSnap
    }

    setRotationSnap ( rotationSnap ) {
        this.rotationSnap = rotationSnap
    }

    enable () {

        this.visible = true
        this.enabled = true
        this.updateClipping()

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

    update () {

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
                        this.dispatchEvent( this._events.objectChange )

                    } else if ( actionMap.translate.back.includes( key ) ) {

                        this._translateZ( -this.translationSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.objectChange )

                    } else if ( actionMap.translate.right.includes( key ) ) {

                        this._translateX( this.translationSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.objectChange )

                    } else if ( actionMap.translate.left.includes( key ) ) {

                        this._translateX( -this.translationSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.objectChange )

                    } else if ( actionMap.translate.up.includes( key ) ) {

                        this._translateY( this.translationSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.objectChange )

                    } else if ( actionMap.translate.down.includes( key ) ) {

                        this._translateY( -this.translationSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.objectChange )

                    }

                    break

                case ClippingModes.Rotate:

                    break

                case ClippingModes.Scale:

                    if ( actionMap.scale.depthPlus.includes( key ) ) {

                        this._scaleZ( this.scaleSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.objectChange )

                    } else if ( actionMap.scale.depthMinus.includes( key ) ) {

                        this._scaleZ( -this.scaleSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.objectChange )

                    } else if ( actionMap.scale.widthPlus.includes( key ) ) {

                        this._scaleX( this.scaleSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.objectChange )

                    } else if ( actionMap.scale.widthMinus.includes( key ) ) {

                        this._scaleX( -this.scaleSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.objectChange )

                    } else if ( actionMap.scale.heightPlus.includes( key ) ) {

                        this._scaleY( this.scaleSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.objectChange )

                    } else if ( actionMap.scale.heightMinus.includes( key ) ) {

                        this._scaleY( -this.scaleSnap )
                        this.updateClipping()
                        this._consumeEvent( keyEvent )
                        this.dispatchEvent( this._events.objectChange )

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
        if ( mouseEvent.button !== Mouse.LEFT.value ) { return }
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
            const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.handles.children )
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
                    throw new RangeError( `Invalid switch parameter: ${this._mode}` )

            }

            this.updateClipping()
            this._consumeEvent( mouseEvent )
            this.dispatchEvent( this._events.objectChange )

        }

    }

    _onMouseUp ( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        if ( event.button !== Mouse.LEFT.value ) { return }

        mouseEvent.preventDefault()
        this._consumeEvent( mouseEvent )

        this._dragging = false
        this.dispatchEvent( this._events.mouseUp )

        // Check mouseIn
        const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.handles.children )
        if ( intersect ) {

            const handle = intersect.object

            this._currentHandle = handle
            this._currentHandle.highlight( true )

            this._consumeEvent( mouseEvent )
            this.dispatchEvent( this._events.mouseEnter )

        } else if ( isDefined( this._currentHandle ) ) {

            this._currentHandle.highlight( false )
            this._currentHandle = null

            this.dispatchEvent( this._events.mouseLeave )

        }

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

    }

    _translateX ( deltaX ) {

        this.position.setX( this.position.x + deltaX )

    }

    _translateY ( deltaY ) {

        this.position.setY( this.position.y + deltaY )

    }

    _translateZ ( deltaZ ) {

        this.position.setZ( this.position.z + deltaZ )

    }

    _translateXY ( deltaX, deltaY ) {

        this.position.setX( this.position.x + deltaX )
        this.position.setY( this.position.y + deltaY )

    }

    _translateXZ ( deltaX, deltaZ ) {

        this.position.setX( this.position.x + deltaX )
        this.position.setZ( this.position.z + deltaZ )

    }

    _translateYZ ( deltaY, deltaZ ) {

        this.position.setY( this.position.y + deltaY )
        this.position.setZ( this.position.z + deltaZ )

    }

    _translateXYZ ( deltaX, deltaY, deltaZ ) {

        this.position.set( this.position.x + deltaX, this.position.y + deltaY, this.position.z + deltaZ )

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

    }

    _scaleX ( deltaX ) {

        this.scale.setX( this.scale.x + deltaX )

    }

    _scaleY ( deltaY ) {

        this.scale.setY( this.scale.y + deltaY )

    }

    _scaleZ ( deltaZ ) {

        this.scale.setZ( this.scale.z + deltaZ )

    }

    _scaleXY ( deltaX, deltaY ) {

        this.scale.setX( this.scale.x + deltaX )
        this.scale.setY( this.scale.y + deltaY )

    }

    _scaleXZ ( deltaX, deltaZ ) {

        this.scale.setX( this.scale.x + deltaX )
        this.scale.setZ( this.scale.z + deltaZ )

    }

    _scaleYZ ( deltaY, deltaZ ) {

        this.scale.setY( this.scale.y + deltaY )
        this.scale.setZ( this.scale.z + deltaZ )

    }

    _scaleXYZ ( deltaX, deltaY, deltaZ ) {

        this.scale.set( this.scale.x + deltaX, this.scale.y + deltaY, this.scale.z + deltaZ )

    }

}

export {
    AbstractGizmo,
    AbstractHandle,
    AbstractHitbox,
    ClippingBox,
    ClippingControls,
    ClippingModes,
    CylindricaHitbox,
    HighlightableLineMaterial,
    HighlightableMaterial,
    LozengeHandle,
    LozengeHitbox,
    OctahedricalHandle,
    OctahedricalHitbox,
    PlanarHitbox,
    PlaneHandle,
    RotateGizmo,
    RotateHandle,
    ScaleGizmo,
    ScaleHandle,
    SphericalHitbox,
    TorusHitbox,
    TranslateGizmo,
    TranslateHandle
}
