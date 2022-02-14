/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import {
    BufferGeometry,
    Float32BufferAttribute,
    Vector3
} from 'three-full'
//import { Float32BufferAttribute } from 'three-full/sources/core/BufferAttribute'
//import { BufferGeometry }         from 'three-full/sources/core/BufferGeometry'
//import { Vector3 }                from 'three-full/sources/math/Vector3'

class LineGeometry extends BufferGeometry {

    constructor ( pointA = new Vector3( 0, 0, 0 ), pointB = new Vector3( 1, 0, 0 ) ) {
        super()

        this.type = 'LineGeometry'
        this.setAttribute( 'position', new Float32BufferAttribute( [ pointA.x, pointA.y, pointA.z, pointB.x, pointB.y, pointB.z ], 3 ) )

    }

}

export { LineGeometry }
