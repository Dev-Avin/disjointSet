import React, { useState, useRef, useEffect } from "react";
import "./DisjointSetAnimation.css";
const DisjointSetAnimation = () => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [parents, setParents] = useState([]);
  const [rank, setRank] = useState([]);
  const [links, setLinks] = useState([]);
  const [pathCompression, setPathCompression] = useState(false);
  const [unionByRank, setUnionByRank] = useState(false);
  const [callStack, setCallStack] = useState([]); // Call stack state
  const [nextNodeId, setNextNodeId] = useState(0);
  const [elementId, setElementId] = useState("");
  const [elementValue, setElementValue] = useState(""); // New state for element value
  const [elementA, setElementA] = useState("");
  const [elementB, setElementB] = useState("");
  const [findElement, setFindElement] = useState("");
  const [draggingNode, setDraggingNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth - 330;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      applyRepulsion();
      applyAttraction();
      drawNodesAndLinks(ctx);
      requestAnimationFrame(animate);
    };
    animate();

    return () => window.removeEventListener("resize", resize);
  }, [nodes, links]);

  class Node {
    constructor(id, value, x, y) {
      this.id = id;
      this.value = value; // Added value field
      this.x = x;
      this.y = y;
      this.status = "normal";
      this.rank = rank[id] || 0;
      this.isDragging = false;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 30, 0, 2 * Math.PI);
      ctx.fillStyle = this.status === "active" ? "red" : "blue";
      ctx.fill();

      ctx.font = "20px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(this.value, this.x, this.y + 7); // Display the value in the node

      if (hoveredNode === this.id) {
        ctx.fillStyle = "black";
        ctx.fillText(`ID: ${this.id}`, this.x, this.y - 20);
        ctx.fillText(`Rank: ${this.rank}`, this.x, this.y - 40);
        ctx.fillText(`Parent: ${parents[this.id]}`, this.x, this.y - 60);
      }
    }

    setStatus(newStatus) {
      this.status = newStatus;
    }

    isInside(x, y) {
      return Math.hypot(this.x - x, this.y - y) < 30;
    }
  }

  const makeSet = (value) => {
    const id = nextNodeId;
    if (nodes.some((node) => node.id === id)) {
      alert(`Node with ID ${id} already exists.`);
      return;
    }

    const newParents = [...parents];
    newParents[id] = id;
    setParents(newParents);

    const newRank = [...rank];
    newRank[id] = 0;
    setRank(newRank);

    const newNode = new Node(
      id,
      value,
      Math.random() * (window.innerWidth - 100) + 50,
      Math.random() * (window.innerHeight - 100) + 50
    );
    setNodes((prevNodes) => [...prevNodes, newNode]);
    setNextNodeId(id + 1); // Increment the nextNodeId counter
  };

  const findSet = (x) => {
    const nodeExists = nodes.some((node) => node.id === x);
    if (!nodeExists) {
      alert(`Node with ID ${x} does not exist.`);
      return null;
    }

    const traversalPath = [];
    let current = x;

    // Traverse up to the root and collect the path
    while (parents[current] !== current) {
      traversalPath.push(current);
      current = parents[current];
    }
    traversalPath.push(current); // Include root in the traversal path

    const root = current;

    if (pathCompression) {
      // Apply path compression after finding the root
      traversalPath.forEach((node) => {
        // Update parents for path compression
        if (parents[node] !== root) {
          parents[node] = root;
        }
      });

      // Update all state changes after path compression
      setParents([...parents]);
      resetAndRecalculateRanks(); // Reset and recalculate ranks at the end
      updateLinks(); // Update links once all parent changes are done
    }

    return root;
  };

  const resetAndRecalculateRanks = () => {
    // Reset all ranks to zero
    const newRank = Array(nodes.length).fill(0);

    // Iteratively calculate ranks for each node
    nodes.forEach((node) => {
      let current = node.id;
      let rank = 0;

      // Follow the chain of parents until reaching the root
      while (parents[current] !== current) {
        rank++;
        current = parents[current];
      }

      // Update ranks for the entire path to the root
      current = node.id;
      while (parents[current] !== current) {
        newRank[current] = rank;
        rank--;
        current = parents[current];
      }
      // Set the rank of the root
      newRank[current] = rank;
    });

    setRank([...newRank]); // Update state with new rank values
  };

  const union = (x, y) => {
    const nodeXExists = nodes.some((node) => node.id === x);
    const nodeYExists = nodes.some((node) => node.id === y);

    if (!nodeXExists || !nodeYExists) {
      alert(`One or both nodes (ID ${x}, ID ${y}) do not exist.`);
      return;
    }

    const rootX = findSet(x);
    const rootY = findSet(y);

    if (rootX !== null && rootY !== null && rootX !== rootY) {
      if (unionByRank) {
        if (rank[rootX] > rank[rootY]) {
          parents[rootY] = rootX;
        } else if (rank[rootX] < rank[rootY]) {
          parents[rootX] = rootY;
        } else {
          parents[rootY] = rootX;
          rank[rootX]++;
        }
      } else {
        parents[rootY] = rootX;
        rank[rootX] = Math.max(rank[rootX], rank[rootY] + 1);
      }
      setParents([...parents]);
      setRank([...rank]);
      updateLinks();
    }
  };

  const drawNodesAndLinks = (ctx) => {
    links.forEach((link) => drawLink(ctx, link.from, link.to));
    nodes.forEach((node) => node.draw(ctx));
  };

  const drawLink = (ctx, fromNode, toNode) => {
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const updateLinks = () => {
    const newLinks = nodes
      .map((node) => ({
        from: node,
        to: nodes.find((parent) => parent.id === parents[node.id]),
      }))
      .filter((link) => link.to);
    setLinks(newLinks);
  };

  const applyAttraction = () => {
    const attractionStrength = 0.01;
    const minDistance = 100; // Minimum distance for attraction to apply

    nodes.forEach((node) => {
      const parentID = parents[node.id];
      if (parentID !== node.id) {
        const parentNode = nodes.find((n) => n.id === parentID);
        if (parentNode) {
          const dx = parentNode.x - node.x;
          const dy = parentNode.y - node.y;
          const distance = Math.hypot(dx, dy);

          // Only apply attraction if nodes are more than 100px apart
          if (distance > minDistance) {
            const force = attractionStrength * (distance - minDistance); // Scale force by excess distance
            node.x += (force * dx) / distance;
            node.y += (force * dy) / distance;
          }
        }
      }
    });
  };

  const applyRepulsion = () => {
    const forceStrength = 0.5;

    // Repel nodes from each other
    nodes.forEach((node, i) => {
      nodes.forEach((otherNode, j) => {
        if (i !== j) {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 100 && distance > 0) {
            const force = forceStrength / distance;
            node.x += force * dx;
            node.y += force * dy;
          }
        }
      });
    });

    // Repel nodes from the canvas walls
    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;
    const edgeBuffer = 30; // Distance from the edge to start repelling

    nodes.forEach((node) => {
      const dx = node.x - canvasWidth / 2;
      const dy = node.y - canvasHeight / 2;

      // Repel horizontally if close to the left or right edge
      if (node.x < edgeBuffer) {
        node.x += edgeBuffer - node.x; // Push towards the right
      } else if (node.x > canvasWidth - edgeBuffer) {
        node.x -= node.x - (canvasWidth - edgeBuffer); // Push towards the left
      }

      // Repel vertically if close to the top or bottom edge
      if (node.y < edgeBuffer) {
        node.y += edgeBuffer - node.y; // Push downwards
      } else if (node.y > canvasHeight - edgeBuffer) {
        node.y -= node.y - (canvasHeight - edgeBuffer); // Push upwards
      }
    });
  };

  const getNodeInfoArray = () =>
    nodes.map((node) => ({
      id: node.id,
      value: node.value,
      rank: rank[node.id],
      parent: parents[node.id],
    }));

  return (
    <div className="disjoint-set-container">
      <canvas ref={canvasRef} className="canvas" />

      <div className="sidebar">
        <div className="control-section">
          <input
            type="text"
            placeholder="Element Value"
            value={elementValue}
            onChange={(e) => setElementValue(e.target.value)}
            className="input-field"
          />
          <button
            onClick={() => makeSet(elementValue)}
            className="control-button"
          >
            Make Set
          </button>
        </div>

        <div className="control-section">
          <input
            type="number"
            placeholder="Element A ID"
            value={elementA}
            onChange={(e) => setElementA(parseInt(e.target.value, 10))}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Element B ID"
            value={elementB}
            onChange={(e) => setElementB(parseInt(e.target.value, 10))}
            className="input-field"
          />
          <button
            onClick={() => union(elementA, elementB)}
            className="control-button"
          >
            Union
          </button>
        </div>

        <div className="control-section">
          <input
            type="number"
            placeholder="Find Element"
            value={findElement}
            onChange={(e) => setFindElement(parseInt(e.target.value, 10))}
            className="input-field"
          />
          <button
            onClick={() => findSet(findElement)}
            className="control-button"
          >
            Find Set
          </button>
        </div>

        <div className="toggle-section">
          <label>
            <input
              type="checkbox"
              checked={pathCompression}
              onChange={() => setPathCompression(!pathCompression)}
            />
            Path Compression
          </label>
          <label>
            <input
              type="checkbox"
              checked={unionByRank}
              onChange={() => setUnionByRank(!unionByRank)}
            />
            Union by Rank
          </label>
        </div>

        <div className="node-info">
          <h4>Node Info</h4>
          <table className="info-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Value</th>
                <th>Rank</th>
                <th>Parent</th>
              </tr>
            </thead>
            <tbody>
              {getNodeInfoArray().map((nodeInfo) => (
                <tr key={nodeInfo.id}>
                  <td>{nodeInfo.id}</td>
                  <td>{nodeInfo.value}</td>
                  <td>{nodeInfo.rank}</td>
                  <td>{nodeInfo.parent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisjointSetAnimation;
