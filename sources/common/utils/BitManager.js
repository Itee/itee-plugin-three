/**
 *
 */

class BitManager {

    static getBit ( bitField, bitPosition ) {
        return ( bitField & ( 1 << bitPosition ) ) === 0 ? 0 : 1
    }

    static setBit ( bitField, bitPosition ) {
        return bitField | ( 1 << bitPosition )
    }

    static clearBit ( bitField, bitPosition ) {
        const mask = ~( 1 << bitPosition )
        return bitField & mask
    }

    static updateBit ( bitField, bitPosition, bitValue ) {
        const bitValueNormalized = bitValue ? 1 : 0
        const clearMask          = ~( 1 << bitPosition )
        return ( bitField & clearMask ) | ( bitValueNormalized << bitPosition )
    }

    static getBits ( bitField, bitPositions ) {
        let bits = 0
        for ( let bitPosition of bitPositions ) {
            if ( BitManager.getBit( bitField, bitPosition ) ) {
                bits = BitManager.setBit( bits, bitPosition )
            }
        }
        return bits
    }

}

export { BitManager }
