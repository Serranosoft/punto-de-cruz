import * as React from "react"
import Svg, { Path } from "react-native-svg"

function Pinch(props) {
    return (
        <Svg
            width="16px"
            height="16px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <Path d="M21.707 3.707L17.414 8H20a1 1 0 010 2h-5a1 1 0 01-1-1V4a1 1 0 012 0v2.586l4.293-4.293a1 1 0 111.414 1.414zM3 22a1 1 0 00.707-.293L8 17.414V20a1 1 0 002 0v-5a1 1 0 00-1-1H4a1 1 0 000 2h2.586l-4.293 4.293A1 1 0 003 22z" />
        </Svg>
    )
}

export default Pinch
