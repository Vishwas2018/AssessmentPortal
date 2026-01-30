// src/components/exam/QuestionContentRenderer.tsx
// Enhanced renderer with signed URL support and proper image handling
// Supports: text, images, tables, math, grids, charts, shapes, etc.

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ImageOff, Loader2 } from "lucide-react";
import { resolveMediaUrl } from "../../lib/mediaStorage";
import type {
  ContentBlock,
  TextBlock,
  ImageBlock,
  TableBlock,
  MathBlock,
  GridBlock,
  NumberLineBlock,
  ChartBlock,
  ShapeBlock,
  TallyBlock,
  ClockBlock,
  MoneyBlock,
  FractionBlock,
  TallyData,
} from "../../types/question";

// ============================================
// MAIN RENDERER
// ============================================

interface QuestionContentRendererProps {
  blocks: ContentBlock[];
  className?: string;
}

export const QuestionContentRenderer: React.FC<
  QuestionContentRendererProps
> = ({ blocks, className = "" }) => {
  return (
    <div className={`question-content space-y-3 ${className}`}>
      {blocks.map((block, index) => (
        <ContentBlockRenderer key={block.id || index} block={block} />
      ))}
    </div>
  );
};

// ============================================
// BLOCK RENDERER (SWITCH)
// ============================================

interface ContentBlockRendererProps {
  block: ContentBlock;
}

const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({
  block,
}) => {
  switch (block.type) {
    case "text":
      return <TextBlockRenderer block={block} />;
    case "image":
      return <ImageBlockRenderer block={block} />;
    case "table":
      return <TableBlockRenderer block={block} />;
    case "math":
      return <MathBlockRenderer block={block} />;
    case "grid":
      return <GridBlockRenderer block={block} />;
    case "number-line":
      return <NumberLineRenderer block={block} />;
    case "chart":
      return <ChartBlockRenderer block={block} />;
    case "shape":
      return <ShapeBlockRenderer block={block} />;
    case "tally":
      return <TallyBlockRenderer block={block} />;
    case "clock":
      return <ClockBlockRenderer block={block} />;
    case "money":
      return <MoneyBlockRenderer block={block} />;
    case "fraction":
      return <FractionBlockRenderer block={block} />;
    case "spacer":
      return <div style={{ height: block.height || 16 }} />;
    default:
      return null;
  }
};

// ============================================
// TEXT BLOCK
// ============================================

const TextBlockRenderer: React.FC<{ block: TextBlock }> = ({ block }) => {
  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[block.alignment || "left"];

  const styleClass = {
    normal: "text-gray-700",
    bold: "text-gray-800 font-semibold",
    italic: "text-gray-700 italic",
    heading: "text-gray-900 font-bold text-lg",
  }[block.style || "normal"];

  return (
    <p className={`${styleClass} ${alignmentClass} leading-relaxed`}>
      {block.content}
    </p>
  );
};

// ============================================
// IMAGE BLOCK (Enhanced with signed URLs)
// ============================================

interface EnhancedImageBlock extends Omit<ImageBlock, "url"> {
  url?: string;
  bucket?: string;
  path?: string;
}

