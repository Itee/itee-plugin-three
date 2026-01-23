/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { degreesToRadians }   from 'itee-utils'
import { Vector3 }            from 'three-full'
import { LozengeHandle }      from '../handles/LozengeHandle.js'
import { OctahedricalHandle } from '../handles/OctahedricalHandle.js'
import { TranslateHandle }    from '../handles/TranslateHandle.js'
//import { Vector3 }            from 'three-full/sources/math/Vector3'
import { AbstractGizmo }      from './AbstractGizmo.js'

class TranslateGizmo extends AbstractGizmo {

    constructor() {

        super()
        this.isTranslateGizmo = true
        this.type             = 'TranslateGizmo'

        this.handleGizmos = {

            X: new TranslateHandle( {
                color:     0xaa0000,
                direction: new Vector3( 1, 0, 0 )
            } ),

            Y: new TranslateHandle( {
                color:     0x00aa00,
                direction: new Vector3( 0, 1, 0 )
            } ),

            Z: new TranslateHandle( {
                color:     0x0000aa,
                direction: new Vector3( 0, 0, 1 )
            } ),

            XY: new LozengeHandle( {
                color:     0xaaaa00,
                direction: new Vector3( 1, 1, 0 )
            } ).setScale( 0.33, 0.33, 1.0 ),

            YZ: new LozengeHandle( {
                color:     0x00aaaa,
                direction: new Vector3( 0, 1, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3( 0, 1, 0 ), degreesToRadians( -90 ) ),

            XZ: new LozengeHandle( {
                color:     0xaa00aa,
                direction: new Vector3( 1, 0, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3( 1, 0, 0 ), degreesToRadians( 90 ) ),

            XYZ: new OctahedricalHandle( {
                color: 0xaaaaaa
            } ).setScale( 0.15, 0.15, 0.15 )

        }

        this._setupHandles( this.handleGizmos )
        //        this.init()

    }

    raycast( raycaster, intersects ) {

        const isIntersected = ( raycaster.intersectObject( this.intersectPlane, true ).length > 0 )
        if ( !isIntersected ) { return }

        for ( let handle of this.children ) {
            if ( handle.name === this.intersectPlane.name ) {continue}
            handle.raycast( raycaster, intersects )
        }

    }
}

export { TranslateGizmo }
