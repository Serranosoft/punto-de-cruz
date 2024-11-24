import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ArrowRight(props) {
    return (
        <Svg
            width="32px"
            height="32px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <Path
                d="M6 12h12m0 0l-5-5m5 5l-5 5"
                stroke="#000"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    )
}

export default ArrowRight
