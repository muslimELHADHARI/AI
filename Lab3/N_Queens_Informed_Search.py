import heapq
import time

def is_safe(state, row, col):
    for r in range(row):
        if state[r] == col or abs(state[r] - col) == row - r:
            return False
    return True

def min_cost_for_row(state, r, N, cost_func):
    min_cost = float('inf')
    for c in range(N):
        if all(state[k] != c and abs(state[k] - c) != abs(k - r) for k in range(len(state))):
            min_cost = min(min_cost, cost_func(c))
    return min_cost if min_cost != float('inf') else 0

def h2(state, N, cost_func):
    depth = len(state)
    return sum(min_cost_for_row(state, r, N, cost_func) for r in range(depth, N))

cost_func = lambda c: c + 1
min_cost = 1

def ucs(N):
    pq = [(0, [], 0)]  # (priority, state, cost)
    explored = 0
    start_time = time.time()
    while pq:
        _, state, cost = heapq.heappop(pq)
        explored += 1
        depth = len(state)
        if depth == N:
            end_time = time.time()
            return state, cost, explored, end_time - start_time
        for col in range(N):
            if is_safe(state, depth, col):
                new_state = state + [col]
                new_cost = cost + cost_func(col)
                heapq.heappush(pq, (new_cost, new_state, new_cost))
    end_time = time.time()
    return None, None, explored, end_time - start_time

def astar_h1(N):
    pq = [(0 + N * min_cost, [], 0)]  # (f, state, cost)
    explored = 0
    start_time = time.time()
    while pq:
        _, state, cost = heapq.heappop(pq)
        explored += 1
        depth = len(state)
        if depth == N:
            end_time = time.time()
            return state, cost, explored, end_time - start_time
        for col in range(N):
            if is_safe(state, depth, col):
                new_state = state + [col]
                new_cost = cost + cost_func(col)
                h = (N - depth - 1) * min_cost
                f = new_cost + h
                heapq.heappush(pq, (f, new_state, new_cost))
    end_time = time.time()
    return None, None, explored, end_time - start_time

def astar_h2(N):
    pq = [(0 + h2([], N, cost_func), [], 0)]  # (f, state, cost)
    explored = 0
    start_time = time.time()
    while pq:
        _, state, cost = heapq.heappop(pq)
        explored += 1
        depth = len(state)
        if depth == N:
            end_time = time.time()
            return state, cost, explored, end_time - start_time
        for col in range(N):
            if is_safe(state, depth, col):
                new_state = state + [col]
                new_cost = cost + cost_func(col)
                h = h2(new_state, N, cost_func)
                f = new_cost + h
                heapq.heappush(pq, (f, new_state, new_cost))
    end_time = time.time()
    return None, None, explored, end_time - start_time

def greedy_bfs(N):
    def h(state):
        depth = len(state)
        if depth == N:
            return 0
        safe_count = sum(1 for col in range(N) if is_safe(state, depth, col))
        return -safe_count

    pq = [(h([]), [])]  # (h, state)
    explored = 0
    start_time = time.time()
    while pq:
        _, state = heapq.heappop(pq)
        explored += 1
        depth = len(state)
        if depth == N:
            end_time = time.time()
            cost = sum(cost_func(col) for col in state)
            return state, cost, explored, end_time - start_time
        for col in range(N):
            if is_safe(state, depth, col):
                new_state = state + [col]
                heapq.heappush(pq, (h(new_state), new_state))
    end_time = time.time()
    return None, None, explored, end_time - start_time

def run_experiments():
    N_values = [4, 5]
    algorithms = {
        'UCS': ucs,
        'A* h1': astar_h1,
        'A* h2': astar_h2,
        'Greedy': greedy_bfs
    }
    results = []
    for N in N_values:
        print(f"\n=== N = {N} ===")
        for name, algo in algorithms.items():
            solution, cost, explored, time_taken = algo(N)
            print(f"{name}: Solution = {solution}, Cost = {cost}, Explored = {explored}, Time = {time_taken:.6f}s")
            results.append({
                'N': N, 'Algorithm': name, 'Solution': solution, 'Cost': cost,
                'Explored': explored, 'Time': time_taken, 'Depth': N if solution else None
            })
    return results

if __name__ == "__main__":
    results = run_experiments()