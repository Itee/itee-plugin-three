/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @see [IFC Standard]{@link http://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/}
 *
 */

class AbstractMongooseModel {

    static getSchemaFrom ( Mongoose, force = false ) {

        if ( !this._schema ) {
            //        if ( !this._schema || force ) {
            this._schema = this.schema( Mongoose )
        }

        return this._schema

    }

    static schema ( Mongoose ) {
        console.error( `${ this.name }.schema(): Need to be override !` )
        return new Mongoose.Schema( {} )
    }

    static getModelFrom ( Mongoose, force = false ) {

        if ( !this._model ) {
            //        if ( !this._model || force ) {
            this._model = this.model( Mongoose, this.getSchemaFrom( Mongoose ) )
        }

        return this._model

    }

    static model ( Mongoose, Schema ) {
        console.error( `${ this.name }.model(): Need to be override !` )
        return null
    }

    static registerModelTo ( Mongoose ) {

        const schema = this.getSchemaFrom( Mongoose, true )
        const model  = this.getModelFrom( Mongoose, true )

        return Mongoose

    }

}

AbstractMongooseModel.isAbstractMongooseModel = true
AbstractMongooseModel._schema                 = null
AbstractMongooseModel._model                  = null

export { AbstractMongooseModel }
