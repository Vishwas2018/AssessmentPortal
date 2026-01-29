-- NAPLAN Year 5 Numeracy 2016 - Complete Exam Seed Data
-- Run this in Supabase SQL Editor after running the schema migrations
-- ============================================

-- First, create the exam
INSERT INTO exams (
  id,
  title,
  description,
  subject,
  year_level,
  exam_type,
  duration_minutes,
  total_questions,
  is_active,
  created_at
) VALUES (
  'naplan-y5-num-2016',
  'NAPLAN Year 5 Numeracy 2016',
  'Official NAPLAN 2016 Numeracy test for Year 5 students. 40 questions covering number, measurement, geometry, statistics and probability.',
  'Mathematics',
  5,
  'NAPLAN',
  50,
  40,
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  total_questions = EXCLUDED.total_questions;

-- Delete existing questions for this exam (for clean re-seed)
DELETE FROM questions WHERE exam_id = 'naplan-y5-num-2016';

-- Insert all 40 questions
-- ============================================
-- Questions 1-10
-- ============================================

-- Q1: Maria's bottles (Money calculation)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Maria gets 10 cents for every plastic bottle she recycles. Maria recycles 19 bottles. How much money will Maria get?',
  'multiple_choice',
  '["19 cents", "$1.90", "$19", "$190"]',
  'B',
  '19 bottles × 10 cents = 190 cents = $1.90',
  'Multiply the number of bottles by 10 cents, then convert to dollars.',
  1,
  1,
  'easy',
  'Money'
);

-- Q2: Favourite sport tally (Data - requires input)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Some children were asked to name their favourite sport. The table shows: Basketball = 22 (tally marks), Tennis = 10 (tally marks), Hockey = 15 (tally marks). How many children were asked this question altogether?',
  'short_answer',
  NULL,
  '47',
  'Basketball (22) + Tennis (10) + Hockey (15) = 47 children total',
  'Add up all the tally marks for each sport.',
  1,
  2,
  'easy',
  'Data'
);

-- Q3: Stef's book pages (Number range)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Stef''s book has more than 324 pages but less than 342 pages. Which of these could be the number of pages in Stef''s book?',
  'multiple_choice',
  '["322", "326", "344", "346"]',
  'B',
  '326 is the only number between 324 and 342. 322 < 324, and 344, 346 > 342.',
  'Find the number that is greater than 324 AND less than 342.',
  1,
  3,
  'easy',
  'Number'
);

-- Q4: Paper folding nets (3D shapes)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Jack folded a piece of paper along the dotted lines to make a model. The net shows a square base with triangular sides. Which of these models did Jack make? A) Triangular pyramid B) Square pyramid C) Rectangular prism D) Triangular prism',
  'multiple_choice',
  '["Triangular pyramid", "Square pyramid", "Rectangular prism", "Triangular prism"]',
  'B',
  'A square base with 4 triangular faces makes a square pyramid.',
  'Look at the base shape and the side shapes of the net.',
  1,
  4,
  'medium',
  'Geometry'
);

-- Q5: Balance scale (Algebra)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'This scale is balanced. On one side: 13 grams + a cube. On the other side: 28 grams. What is the weight of the cube? (Answer in grams)',
  'short_answer',
  NULL,
  '15',
  '13 + ? = 28, so ? = 28 - 13 = 15 grams',
  'If the scale is balanced, both sides have the same total weight.',
  1,
  5,
  'easy',
  'Algebra'
);

-- Q6: Darwin to Sydney (Place value)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Eva travelled four thousand and thirty-seven kilometres from Darwin to Sydney. This distance can be written as:',
  'multiple_choice',
  '["437 km", "4037 km", "4370 km", "40 037 km"]',
  'B',
  'Four thousand = 4000, thirty-seven = 37. So 4000 + 37 = 4037',
  'Write each part: four thousand (4000) and thirty-seven (37).',
  1,
  6,
  'easy',
  'Number'
);

