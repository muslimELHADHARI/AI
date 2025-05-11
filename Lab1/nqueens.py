import time
import tracemalloc

def is_safe(board, row, col, n):
    # Check if a queen can be placed at position (row, col)
    for i in range(col):
        if board[row][i] == 1:
            return False
    for i, j in zip(range(row, -1, -1), range(col, -1, -1)):
        if board[i][j] == 1:
            return False
    for i, j in zip(range(row, n, 1), range(col, -1, -1)):
        if board[i][j] == 1:
            return False
    return True

def solve_4queens_util(board, col, n, solutions):
    # Recursive function to solve the problem using backtracking
    if col >= n:
        # A valid solution is found
        solution = []
        for i in range(n):
            for j in range(n):
                if board[i][j] == 1:
                    solution.append((i, j))
        solutions.append(solution)
        return True
    for i in range(n):
        if is_safe(board, i, col, n):
            board[i][col] = 1
            solve_4queens_util(board, col + 1, n, solutions)
            board[i][col] = 0  # Backtrack
    return False

def solve_4queens():
    n = 10
    board = [[0] * n for _ in range(n)]
    solutions = []
    # Measure time and memory
    tracemalloc.start()
    start_time = time.time()
    solve_4queens_util(board, 0, n, solutions)  # Corrected: removed 'hearing'
    end_time = time.time()
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    # Display results
    print("4 Queens Problem:")
    print(f"Solutions found: {len(solutions)}")
    for idx, sol in enumerate(solutions, 1):
        print(f"Solution {idx}: {sol}")
    print(f"Execution Time: {end_time - start_time:.6f} seconds")
    print(f"Memory Usage: {peak / 1024:.2f} KB")

if __name__ == "__main__":
    solve_4queens()