const ImageBlockRenderer: React.FC<{ block: EnhancedImageBlock }> = ({
  block,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      setError(false);

      try {
        // Resolve URL (handles both legacy url and bucket/path format)
        const url = await resolveMediaUrl({
          url: block.url,
          bucket: block.bucket,
          path: block.path,
        });

        if (url) {
          setImageUrl(url);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error loading image:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [block.url, block.bucket, block.path]);

  const alignmentClass = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  }[block.alignment || "center"];

  // Loading state
  if (loading) {
    return (
      <div
        className={`flex items-center justify-center p-8 bg-gray-100 rounded-lg ${alignmentClass}`}
        style={{ width: block.width || 200, height: block.height || 150 }}
      >
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !imageUrl) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg ${alignmentClass}`}
        style={{ width: block.width || 200, height: block.height || 150 }}
      >
        <ImageOff className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-sm text-gray-500">Image unavailable</span>
      </div>
    );
  }

  return (
    <figure className={alignmentClass}>
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        src={imageUrl}
        alt={block.alt || "Question image"}
        style={{
          width: block.width ? `${block.width}px` : "auto",
          height: block.height ? `${block.height}px` : "auto",
          maxWidth: "100%",
          maxHeight: "400px",
          objectFit: "contain",
        }}
        className="rounded-lg shadow-sm"
        loading="lazy"
        onError={() => setError(true)}
      />
      {block.caption && (
        <figcaption className="text-sm text-gray-500 text-center mt-2">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
};

// ============================================
// TABLE BLOCK
// ============================================

const TableBlockRenderer: React.FC<{ block: TableBlock }> = ({ block }) => {
  const headerBgClass = {
    blue: "bg-cyan-500 text-white",
    gray: "bg-gray-200 text-gray-800",
    none: "bg-white text-gray-800",
  }[block.headerStyle || "blue"];

  const renderCell = (cell: string | number | TallyData): React.ReactNode => {
    if (typeof cell === "object" && (cell as TallyData).type === "tally") {
      return <TallyMarks count={(cell as TallyData).count} />;
    }
    return cell as React.ReactNode;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[200px] border-collapse border border-gray-300 mx-auto">
        {block.headers && (
          <thead>
            <tr>
              {block.headers.map((header, i) => (
                <th
                  key={i}
                  className={`px-4 py-2 border border-gray-300 font-semibold ${headerBgClass}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-2 border border-gray-300 text-center"
                >
                  {renderCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {block.caption && (
        <p className="text-sm text-gray-500 text-center mt-2">
          {block.caption}
        </p>
      )}
    </div>
  );
};

// ============================================
// TALLY MARKS COMPONENT
// ============================================

interface TallyMarksProps {
  count: number;
}

const TallyMarks: React.FC<TallyMarksProps> = ({ count }) => {
  const groups = Math.floor(count / 5);
  const remainder = count % 5;

  return (
    <span className="inline-flex items-center gap-2 font-mono text-lg">
      {Array.from({ length: groups }).map((_, i) => (
        <span key={i} className="tally-group">
          <span className="relative inline-flex">
            <span className="inline-flex gap-[2px]">
              {Array.from({ length: 4 }).map((_, j) => (
                <span
                  key={j}
                  className="inline-block w-[2px] h-5 bg-gray-800"
                />
              ))}
            </span>
            <span
              className="absolute top-0 left-0 w-full h-full"
              style={{
                background:
                  "linear-gradient(to top right, transparent 45%, #1f2937 45%, #1f2937 55%, transparent 55%)",
              }}
            />
          </span>
        </span>
      ))}
      {remainder > 0 && (
        <span className="inline-flex gap-[2px]">
          {Array.from({ length: remainder }).map((_, i) => (
            <span key={i} className="inline-block w-[2px] h-5 bg-gray-800" />
          ))}
        </span>
      )}
    </span>
  );
};

const TallyBlockRenderer: React.FC<{ block: TallyBlock }> = ({ block }) => {
  return <TallyMarks count={block.count} />;
};

// ============================================
// MATH BLOCK (LaTeX)
// ============================================

const MathBlockRenderer: React.FC<{ block: MathBlock }> = ({ block }) => {
  const renderBasicMath = (latex: string): string => {
    return latex
      .replace(
        /\\frac\{(\d+)\}\{(\d+)\}/g,
        '<span class="inline-flex flex-col items-center mx-1 text-center"><span class="border-b border-gray-800 px-1">$1</span><span class="px-1">$2</span></span>',
      )
      .replace(/\\times/g, "×")
      .replace(/\\div/g, "÷")
      .replace(/\\pm/g, "±")
      .replace(/\\sqrt\{([^}]+)\}/g, "√$1")
      .replace(/\^(\d+)/g, "<sup>$1</sup>")
      .replace(/_(\d+)/g, "<sub>$1</sub>");
  };

  if (block.display === "block") {
    return (
      <div
        className="text-center text-xl py-2"
        dangerouslySetInnerHTML={{ __html: renderBasicMath(block.latex) }}
      />
    );
  }

  return (
    <span
      className="inline-block"
      dangerouslySetInnerHTML={{ __html: renderBasicMath(block.latex) }}
    />
  );
};

// ============================================
// FRACTION BLOCK
// ============================================

const FractionBlockRenderer: React.FC<{ block: FractionBlock }> = ({
  block,
}) => {
  if (block.display === "visual-circle") {
    return (
      <VisualFractionCircle
        numerator={block.numerator}
        denominator={block.denominator}
      />
    );
  }

  if (block.display === "visual-bar") {
    return (
      <VisualFractionBar
        numerator={block.numerator}
        denominator={block.denominator}
      />
    );
  }

  return (
    <span className="inline-flex flex-col items-center mx-1 text-lg">
      <span className="text-center border-b-2 border-gray-800 px-2 min-w-[1.5em] font-semibold">
        {block.numerator}
      </span>
      <span className="text-center px-2 min-w-[1.5em] font-semibold">
        {block.denominator}
      </span>
    </span>
  );
};

const VisualFractionCircle: React.FC<{
  numerator: number;
  denominator: number;
}> = ({ numerator, denominator }) => {
  const segments = Array.from({ length: denominator }, (_, i) => {
    const startAngle = (i * 360) / denominator - 90;
    const endAngle = ((i + 1) * 360) / denominator - 90;
    const filled = i < numerator;

    return { startAngle, endAngle, filled };
  });

  return (
    <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto">
      {segments.map((seg, i) => {
        const startRad = (seg.startAngle * Math.PI) / 180;
        const endRad = (seg.endAngle * Math.PI) / 180;
        const largeArc = denominator <= 2 ? 1 : 0;

        const x1 = 30 + 25 * Math.cos(startRad);
        const y1 = 30 + 25 * Math.sin(startRad);
        const x2 = 30 + 25 * Math.cos(endRad);
        const y2 = 30 + 25 * Math.sin(endRad);

        return (
          <path
            key={i}
            d={`M30,30 L${x1},${y1} A25,25 0 ${largeArc},1 ${x2},${y2} Z`}
            fill={seg.filled ? "#6366f1" : "#e5e7eb"}
            stroke="#374151"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
};

const VisualFractionBar: React.FC<{
  numerator: number;
  denominator: number;
}> = ({ numerator, denominator }) => {
  return (
    <div className="flex border border-gray-400 rounded overflow-hidden mx-auto w-fit">
      {Array.from({ length: denominator }).map((_, i) => (
        <div
          key={i}
          className={`w-8 h-8 border-r last:border-r-0 border-gray-300 ${
            i < numerator ? "bg-indigo-500" : "bg-gray-100"
          }`}
        />
      ))}
    </div>
  );
};

// ============================================
// NUMBER LINE BLOCK
// ============================================

const NumberLineRenderer: React.FC<{ block: NumberLineBlock }> = ({
  block,
}) => {
  const { min, max, markers = [], showTicks = true } = block;
  const range = max - min;
  const step = block.step || range / 4;
  const ticks = [];

  for (let i = min; i <= max; i += step) {
    ticks.push(i);
  }

  const getPosition = (value: number): number => {
    return ((value - min) / range) * 100;
  };

  return (
    <div className="relative py-8 px-4">
      <div className="relative h-1 bg-gray-400 rounded">
        {showTicks &&
          ticks.map((tick, i) => (
            <div
              key={i}
              className="absolute -top-2"
              style={{ left: `${getPosition(tick)}%` }}
            >
              <div className="w-0.5 h-4 bg-gray-600 -translate-x-1/2" />
              <span className="absolute top-5 -translate-x-1/2 text-sm text-gray-600">
                {tick} {min === 0 && tick === max ? "km" : ""}
              </span>
            </div>
          ))}

        {markers.map((marker, i) => (
          <div
            key={i}
            className="absolute -top-6 -translate-x-1/2"
            style={{ left: `${getPosition(marker.value)}%` }}
          >
            <span className="text-2xl">{marker.icon || "📍"}</span>
            {marker.label && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-indigo-100 px-1 rounded whitespace-nowrap">
                {marker.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// GRID BLOCK
// ============================================

const GridBlockRenderer: React.FC<{ block: GridBlock }> = ({ block }) => {
  const {
    rows,
    cols,
    cellSize = 30,
    filledCells = [],
    markers = [],
    labels,
  } = block;

  return (
    <div className="overflow-x-auto py-4">
      <div className="inline-block">
        {labels?.x && (
          <div className="flex">
            <div style={{ width: cellSize }} />
            {labels.x.map((label, i) => (
              <div
                key={i}
                className="text-center text-sm text-gray-600 font-medium"
                style={{ width: cellSize }}
              >
                {label}
              </div>
            ))}
          </div>
        )}

        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex">
            {labels?.y && (
              <div
                className="flex items-center justify-center text-sm text-gray-600 font-medium"
                style={{ width: cellSize }}
              >
                {labels.y[rowIndex]}
              </div>
            )}

            {Array.from({ length: cols }).map((_, colIndex) => {
              const isFilled = filledCells.some(
                (c) => c.row === rowIndex && c.col === colIndex,
              );
              const marker = markers.find(
                (m) => m.x === colIndex && m.y === rows - rowIndex - 1,
              );

              return (
                <div
                  key={colIndex}
                  className={`border border-gray-300 relative ${
                    isFilled ? "bg-gray-400" : "bg-white"
                  }`}
                  style={{ width: cellSize, height: cellSize }}
                >
                  {marker && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg">{marker.icon || "📍"}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// CHART BLOCK
// ============================================

const ChartBlockRenderer: React.FC<{ block: ChartBlock }> = ({ block }) => {
  const { chartType, data, title, xLabel, yLabel } = block;

  if (chartType === "bar") {
    return (
      <BarChart data={data} title={title} xLabel={xLabel} yLabel={yLabel} />
    );
  }

  if (chartType === "dot-plot") {
    return <DotPlot data={data} title={title} />;
  }

  return (
    <div className="text-gray-500">Chart type not supported: {chartType}</div>
  );
};

const BarChart: React.FC<{
  data: { labels: string[]; values: number[]; colors?: string[] };
  title?: string;
  xLabel?: string;
  yLabel?: string;
}> = ({ data, title, xLabel, yLabel }) => {
  const maxValue = Math.max(...data.values);

  return (
    <div className="p-4">
      {title && <h4 className="text-center font-semibold mb-4">{title}</h4>}
      <div className="flex items-end gap-2 h-40 border-b border-l border-gray-400 pl-8 pb-8 relative">
        {yLabel && (
          <span className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-600">
            {yLabel}
          </span>
        )}

        {data.labels.map((label, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <motion.div
              className="w-full max-w-[40px] bg-cyan-500 rounded-t"
              initial={{ height: 0 }}
              animate={{ height: `${(data.values[i] / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
            <span className="text-xs text-gray-600 mt-2">{label}</span>
          </div>
        ))}
      </div>
      {xLabel && (
        <p className="text-center text-xs text-gray-600 mt-2">{xLabel}</p>
      )}
    </div>
  );
};

const DotPlot: React.FC<{
  data: { labels: string[]; values: number[] };
  title?: string;
}> = ({ data, title }) => {
  return (
    <div className="p-4">
      {title && <h4 className="text-center font-semibold mb-4">{title}</h4>}
      <div className="flex items-end gap-4 border-b border-gray-400 pb-2">
        {data.labels.map((label, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 min-w-[30px]"
          >
            <div className="flex flex-col-reverse gap-1">
              {Array.from({ length: data.values[i] }).map((_, j) => (
                <div key={j} className="w-4 h-4 bg-gray-800 rounded-full" />
              ))}
            </div>
            <span className="text-sm text-gray-600 mt-2">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// SHAPE BLOCK
// ============================================

const ShapeBlockRenderer: React.FC<{ block: ShapeBlock }> = ({ block }) => {
  if (block.svg) {
    return (
      <div
        className="mx-auto"
        dangerouslySetInnerHTML={{ __html: block.svg }}
      />
    );
  }

  switch (block.shapeType) {
    case "rectangle":
      return (
        <svg width="120" height="80" className="mx-auto">
          <rect
            x="10"
            y="10"
            width="100"
            height="60"
            fill={block.color || "#e5e7eb"}
            stroke="#374151"
            strokeWidth="2"
          />
          {block.labels?.width && (
            <text x="60" y="80" textAnchor="middle" fontSize="12">
              {block.labels.width}
            </text>
          )}
        </svg>
      );
    case "triangle":
      return (
        <svg width="100" height="100" className="mx-auto">
          <polygon
            points="50,10 90,90 10,90"
            fill={block.color || "#e5e7eb"}
            stroke="#374151"
            strokeWidth="2"
          />
        </svg>
      );
    case "circle":
      return (
        <svg width="100" height="100" className="mx-auto">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill={block.color || "#e5e7eb"}
            stroke="#374151"
            strokeWidth="2"
          />
        </svg>
      );
    default:
      return <div className="text-gray-500">Shape: {block.shapeType}</div>;
  }
};

// ============================================
// CLOCK BLOCK
// ============================================

const ClockBlockRenderer: React.FC<{ block: ClockBlock }> = ({ block }) => {
  const { hours, minutes, showDigital } = block;

  const hourAngle = ((hours % 12) + minutes / 60) * 30 - 90;
  const minuteAngle = minutes * 6 - 90;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" className="mx-auto">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="white"
          stroke="#374151"
          strokeWidth="2"
        />

        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = 50 + 38 * Math.cos(angle);
          const y = 50 + 38 * Math.sin(angle);
          return <circle key={i} cx={x} cy={y} r="2" fill="#374151" />;
        })}

        <line
          x1="50"
          y1="50"
          x2={50 + 20 * Math.cos((hourAngle * Math.PI) / 180)}
          y2={50 + 20 * Math.sin((hourAngle * Math.PI) / 180)}
          stroke="#374151"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <line
          x1="50"
          y1="50"
          x2={50 + 30 * Math.cos((minuteAngle * Math.PI) / 180)}
          y2={50 + 30 * Math.sin((minuteAngle * Math.PI) / 180)}
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <circle cx="50" cy="50" r="3" fill="#374151" />
      </svg>

      {showDigital && (
        <span className="text-lg font-mono">
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
        </span>
      )}
    </div>
  );
};

// ============================================
// MONEY BLOCK
// ============================================

const MoneyBlockRenderer: React.FC<{ block: MoneyBlock }> = ({ block }) => {
  const { amount, currency = "AUD", showCoins, coins } = block;

  if (showCoins && coins) {
    return (
      <div className="flex flex-wrap gap-2 items-center justify-center">
        {coins.map((coin, i) => (
          <div key={i} className="flex items-center gap-1">
            {Array.from({ length: coin.count }).map((_, j) => (
              <div
                key={j}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-xs font-bold shadow-md"
              >
                {coin.value}c
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <span className="text-lg font-semibold">
      {currency === "AUD" ? "$" : "$"}
      {amount.toFixed(2)}
    </span>
  );
};

export default QuestionContentRenderer;
