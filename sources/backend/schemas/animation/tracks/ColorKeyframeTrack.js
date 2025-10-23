/**
 * @module Schemas/Animation/Tracks/ColorKeyframeTrack
 * @desc Export the ThreeJs ColorKeyframeTrack Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Animation/Tracks/KeyframeTrack Schemas/Animation/Tracks/KeyframeTrack}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { KeyframeTrack } from './KeyframeTrack'

class ColorKeyframeTrack extends KeyframeTrack {

    static schema( Mongoose ) {

        const Schema = Mongoose.Schema

        return new Schema( {
            ValueTypeName: {
                type:    String,
                default: 'color'
            }
        } )

    }

    static model( Mongoose, Schema ) {

        //        const KeyframeTrackBaseModel = KeyframeTrack.getModelFrom( Mongoose )
        //        const model             = KeyframeTrackBaseModel.discriminator( this.name, Schema )
        //        return model

        //        const AbstractMongooseBaseModel = AbstractMongooseModel.model( Mongoose )
        //        const ColorBaseModel            = ColorKeyframeTrack.getModelFrom( Mongoose )
        //        const ThisBaseModel             = this.getModelFrom( Mongoose )

        const KeyframeTrackBaseModel = KeyframeTrack.getModelFrom( Mongoose )
        const model                  = KeyframeTrackBaseModel.discriminator( this.name, Schema )
        return model

    }

}

ColorKeyframeTrack._schema = null
ColorKeyframeTrack._model  = null

export { ColorKeyframeTrack }
