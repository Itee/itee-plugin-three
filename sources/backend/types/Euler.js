/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import {
    isNotDefined,
    isNotNumber,
    isNotObject,
    isNotString
} from 'itee-validators'

function EulerType ( Mongoose ) {
    'use strict'

    const SchemaType = Mongoose.SchemaType
    const Schema     = Mongoose.Schema
    const Types      = Schema.Types

    // Declare type
    function Euler ( key, options ) {
        SchemaType.call( this, key, options, 'Euler' )
    }

    Euler.prototype = Object.assign( Object.create( SchemaType.prototype ), {

        cast ( value ) {

            if ( isNotDefined( value ) ) { throw new Error( `Euler: ${value} is null or undefined` ) }
            if ( isNotObject( value ) && !value.isEuler ) { throw new Error( `Euler: ${value} is not a object or Euler instance` ) }

            if ( !( 'x' in value ) ) { throw new Error( 'Euler: ' + value + ' does not contain x property' ) }
            if ( isNotNumber( value.x ) ) { throw new Error( `Euler: ${value} expected x to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Error( 'Euler: ' + value + ' does not contain y property' ) }
            if ( isNotNumber( value.y ) ) { throw new Error( `Euler: ${value} expected y to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Error( 'Euler: ' + value + ' does not contain z property' ) }
            if ( isNotNumber( value.z ) ) { throw new Error( `Euler: ${value} expected z to be a number` ) }

            if ( !( 'order' in value ) ) { throw new Error( 'Euler: ' + value + ' does not contain order property' ) }
            if ( isNotString( value.order ) ) { throw new Error( `Euler: ${value} expected order to be a string` ) }
            if ( ![
                'XYZ',
                'YZX',
                'ZXY',
                'XZY',
                'YXZ',
                'ZYX'
            ].includes( value.order.toUpperCase() ) ) { throw new Error( `Euler: ${value} expected order to be a string in ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX']` ) }

            return {
                x:     value.x,
                y:     value.y,
                z:     value.z,
                order: value.order.toUpperCase()
            }

        }

    } )

    // Register type
    Types.Euler = Euler
    return Mongoose

}

export { EulerType }
