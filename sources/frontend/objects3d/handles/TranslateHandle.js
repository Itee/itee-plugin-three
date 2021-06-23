/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import {
    isNull,
    isUndefined
}                                    from 'itee-validators'
import {
    ConeBufferGeometry,
    Vector3,
    Line,
    Mesh
}                                    from 'three-full'
//import { ConeBufferGeometry }        from 'three-full/sources/geometries/ConeGeometry'
//import { Vector3 }                   from 'three-full/sources/math/Vector3'
//import { Line }                      from 'three-full/sources/objects/Line'
//import { Mesh }                      from 'three-full/sources/objects/Mesh'
import { AbstractHandle }            from './AbstractHandle'
import { CylindricaHitbox }          from '../hitboxes/CylindricaHitbox'
import { HighlightableLineMaterial } from '../../materials/HighlightableLineMaterial'
import { HighlightableMaterial }     from '../../materials/HighlightableMaterial'
import { LineGeometry }              from '../../geometries/LineGeometry'

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

        const lineGeometry    = new LineGeometry( new Vector3( 0, 0, 0 ), new Vector3( 0, 0.8, 0 ) )
        const lineMaterial    = new HighlightableLineMaterial( { color: _parameters.color } )
        const line            = new Line( lineGeometry, lineMaterial )
        line.matrixAutoUpdate = false
        this.add( line )

        const coneGeometry = new ConeBufferGeometry( 0.05, 0.2, 12, 1, false )
        coneGeometry.translate( 0, 0.9, 0 )
        const coneMaterial    = new HighlightableMaterial( { color: _parameters.color } )
        const cone            = new Mesh( coneGeometry, coneMaterial )
        cone.matrixAutoUpdate = false
        this.add( cone )

        this.direction = _parameters.direction

    }

    get direction () {

        return this._direction

    }

    set direction ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
        if ( !( value instanceof Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

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

        this.updateMatrix()
        this.hitbox.updateMatrix()

    }

    setDirection ( direction ) {

        this.direction = direction
        return this

    }

    flipDirection () {

        this.direction = this._direction.negate()

    }

}

export { TranslateHandle }
