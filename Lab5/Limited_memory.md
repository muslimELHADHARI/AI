Lab 4: Limited Memory Informed Search Algorithms
Overview
This document provides guidance for implementing and comparing Recursive Best-First Search (RBFS), Simplified Memory-Bounded A* (SMA*), and Iterative Deepening A* (IDA*) for maze solving, as outlined in Lab 4. It includes pseudocode for each algorithm, a maze generation algorithm, and a framework for performance comparison across maze sizes (10x10, 20x20, 30x30). The focus is on memory efficiency, path quality, execution time, and sensitivity to maze complexity.
Task 1: Maze Generator
Objective
Generate perfect mazes (one unique path from start to goal) with a start point (‘S’), goal point (‘G’), walls, and open cells. Allow movement in four directions (up, down, left, right) with a uniform cost of 1 per step.
Algorithm Choice
Use the recursive backtracker algorithm, a depth-first search-based method that ensures a perfect maze. It’s simple to implement and produces mazes with a single solution path, suitable for testing pathfinding algorithms.
Pseudocode for Recursive Backtracker
function GENERATE_MAZE(width, height):
    Initialize grid of size width × height with all walls
    Choose random starting cell (x, y)
    Mark (x, y) as visited
    RECURSIVE_BACKTRACK(x, y)
    Place ‘S’ at a random open cell
    Place ‘G’ at another random open cell, ensuring connectivity
    Return grid

function RECURSIVE_BACKTRACK(x, y):
    Mark (x, y) as open
    Randomly shuffle neighbors [(x+2, y), (x-2, y), (x, y+2), (x, y-2)]
    For each neighbor (nx, ny):
        If (nx, ny) is within bounds and not visited:
            Remove wall between (x, y) and (nx, ny)
            RECURSIVE_BACKTRACK(nx, ny)

Implementation Notes

Represent the maze as a 2D grid where cells are either open (0), walls (1), start (‘S’), or goal (‘G’).
Ensure the start and goal are placed in open cells with a valid path between them.
Test maze generation for sizes 10x10, 20x20, and 30x30 to evaluate algorithm scalability.

Task 2: Implement the Algorithms
Recursive Best-First Search (RBFS)
RBFS simulates A* with linear memory by using recursion and tracking the best alternative path. It’s memory-efficient but may re-expand nodes, increasing time complexity.
Pseudocode
function RBFS(problem, node, f_limit):
    If problem.GOAL_TEST(node.STATE):
        Return SOLUTION(node)
    successors = []
    For each action in problem.ACTIONS(node.STATE):
        Add CHILD_NODE(problem, node, action) to successors
    If successors is empty:
        Return failure, INFINITY
    For each s in successors:
        s.f = max(s.g + s.h, node.f)
    Loop:
        best = lowest f-value node in successors
        If best.f > f_limit:
            Return failure, best.f
        alternative = second-lowest f-value in successors
        result, best.f = RBFS(problem, best, min(f_limit, alternative))
        If result != failure:
            Return result

Notes

f(n) = g(n) + h(n), where g(n) is the cost to reach node n, and h(n) is the heuristic estimate (e.g., Manhattan distance).
Memory usage is O(bd), where b is the branching factor and d is the solution depth.
May suffer from excessive node regeneration, impacting execution time.

Simplified Memory-Bounded A* (SMA*)
SMA* extends A* by limiting memory usage. When memory is full, it prunes the highest f-cost node and stores its f-cost for potential regeneration, balancing memory and optimality.
Pseudocode
function SMA_STAR(problem, memory_limit):
    open_list = PriorityQueue()
    open_list.insert(MAKE_NODE(problem.INITIAL_STATE))
    While open_list is not empty:
        If open_list.size > memory_limit:
            highest_f_node = open_list.find_highest_f()
            open_list.remove(highest_f_node)
            parent = highest_f_node.PARENT
            parent.f = min(parent.f, highest_f_node.f)
        node = open_list.pop_lowest_f()
        If problem.GOAL_TEST(node.STATE):
            Return SOLUTION(node)
        For each action in problem.ACTIONS(node.STATE):
            child = CHILD_NODE(problem, node, action)
            If child.STATE not in open_list or child.f < open_list[child.STATE].f:
                open_list.insert(child)
    Return failure

Notes

Uses a priority queue ordered by f-cost.
Memory usage is bounded by memory_limit (number of nodes).
Optimal if memory is sufficient to store the shallowest optimal solution; otherwise, returns the best solution within memory constraints.
Re-expansion of forgotten nodes may increase computation time.

Iterative Deepening A* (IDA*)
IDA* combines depth-first search with iterative deepening, using a cost threshold based on f(n). It’s memory-efficient but may re-explore nodes multiple times.
Pseudocode
function IDA_STAR(root):
    bound = h(root)
    path = [root]
    While True:
        t = SEARCH(path, 0, bound)
        If t = FOUND:
            Return path
        If t = INFINITY:
            Return NOT_FOUND
        bound = t

