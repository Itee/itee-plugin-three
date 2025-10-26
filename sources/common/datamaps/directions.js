import { Vector3 } from 'three'
import {
    OneHalf,
    SquareRootOfThreeOnTwo,
    SquareRootOfTwoOnTwo
}                  from '../constants/constants'

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//[x:LEFT-RIGHT][y:DOWN-UP][z:BACK-FRONT]
const Left_Down_Back   = /*#__PURE__*/new Vector3( -1, -1, -1 ).normalize()
const Left_Down        = /*#__PURE__*/new Vector3( -1, -1, +0 ).normalize()
const Left_Down_Front  = /*#__PURE__*/new Vector3( -1, -1, +1 ).normalize()
const Left_Back        = /*#__PURE__*/new Vector3( -1, +0, -1 ).normalize()
const Left             = /*#__PURE__*/new Vector3( -1, +0, +0 ).normalize()
const Left_Front       = /*#__PURE__*/new Vector3( -1, +0, +1 ).normalize()
const Left_Up_Back     = /*#__PURE__*/new Vector3( -1, +1, -1 ).normalize()
const Left_Up          = /*#__PURE__*/new Vector3( -1, +1, +0 ).normalize()
const Left_Up_Front    = /*#__PURE__*/new Vector3( -1, +1, +1 ).normalize()
const Down_Back        = /*#__PURE__*/new Vector3( +0, -1, -1 ).normalize()
const Down             = /*#__PURE__*/new Vector3( +0, -1, +0 ).normalize()
const Down_Front       = /*#__PURE__*/new Vector3( +0, -1, +1 ).normalize()
const Back             = /*#__PURE__*/new Vector3( +0, +0, -1 ).normalize()
const Null             = /*#__PURE__*/new Vector3( +0, +0, +0 ).normalize()
const Front            = /*#__PURE__*/new Vector3( +0, +0, +1 ).normalize()
const Up_Back          = /*#__PURE__*/new Vector3( +0, +1, -1 ).normalize()
const Up               = /*#__PURE__*/new Vector3( +0, +1, +0 ).normalize()
const Up_Front         = /*#__PURE__*/new Vector3( +0, +1, +1 ).normalize()
const Right_Down_Back  = /*#__PURE__*/new Vector3( +1, -1, -1 ).normalize()
const Right_Down       = /*#__PURE__*/new Vector3( +1, -1, +0 ).normalize()
const Right_Down_Front = /*#__PURE__*/new Vector3( +1, -1, +1 ).normalize()
const Right_Back       = /*#__PURE__*/new Vector3( +1, +0, -1 ).normalize()
const Right            = /*#__PURE__*/new Vector3( +1, +0, +0 ).normalize()
const Right_Front      = /*#__PURE__*/new Vector3( +1, +0, +1 ).normalize()
const Right_Up_Back    = /*#__PURE__*/new Vector3( +1, +1, -1 ).normalize()
const Right_Up         = /*#__PURE__*/new Vector3( +1, +1, +0 ).normalize()
const Right_Up_Front   = /*#__PURE__*/new Vector3( +1, +1, +1 ).normalize()

/*


 -Z              nnw N nne
 /|\            NW   |   NE
 |          wnw  \  |  /  ene
 |          W ------x------ E
 |          wsw  /  |  \  ese
 |             SW   |   SE
 |              ssw S sse
 |
 _|_________________________________\ +X
 |                                 /

 */
const Cardinales = {
    North:            Back,
    North_North_East: /*#__PURE__*/new Vector3( OneHalf, 0, -( SquareRootOfThreeOnTwo ) ).normalize(),
    North_East:       /*#__PURE__*/new Vector3( SquareRootOfTwoOnTwo, 0, -( SquareRootOfTwoOnTwo ) ).normalize(),
    East_North_East:  /*#__PURE__*/new Vector3( SquareRootOfThreeOnTwo, 0, -( OneHalf ) ).normalize(),
    East:             Right,
    East_South_East:  /*#__PURE__*/new Vector3( SquareRootOfThreeOnTwo, 0, -( -OneHalf ) ).normalize(),
    South_East:       /*#__PURE__*/new Vector3( SquareRootOfTwoOnTwo, 0, -( -SquareRootOfTwoOnTwo ) ).normalize(),
    South_South_East: /*#__PURE__*/new Vector3( OneHalf, 0, -( -SquareRootOfThreeOnTwo ) ).normalize(),
    South:            Front,
    South_South_West: /*#__PURE__*/new Vector3( -OneHalf, 0, -( -SquareRootOfThreeOnTwo ) ).normalize(),
    South_West:       /*#__PURE__*/new Vector3( -SquareRootOfTwoOnTwo, 0, -( -SquareRootOfTwoOnTwo ) ).normalize(),
    West_South_West:  /*#__PURE__*/new Vector3( -SquareRootOfThreeOnTwo, 0, -( -OneHalf ) ).normalize(),
    West:             Left,
    West_North_West:  /*#__PURE__*/new Vector3( -SquareRootOfThreeOnTwo, 0, -( OneHalf ) ).normalize(),
    North_West:       /*#__PURE__*/new Vector3( -SquareRootOfTwoOnTwo, 0, -( SquareRootOfTwoOnTwo ) ).normalize(),
    North_North_West: /*#__PURE__*/new Vector3( -OneHalf, 0, -( SquareRootOfThreeOnTwo ) ).normalize()
}

const Directions = {
    Left_Down_Back,
    Left_Down,
    Left_Down_Front,
    Left_Back,
    Left,
    Left_Front,
    Left_Up_Back,
    Left_Up,
    Left_Up_Front,
    Down_Back,
    Down,
    Down_Front,
    Back,
    Null,
    Front,
    Up_Back,
    Up,
    Up_Front,
    Right_Down_Back,
    Right_Down,
    Right_Down_Front,
    Right_Back,
    Right,
    Right_Front,
    Right_Up_Back,
    Right_Up,
    Right_Up_Front,

    Cardinales
}

export { Directions }
