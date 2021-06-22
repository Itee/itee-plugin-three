/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import {
    isNull,
    isUndefined
}                     from 'itee-validators'
import { Object3D }   from 'three-full/sources/core/Object3D'
import { Quaternion } from 'three-full/sources/math/Quaternion'

class AbstractHandle extends Object3D {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                debug:  false,
                color:  0xffffff,
                hitbox: null
            }, ...parameters
        }

        super( _parameters )
        this.isHandle         = true
        this.type             = 'Handle'
        this.matrixAutoUpdate = true

        this.debug  = _parameters.debug
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

export { AbstractHandle }
