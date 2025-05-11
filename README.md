# AI Labs Repository

This repository contains implementations of various AI algorithms and techniques across multiple labs. Each lab focuses on a specific problem or concept in artificial intelligence, ranging from search algorithms to constraint satisfaction problems.

## Repository Structure

```
Lab1/
    farmer.py
    nqueens.py
    shortest_path.py
Lab2/
    N_Queens_Uninformed_Search.py
Lab3/
    N_Queens_Informed_Search.py
Lab4/
    Limited_memory.md
    pacman/
        components.json
        next.config.mjs
        package.json
        pnpm-lock.yaml
        postcss.config.mjs
        README.md
        tailwind.config.ts
        tsconfig.json
        app/
            globals.css
            layout.tsx
            page.tsx
        components/
            algorithm-selector.tsx
            algorithm-visualizer.tsx
            game-board.tsx
            theme-provider.tsx
            ui/
                ...
        hooks/
            use-mobile.tsx
            use-toast.ts
        lib/
            game-state.ts
            path-finding.ts
            utils.ts
        public/
            placeholder-logo.png
            placeholder-logo.svg
            placeholder-user.jpg
            placeholder.jpg
            placeholder.svg
        styles/
            globals.css
Lab5/
    n_queens_results.png
    n_queens.py
    README.md
```

### Lab Descriptions

- **Lab 1: Basic Search Algorithms**
  - Implements foundational search algorithms like breadth-first search, depth-first search, and shortest path algorithms.
  - Includes the Farmer Problem and N-Queens problem.

- **Lab 2: Uninformed Search**
  - Focuses on solving the N-Queens problem using uninformed search techniques.

- **Lab 3: Informed Search**
  - Explores heuristic-based approaches to the N-Queens problem, such as A* and greedy search.

- **Lab 4: Limited Memory Informed Search**
  - Implements memory-efficient search algorithms like RBFS, IDA*, and SMA*.
  - Includes a Pacman game built with Next.js to visualize informed search algorithms in action.

- **Lab 5: Constraint Satisfaction Problems**
  - Solves the N-Queens problem using CSP techniques.
  - Includes visualizations and comparisons of different algorithms.

## Lab 4: Pacman Game

The Pacman game in Lab 4 demonstrates the use of informed search algorithms in a real-time environment. It features:
- **Algorithms**: RBFS, IDA*, and SMA*.
- **Game Mechanics**: Pacman navigates a maze, collects pellets, and avoids ghosts.
- **Visualization**: Displays the path-finding process for educational purposes.

### Getting Started with Pacman

#### Prerequisites
- Node.js (v18 or later)
- npm or pnpm

#### Installation
1. Navigate to the `Lab4/pacman` directory:
   ```powershell
   cd Lab4\pacman
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Run the development server:
   ```powershell
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

## How to Contribute

Contributions are welcome! If you have suggestions or find bugs, feel free to open an issue or submit a pull request.

## License

This repository is licensed under the MIT License.
