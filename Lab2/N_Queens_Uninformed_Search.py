import time
from collections import deque
import heapq

def is_safe(state, row, col):
    for r in range(row):
        if state[r] == col or abs(state[r] - col) == row - r:
            return False
    return True

def dfs(N):
    def _dfs(row, state, explored):
        explored[0] += 1
        if row == N:
            return state[:]
        for col in range(N):
            if is_safe(state, row, col):
                state.append(col)
                result = _dfs(row + 1, state, explored)
                if result is not None:
                    return result
                state.pop()
        return None

    explored = [0]
    start_time = time.time()
    solution = _dfs(0, [], explored)
    end_time = time.time()
    return solution, explored[0], end_time - start_time

def bfs(N):
    queue = deque([[]])
    explored = 0
    start_time = time.time()
    while queue:
        state = queue.popleft()
        explored += 1
        row = len(state)
        if row == N:
            end_time = time.time()
            return state, explored, end_time - start_time
        for col in range(N):
            if is_safe(state, row, col):
                queue.append(state + [col])
    end_time = time.time()
    return None, explored, end_time - start_time

def ucs(N, cost_func):
    pq = [(0, [])]  # (total_cost, state)
    explored = 0
    start_time = time.time()
    while pq:
        cost, state = heapq.heappop(pq)
        explored += 1
        row = len(state)
        if row == N:
            end_time = time.time()
            return state, cost, explored, end_time - start_time
        for col in range(N):
            if is_safe(state, row, col):
                new_state = state + [col]
                new_cost = cost + cost_func(col)
                heapq.heappush(pq, (new_cost, new_state))
    end_time = time.time()
    return None, None, explored, end_time - start_time

def calculate_cost(state, cost_func):
    return sum(cost_func(col) for col in state) if state else None

def run_experiments():
    N_values = [4, 5, 6]
    cost_func1 = lambda col: col + 1  # Cost increases with column index
    cost_func2 = lambda col: N - col  # Cost decreases with column index
    results = []

    for N in N_values:
        print(f"\n=== N = {N} ===")
        
        # DFS
        dfs_solution, dfs_explored, dfs_time = dfs(N)
        dfs_cost = calculate_cost(dfs_solution, cost_func1) if dfs_solution else None
        print(f"DFS: Solution = {dfs_solution}, Cost = {dfs_cost}, Explored = {dfs_explored}, Time = {dfs_time:.6f}s")
        results.append({
            'N': N, 'Algorithm': 'DFS', 'Solution': dfs_solution, 'Cost': dfs_cost,
            'Explored': dfs_explored, 'Time': dfs_time, 'Depth': N if dfs_solution else None
        })

        # BFS
        bfs_solution, bfs_explored, bfs_time = bfs(N)
        bfs_cost = calculate_cost(bfs_solution, cost_func1) if bfs_solution else None
        print(f"BFS: Solution = {bfs_solution}, Cost = {bfs_cost}, Explored = {bfs_explored}, Time = {bfs_time:.6f}s")
        results.append({
            'N': N, 'Algorithm': 'BFS', 'Solution': bfs_solution, 'Cost': bfs_cost,
            'Explored': bfs_explored, 'Time': bfs_time, 'Depth': N if bfs_solution else None
        })

        # UCS with cost_func1
        ucs_solution, ucs_cost, ucs_explored, ucs_time = ucs(N, cost_func1)
        print(f"UCS (cost=col+1): Solution = {ucs_solution}, Cost = {ucs_cost}, Explored = {ucs_explored}, Time = {ucs_time:.6f}s")
        results.append({
            'N': N, 'Algorithm': 'UCS (col+1)', 'Solution': ucs_solution, 'Cost': ucs_cost,
            'Explored': ucs_explored, 'Time': ucs_time, 'Depth': N if ucs_solution else None
        })

        # UCS with cost_func2
        ucs_solution2, ucs_cost2, ucs_explored2, ucs_time2 = ucs(N, cost_func2)
        print(f"UCS (cost=N-col): Solution = {ucs_solution2}, Cost = {ucs_cost2}, Explored = {ucs_explored2}, Time = {ucs_time2:.6f}s")
        results.append({
            'N': N, 'Algorithm': 'UCS (N-col)', 'Solution': ucs_solution2, 'Cost': ucs_cost2,
            'Explored': ucs_explored2, 'Time': ucs_time2, 'Depth': N if ucs_solution else None
        })

    return results

if __name__ == "__main__":
    results = run_experiments()