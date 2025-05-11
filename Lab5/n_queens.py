import random
import time
import math
import matplotlib.pyplot as plt
import numpy as np

# Helper function to calculate conflicts
def calculate_conflicts(state):
    n = len(state)
    conflicts = 0
    for i in range(n):
        for j in range(i + 1, n):
            if state[i] == state[j]:  # Same row
                conflicts += 1
            if abs(state[i] - state[j]) == abs(i - j):  # Same diagonal
                conflicts += 1
    return conflicts

# Hill Climbing
def hill_climbing(n, max_steps=1000):
    state = [random.randint(0, n-1) for _ in range(n)]
    steps = 0
    while steps < max_steps:
        current_conflicts = calculate_conflicts(state)
        if current_conflicts == 0:
            return state, steps, True
        neighbors = []
        for col in range(n):
            for row in range(n):
                if row != state[col]:
                    neighbor = state.copy()
                    neighbor[col] = row
                    neighbors.append((neighbor, calculate_conflicts(neighbor)))
        neighbors.sort(key=lambda x: x[1])
        if neighbors[0][1] >= current_conflicts:
            return state, steps, False
        state = neighbors[0][0]
        steps += 1
    return state, steps, False

# Beam Search
def beam_search(n, k=3, max_steps=1000):
    states = [[random.randint(0, n-1) for _ in range(n)] for _ in range(k)]
    steps = 0
    while steps < max_steps:
        for state in states:
            if calculate_conflicts(state) == 0:
                return state, steps, True
        neighbors = []
        for state in states:
            for col in range(n):
                for row in range(n):
                    if row != state[col]:
                        neighbor = state.copy()
                        neighbor[col] = row
                        neighbors.append((neighbor, calculate_conflicts(neighbor)))
        neighbors.sort(key=lambda x: x[1])
        states = [neighbor[0] for neighbor in neighbors[:k]]
        steps += 1
    best_state = min(states, key=calculate_conflicts)
    return best_state, steps, calculate_conflicts(best_state) == 0

# Simulated Annealing
def simulated_annealing(n, initial_temp=1000, cooling_rate=0.995, max_steps=1000):
    state = [random.randint(0, n-1) for _ in range(n)]
    temp = initial_temp
    steps = 0
    while steps < max_steps and temp > 0.1:
        current_conflicts = calculate_conflicts(state)
        if current_conflicts == 0:
            return state, steps, True
        col = random.randint(0, n-1)
        row = random.randint(0, n-1)
        while row == state[col]:
            row = random.randint(0, n-1)
        neighbor = state.copy()
        neighbor[col] = row
        neighbor_conflicts = calculate_conflicts(neighbor)
        delta = neighbor_conflicts - current_conflicts
        if delta <= 0 or random.random() < math.exp(-delta / temp):
            state = neighbor
        temp *= cooling_rate
        steps += 1
    return state, steps, calculate_conflicts(state) == 0

# Genetic Algorithm
def genetic_algorithm(n, pop_size=100, max_gen=1000, mutation_rate=0.1):
    def fitness(state):
        return -calculate_conflicts(state)
    
    population = [[random.randint(0, n-1) for _ in range(n)] for _ in range(pop_size)]
    for gen in range(max_gen):
        population.sort(key=fitness, reverse=True)
        if fitness(population[0]) == 0:
            return population[0], gen, True
        new_population = population[:pop_size//2]
        while len(new_population) < pop_size:
            parent1, parent2 = random.choices(population[:pop_size//2], k=2)
            crossover_point = random.randint(1, n-1)
            child = parent1[:crossover_point] + parent2[crossover_point:]
            if random.random() < mutation_rate:
                col = random.randint(0, n-1)
                child[col] = random.randint(0, n-1)
            new_population.append(child)
        population = new_population
    best_state = max(population, key=fitness)
    return best_state, max_gen, calculate_conflicts(best_state) == 0

# Run experiments
def run_experiments(n_values, runs=20):
    results = {
        'hill_climbing': {'time': [], 'success': [], 'conflicts': [], 'iterations': []},
        'beam_search': {'time': [], 'success': [], 'conflicts': [], 'iterations': []},
        'simulated_annealing': {'time': [], 'success': [], 'conflicts': [], 'iterations': []},
        'genetic_algorithm': {'time': [], 'success': [], 'conflicts': [], 'iterations': []}
    }
    
    for n in n_values:
        for algo in results:
            times, successes, conflicts, iterations = [], [], [], []
            for _ in range(runs):
                start_time = time.time()
                if algo == 'hill_climbing':
                    state, steps, success = hill_climbing(n)
                elif algo == 'beam_search':
                    state, steps, success = beam_search(n)
                elif algo == 'simulated_annealing':
                    state, steps, success = simulated_annealing(n)
                else:
                    state, steps, success = genetic_algorithm(n)
                times.append(time.time() - start_time)
                successes.append(success)
                conflicts.append(calculate_conflicts(state) if not success else 0)
                iterations.append(steps)
            results[algo]['time'].append(sum(times) / runs)
            results[algo]['success'].append(sum(successes) / runs * 100)
            results[algo]['conflicts'].append(sum(conflicts) / runs)
            results[algo]['iterations'].append(sum(iterations) / runs)
    
    return results

# Plot results
def plot_results(n_values, results):
    plt.figure(figsize=(12, 8))
    
    # N vs Time
    plt.subplot(2, 2, 1)
    for algo in results:
        plt.plot(n_values, results[algo]['time'], label=algo)
    plt.xlabel('N')
    plt.ylabel('Average Time (s)')
    plt.title('N vs Time')
    plt.legend()
    
    # N vs Success Rate
    plt.subplot(2, 2, 2)
    for algo in results:
        plt.plot(n_values, results[algo]['success'], label=algo)
    plt.xlabel('N')
    plt.ylabel('Success Rate (%)')
    plt.title('N vs Success Rate')
    plt.legend()
    
    # N vs Conflicts
    plt.subplot(2, 2, 3)
    for algo in results:
        plt.plot(n_values, results[algo]['conflicts'], label=algo)
    plt.xlabel('N')
    plt.ylabel('Average Conflicts')
    plt.title('N vs Conflicts')
    plt.legend()
    
    # Algorithm vs Iterations
    plt.subplot(2, 2, 4)
    algos = list(results.keys())
    iterations = [results[algo]['iterations'][-1] for algo in algos]
    plt.bar(algos, iterations)
    plt.xlabel('Algorithm')
    plt.ylabel('Average Iterations')
    plt.title('Algorithm vs Iterations')
    
    plt.tight_layout()
    plt.savefig('n_queens_results.png')

# Example usage
if __name__ == "__main__":
    n_values = [8, 16]
    results = run_experiments(n_values)
    plot_results(n_values, results)