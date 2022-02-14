/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import {
    EdgesGeometry,
    LineSegments,
    Mesh,
    OctahedronBufferGeometry
}                                    from 'three-full'
import { HighlightableLineMaterial } from '../../materials/HighlightableLineMaterial'
import { HighlightableMaterial }     from '../../materials/HighlightableMaterial'
import { OctahedricalHitbox }        from '../hitboxes/OctahedricalHitbox'
//import { EdgesGeometry }             from 'three-full/sources/geometries/EdgesGeometry'
//import { OctahedronBufferGeometry }  from 'three-full/sources/geometries/OctahedronGeometry'
//import { LineSegments }              from 'three-full/sources/objects/LineSegments'
//import { Mesh }                      from 'three-full/sources/objects/Mesh'
import { AbstractHandle }            from './AbstractHandle'

class OctahedricalHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                color:  0xffffff,
                hitbox: new OctahedricalHitbox()
            }, ...parameters
        }

        super( _parameters )
        this.isOmnidirectionalHandle = true
        this.type                    = 'OmnidirectionalHandle'

        const octahedronGeometry    = new OctahedronBufferGeometry( 0.1, 0 )
        const octahedronMaterial    = new HighlightableMaterial( {
            color:       _parameters.color,
            transparent: true,
            opacity:     0.55
        } )
        const octahedron            = new Mesh( octahedronGeometry, octahedronMaterial )
        octahedron.matrixAutoUpdate = false
        this.add( octahedron )

        const edgesGeometry    = new EdgesGeometry( octahedronGeometry )
        const edgesMaterial    = new HighlightableLineMaterial( {
            color:     _parameters.color,
            linewidth: 4
        } )
        const edges            = new LineSegments( edgesGeometry, edgesMaterial )
        edges.matrixAutoUpdate = false
        this.add( edges )

    }

    update ( cameraDirection ) {
        super.update( cameraDirection )

        this.updateMatrix()
        this.hitbox.updateMatrix()
    }

}

export { OctahedricalHandle }
