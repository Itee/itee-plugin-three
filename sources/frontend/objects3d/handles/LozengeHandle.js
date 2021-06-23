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
    Line,
    Mesh
}                                    from 'three-full'
//import { Float32BufferAttribute }    from 'three-full/sources/core/BufferAttribute'
//import { BufferGeometry }            from 'three-full/sources/core/BufferGeometry'
//import { Vector3 }                   from 'three-full/sources/math/Vector3'
//import { Line }                      from 'three-full/sources/objects/Line'
//import { Mesh }                      from 'three-full/sources/objects/Mesh'
import { AbstractHandle }            from './AbstractHandle'
import { LozengeHitbox }             from '../hitboxes/LozengeHitbox'
import { HighlightableLineMaterial } from '../../materials/HighlightableLineMaterial'
import { HighlightableMaterial }     from '../../materials/HighlightableMaterial'

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
        lineBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0.1, 0.75, 0.0, 1.0, 1.0, 0.0, 0.75, 0.1, 0.0 ], 3 ) )

        const lineMaterial = new HighlightableLineMaterial( {
            color: _parameters.color
        } )

        const line            = new Line( lineBufferGeometry, lineMaterial )
        line.matrixAutoUpdate = false
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
        lozengeBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( lozengePositions, 3 ) )
        lozengeBufferGeometry.setIndex( lozengeIndexes )

        const lozengeMaterial    = new HighlightableMaterial( {
            color:       _parameters.color,
            transparent: true,
            opacity:     0.35
        } )
        const lozenge            = new Mesh( lozengeBufferGeometry, lozengeMaterial )
        lozenge.matrixAutoUpdate = false
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
        if ( !( value instanceof Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

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

        this.updateMatrix()
        this.hitbox.updateMatrix()

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

export { LozengeHandle }