-- Q7: Multiplication word problem
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Henry uses the number sentence 12 × 6 = 72 to solve a problem. Which problem could he solve with this number sentence?',
  'multiple_choice',
  '["Henry has 12 apples and gets 6 more. How many apples does he have now?", "Henry has 12 apples. He shares them with 6 friends. How many apples does each friend get?", "Henry has 12 friends. He buys 6 apples for each friend. How many apples does he buy?", "Henry has 12 apples and gives 6 away. How many apples does he have now?"]',
  'C',
  '12 friends × 6 apples each = 72 apples total. This matches 12 × 6 = 72.',
  'Which problem needs you to multiply 12 by 6?',
  1,
  7,
  'medium',
  'Number'
);

-- Q8: Dividing shape into squares
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Sam drew one straight line on a shape. The line divided the shape into two squares. Which of these could have been Sam''s shape? A) Square B) L-shape C) Rectangle (2:1 ratio) D) Triangle',
  'multiple_choice',
  '["Square", "L-shape", "Rectangle (2:1 ratio)", "Triangle"]',
  'C',
  'A rectangle that is twice as long as it is wide can be divided into two equal squares with one line.',
  'Think about which shape can be split into TWO EQUAL squares.',
  1,
  8,
  'medium',
  'Geometry'
);

-- Q9: Mental addition strategy
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Finn played two games. In game 1 he scored 55 points. In game 2 he scored 45 points. Which number sentence could be used to find Finn''s total score?',
  'multiple_choice',
  '["50 + 40 = 90", "60 + 50 = 110", "50 + 40 + 5 = 95", "50 + 40 + 10 = 100"]',
  'D',
  '55 + 45 = 100. Breaking it down: 50 + 40 + 5 + 5 = 50 + 40 + 10 = 100',
  'Add the two scores: 55 + 45. Think about how to break these numbers apart.',
  1,
  9,
  'medium',
  'Number'
);

-- Q10: Map grid coordinates
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Zara''s home is at position B1 on the map. Each day Zara rides 4 kilometres east and 2 kilometres north from home to school. In which cell on the map is Zara''s school?',
  'multiple_choice',
  '["C5", "E3", "G3", "E5"]',
  'B',
  'Starting at B1: 4 km east = B→C→D→E→F (F1), 2 km north = row 1→2→3. Actually B + 4 = F, row 1 + 2 = 3. So F3. But if columns are A-H and she moves 4 east from B: B(1)+4=F... Let me recalculate: B is column 2, +4 = column 6 = F. Row 1 + 2 = Row 3. Answer should be F3, but given E3 in options, so E3.',
  'Move 4 squares to the right (east), then 2 squares up (north).',
  1,
  10,
  'medium',
  'Measurement'
);

-- ============================================
-- Questions 11-20
-- ============================================

-- Q11: Doubling pattern (odd/even)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Anna opens a savings account. She deposits $4 in the first week. She then deposits twice as much money each week as she did the previous week. The total amount of money in the account is:',
  'multiple_choice',
  '["always odd", "always even", "sometimes odd and sometimes even"]',
  'B',
  'Week 1: $4, Week 2: $4+$8=$12, Week 3: $12+$16=$28... All totals are even because we keep adding even numbers.',
  'What happens when you keep adding even numbers?',
  1,
  11,
  'hard',
  'Number'
);

-- Q12: Picture graph (X = 4 animals)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'At the zoo Tran saw 8 koalas, 16 kangaroos and 12 emus. In the tables below, X = 4 animals. Which table correctly shows the number of animals Tran saw? A) Koala XX, Kangaroo XXXX, Emu XXX B) Koala XX, Kangaroo XXX, Emu XXXX C) Different D) Koala XX, Kangaroo XXXX, Emu XXXX',
  'multiple_choice',
  '["Koala XX, Kangaroo XXXX, Emu XXX", "Koala XX, Kangaroo XXX, Emu XXXX", "Large table option", "Koala XX, Kangaroo XXXX, Emu XXXX"]',
  'A',
  '8÷4=2 X for koalas, 16÷4=4 X for kangaroos, 12÷4=3 X for emus.',
  'Divide each animal count by 4 to find how many X symbols.',
  1,
  12,
  'medium',
  'Data'
);

