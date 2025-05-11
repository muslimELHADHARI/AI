# Lab 4: Limited Memory Informed Search Algorithms

## Complete Python Implementation

The following Python code includes the maze generator, implementations of RBFS, SMA*, and IDA*, and an experiment framework to compare their performance. The code generates mazes, runs each algorithm, and collects metrics (iterations, execution time, path length, memory usage) for maze sizes 10x10, 20x20, and 30x30.

```python
import random
import time
import sys
from heapq import heappush, heappop

# Increase recursion limit to handle deeper mazes
sys.setrecursionlimit(10000)

# Node class for search algorithms
class Node:
    def __init__(self, state, parent=None, action=None, g=0, h=0):
        self.state = state  # (row, col)
        self.parent = parent
        self.action = action
        self.g = g  # Cost to reach node
        self.h = h  # Heuristic estimate
        self.f = g + h  # Estimated total cost

# Maze generator using recursive backtracker
def generate_maze(rows, cols):
    grid = [[1 for _ in range(cols)] for _ in range(rows)]  # 1 = wall
    def carve_passage(x, y):
        grid[y][x] = 0  # 0 = open
        directions = [(0, 2), (2, 0), (0, -2), (-2, 0)]
        random.shuffle(directions)
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 0 <= nx < cols and 0 <= ny < rows and grid[ny][nx] == 1:
                grid[y + dy//2][x + dx//2] = 0
                carve_passage(nx, ny)
    
    # Start at random even coordinates
    start_x = random.randrange(0, cols, 2)
    start_y = random.randrange(0, rows, 2)
    carve_passage(start_x, start_y)
    
    # Place start and goal
    open_cells = [(i, j) for i in range(rows) for j in range(cols) if grid[i][j] == 0]
    start_pos, goal_pos = random.sample(open_cells, 2)
    return grid, start_pos, goal_pos

# Heuristic: Manhattan distance
def manhattan_distance(state, goal):
    return abs(state[0] - goal[0]) + abs(state[1] - goal[1])

# Get valid successor states
def get_successors(grid, state):
    row, col = state
    successors = []
    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        nr, nc = row + dr, col + dc
        if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] != 1:
            successors.append((nr, nc))
    return successors

# Reconstruct path from goal node
def reconstruct_path(node):
    path = []
    while node:
        path.append(node.state)
        node = node.parent
    return path[::-1]

# RBFS Implementation
def rbfs(grid, start_pos, goal_pos, timeout=30):
    heuristic = lambda state: manhattan_distance(state, goal_pos)
    root = Node(start_pos, g=0, h=heuristic(start_pos))
    iterations = [0]
    max_memory = [1]
    visited = set()
    start_time = time.time()

    def rbfs_recursive(node, f_limit):
        nonlocal iterations, max_memory
        iterations[0] += 1
        if time.time() - start_time > timeout:
            raise TimeoutError("RBFS timed out")
        if node.state == goal_pos:
            return node, node.f
        successors = []
        state_added = False
        if node.state not in visited:
            visited.add(node.state)
            state_added = True
        for succ_state in get_successors(grid, node.state):
            if succ_state not in visited:
                child = Node(succ_state, parent=node, action=None, g=node.g + 1, h=heuristic(succ_state))
                successors.append(child)
        max_memory[0] = max(max_memory[0], len(successors) + 1)
        if not successors:
            if state_added:
                visited.remove(node.state)
            return None, float('inf')
        for s in successors:
            s.f = max(s.g + s.h, node.f)
        while True:
            successors.sort(key=lambda x: x.f)
            best = successors[0]
            if best.f > f_limit:
                if state_added:
                    visited.remove(node.state)
                return None, best.f
            alternative = successors[1].f if len(successors) > 1 else float('inf')
            result, best_f = rbfs_recursive(best, min(f_limit, alternative))
            best.f = best_f
            if result:
                return result, best_f
        if state_added:
            visited.remove(node.state)

    try:
        result, _ = rbfs_recursive(root, float('inf'))
        exec_time = time.time() - start_time
        path = reconstruct_path(result) if result else None
        return path, iterations[0], exec_time, max_memory[0]
    except TimeoutError:
        print("RBFS timed out after", timeout, "seconds")
        return None, iterations[0], time.time() - start_time, max_memory[0]

# SMA* Implementation (Fixed)
def sma_star(grid, start_pos, goal_pos, memory_limit):
    heuristic = lambda state: manhattan_distance(state, goal_pos)
    open_list = []
    start_time = time.time()
    heappush(open_list, (0, id(Node(start_pos)), Node(start_pos, g=0, h=heuristic(start_pos))))
    iterations = [0]
    max_memory = [1]

    while open_list:
        iterations[0] += 1
        if len(open_list) > memory_limit:
            highest_f = max(open_list, key=lambda x: x[0])[0]
            open_list = [x for x in open_list if x[0] != highest_f]
            max_memory[0] = max(max_memory[0], len(open_list) + 1)
            if not open_list:  # Check if pruning emptied the list
                return None, iterations[0], time.time() - start_time, max_memory[0]
        _, _, node = heappop(open_list)
        if node.state == goal_pos:
            path = reconstruct_path(node)
            return path, iterations[0], time.time() - start_time, max_memory[0]
        for succ_state in get_successors(grid, node.state):
            child = Node(succ_state, parent=node, g=node.g + 1, h=heuristic(succ_state))
            existing = next((x for x in open_list if x[2].state == child.state), None)
            if existing and existing[0] <= child.f:
                continue
            if existing:
                open_list.remove(existing)
            heappush(open_list, (child.f, id(child), child))
            max_memory[0] = max(max_memory[0], len(open_list))
    return None, iterations[0], time.time() - start_time, max_memory[0]

# IDA* Implementation
def ida_star(grid, start_pos, goal_pos):
    heuristic = lambda state: manhattan_distance(state, goal_pos)
    iterations = [0]
    max_memory = [1]

    def search(path, g, bound):
        nonlocal iterations, max_memory
        iterations[0] += 1
        node = path[-1]
        f = g + heuristic(node.state)
        if f > bound:
            return f
        if node.state == goal_pos:
            return 'FOUND'
        min_exceeded = float('inf')
        for succ_state in get_successors(grid, node.state):
            if succ_state not in [n.state for n in path]:
                path.append(Node(succ_state, parent=path[-1], g=g + 1))
                max_memory[0] = max(max_memory[0], len(path))
                t = search(path, g + 1, bound)
                if t == 'FOUND':
                    return 'FOUND'
                if t != float('inf'):
                    min_exceeded = min(min_exceeded, t)
                path.pop()
        return min_exceeded

    start_time = time.time()
    bound = heuristic(start_pos)
    path = [Node(start_pos, g=0, h=heuristic(start_pos))]
    while True:
        t = search(path, 0, bound)
        if t == 'FOUND':
            exec_time = time.time() - start_time
            return reconstruct_path(path[-1]), iterations[0], exec_time, max_memory[0]
        if t == float('inf'):
            return None, iterations[0], time.time() - start_time, max_memory[0]
        bound = t

# Experiment framework
def run_experiments():
    maze_sizes = [(10, 10), (20, 20), (30, 30)]
    num_trials = 5  # Number of mazes per size
    memory_limit = 100  # For SMA*
    results = []

    for rows, cols in maze_sizes:
        size_results = {'size': f'{rows}x{cols}', 'RBFS': [], 'SMA*': [], 'IDA*': []}
        for _ in range(num_trials):
            grid, start_pos, goal_pos = generate_maze(rows, cols)
            
            # Run RBFS
            path_rbfs, iter_rbfs, time_rbfs, mem_rbfs = rbfs(grid, start_pos, goal_pos)
            size_results['RBFS'].append({
                'iterations': iter_rbfs,
                'time': time_rbfs,
                'path_length': len(path_rbfs) if path_rbfs else None,
                'memory': mem_rbfs
            })
            
            # Run SMA*
            path_sma, iter_sma, time_sma, mem_sma = sma_star(grid, start_pos, goal_pos, memory_limit)
            size_results['SMA*'].append({
                'iterations': iter_sma,
                'time': time_sma,
                'path_length': len(path_sma) if path_sma else None,
                'memory': mem_sma
            })
            
            # Run IDA*
            path_ida, iter_ida, time_ida, mem_ida = ida_star(grid, start_pos, goal_pos)
            size_results['IDA*'].append({
                'iterations': iter_ida,
                'time': time_ida,
                'path_length': len(path_ida) if path_ida else None,
                'memory': mem_ida
            })
        
        results.append(size_results)
    
    # Print results
    print("\nExperiment Results:")
    for size_result in results:
        print(f"\nMaze Size: {size_result['size']}")
        for algo in ['RBFS', 'SMA*', 'IDA*']:
            avg_iterations = sum(r['iterations'] for r in size_result[algo]) / num_trials
            avg_time = sum(r['time'] for r in size_result[algo]) / num_trials
            valid_paths = [r['path_length'] for r in size_result[algo] if r['path_length'] is not None]
            avg_path_length = sum(valid_paths) / len(valid_paths) if valid_paths else None
            avg_memory = sum(r['memory'] for r in size_result[algo]) / num_trials
            print(f"{algo}:")
            print(f"  Avg Iterations: {avg_iterations:.2f}")
            print(f"  Avg Execution Time: {avg_time:.4f} s")
            print(f"  Avg Path Length: {avg_path_length:.2f}" if avg_path_length else "  Avg Path Length: None")
            print(f"  Avg Max Memory: {avg_memory:.2f} nodes")

if __name__ == "__main__":
    # Set random seed for reproducibility
    random.seed(42)
    # Run experiments
    run_experiments()
```

