import { useState } from "react";
import "./App.css";

function App() {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);

  const [grid, setGrid] = useState(
    Array.from({ length: 5 }, () => Array(5).fill(0))
  );

  const [start, setStart] = useState(null);
  const [destination, setDestination] = useState(null);

  const [mode, setMode] = useState("wall");

  const [visited, setVisited] = useState([]);
  const [path, setPath] = useState([]);

  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  const createGrid = () => {
    const r = Math.min(Math.max(Number(rows), 2), 10);
    const c = Math.min(Math.max(Number(cols), 2), 10);

    setRows(r);
    setCols(c);
    setGrid(Array.from({ length: r }, () => Array(c).fill(0)));

    setStart(null);
    setDestination(null);
    setVisited([]);
    setPath([]);
    setMessage("");
  };

  const handleCellClick = (row, col) => {
    if (running) return;

    if (mode === "start") {
      if (destination?.row === row && destination?.col === col) return;

      setStart({ row, col });

      setGrid((prev) => {
        const copy = prev.map((r) => [...r]);
        copy[row][col] = 0;
        return copy;
      });

      return;
    }

    if (mode === "destination") {
      if (start?.row === row && start?.col === col) return;

      setDestination({ row, col });

      setGrid((prev) => {
        const copy = prev.map((r) => [...r]);
        copy[row][col] = 0;
        return copy;
      });

      return;
    }

    if (start?.row === row && start?.col === col) return;
    if (destination?.row === row && destination?.col === col) return;

    setGrid((prev) => {
      const copy = prev.map((r) => [...r]);
      copy[row][col] = copy[row][col] === 1 ? 0 : 1;
      return copy;
    });

    setVisited([]);
    setPath([]);
    setMessage("");
  };

  const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const runDFS = async () => {
    if (!start || !destination) {
      setMessage("Set both Start and Destination first.");
      return;
    }

    setRunning(true);
    setVisited([]);
    setPath([]);
    setMessage("🧠 DFS is searching...");

    const visitedSet = new Set();
    const currentPath = [];
    let finalPath = [];

    const directions = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ];

    const dfs = async (row, col) => {
      if (
        row < 0 ||
        row >= rows ||
        col < 0 ||
        col >= cols ||
        grid[row][col] === 1
      ) {
        return false;
      }

      const key = `${row}-${col}`;

      if (visitedSet.has(key)) {
        return false;
      }

      visitedSet.add(key);
      currentPath.push({ row, col });

      setVisited([...visitedSet]);

      await sleep(250);

      if (
        row === destination.row &&
        col === destination.col
      ) {
        finalPath = [...currentPath];
        return true;
      }

      for (const [dr, dc] of directions) {
        const found = await dfs(row + dr, col + dc);

        if (found) {
          return true;
        }
      }

      currentPath.pop();

      await sleep(250);

      return false;
    };

    const found = await dfs(start.row, start.col);

    if (found) {
      setPath(finalPath);
      setMessage("🎉 Destination reached!");
    } else {
      setMessage("❌ No path exists");
    }

    setRunning(false);
  };

  const resetSearch = () => {
    if (running) return;

    setVisited([]);
    setPath([]);
    setMessage("");
  };

  const isStart = (row, col) =>
    start?.row === row && start?.col === col;

  const isDestination = (row, col) =>
    destination?.row === row && destination?.col === col;

  const isVisited = (row, col) =>
    visited.includes(`${row}-${col}`);

  const isPath = (row, col) =>
    path.some(
      (cell) => cell.row === row && cell.col === col
    );

  return (
    <div className="app">

      <header>
        <h1>🧠 AI Maze Solver</h1>
        <p>Depth First Search • Backtracking Visualization</p>
      </header>

      <div className="controls">

        <div className="input-group">
          <label>Rows</label>
          <input
            type="number"
            min="2"
            max="10"
            value={rows}
            disabled={running}
            onChange={(e) => setRows(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Columns</label>
          <input
            type="number"
            min="2"
            max="10"
            value={cols}
            disabled={running}
            onChange={(e) => setCols(e.target.value)}
          />
        </div>

        <button onClick={createGrid} disabled={running}>
          🗺️ Create Maze
        </button>

        <button
          className={mode === "wall" ? "active" : ""}
          onClick={() => setMode("wall")}
          disabled={running}
        >
          🧱 Walls
        </button>

        <button
          className={mode === "start" ? "active" : ""}
          onClick={() => setMode("start")}
          disabled={running}
        >
          🧑 Start
        </button>

        <button
          className={mode === "destination" ? "active" : ""}
          onClick={() => setMode("destination")}
          disabled={running}
        >
          🏁 Goal
        </button>

        <button
          className="run"
          onClick={runDFS}
          disabled={running}
        >
          ▶ Run DFS
        </button>

        <button onClick={resetSearch} disabled={running}>
          ↻ Reset
        </button>

      </div>

      <div className="mode">
        Current mode: <strong>{mode}</strong>
      </div>

      <main className="game-area">

        <div
          className="maze"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
          }}
        >

          {grid.map((row, r) =>
            row.map((cell, c) => {

              const classes = [
                "cell",
                cell === 1 ? "wall" : "",
                isVisited(r, c) ? "visited" : "",
                isPath(r, c) ? "final-path" : "",
                isStart(r, c) ? "start" : "",
                isDestination(r, c) ? "destination" : "",
              ].join(" ");

              return (
                <div
                  key={`${r}-${c}`}
                  className={classes}
                  onClick={() => handleCellClick(r, c)}
                >

                  {isStart(r, c) && (
                    <div className="character">
                      🧑
                    </div>
                  )}

                  {isDestination(r, c) && (
                    <div className="goal">
                      🏁
                    </div>
                  )}

                  {cell === 1 && (
                    <div className="brick">
                      <span>🧱</span>
                    </div>
                  )}

                </div>
              );
            })
          )}

        </div>

        <aside className="info-panel">

          <h2>🧠 DFS</h2>

          <div className="status">
            {message || "Waiting for maze..."}
          </div>

          <div className="stats">
            <div>
              <span>Visited</span>
              <strong>{visited.length}</strong>
            </div>

            <div>
              <span>Path</span>
              <strong>{path.length}</strong>
            </div>
          </div>

          <div className="legend">

            <div>
              <span className="legend-box empty"></span>
              Empty
            </div>

            <div>
              <span className="legend-box wall-box"></span>
              Wall
            </div>

            <div>
              <span className="legend-box explore"></span>
              Exploring
            </div>

            <div>
              <span className="legend-box final"></span>
              Final Path
            </div>

          </div>

        </aside>

      </main>

    </div>
  );
}

export default App;