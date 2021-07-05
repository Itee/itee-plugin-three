/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
import { degreesToRadians }          from 'itee-utils'
import {
    isNull,
    isUndefined
}                                    from 'itee-validators'
import {
    Float32BufferAttribute,
    BufferGeometry,
    Vector3,
    ArrowHelper,
    Line,
    Mesh
}                                    from 'three-full'
import { AbstractHandle }            from './AbstractHandle'
import { PlanarHitbox }              from '../hitboxes/PlanarHitbox'
import { HighlightableLineMaterial } from '../../materials/HighlightableLineMaterial'
import { HighlightableMaterial }     from '../../materials/HighlightableMaterial'

class PlaneHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                showEdges: false,
                centered:  false,
                color:     0xffffff,
                hitbox:    new PlanarHitbox( { centered: parameters.centered || false } ),
                direction: new Vector3( 0, 1, 0 )
            }, ...parameters
        }

        super( _parameters )
        this.isPlaneHandle = true
        this.type          = 'PlaneHandle'

        // Edge line
        if ( _parameters.showEdges ) {

            const lineBufferGeometry = new BufferGeometry()
            lineBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0.75, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.75, 0.0 ], 3 ) )

            const lineMaterial = new HighlightableLineMaterial( {
                color: _parameters.color
            } )

            const line            = new Line( lineBufferGeometry, lineMaterial )
            line.matrixAutoUpdate = false
            this.add( line )

        }


        // Plane
        const planePositions = ( _parameters.centered ) ?
            [
                -0.5, -0.5, 0.0,
                0.5, -0.5, 0.0,
                0.5, 0.5, 0.0,
                -0.5, 0.5, 0.0
            ] : [
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
        planeBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( planePositions, 3 ) )
        planeBufferGeometry.setIndex( planeIndexes )

        const planeMaterial    = new HighlightableMaterial( {
            color:       _parameters.color,
            transparent: true,
            opacity:     0.35
        } )
        const plane            = new Mesh( planeBufferGeometry, planeMaterial )
        plane.matrixAutoUpdate = false
        this.add( plane )

        this.xAxis = new Vector3( 1, 0, 0 )
        this.yAxis = new Vector3( 0, 1, 0 )
        this.zAxis = new Vector3( 0, 0, 1 )

        this.xDirection = new Vector3( _parameters.direction.x, 0, 0 )
        this.yDirection = new Vector3( 0, _parameters.direction.y, 0 )
        this.zDirection = new Vector3( 0, 0, _parameters.direction.z )
        this.direction  = _parameters.direction

        if ( this.debug ) {
            const origin      = new Vector3( 0, 0, 0 )
            const direction   = _parameters.direction
            const arrowHelper = new ArrowHelper( direction, origin, 1, 0x123456 )
            this.add( arrowHelper )
        }
    }

    get direction () {

        return this._direction

    }

    set direction ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
        if ( !( value instanceof Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

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

        this.updateMatrix()
        this.hitbox.updateMatrix()

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

export { PlaneHandle }