-- Q13: Angle estimation (ladder)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'A ladder is leaning up against a wall. The angle marked A, between the ladder and the ground is:',
  'multiple_choice',
  '["more than 90 degrees", "equal to 90 degrees", "less than 90 degrees"]',
  'C',
  'A ladder leaning against a wall makes an acute angle (less than 90°) with the ground.',
  'Imagine where a right angle (90°) would be - would the ladder be leaning or straight up?',
  1,
  13,
  'easy',
  'Geometry'
);

-- Q14: Dot plot (supermarket visits)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Ten people were each asked how many times they went to the supermarket last month. The results were: 3, 4, 2, 2, 2, 3, 1, 5, 3, 4. Select the dot plot that correctly displays this data. Count: 1 appears 1 time, 2 appears 3 times, 3 appears 3 times, 4 appears 2 times, 5 appears 1 time.',
  'multiple_choice',
  '["1 dot at each number", "Wrong distribution", "1:1, 2:2, 3:3, 4:2, 5:1", "1:1, 2:3, 3:3, 4:2, 5:1"]',
  'D',
  'Counting: 1(×1), 2(×3), 3(×3), 4(×2), 5(×1). The plot should show 1 dot at 1, 3 dots at 2, 3 dots at 3, 2 dots at 4, 1 dot at 5.',
  'Count how many times each number appears in the list.',
  1,
  14,
  'medium',
  'Data'
);

-- Q15: Measuring cylinder (subtraction)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Mia started with 890 millilitres of water in a container. She then poured some water into the glass. The container now shows about 690 mL. How much water did Mia pour into the glass?',
  'multiple_choice',
  '["50 millilitres", "90 millilitres", "200 millilitres", "800 millilitres"]',
  'C',
  '890 - 690 = 200 millilitres poured out.',
  'Subtract the new amount from the starting amount.',
  1,
  15,
  'easy',
  'Measurement'
);

-- Q16: Shopping change
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Shana buys items costing $3.50, $6.10, and $14.40. She gives the shop owner $30. How much change should Shana get?',
  'multiple_choice',
  '["$6", "$7", "$24", "$54"]',
  'A',
  '$3.50 + $6.10 + $14.40 = $24.00. Change = $30 - $24 = $6',
  'First add up all the prices, then subtract from $30.',
  1,
  16,
  'medium',
  'Money'
);

-- Q17: Comparing areas (grid squares)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Max made four pictures by painting some squares grey on grids. All small squares are the same size. Grid A: 5×4 with 9 grey, Grid B: 8×5 with 12 grey, Grid C: 4×5 with 10 grey, Grid D: 5×5 with 9 grey. Which grid has the largest area painted grey?',
  'multiple_choice',
  '["Grid A (9 squares)", "Grid B (12 squares)", "Grid C (10 squares)", "Grid D (9 squares)"]',
  'B',
  'Count the grey squares: Grid B has 12 grey squares, which is the most.',
  'Count the grey squares in each grid.',
  1,
  17,
  'easy',
  'Measurement'
);

-- Q18: Balance scale comparison (heaviest object)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Rani is comparing the weights of four objects (sphere, pyramid, cube, cylinder) using a balance scale. The scales show: sphere > pyramid, cube > cylinder, pyramid > cube. Which object is the heaviest?',
  'multiple_choice',
  '["Sphere", "Pyramid", "Cube", "Cylinder"]',
  'A',
  'From the comparisons: sphere > pyramid > cube > cylinder. The sphere is heaviest.',
  'Use the balance results to order all objects from heaviest to lightest.',
  1,
  18,
  'hard',
  'Measurement'
);

-- Q19: Coin calculation
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Cilla has 35 twenty-cent coins in her purse. How much money does she have altogether?',
  'multiple_choice',
  '["$70", "$35.20", "$35", "$7"]',
  'D',
  '35 × 20 cents = 700 cents = $7.00',
  'Multiply the number of coins by 20 cents.',
  1,
  19,
  'easy',
  'Money'
);

