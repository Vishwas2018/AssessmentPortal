// src/types/question.ts
// Comprehensive types for rich question content
// Supports: images, diagrams, tables, charts, math notation, and more

// ============================================
// CONTENT BLOCK TYPES
// ============================================

export type ContentBlockType =
  | "text"
  | "image"
  | "table"
  | "math"
  | "grid"
  | "number-line"
  | "chart"
  | "shape"
  | "tally"
  | "clock"
  | "money"
  | "fraction"
  | "spacer";

// Base content block
interface BaseContentBlock {
  id: string;
  type: ContentBlockType;
}

// Text block - for paragraphs, headings, etc.
export interface TextBlock extends BaseContentBlock {
  type: "text";
  content: string;
  style?: "normal" | "bold" | "italic" | "heading";
  alignment?: "left" | "center" | "right";
}

// Image block - for photos, diagrams, illustrations
export interface ImageBlock extends BaseContentBlock {
  type: "image";
  url: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  alignment?: "left" | "center" | "right";
}

// Table block - for data tables
export interface TableBlock extends BaseContentBlock {
  type: "table";
  headers?: string[];
  rows: (string | number | TallyData)[][];
  caption?: string;
  headerStyle?: "blue" | "gray" | "none";
}

// Math block - for LaTeX/MathML expressions
export interface MathBlock extends BaseContentBlock {
  type: "math";
  latex: string;
  display?: "inline" | "block";
}

// Grid block - for coordinate grids, area problems
export interface GridBlock extends BaseContentBlock {
  type: "grid";
  rows: number;
  cols: number;
  cellSize?: number;
  filledCells?: { row: number; col: number; color?: string }[];
  showAxes?: boolean;
  labels?: { x?: string[]; y?: string[] };
  markers?: { x: number; y: number; label?: string; icon?: string }[];
}

// Number line block
export interface NumberLineBlock extends BaseContentBlock {
  type: "number-line";
  min: number;
  max: number;
  step?: number;
  markers?: { value: number; label?: string; icon?: string }[];
  showTicks?: boolean;
}

// Chart block - for bar graphs, pie charts, etc.
export interface ChartBlock extends BaseContentBlock {
  type: "chart";
  chartType: "bar" | "pie" | "line" | "dot-plot" | "pictograph";
  data: ChartData;
  title?: string;
  xLabel?: string;
  yLabel?: string;
}

export interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

// Shape block - for geometric shapes
export interface ShapeBlock extends BaseContentBlock {
  type: "shape";
  shapeType:
    | "rectangle"
    | "square"
    | "triangle"
    | "circle"
    | "polygon"
    | "composite"
    | "custom-svg";
  dimensions?: Record<string, number>;
  labels?: Record<string, string>;
  svg?: string; // For custom SVG shapes
  color?: string;
  showGrid?: boolean;
}

// Tally block - for tally marks
export interface TallyBlock extends BaseContentBlock {
  type: "tally";
  count: number;
}

export interface TallyData {
  type: "tally";
  count: number;
}

// Clock block - for time problems
export interface ClockBlock extends BaseContentBlock {
  type: "clock";
  hours: number;
  minutes: number;
  showDigital?: boolean;
}

// Money block - for currency display
export interface MoneyBlock extends BaseContentBlock {
  type: "money";
  amount: number;
  currency?: "AUD" | "USD";
  showCoins?: boolean;
  coins?: { value: number; count: number }[];
}

// Fraction block - for visual fractions
export interface FractionBlock extends BaseContentBlock {
  type: "fraction";
  numerator: number;
  denominator: number;
  display?: "numeric" | "visual-circle" | "visual-bar";
  shaded?: number; // For visual display
}

// Spacer block - for layout
export interface SpacerBlock extends BaseContentBlock {
  type: "spacer";
  height?: number;
}

// Union type for all content blocks
export type ContentBlock =
  | TextBlock
  | ImageBlock
  | TableBlock
  | MathBlock
  | GridBlock
  | NumberLineBlock
  | ChartBlock
  | ShapeBlock
  | TallyBlock
  | ClockBlock
  | MoneyBlock
  | FractionBlock
  | SpacerBlock;

// ============================================
// OPTION TYPES
// ============================================

export type OptionType = "text" | "image" | "mixed" | "shape";

export interface QuestionOption {
  id: string; // A, B, C, D or custom ID
  text?: string;
  imageUrl?: string;
  content?: ContentBlock[]; // For complex options
  isCorrect?: boolean; // For admin/results view
}

