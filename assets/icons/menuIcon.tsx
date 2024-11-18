import * as React from "react"
import Svg, { SvgProps, Defs, ClipPath, Path, G } from "react-native-svg"
const MenuIcon = (props: SvgProps) => (
  <Svg width={24} height={24} {...props}>
    <Defs>
      <ClipPath id="a">
        <Path
          fill="#fff"
          stroke="#707070"
          d="M2906 4817h24v24h-24z"
          data-name="Rectangle 149418"
        />
      </ClipPath>
    </Defs>
    <G
      clipPath="url(#a)"
      data-name="Mask Group 538"
      transform="translate(-2906 -4817)"
    >
      <G data-name="svgexport-15 (2)">
        <Path
          fill="#795547"
          fillRule="evenodd"
          d="M2930 4821a1.333 1.333 0 0 0-1.333-1.333h-21.334a1.333 1.333 0 0 0 0 2.667h21.334A1.333 1.333 0 0 0 2930 4821Zm0 8a1.333 1.333 0 0 0-1.333-1.333h-13.334a1.333 1.333 0 0 0 0 2.667h13.334A1.333 1.333 0 0 0 2930 4829Zm0 8a1.333 1.333 0 0 0-1.333-1.333H2922a1.333 1.333 0 0 0 0 2.667h6.667A1.333 1.333 0 0 0 2930 4837Z"
          data-name="Path 85530"
        />
      </G>
    </G>
  </Svg>
)
export default MenuIcon