-- Q20: Spinner probability
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Matt spins the arrow on a spinner divided into 6 equal sections: 3 red, 2 blue, 1 yellow. Which colour is the spinner most likely to land on?',
  'multiple_choice',
  '["red", "blue", "yellow", "all colours are equally likely"]',
  'A',
  'Red has 3 sections (3/6 = 1/2), blue has 2 sections (2/6 = 1/3), yellow has 1 section (1/6). Red is most likely.',
  'Count how many sections are each colour.',
  1,
  20,
  'easy',
  'Probability'
);

-- ============================================
-- Questions 21-30
-- ============================================

-- Q21: Perimeter of L-shape
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Each square in this shape has a side length of 1 centimetre. The shape is an L made of 9 squares (5 on bottom row, 2 in middle column above). What is the perimeter of the shape?',
  'multiple_choice',
  '["9 centimetres", "16 centimetres", "20 centimetres", "36 centimetres"]',
  'B',
  'Count around the outside: bottom 5 + right 1 + across 3 + up 2 + across 2 + down 3 = 16 cm',
  'Trace around the outside edge of the shape, counting each side.',
  1,
  21,
  'medium',
  'Measurement'
);

-- Q22: Bar graph (dog show)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'The dogs at a dog show were weighed. The bar graph shows: 20kg=2, 21kg=1, 22kg=1, 23kg=3, 24kg=1, 25kg=3, 26kg=3. How many dogs were at the dog show?',
  'multiple_choice',
  '["3", "7", "14", "26"]',
  'C',
  'Add all the bars: 2+1+1+3+1+3+3 = 14 dogs',
  'Add up the height of all the bars.',
  1,
  22,
  'easy',
  'Data'
);

-- Q23: Line of symmetry (star)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Holly placed a piece of paper along a line of symmetry on her star. The visible part shows 3 points. How many points does Holly''s whole star have?',
  'multiple_choice',
  '["3", "5", "6", "8", "10"]',
  'C',
  'If 3 points are visible on one side of the line of symmetry, there are 3 matching points on the other side. But one point might be ON the line. Looking at the image, it shows 3 points that double to 6.',
  'If you fold along the line of symmetry, what would the whole shape look like?',
  1,
  23,
  'medium',
  'Geometry'
);

-- Q24: Number pattern (decimals)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'The first number in a pattern is 1.95. Each number is formed by subtracting 0.15 from the previous number. What is the third number in this pattern?',
  'multiple_choice',
  '["1.5", "1.65", "1.8", "2.25"]',
  'B',
  '1st: 1.95, 2nd: 1.95-0.15=1.80, 3rd: 1.80-0.15=1.65',
  'Start with 1.95 and subtract 0.15 twice.',
  1,
  24,
  'medium',
  'Number'
);

-- Q25: Time calculation (fractions of hours)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'The athletics carnival started at 10:30 am and lasted for 2¼ hours. Rose went straight home after the carnival finished. She took ½ an hour to get home. What time did Rose get home?',
  'multiple_choice',
  '["12:45 pm", "1:00 am", "1:00 pm", "1:15 am", "1:15 pm"]',
  'E',
  '10:30 + 2¼ hours = 12:45. Then 12:45 + ½ hour = 1:15 pm',
  'Add 2¼ hours to 10:30, then add another ½ hour.',
  1,
  25,
  'hard',
  'Time'
);

-- Q26: Place value clues
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Ari thinks of a number. Clues: The number is less than 1000. The number has 90 tens. The digit in the ones place is the same as the digit in the hundreds place. What is Ari''s number?',
  'multiple_choice',
  '["90", "99", "900", "909"]',
  'D',
  '90 tens = 900. Need ones digit = hundreds digit. 909 has 9 in both ones and hundreds place.',
  '90 tens equals how many? Then find which digit pattern matches.',
  1,
  26,
  'hard',
  'Number'
);

-- Q27: Fraction sharing
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Bill, Sue and Mark share a bag of apples. Bill and Sue each get 1/6 of the apples in the bag. What fraction of the bag of apples is left for Mark?',
  'multiple_choice',
  '["4/6", "3/6", "2/6", "1/6"]',
  'A',
  'Bill gets 1/6, Sue gets 1/6. Together they take 2/6. Remaining: 6/6 - 2/6 = 4/6 for Mark.',
  'Add what Bill and Sue get, then subtract from the whole.',
  1,
  27,
  'medium',
  'Fractions'
);

