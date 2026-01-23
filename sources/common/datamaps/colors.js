/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { toEnum } from 'itee-utils'
import { Color }  from 'three'

const Colors = /*#__PURE__*/toEnum( {
    Black:                /*#__PURE__*/new Color( '#000000' ),
    Navy:                 /*#__PURE__*/new Color( '#000080' ),
    DarkBlue:             /*#__PURE__*/new Color( '#00008b' ),
    MediumBlue:           /*#__PURE__*/new Color( '#0000cd' ),
    Blue:                 /*#__PURE__*/new Color( '#0000ff' ),
    DarkGreen:            /*#__PURE__*/new Color( '#006400' ),
    Green:                /*#__PURE__*/new Color( '#008000' ),
    Teal:                 /*#__PURE__*/new Color( '#008080' ),
    DarkCyan:             /*#__PURE__*/new Color( '#008b8b' ),
    DeepSkyBlue:          /*#__PURE__*/new Color( '#00bfff' ),
    DarkTurquoise:        /*#__PURE__*/new Color( '#00ced1' ),
    MediumSpringGreen:    /*#__PURE__*/new Color( '#00fa9a' ),
    Lime:                 /*#__PURE__*/new Color( '#00ff00' ),
    SpringGreen:          /*#__PURE__*/new Color( '#00ff7f' ),
    Aqua:                 /*#__PURE__*/new Color( '#00ffff' ),
    Cyan:                 /*#__PURE__*/new Color( '#00ffff' ),
    MidnightBlue:         /*#__PURE__*/new Color( '#191970' ),
    DodgerBlue:           /*#__PURE__*/new Color( '#1e90ff' ),
    LightSeaGreen:        /*#__PURE__*/new Color( '#20b2aa' ),
    ForestGreen:          /*#__PURE__*/new Color( '#228b22' ),
    SeaGreen:             /*#__PURE__*/new Color( '#2e8b57' ),
    DarkSlateGray:        /*#__PURE__*/new Color( '#2f4f4f' ),
    DarkSlateGrey:        /*#__PURE__*/new Color( '#2f4f4f' ),
    LimeGreen:            /*#__PURE__*/new Color( '#32cd32' ),
    MediumSeaGreen:       /*#__PURE__*/new Color( '#3cb371' ),
    Turquoise:            /*#__PURE__*/new Color( '#40e0d0' ),
    RoyalBlue:            /*#__PURE__*/new Color( '#4169e1' ),
    SteelBlue:            /*#__PURE__*/new Color( '#4682b4' ),
    DarkSlateBlue:        /*#__PURE__*/new Color( '#483d8b' ),
    MediumTurquoise:      /*#__PURE__*/new Color( '#48d1cc' ),
    Indigo:               /*#__PURE__*/new Color( '#4b0082' ),
    DarkOliveGreen:       /*#__PURE__*/new Color( '#556b2f' ),
    CadetBlue:            /*#__PURE__*/new Color( '#5f9ea0' ),
    CornflowerBlue:       /*#__PURE__*/new Color( '#6495ed' ),
    RebeccaPurple:        /*#__PURE__*/new Color( '#663399' ),
    MediumAquaMarine:     /*#__PURE__*/new Color( '#66cdaa' ),
    DimGray:              /*#__PURE__*/new Color( '#696969' ),
    DimGrey:              /*#__PURE__*/new Color( '#696969' ),
    SlateBlue:            /*#__PURE__*/new Color( '#6a5acd' ),
    OliveDrab:            /*#__PURE__*/new Color( '#6b8e23' ),
    SlateGray:            /*#__PURE__*/new Color( '#708090' ),
    SlateGrey:            /*#__PURE__*/new Color( '#708090' ),
    LightSlateGray:       /*#__PURE__*/new Color( '#778899' ),
    LightSlateGrey:       /*#__PURE__*/new Color( '#778899' ),
    MediumSlateBlue:      /*#__PURE__*/new Color( '#7b68ee' ),
    LawnGreen:            /*#__PURE__*/new Color( '#7cfc00' ),
    Chartreuse:           /*#__PURE__*/new Color( '#7fff00' ),
    Aquamarine:           /*#__PURE__*/new Color( '#7fffd4' ),
    Maroon:               /*#__PURE__*/new Color( '#800000' ),
    Purple:               /*#__PURE__*/new Color( '#800080' ),
    Olive:                /*#__PURE__*/new Color( '#808000' ),
    Gray:                 /*#__PURE__*/new Color( '#808080' ),
    Grey:                 /*#__PURE__*/new Color( '#808080' ),
    SkyBlue:              /*#__PURE__*/new Color( '#87ceeb' ),
    LightSkyBlue:         /*#__PURE__*/new Color( '#87cefa' ),
    BlueViolet:           /*#__PURE__*/new Color( '#8a2be2' ),
    DarkRed:              /*#__PURE__*/new Color( '#8b0000' ),
    DarkMagenta:          /*#__PURE__*/new Color( '#8b008b' ),
    SaddleBrown:          /*#__PURE__*/new Color( '#8b4513' ),
    DarkSeaGreen:         /*#__PURE__*/new Color( '#8fbc8f' ),
    LightGreen:           /*#__PURE__*/new Color( '#90ee90' ),
    MediumPurple:         /*#__PURE__*/new Color( '#9370db' ),
    DarkViolet:           /*#__PURE__*/new Color( '#9400d3' ),
    PaleGreen:            /*#__PURE__*/new Color( '#98fb98' ),
    DarkOrchid:           /*#__PURE__*/new Color( '#9932cc' ),
    YellowGreen:          /*#__PURE__*/new Color( '#9acd32' ),
    Sienna:               /*#__PURE__*/new Color( '#a0522d' ),
    Brown:                /*#__PURE__*/new Color( '#a52a2a' ),
    DarkGray:             /*#__PURE__*/new Color( '#a9a9a9' ),
    DarkGrey:             /*#__PURE__*/new Color( '#a9a9a9' ),
    LightBlue:            /*#__PURE__*/new Color( '#add8e6' ),
    GreenYellow:          /*#__PURE__*/new Color( '#adff2f' ),
    PaleTurquoise:        /*#__PURE__*/new Color( '#afeeee' ),
    LightSteelBlue:       /*#__PURE__*/new Color( '#b0c4de' ),
    PowderBlue:           /*#__PURE__*/new Color( '#b0e0e6' ),
    FireBrick:            /*#__PURE__*/new Color( '#b22222' ),
    DarkGoldenRod:        /*#__PURE__*/new Color( '#b8860b' ),
    MediumOrchid:         /*#__PURE__*/new Color( '#ba55d3' ),
    RosyBrown:            /*#__PURE__*/new Color( '#bc8f8f' ),
    DarkKhaki:            /*#__PURE__*/new Color( '#bdb76b' ),
    Silver:               /*#__PURE__*/new Color( '#c0c0c0' ),
    MediumVioletRed:      /*#__PURE__*/new Color( '#c71585' ),
    IndianRed:            /*#__PURE__*/new Color( '#cd5c5c' ),
    Peru:                 /*#__PURE__*/new Color( '#cd853f' ),
    Chocolate:            /*#__PURE__*/new Color( '#d2691e' ),
    Tan:                  /*#__PURE__*/new Color( '#d2b48c' ),
    LightGray:            /*#__PURE__*/new Color( '#d3d3d3' ),
    LightGrey:            /*#__PURE__*/new Color( '#d3d3d3' ),
    Thistle:              /*#__PURE__*/new Color( '#d8bfd8' ),
    Orchid:               /*#__PURE__*/new Color( '#da70d6' ),
    GoldenRod:            /*#__PURE__*/new Color( '#daa520' ),
    PaleVioletRed:        /*#__PURE__*/new Color( '#db7093' ),
    Crimson:              /*#__PURE__*/new Color( '#dc143c' ),
    Gainsboro:            /*#__PURE__*/new Color( '#dcdcdc' ),
    Plum:                 /*#__PURE__*/new Color( '#dda0dd' ),
    BurlyWood:            /*#__PURE__*/new Color( '#deb887' ),
    LightCyan:            /*#__PURE__*/new Color( '#e0ffff' ),
    Lavender:             /*#__PURE__*/new Color( '#e6e6fa' ),
    DarkSalmon:           /*#__PURE__*/new Color( '#e9967a' ),
    Violet:               /*#__PURE__*/new Color( '#ee82ee' ),
    PaleGoldenRod:        /*#__PURE__*/new Color( '#eee8aa' ),
    LightCoral:           /*#__PURE__*/new Color( '#f08080' ),
    Khaki:                /*#__PURE__*/new Color( '#f0e68c' ),
    AliceBlue:            /*#__PURE__*/new Color( '#f0f8ff' ),
    HoneyDew:             /*#__PURE__*/new Color( '#f0fff0' ),
    Azure:                /*#__PURE__*/new Color( '#f0ffff' ),
    SandyBrown:           /*#__PURE__*/new Color( '#f4a460' ),
    Wheat:                /*#__PURE__*/new Color( '#f5deb3' ),
    Beige:                /*#__PURE__*/new Color( '#f5f5dc' ),
    WhiteSmoke:           /*#__PURE__*/new Color( '#f5f5f5' ),
    MintCream:            /*#__PURE__*/new Color( '#f5fffa' ),
    GhostWhite:           /*#__PURE__*/new Color( '#f8f8ff' ),
    Salmon:               /*#__PURE__*/new Color( '#fa8072' ),
    AntiqueWhite:         /*#__PURE__*/new Color( '#faebd7' ),
    Linen:                /*#__PURE__*/new Color( '#faf0e6' ),
    LightGoldenRodYellow: /*#__PURE__*/new Color( '#fafad2' ),
    OldLace:              /*#__PURE__*/new Color( '#fdf5e6' ),
    Red:                  /*#__PURE__*/new Color( '#ff0000' ),
    Fuchsia:              /*#__PURE__*/new Color( '#ff00ff' ),
    Magenta:              /*#__PURE__*/new Color( '#ff00ff' ),
    DeepPink:             /*#__PURE__*/new Color( '#ff1493' ),
    OrangeRed:            /*#__PURE__*/new Color( '#ff4500' ),
    Tomato:               /*#__PURE__*/new Color( '#ff6347' ),
    HotPink:              /*#__PURE__*/new Color( '#ff69b4' ),
    Coral:                /*#__PURE__*/new Color( '#ff7f50' ),
    DarkOrange:           /*#__PURE__*/new Color( '#ff8c00' ),
    LightSalmon:          /*#__PURE__*/new Color( '#ffa07a' ),
    Orange:               /*#__PURE__*/new Color( '#ffa500' ),
    LightPink:            /*#__PURE__*/new Color( '#ffb6c1' ),
    Pink:                 /*#__PURE__*/new Color( '#ffc0cb' ),
    Gold:                 /*#__PURE__*/new Color( '#ffd700' ),
    PeachPuff:            /*#__PURE__*/new Color( '#ffdab9' ),
    NavajoWhite:          /*#__PURE__*/new Color( '#ffdead' ),
    Moccasin:             /*#__PURE__*/new Color( '#ffe4b5' ),
    Bisque:               /*#__PURE__*/new Color( '#ffe4c4' ),
    MistyRose:            /*#__PURE__*/new Color( '#ffe4e1' ),
    BlanchedAlmond:       /*#__PURE__*/new Color( '#ffebcd' ),
    PapayaWhip:           /*#__PURE__*/new Color( '#ffefd5' ),
    LavenderBlush:        /*#__PURE__*/new Color( '#fff0f5' ),
    SeaShell:             /*#__PURE__*/new Color( '#fff5ee' ),
    Cornsilk:             /*#__PURE__*/new Color( '#fff8dc' ),
    LemonChiffon:         /*#__PURE__*/new Color( '#fffacd' ),
    FloralWhite:          /*#__PURE__*/new Color( '#fffaf0' ),
    Snow:                 /*#__PURE__*/new Color( '#fffafa' ),
    Yellow:               /*#__PURE__*/new Color( '#ffff00' ),
    LightYellow:          /*#__PURE__*/new Color( '#ffffe0' ),
    Ivory:                /*#__PURE__*/new Color( '#fffff0' ),
    White:                /*#__PURE__*/new Color( '#ffffff' )
} )

class ColorPalette {

    constructor( palette ) {
        if ( palette.default ) {
            this.default.set( palette.default )
        } else {
            this.default.set( Colors.Fuchsia )
        }

        if ( palette.intersected ) {
            this.intersected.set( palette.intersected )
        } else {
            this.default.set( Colors.PeachPuff )
        }

        if ( palette.selected ) {
            this.selected.set( palette.selected )
        } else {
            this.default.set( Colors.DarkOrange )
        }

        if ( palette.active ) {
            this.active.set( palette.active )
        } else {
            this.default.set( Colors.YellowGreen )
        }

        if ( palette.inactive ) {
            this.inactive.set( palette.inactive )
        } else {
            this.default.set( Colors.LightCyan )
        }

        if ( palette.enabled ) {
            this.enabled.set( palette.enabled )
        } else {
            this.default.set( Colors.Lavender )
        }

        if ( palette.disabled ) {
            this.disabled.set( palette.disabled )
        } else {
            this.default.set( Colors.Grey )
        }
    }

}

export {
    Colors,
    ColorPalette
}
