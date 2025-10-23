/**
 * @module Schemas/Animation/Tracks/KeyframeTrack
 * @desc Export the ThreeJs KeyframeTrack Model and Schema for Mongoose.
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
import { AbstractMongooseModel } from '../../AbstractMongooseModel'

class KeyframeTrack extends AbstractMongooseModel {

    static schema( Mongoose ) {

        return new Mongoose.Schema( {
            name:                 String,
            times:                Buffer,
            values:               Buffer,
            DefaultInterpolation: {
                type:    Number,
                default: 2301
            },
            TimeBufferType:   Number,
            ValuesBufferType: Number
        }, {
            collection:       'keyframes',
            discriminatorKey: 'type'
        } )

    }

    static model( Mongoose, Schema ) {

        // We need to pre-declare the base model to be able to use
        // the discriminator 'type' correctly with the main type, instead of
        // directly register the model as it
        const model = Mongoose.model( `${ this.name }s`, Schema )
        model.discriminator( this.name, new Mongoose.Schema( {} ) )

        return model
    }

}

KeyframeTrack._schema = null
KeyframeTrack._model  = null

export { KeyframeTrack }
