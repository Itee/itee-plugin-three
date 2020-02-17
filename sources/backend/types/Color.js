/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { BSON_DATA_OBJECT } from 'bson'
import {
    isNotDefined,
    isNotNumber,
    isNotObject
}                           from 'itee-validators'

function ColorType ( Mongoose ) {
    'use strict'

    class Color extends Mongoose.SchemaType {

        constructor ( key, options ) {

            super( key, options, 'Color' )

        }

        cast ( value ) {

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } is null or undefined` ) }
            if ( isNotObject( value ) && !value.isColor ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } is not a object or Color instance` ) }

            if ( !( 'r' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } does not contain r property` ) }
            if ( isNotNumber( value.r ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } expected to be a number` ) }

            if ( !( 'g' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } does not contain g property` ) }
            if ( isNotNumber( value.g ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } expected to be a number` ) }

            if ( !( 'b' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } does not contain b property` ) }
            if ( isNotNumber( value.b ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } expected to be a number` ) }

            return {
                r: value.r,
                g: value.g,
                b: value.b
            }

        }

    }

    Color.COLOR_BSON_TYPE = BSON_DATA_OBJECT

    // Register type
    Mongoose.Schema.Types.Color = Color

    return Mongoose

}

export { ColorType }