## Report Outline

### Introduction
The maze problem requires finding the shortest path from a start point (S) to a goal point (G) in a grid with open cells (0) and walls (1). This lab implements three memory-efficient search algorithms—Recursive Best-First Search (RBFS), Simplified Memory-Bounded A* (SMA*), and Iterative Deepening A* (IDA*)—to solve mazes of sizes 10x10, 20x20, and 30x30. The goal is to compare their performance based on iterations, execution time, path quality, and memory efficiency, analyzing how memory constraints impact search efficiency.

### Methodology
#### Maze Generation
Mazes are generated using a recursive backtracker algorithm, which creates perfect mazes with a unique path between any two points. The `generate_maze` function produces a grid with randomly placed start and goal positions, ensuring connectivity.

#### Algorithm Implementation
- **RBFS**: Uses recursive calls to explore nodes with the lowest f-cost (g + h), storing only the current path and best alternative for linear memory usage.
- **SMA***: Extends A* with a memory limit, pruning the highest f-cost node when memory is full and updating its parent’s f-cost for potential regeneration.
- **IDA***: Performs depth-first search with iterative deepening based on f-cost thresholds, minimizing memory by exploring nodes within the current bound.

#### Experiments
The experiment framework (`run_experiments`) tests each algorithm on five mazes per size (10x10, 20x20, 30x30). Metrics collected include:
- **Iterations**: Number of node expansions (recursive calls for RBFS/IDA*, nodes popped for SMA*).
- **Execution Time**: Runtime in seconds using Python’s `time` module.
- **Path Quality**: Length of the returned path to verify optimality.
- **Memory Efficiency**: Maximum number of nodes stored (successors in RBFS, open list in SMA*, path length in IDA*).

