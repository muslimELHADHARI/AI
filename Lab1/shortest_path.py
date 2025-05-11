import time
import tracemalloc
import heapq

def dijkstra(graph, start, end):
    # Algorithme de Dijkstra pour le chemin le plus court
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    previous = {node: None for node in graph}
    
    while pq:
        current_distance, current_node = heapq.heappop(pq)
        if current_node == end:
            break
        if current_distance > distances[current_node]:
            continue
        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current_node
                heapq.heappush(pq, (distance, neighbor))
    
    # Reconstruire le chemin
    path = []
    current_node = end
    while current_node is not None:
        path.append(current_node)
        current_node = previous[current_node]
    path.reverse()
    return path, distances[end]

def solve_shortest_path():
    # Graphe exemple (nœuds A, B, C, D, E)
    graph = {
        'A': {'B': 4, 'C': 2},
        'B': {'A': 4, 'C': 1, 'D': 5},
        'C': {'A': 2, 'B': 1, 'D': 8, 'E': 10},
        'D': {'B': 5, 'C': 8, 'E': 2},
        'E': {'C': 10, 'D': 2}
    }
    start, end = 'A', 'E'
    # Mesure du temps et de la mémoire
    tracemalloc.start()
    start_time = time.time()
    path, distance = dijkstra(graph, start, end)
    end_time = time.time()
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    # Affichage des résultats
    print("\nShortest Path Problem:")
    print(f"Shortest Path from {start} to {end}: {path}")
    print(f"Total Distance: {distance}")
    print(f"Execution Time: {end_time - start_time:.6f} seconds")
    print(f"Memory Usage: {peak / 1024:.2f} KB")

if __name__ == "__main__":
    solve_shortest_path()