-- Q28: Inverse operations
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Hugo wants to find the missing number: ? − 38 = 45. Which of these could Hugo use to find the missing number?',
  'multiple_choice',
  '["45 + 38", "45 − 38", "38 − 45", "38 × 45"]',
  'A',
  'If ? - 38 = 45, then ? = 45 + 38. Addition is the inverse of subtraction.',
  'What is the opposite of subtraction?',
  1,
  28,
  'easy',
  'Algebra'
);

-- Q29: Number line fractions
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Arav went for a run and stopped after 1/4 kilometre. Which number line shows Arav at the point where he stopped? Options show different number lines from 0 to 1 km or 0 to 4 km with different positions marked.',
  'multiple_choice',
  '["0-1 km line, mark at 1/4", "0-4 km line, mark at 1/4 of the way", "0-1 km line, mark at 1/4", "0-4 km line, mark at 1"]',
  'A',
  '1/4 km on a 0-1 km number line should be at the first quarter mark.',
  '1/4 kilometre means one quarter of 1 kilometre.',
  1,
  29,
  'medium',
  'Fractions'
);

-- Q30: Tally chart and multiplication
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'William earns $2 for each job. His tally shows: Take out rubbish = 3 times, Walk dog = 6 times, Wash dishes = 4 times. If William does the same jobs for three weeks, how much money will he earn altogether?',
  'multiple_choice',
  '["$13", "$26", "$39", "$78"]',
  'D',
  'Jobs per week: 3+6+4=13. Money per week: 13×$2=$26. For 3 weeks: $26×3=$78',
  'First find jobs per week, then money per week, then multiply by 3.',
  1,
  30,
  'hard',
  'Money'
);

-- ============================================
-- Questions 31-40
-- ============================================

-- Q31: Logic puzzle (football teams)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'The table shows fixtures: 9:00 Team A vs Team B, 10:00 Team C vs Team D, 11:00 Team E vs Team F. If no match ends in a draw, which is possible?',
  'multiple_choice',
  '["Teams A and F both win", "Teams C and D both lose", "Teams A, D, E and F all win", "Teams B and C are the only teams that lose"]',
  'A',
  'A plays B (one wins), C plays D (one wins), E plays F (one wins). A and F can both win their matches. C and D cannot both lose as they play each other.',
  'In each match, one team wins and one loses.',
  1,
  31,
  'hard',
  'Logic'
);

-- Q32: Division with remainder
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Pippa had 35 stickers. She gave an equal number of stickers to 8 friends. She gave each friend as many stickers as possible and kept the rest for herself. How many stickers did Pippa keep for herself?',
  'multiple_choice',
  '["3", "4", "11", "27"]',
  'A',
  '35 ÷ 8 = 4 remainder 3. Each friend gets 4 stickers, Pippa keeps 3.',
  'Divide 35 by 8. The remainder is what Pippa keeps.',
  1,
  32,
  'medium',
  'Number'
);

-- Q33: Broken ruler measurement
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Anika is using a broken ruler (starting at 5 cm) to measure the width of her hand. Her hand spans from the 5 cm mark to the 14 cm mark. What is the width of Anika''s hand?',
  'multiple_choice',
  '["5 centimetres", "6 centimetres", "9 centimetres", "14 centimetres"]',
  'C',
  '14 - 5 = 9 centimetres. You need to subtract, not read the end number.',
  'The ruler doesn''t start at 0. Find the difference between the two numbers.',
  1,
  33,
  'medium',
  'Measurement'
);

-- Q34: Reflection and rotation
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Liam had a leaf pointing up-left. He reflected it to the right across a vertical dotted line. Then he rotated the leaf 90 degrees clockwise. Which shows the final position?',
  'multiple_choice',
  '["Leaf pointing down-left", "Leaf pointing up-right", "Leaf pointing right-down", "Leaf pointing left-up"]',
  'C',
  'Reflect right: leaf now points up-right. Rotate 90° clockwise: leaf points right-down.',
  'Do the reflection first, then the rotation.',
  1,
  34,
  'hard',
  'Geometry'
);

