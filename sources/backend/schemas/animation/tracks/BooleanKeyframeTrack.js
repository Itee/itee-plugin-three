/**
 * @module Schemas/Animation/Tracks/BooleanKeyframeTrack
 * @desc Export the ThreeJs BooleanKeyframeTrack Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Animation/Tracks/KeyframeTrack Schemas/Animation/Tracks/KeyframeTrack}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { AbstractMongooseModel } from '../../AbstractMongooseModel.js'
import { KeyframeTrack }         from './KeyframeTrack.js'

class BooleanKeyframeTrack extends AbstractMongooseModel {

    static schema( Mongoose ) {

        const Schema = Mongoose.Schema

        return new Schema( {
            DefaultInterpolation: {
                type:    Number,
                default: 2300
            },
            ValueBufferType: Array,
            ValueTypeName:   {
                type:    String,
                default: 'bool'
            }
        } )

    }

    static model( Mongoose, Schema ) {

        return KeyframeTrack.getModelFrom( Mongoose )
                            .discriminator( this.name, Schema )

    }

}

export { BooleanKeyframeTrack }
