import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ArrowLeft(props) {
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
                d="M6 12h12M6 12l5-5m-5 5l5 5"
                stroke="#000"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    )
}

export default ArrowLeft
