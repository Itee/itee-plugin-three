/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import {
    BoxBufferGeometry,
    EdgesGeometry,
    LineSegments,
    Mesh
}                                    from 'three-full'
import { HighlightableLineMaterial } from '../../materials/HighlightableLineMaterial'
import { HighlightableMaterial }     from '../../materials/HighlightableMaterial'
import { BoxHitbox }                 from '../hitboxes/BoxHitbox'
//import { EdgesGeometry }             from 'three-full/sources/geometries/EdgesGeometry'
//import { BoxBufferGeometry }         from 'three-full/sources/geometries/BoxGeometry'
//import { LineSegments }              from 'three-full/sources/objects/LineSegments'
//import { Mesh }                      from 'three-full/sources/objects/Mesh'
import { AbstractHandle }            from './AbstractHandle'

class BoxHandle extends AbstractHandle {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                boxColor:   0x104b83,
                edgesColor: 0x123456,
                hitbox:     new BoxHitbox( {
                    geometry: new BoxBufferGeometry( 1.1, 1.1, 1.1, 1, 1, 1 )
                } )
            }, ...parameters
        }

        super( _parameters )
        this.isOmnidirectionalHandle = true
        this.type                    = 'OmnidirectionalHandle'

        ////

        const boxGeometry = new BoxBufferGeometry( 1.0, 1.0, 1.0, 1, 1, 1 )
        boxGeometry.name  = 'BoxHandle_Box_Geometry'

        const boxMaterial = new HighlightableMaterial( {
            color:       _parameters.boxColor,
            transparent: false,
            opacity:     1.0
        } )
        boxMaterial.name  = 'BoxHandle_Box_Material'

        const box            = new Mesh( boxGeometry, boxMaterial )
        box.name             = 'BoxHandle_Box'
        box.matrixAutoUpdate = false

        this.add( box )

        ////

        const edgesGeometry = new EdgesGeometry( boxGeometry )
        edgesGeometry.name  = 'BoxHandle_Edges_Geometry'

        const edgesMaterial = new HighlightableLineMaterial( {
            color:       _parameters.edgesColor,
            linewidth:   4,
            transparent: false,
            opacity:     1.0
        } )
        edgesMaterial.name  = 'BoxHandle_Edges_Material'

        const edges            = new LineSegments( edgesGeometry, edgesMaterial )
        edges.name             = 'BoxHandle_Edges'
        edges.matrixAutoUpdate = false

        this.add( edges )

    }

    update( cameraDirection ) {
        super.update( cameraDirection )

        this.updateMatrix()
        this.hitbox.updateMatrix()
    }

}

export { BoxHandle }
