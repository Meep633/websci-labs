import * as d3 from "d3";
import { AxisLeft } from './AxisLeft';
import { AxisBottom } from './AxisBottom';
import { Tooltip } from "./Tooltip";
import { useState } from "react";

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };

export const ScatterPlot = ({width, height, fillColor, strokeColor, data, xAxisName, yAxisName}) => {
  // Layout. The div size is set by the given props.
  // The bounds (=area inside the axis) is calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Scales
  const yScale = d3.scaleLinear().domain([d3.min(data, d => d.y), d3.max(data, d => d.y)]).range([boundsHeight, 0]);
  const xScale = d3.scaleLinear().domain([d3.min(data, d => d.x), d3.max(data, d => d.x)]).range([0, boundsWidth]);

  const [hovered, setHovered] = useState(null);

  const allShapes = data.map((d, i) => {
    return (
      <circle
        key={i}
        r={7} // radius
        cx={xScale(d.x)} // position on the X axis
        cy={yScale(d.y)} // on the Y axis
        opacity={1}
        stroke={strokeColor} //change this to what you want
        fill={fillColor}   //change this to what you want
        fillOpacity={0.2}
        strokeWidth={1}
        onMouseEnter={() => 
          setHovered({
            xPos: xScale(d.x),
            yPos: yScale(d.y),
            name: d.name
          })
        }
        onMouseLeave={() => setHovered(null)}
      />
    );
  });

  return (
    <div style={{position: "relative"}}>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        >
          {/* Y axis */}
          <AxisLeft yScale={yScale} pixelsPerTick={40} width={boundsWidth} name={yAxisName} />

          {/* X axis, use an additional translation to appear at the bottom */}
          <g transform={`translate(0, ${boundsHeight})`}>
            <AxisBottom
              xScale={xScale}
              pixelsPerTick={40}
              height={boundsHeight}
              name={xAxisName}
            />
          </g>

          {/* Circles */}
          {allShapes}
        </g>
      </svg>

      {/* Tooltip */}
      <div
        style={{
          width: boundsWidth,
          height: boundsHeight,
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          marginLeft: MARGIN.left,
          marginTop: MARGIN.top,
        }}
      >
        <Tooltip interactionData={hovered} />
      </div>
    </div>
  );
};