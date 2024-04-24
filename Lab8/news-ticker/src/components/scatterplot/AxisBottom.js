import { useMemo } from "react";

// tick length (vertical length)
const TICK_LENGTH = 6;

export const AxisBottom = ({xScale, pixelsPerTick, name}) => {
  const range = xScale.range(); //get range of passed in scale

  const ticks = useMemo(() => { //ticks does
    const width = range[1] - range[0]; //rightPixel - leftPixel
    const numberOfTicksTarget = Math.floor(width / pixelsPerTick); //number of ticks on axis

    return xScale.ticks(numberOfTicksTarget).map((value) => ({ //array of objects {value: value, xOffset: offset}
      value,
      xOffset: xScale(value),
    }));
  }, [xScale, pixelsPerTick, range]);

  return (
    <>
      {/* Main horizontal line */}
      <path
        d={["M", range[0], 0, "L", range[1], 0].join(" ")} //some commands that make the line idk
        fill="none" //color of inside of shape
        stroke="currentColor" //color of border of shape
      />
      <text x={(range[1] - range[0])/2 - 80} y={40}>{name}</text>

      {/* Ticks and labels */}
      {ticks.map(({ value, xOffset }) => (
        <g key={value} transform={`translate(${xOffset}, 0)`}> {/* translate() puts tick xOffset pixels from origin */}
          <line y2={TICK_LENGTH} stroke="currentColor" /> {/* creates the line */}
          <text 
            key={value}
            style={{
              fontSize: "10px",
              textAnchor: "middle",
              transform: "translateY(20px)",
            }}
          >
            {value} {/* labels tick */}
          </text>
        </g>
      ))}
    </>
  );
};