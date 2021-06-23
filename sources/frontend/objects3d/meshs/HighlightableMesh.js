/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { Mesh } from 'three-full'
//import { Mesh }                  from 'three-full/sources/objects/Mesh'
import { HighlightableMaterial } from '../../materials/HighlightableMaterial'

class HighlightableMesh extends Mesh {

    constructor ( geometry, parameters = {} ) {
        super( geometry, new HighlightableMaterial( {
            color:       parameters.color,
            transparent: true,
            opacity:     0.55
        } ) )

        this.isHighlightableMesh = true
        this.type                = 'HighlightableMesh'

    }

    highlight ( value ) {

        this.material.highlight( value )

    }

}

export { HighlightableMesh }