// ============================================
// QUESTION TYPES
// ============================================

export type QuestionType =
  | "multiple-choice"
  | "multiple-select"
  | "short-answer"
  | "numeric"
  | "fill-in-blank"
  | "drag-drop"
  | "matching";

export interface RichQuestion {
  id: string;
  exam_id: string;
  question_number: number;
  question_type: QuestionType;

  // Rich content for the question
  content: ContentBlock[];

  // Options (for MCQ, multiple select, etc.)
  options?: QuestionOption[];

  // Answer configuration
  correct_answer: string | string[];
  answer_explanation?: ContentBlock[];

  // Hints
  hint?: string;
  hint_content?: ContentBlock[];

  // Metadata
  points: number;
  difficulty?: "easy" | "medium" | "hard";
  topic?: string;
  skill?: string;

  // For numeric answers
  numeric_tolerance?: number;

  // For fill-in-blank
  blanks?: { id: string; correct: string }[];
}

// ============================================
// EXAMPLE QUESTION DATA
// ============================================

export const exampleNAPLANQuestions: Partial<RichQuestion>[] = [
  // Question 1: Maria's bottles (with image)
  {
    question_number: 1,
    question_type: "multiple-choice",
    content: [
      {
        id: "1",
        type: "text",
        content: "Maria gets 10 cents for every plastic bottle she recycles.",
      },
      {
        id: "2",
        type: "image",
        url: "/images/questions/bottle.png",
        alt: "Plastic bottle",
        width: 100,
      },
      { id: "3", type: "text", content: "Maria recycles 19 bottles." },
      {
        id: "4",
        type: "text",
        content: "How much money will Maria get?",
        style: "bold",
      },
    ],
    options: [
      { id: "A", text: "19 cents" },
      { id: "B", text: "$1.90" },
      { id: "C", text: "$19" },
      { id: "D", text: "$190" },
    ],
    correct_answer: "B",
  },

  // Question 2: Favourite sport (with tally table)
  {
    question_number: 2,
    question_type: "short-answer",
    content: [
      {
        id: "1",
        type: "text",
        content: "Some children were asked to name their favourite sport.",
      },
      {
        id: "2",
        type: "text",
        content: "The table below shows their responses.",
      },
      {
        id: "3",
        type: "table",
        headers: ["Favourite sport", "Number of students"],
        rows: [
          ["Basketball", { type: "tally", count: 22 }],
          ["Tennis", { type: "tally", count: 10 }],
          ["Hockey", { type: "tally", count: 15 }],
        ],
        headerStyle: "blue",
      },
      {
        id: "4",
        type: "text",
        content: "How many children were asked this question altogether?",
        style: "bold",
      },
    ],
    correct_answer: "47",
  },

  // Question 5: Balance scale (with diagram)
  {
    question_number: 5,
    question_type: "short-answer",
    content: [
      { id: "1", type: "text", content: "This scale is balanced." },
      {
        id: "2",
        type: "image",
        url: "/images/questions/balance-scale.png",
        alt: "Balance scale showing 13 grams + ? = 28 grams",
        width: 300,
      },
      {
        id: "3",
        type: "text",
        content: "What is the weight of the cube?",
        style: "bold",
      },
    ],
    correct_answer: "15",
  },

  // Question 10: Grid map (with interactive grid)
  {
    question_number: 10,
    question_type: "multiple-choice",
    content: [
      { id: "1", type: "text", content: "Zara's home is shown on the map." },
      {
        id: "2",
        type: "grid",
        rows: 8,
        cols: 8,
        labels: {
          x: ["A", "B", "C", "D", "E", "F", "G", "H"],
          y: ["8", "7", "6", "5", "4", "3", "2", "1"],
        },
        markers: [{ x: 1, y: 1, label: "Zara's home", icon: "🏠" }],
      },
      {
        id: "3",
        type: "text",
        content:
          "Each day Zara rides 4 kilometres east and 2 kilometres north from home to school.",
      },
      {
        id: "4",
        type: "text",
        content: "In which cell on the map is Zara's school?",
        style: "bold",
      },
    ],
    options: [
      { id: "A", text: "C5" },
      { id: "B", text: "E3" },
      { id: "C", text: "G3" },
      { id: "D", text: "E5" },
    ],
    correct_answer: "B",
  },

  // Question 14: Dot plot (with chart)
  {
    question_number: 14,
    question_type: "multiple-choice",
    content: [
      {
        id: "1",
        type: "text",
        content:
          "Ten people were each asked how many times they went to the supermarket last month.",
      },
      {
        id: "2",
        type: "text",
        content: "The results were: 3, 4, 2, 2, 2, 3, 1, 5, 3, 4",
      },
      {
        id: "3",
        type: "text",
        content: "Select the dot plot that correctly displays this data.",
        style: "bold",
      },
    ],
    options: [
      { id: "A", imageUrl: "/images/questions/dotplot-a.png" },
      { id: "B", imageUrl: "/images/questions/dotplot-b.png" },
      { id: "C", imageUrl: "/images/questions/dotplot-c.png" },
      { id: "D", imageUrl: "/images/questions/dotplot-d.png" },
    ],
    correct_answer: "C",
  },

  // Question 20: Spinner (probability)
  {
    question_number: 20,
    question_type: "multiple-choice",
    content: [
      {
        id: "1",
        type: "text",
        content: "Matt spins the arrow on this spinner.",
      },
      {
        id: "2",
        type: "image",
        url: "/images/questions/spinner.png",
        alt: "Spinner with 3 red, 2 blue, and 1 yellow section",
        width: 200,
      },
      {
        id: "3",
        type: "text",
        content: "Which colour is the spinner most likely to land on?",
        style: "bold",
      },
    ],
    options: [
      { id: "A", text: "red" },
      { id: "B", text: "blue" },
      { id: "C", text: "yellow" },
      { id: "D", text: "all colours are equally likely" },
    ],
    correct_answer: "A",
  },

  // Question 27: Fractions
  {
    question_number: 27,
    question_type: "multiple-choice",
    content: [
      {
        id: "1",
        type: "text",
        content: "Bill, Sue and Mark share a bag of apples.",
      },
      {
        id: "2",
        type: "text",
        content: "Bill and Sue each get ",
      },
      {
        id: "3",
        type: "fraction",
        numerator: 1,
        denominator: 6,
        display: "numeric",
      },
      { id: "4", type: "text", content: " of the apples in the bag." },
      {
        id: "5",
        type: "text",
        content: "What fraction of the bag of apples is left for Mark?",
        style: "bold",
      },
    ],
    options: [
      {
        id: "A",
        content: [
          {
            id: "a1",
            type: "fraction",
            numerator: 4,
            denominator: 6,
            display: "numeric",
          },
        ],
      },
      {
        id: "B",
        content: [
          {
            id: "b1",
            type: "fraction",
            numerator: 3,
            denominator: 6,
            display: "numeric",
          },
        ],
      },
      {
        id: "C",
        content: [
          {
            id: "c1",
            type: "fraction",
            numerator: 2,
            denominator: 6,
            display: "numeric",
          },
        ],
      },
      {
        id: "D",
        content: [
          {
            id: "d1",
            type: "fraction",
            numerator: 1,
            denominator: 6,
            display: "numeric",
          },
        ],
      },
    ],
    correct_answer: "A",
  },

  // Question 29: Number line
  {
    question_number: 29,
    question_type: "multiple-choice",
    content: [
      {
        id: "1",
        type: "text",
        content: "Arav went for a run and stopped after ",
      },
      {
        id: "2",
        type: "fraction",
        numerator: 1,
        denominator: 4,
        display: "numeric",
      },
      { id: "3", type: "text", content: " kilometre." },
      {
        id: "4",
        type: "text",
        content:
          "Which of these shows Arav at the point where he stopped running?",
        style: "bold",
      },
    ],
    options: [
      {
        id: "A",
        content: [
          {
            id: "a1",
            type: "number-line",
            min: 0,
            max: 1,
            markers: [{ value: 0.25, icon: "🏃" }],
          },
        ],
      },
      {
        id: "B",
        content: [
          {
            id: "b1",
            type: "number-line",
            min: 0,
            max: 4,
            markers: [{ value: 1, icon: "🏃" }],
          },
        ],
      },
      {
        id: "C",
        content: [
          {
            id: "c1",
            type: "number-line",
            min: 0,
            max: 1,
            markers: [{ value: 0.1, icon: "🏃" }],
          },
        ],
      },
      {
        id: "D",
        content: [
          {
            id: "d1",
            type: "number-line",
            min: 0,
            max: 4,
            markers: [{ value: 0.25, icon: "🏃" }],
          },
        ],
      },
    ],
    correct_answer: "A",
  },
];