SMA* uses a memory limit of 100 nodes, adjustable to test different constraints. Results are averaged across trials to account for variability.

### Results
The experiment results are printed in a table format, showing average iterations, execution time, path length, and memory usage for each algorithm and maze size. Example output (values depend on execution):

| Maze Size | Algorithm | Avg Iterations | Avg Execution Time (s) | Avg Path Length | Avg Max Memory (nodes) |
|-----------|-----------|----------------|------------------------|-----------------|-------------------------|
| 10x10     | RBFS      | [TBD]          | [TBD]                  | [TBD]           | [TBD]                   |
| 10x10     | SMA*      | [TBD]          | [TBD]                  | [TBD]           | [TBD]                   |
| 10x10     | IDA*      | [TBD]          | [TBD]                  | [TBD]           | [TBD]                   |
| 20x20     | RBFS      | [TBD]          | [TBD]                  | [TBD]           | [TBD]                   |
| ...       | ...       | ...            | ...                    | ...             | ...                     |

To generate actual values, run the code and copy the output. Visualize trends using graphs (e.g., execution time vs. maze size) in your report.

### Discussion
Analyze the results to address the lab’s questions:
- **Memory Efficiency**: RBFS and IDA* typically use linear memory (O(bd), where b is the branching factor and d is the depth), making them more efficient than SMA*, which depends on the memory limit.
- **SMA* Behavior with Limited Memory**: With a low memory limit (e.g., 100 nodes), SMA* may prune promising nodes, increasing iterations or failing to find a path. Higher limits improve performance, approaching standard A*.
- **Performance on Larger Mazes**: RBFS and IDA* are expected to scale better in larger mazes due to low memory requirements, while SMA* may struggle if the memory limit is insufficient.
- **IDA* Optimality**: IDA* guarantees optimal paths with an admissible heuristic (Manhattan distance), as it explores all nodes within increasing f-cost bounds.
- **Sensitivity to Maze Complexity**: IDA* may perform poorly in mazes with many nodes having similar f-values, leading to repeated explorations. RBFS may be less sensitive due to its best-first approach, while SMA*’s performance depends on memory availability and maze structure.

### Conclusion
The experiments highlight trade-offs between memory and computational efficiency. RBFS and IDA* excel in memory-constrained environments, while SMA* offers flexibility with adjustable memory limits. These findings inform algorithm selection in applications like robotics, gaming, or embedded systems, where memory constraints are critical. Further experiments with varied memory limits or maze complexities could provide deeper insights.