function SEARCH(path, g, bound):
    node = path.last
    f = g + h(node)
    If f > bound:
        Return f
    If is_goal(node):
        Return FOUND
    min = INFINITY
    For each succ in successors(node):
        If succ not in path:
            path.append(succ)
            t = SEARCH(path, g + cost(node, succ), bound)
            If t = FOUND:
                Return FOUND
            If t != INFINITY:
                min = min(min, t)
            path.pop()
    Return min

Notes

Memory usage is O(bd), similar to RBFS.
Optimal with an admissible heuristic.
Performance may degrade in mazes with many nodes having similar f-values, leading to more iterations.

Task 3: Compare the Algorithms
Metrics



Metric
Measurement Method



Number of Iterations
Count node expansions or recursive calls.


Execution Time
Measure runtime in seconds for each maze size.


Path Quality
Compare path length to the shortest possible path.


Memory Efficiency
Track maximum number of nodes stored during execution.


Implementation Tips

Use a consistent heuristic (e.g., Manhattan distance) for all algorithms to ensure fair comparison.
Run experiments on multiple mazes per size to account for variability.
Log metrics using a programming language like Python, which supports easy timing and memory profiling.

Task 4: Discuss the Results
Expected Observations

Memory Efficiency:
RBFS and IDA* use linear memory (O(bd)), making them highly efficient for memory-constrained environments.
SMA*’s memory usage depends on the set limit, potentially using more memory but managing it effectively by pruning.


SMA Behavior with Limited Memory*:
When memory is full, SMA* removes the highest f-cost node, updating its parent’s f-cost to allow future regeneration if needed.
This may increase execution time due to re-expansions but ensures operation within memory limits.


Performance on Larger Mazes:
RBFS and IDA* are likely to perform well in larger mazes due to low memory requirements.
SMA* may excel if memory is sufficient, behaving like A* with optimal speed.


IDA Optimality*:
IDA* guarantees optimal paths with an admissible heuristic, as it explores nodes within increasing f-cost thresholds.


Sensitivity to Maze Complexity:
IDA* may be slower in mazes with many nodes having similar f-values, causing more iterations.
RBFS may expand fewer nodes than IDA* in some cases, especially with monotonic heuristics.
SMA*’s performance depends on memory availability and maze structure.



Discussion Points

Trade-offs: RBFS and IDA* sacrifice time for memory efficiency, while SMA* balances both but requires careful memory tuning.
Maze Complexity: Mazes with many dead ends or uniform f-values may challenge IDA* more than RBFS or SMA*.
Scalability: Test how each algorithm scales with maze size, noting any performance degradation.
Practical Applications: Consider scenarios (e.g., robotics, gaming) where memory constraints dictate algorithm choice.

Sample Python Implementation
Below is a simplified Python implementation to get started. It includes a maze generator and stubs for the search algorithms, which you can expand with the pseudocode above.
import random
from queue import PriorityQueue

# Maze Generator
def generate_maze(width, height):
    # Initialize grid with walls (1)
    grid = [[1 for _ in range(width)] for _ in range(height)]
    def recursive_backtrack(x, y):
        grid[y][x] = 0  # Mark as open
        directions = [(0, 2), (2, 0), (0, -2), (-2, 0)]
        random.shuffle(directions)
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height and grid[ny][nx] == 1:
                grid[y + dy//2][x + dx//2] = 0  # Remove wall
                recursive_backtrack(nx, ny)
    
    # Start at random even coordinates
    start_x, start_y = random.randrange(0, width, 2), random.randrange(0, height, 2)
    recursive_backtrack(start_x, start_y)
    
    # Place start and goal
    open_cells = [(i, j) for i in range(height) for j in range(width) if grid[i][j] == 0]
    start, goal = random.sample(open_cells, 2)
    grid[start[0]][start[1]] = 'S'
    grid[goal[0]][goal[1]] = 'G'
    return grid

# Node class for search algorithms
class Node:
    def __init__(self, state, parent=None, action=None, g=0, h=0):
        self.state = state  # (x, y) coordinates
        self.parent = parent
        self.action = action
        self.g = g  # Cost to reach node
        self.h = h  # Heuristic estimate
        self.f = g + h  # Estimated total cost

# Heuristic function (Manhattan distance)
def manhattan_distance(state, goal):
    return abs(state[0] - goal[0]) + abs(state[1] - goal[1])

# RBFS Implementation (Stub)
def rbfs(problem, node, f_limit):
    # Implement based on pseudocode above
    pass

# SMA* Implementation (Stub)
def sma_star(problem, memory_limit):
    # Implement based on pseudocode above
    pass

# IDA* Implementation (Stub)
def ida_star(root, goal):
    # Implement based on pseudocode above
    pass

# Example Usage
width, height = 10, 10
maze = generate_maze(width, height)
for row in maze:
    print(' '.join(str(cell) for cell in row))

Conclusion
This lab provides hands-on experience with memory-efficient search algorithms. By implementing RBFS, SMA*, and IDA*, generating mazes, and comparing their performance, you’ll gain insights into their strengths and weaknesses. RBFS and IDA* excel in low-memory scenarios, while SMA* offers flexibility with adjustable memory limits. Analyzing their behavior across maze sizes and complexities will deepen your understanding of heuristic search in AI.
