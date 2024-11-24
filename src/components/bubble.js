import * as React from "react"
import Svg, { Path } from "react-native-svg"

function Bubble({ style }) {
  return (
    <Svg style={style} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <Path
        fill="#ff9a5b"
        d="M161.4 70.6c12.9 16.2 14.3 45 2.1 66.6-12.1 21.5-37.8 35.8-62.9 35.4-25-.4-49.4-15.3-58-34.8-8.6-19.5-1.4-43.5 10.8-59.3C65.6 62.7 82.8 55.1 103.6 53c20.7-2 45 1.5 57.8 17.6z"
      />
    </Svg>
  )
}

export default Bubble