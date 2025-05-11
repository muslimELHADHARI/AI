import time
import tracemalloc
from collections import deque

def is_valid_state(state):
    # Vérifie si l'état est valide (pas de consommation)
    farmer, wolf, goat, cabbage = state
    if farmer == 0:  # Fermier absent
        if wolf == goat == 1 or goat == cabbage == 1:
            return False
    return True

def get_next_states(state):
    # Génère les états suivants possibles
    farmer, wolf, goat, cabbage = state
    next_states = []
    moves = [(1, 0, 0, 0), (1, 1, 0, 0), (1, 0, 1, 0), (1, 0, 0, 1)]  # Fermier seul ou avec un élément
    for move in moves:
        new_state = tuple((s + m) % 2 for s, m in zip(state, move))  # Change de côté (0->1 ou 1->0)
        if is_valid_state(new_state):
            next_states.append(new_state)
    return next_states

def solve_farmer():
    start_state = (0, 0, 0, 0)  # Tout sur la rive gauche
    goal_state = (1, 1, 1, 1)   # Tout sur la rive droite
    queue = deque([(start_state, [])])
    visited = {start_state}
    
    # Mesure du temps et de la mémoire
    tracemalloc.start()
    start_time = time.time()
    while queue:
        state, path = queue.popleft()
        if state == goal_state:
            end_time = time.time()
            current, peak = tracemalloc.get_traced_memory()
            tracemalloc.stop()
            path = path + [state]
            # Affichage des résultats
            print("\nFarmer, Wolf, Goat, Cabbage Problem:")
            print(f"Solution Path (states): {path}")
            print(f"Path Length: {len(path)} steps")
            print(f"Execution Time: {end_time - start_time:.6f} seconds")
            print(f"Memory Usage: {peak / 1024:.2f} KB")
            return path
        for next_state in get_next_states(state):
            if next_state not in visited:
                visited.add(next_state)
                queue.append((next_state, path + [state]))
    end_time = time.time()
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    print("\nFarmer, Wolf, Goat, Cabbage Problem:")
    print("No solution found.")
    print(f"Execution Time: {end_time - start_time:.6f} seconds")
    print(f"Memory Usage: {peak / 1024:.2f} KB")
    return []

if __name__ == "__main__":
    solve_farmer()