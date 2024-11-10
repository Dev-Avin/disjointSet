# DisjointSetAnimation

DisjointSetAnimation is a React-based visualization tool for Disjoint Set (Union-Find) data structures. This project allows users to visually create, find, and union disjoint sets, with interactive animations for path compression and union by rank.

## Features

- Create new sets (nodes) with unique values
- Visualize and log union and find operations with animations
- Toggle options for path compression and union by rank
- Dynamic node interaction, including hover tooltips and draggable nodes
- Collapsible side panel for settings and controls

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Dev-Avin/disjointSet
   cd DisjointSetAnimation
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

### Running the Project

Start the development server:

```bash
yarn start
```

This will start the application at `http://localhost:3000`.

### Building for Production

To create an optimized production build:

```bash
yarn build
```

The optimized build will be created in the `build` directory.

## Usage

1. **Make Set:** Enter a unique value and click **Make Set** to create a new node.
2. **Union Operation:** Enter two node IDs and click **Union** to merge sets.
3. **Find Operation:** Enter a node ID and click **Find Set** to display the root of the set.
4. **Path Compression and Union by Rank:** Toggle these options to modify the algorithm's behavior.
5. **Hover for Info:** Hover over nodes to see additional information.

## Project Structure

```plaintext
DisjointSetAnimation
├── public                # Public assets
├── src
│   ├── components        # React components
│   ├── App.js            # Main application entry
│   ├── index.js          # App render entry point
├── README.md
└── package.json          # Project dependencies and scripts
```

## Built With

- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Yarn](https://yarnpkg.com/) - Dependency management

## Deloyment Link

- [Vercel](https://disjoint-set.vercel.app/) - Vercel Link

## Contributing

Feel free to submit issues or pull requests for enhancements and bug fixes.

---
