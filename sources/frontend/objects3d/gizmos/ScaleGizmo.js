/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { degreesToRadians }   from '@itee/utils'
import { Vector3 }            from 'three-full'
import { OctahedricalHandle } from '../handles/OctahedricalHandle.js'
import { PlaneHandle }        from '../handles/PlaneHandle.js'
import { ScaleHandle }        from '../handles/ScaleHandle.js'
//import { Vector3 }            from 'three-full/sources/math/Vector3'
import { AbstractGizmo }      from './AbstractGizmo.js'

class ScaleGizmo extends AbstractGizmo {

    constructor() {

        super()
        this.isScaleGizmo = true
        this.type         = 'ScaleGizmo'

        this.handleGizmos = {

            XYZ: new OctahedricalHandle( {
                color: 0xaaaaaa
            } ).setScale( 0.15, 0.15, 0.15 ),

            XY: new PlaneHandle( {
                color:     0xaaaa00,
                direction: new Vector3( 1, 1, 0 )
            } ).setScale( 0.33, 0.33, 1.0 ),

            YZ: new PlaneHandle( {
                color:     0x00aaaa,
                direction: new Vector3( 0, 1, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3( 0, 1, 0 ), degreesToRadians( -90 ) ),

            XZ: new PlaneHandle( {
                color:     0xaa00aa,
                direction: new Vector3( 1, 0, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3( 1, 0, 0 ), degreesToRadians( 90 ) ),

            X: new ScaleHandle( {
                color:     0xaa0000,
                direction: new Vector3( 1, 0, 0 )
            } ),

            Y: new ScaleHandle( {
                color:     0x00aa00,
                direction: new Vector3( 0, 1, 0 )
            } ),

            Z: new ScaleHandle( {
                color:     0x0000aa,
                direction: new Vector3( 0, 0, 1 )
            } )

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

export { ScaleGizmo }
