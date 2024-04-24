import { useMemo } from "react";

const TICK_LENGTH = 10;

export const AxisLeft = ({yScale, pixelsPerTick, width, name}) => {
  const range = yScale.range();

  const ticks = useMemo(() => {
    const height = range[0] - range[1]; //topPixel - bottomPixel
    const numberOfTicksTarget = Math.floor(height / pixelsPerTick); //number of ticks on axis

    return yScale.ticks(numberOfTicksTarget).map((value) => ({ //array of objects {value: value, yOffset: offset}
      value,
      yOffset: yScale(value),
    }));
  }, [yScale, pixelsPerTick, range]);

  return (
    <>
      <text x={-(range[0]-range[1])/2 - 80} y={-40} style={{transform: "rotate(-90deg)"}}>{name}</text>
      {/* Ticks and labels */}
      {ticks.map(({ value, yOffset }) => (
        <g
          key={value}
          transform={`translate(0, ${yOffset})`}
          shapeRendering={"crispEdges"}
        >
          <line
            x1={-TICK_LENGTH}
            x2={width + TICK_LENGTH}
            stroke="#D2D7D3"
            strokeWidth={0.5}
          />
          <text
            key={value}
            style={{
              fontSize: "10px",
              textAnchor: "middle",
              transform: "translateX(-20px)",
              fill: "#D2D7D3",
            }}
          >
            {value}
          </text>
        </g>
      ))}
    </>
  );
};