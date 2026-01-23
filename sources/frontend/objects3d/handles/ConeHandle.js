/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import {
    ConeBufferGeometry,
    Mesh
}                                from 'three-full'
import { HighlightableMaterial } from '../../materials/HighlightableMaterial.js'
import { BoxHitbox }             from '../hitboxes/BoxHitbox.js'
import { AbstractHandle }        from './AbstractHandle.js'

class ConeHandle extends AbstractHandle {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                coneColor:  0x104b83,
                edgesColor: 0x123456,
                hitbox:     new BoxHitbox( {
                    geometry: new ConeBufferGeometry( 1.1, 1.1 )
                } )
            }, ...parameters
        }

        super( _parameters )
        this.isOmnidirectionalHandle = true
        this.type                    = 'OmnidirectionalHandle'

        ////

        const coneGeometry = new ConeBufferGeometry( 1.0, 1.0 )
        coneGeometry.name  = 'ConeHandle_Cone_Geometry'

        const coneMaterial = new HighlightableMaterial( {
            color:       _parameters.coneColor,
            transparent: false,
            opacity:     1.0
        } )
        coneMaterial.name  = 'ConeHandle_Cone_Material'

        const cone            = new Mesh( coneGeometry, coneMaterial )
        cone.name             = 'ConeHandle_Cone'
        cone.matrixAutoUpdate = true

        this.add( cone )

        ////

        //        const edgesGeometry = new EdgesGeometry( coneGeometry )
        //        edgesGeometry.name  = 'ConeHandle_Edges_Geometry'
        //
        //        const edgesMaterial = new HighlightableLineMaterial( {
        //            color:       _parameters.edgesColor,
        //            linewidth:   4,
        //            transparent: false,
        //            opacity:     1.0
        //        } )
        //        edgesMaterial.name  = 'ConeHandle_Edges_Material'
        //
        //        const edges            = new LineSegments( edgesGeometry, edgesMaterial )
        //        edges.name             = 'ConeHandle_Edges'
        //        edges.matrixAutoUpdate = false
        //
        //        this.add( edges )

    }

    update( cameraDirection ) {
        super.update( cameraDirection )

        this.updateMatrix()
        this.hitbox.updateMatrix()
    }

}

export { ConeHandle }
