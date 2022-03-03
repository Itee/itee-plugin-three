/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const {
          numberToInternalRepresentation,
          byteToBits
      } = require( 'itee-utils' )
const { BitManager } = require( '../../builds/itee-plugin-three.cjs' )

const a = 0
const b = 1
const c = 2
const d = 4
const e = 8
const f = 16
const g = 32
const h = 64
const i = 128

console.log( `A: ${ byteToBits( a ) }` )
console.log( `B: ${ byteToBits( b ) }` )
console.log( `C: ${ byteToBits( c ) }` )
console.log( `D: ${ byteToBits( d ) }` )
console.log( `E: ${ byteToBits( e ) }` )
console.log( `F: ${ byteToBits( f ) }` )
console.log( `G: ${ byteToBits( g ) }` )
console.log( `H: ${ byteToBits( h ) }` )
console.log( `I: ${ byteToBits( i ) }` )

const ab = a | b
console.log( `AB: ${ byteToBits( ab ) }` )

const ac = a | c
console.log( `AC: ${ byteToBits( ac ) }` )

const bcd = b | c | d
console.log( `BCD: ${ byteToBits( bcd ) }` )

const bcd__hij = b | c | d | g | h | i
console.log( `BCD__HIJ: ${ byteToBits( bcd__hij ) }` )

const e__h = BitManager.getBits( bcd__hij, [ 2, 3, 4, 5 ] )
console.log( `E__H: ${ byteToBits( e__h ) }` )