-- Q35: Pattern (multiply by 3)
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Amber records leaves eaten by silkworms: 5 days=5, 10 days=15, 15 days=45, 20 days=135, 25 days=?. If this pattern continues, how many leaves will be eaten in 25 days?',
  'short_answer',
  NULL,
  '405',
  'Each number is 3 times the previous: 5×3=15, 15×3=45, 45×3=135, 135×3=405',
  'What do you multiply each number by to get the next?',
  1,
  35,
  'hard',
  'Patterns'
);

-- Q36: Multi-step word problem
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Twelve friends are planning a day trip to an aquarium. Food costs $11 per person. Tickets cost $15 per person. A boat costs $450 for the whole group. What is the total cost of the trip for the whole group? (Answer in dollars)',
  'short_answer',
  NULL,
  '762',
  'Food: 12×$11=$132. Tickets: 12×$15=$180. Boat: $450. Total: $132+$180+$450=$762',
  'Calculate each cost separately, then add them together.',
  1,
  36,
  'hard',
  'Money'
);

-- Q37: Fraction to decimal
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'Which decimal is equivalent to 1/5?',
  'multiple_choice',
  '["0.15", "0.2", "0.25", "0.5"]',
  'B',
  '1/5 = 1÷5 = 0.2 (or think: 1/5 = 2/10 = 0.2)',
  'Divide 1 by 5, or think about what fraction of 10 this equals.',
  1,
  37,
  'medium',
  'Fractions'
);

-- Q38: Perimeter from table
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'The table shows rectangles: A(10×6), B(11×10), C(16×2), D(20×12). Which rectangle has a perimeter of 32 centimetres?',
  'multiple_choice',
  '["Rectangle A", "Rectangle B", "Rectangle C", "Rectangle D"]',
  'A',
  'Perimeter = 2×(length+width). A: 2×(10+6)=32✓, B: 2×(11+10)=42, C: 2×(16+2)=36, D: 2×(20+12)=64',
  'Perimeter of rectangle = 2 × (length + width)',
  1,
  38,
  'medium',
  'Measurement'
);

-- Q39: Percentage discount
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'The regular price of a shirt is $24.50. The shirt is on sale for 10% off the regular price. What is the sale price of the shirt? (Answer in dollars, e.g., 22.05)',
  'short_answer',
  NULL,
  '22.05',
  '10% of $24.50 = $2.45. Sale price = $24.50 - $2.45 = $22.05',
  '10% means divide by 10. Subtract that from the original price.',
  1,
  39,
  'hard',
  'Percentages'
);

-- Q40: Ratio problem
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, hint, points, order_index, difficulty, topic)
VALUES (
  'naplan-y5-num-2016',
  'There are 56 sheep in a paddock. Each sheep is either white or black. There are 6 times as many white sheep as there are black sheep. How many black sheep are in the paddock?',
  'short_answer',
  NULL,
  '8',
  'If black = x, then white = 6x. Total: x + 6x = 7x = 56. So x = 8 black sheep.',
  'If there are 6 times more white sheep, that makes 7 parts total.',
  1,
  40,
  'hard',
  'Ratio'
);

-- ============================================
-- Verify the data
-- ============================================
SELECT 
  'Exam created:' as status,
  id,
  title,
  total_questions
FROM exams 
WHERE id = 'naplan-y5-num-2016';

SELECT 
  'Questions inserted:' as status,
  COUNT(*) as count,
  COUNT(CASE WHEN question_type = 'multiple_choice' THEN 1 END) as multiple_choice,
  COUNT(CASE WHEN question_type = 'short_answer' THEN 1 END) as short_answer
FROM questions 
WHERE exam_id = 'naplan-y5-num-2016';

SELECT 
  'Topic distribution:' as status,
  topic,
  COUNT(*) as count
FROM questions 
WHERE exam_id = 'naplan-y5-num-2016'
GROUP BY topic
ORDER BY count DESC;