/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @see [IFC Standard]{@link http://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/}
 *
 */

class AbstractMongooseModel {

    static getSchemaFrom ( Mongoose ) {

        if ( !this._schema ) {
            this._schema = this.schema( Mongoose )
        }

        return this._schema

    }

    static schema ( /*Mongoose*/ ) {
        throw new Error( `${ this.name }.schema(): Need to be override !` )
    }

    static getModelFrom ( Mongoose ) {

        if ( !this._model ) {
            this._model = this.model( Mongoose, this.getSchemaFrom( Mongoose ) )
        }

        return this._model

    }

    static model ( /*Mongoose, Schema*/ ) {
        throw new Error( `${ this.name }.model(): Need to be override !` )
    }

    static registerModelTo ( Mongoose ) {

        this.getSchemaFrom( Mongoose, true )
        this.getModelFrom( Mongoose, true )

        return Mongoose

    }

}

AbstractMongooseModel.isAbstractMongooseModel = true
AbstractMongooseModel._schema                 = null
AbstractMongooseModel._model                  = null

export { AbstractMongooseModel }
