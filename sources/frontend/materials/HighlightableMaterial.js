/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import {
    DoubleSide,
    MeshBasicMaterial
} from 'three-full'
//import { DoubleSide }        from 'three-full/sources/constants'
//import { MeshBasicMaterial } from 'three-full/sources/materials/MeshBasicMaterial'

class HighlightableMaterial extends MeshBasicMaterial {

    constructor( parameters ) {
        super( parameters )
        this.isHighlightableMaterial = true
        //        this.type                    = 'HighlightableMaterial'

        this.depthTest   = false
        this.depthWrite  = false
        this.fog         = false
        this.side        = DoubleSide
        this.transparent = true
        this.oldColor    = this.color.clone()

    }

    highlight( highlighted ) {

        if ( highlighted ) {

            const lum = 0.35
            const _r  = this.color.r
            const _g  = this.color.g
            const _b  = this.color.b
            const r   = Math.min( Math.max( 0, _r + ( _r * lum ) ), 1.0 )
            const g   = Math.min( Math.max( 0, _g + ( _g * lum ) ), 1.0 )
            const b   = Math.min( Math.max( 0, _b + ( _b * lum ) ), 1.0 )
            this.color.setRGB( r, g, b )

        } else {

            this.color.copy( this.oldColor )

        }

    }

}

export { HighlightableMaterial }
