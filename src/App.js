import React from "react";
import KanbanBoard from "./KanbanBoard";
import './App.css'; // Make sure to import the CSS file for App styling

function App() {
    return (
        <div className="app-container">
            <h1>Kanban Board</h1>
            <div className="kanban-board-wrapper">
                <KanbanBoard />
            </div>
        </div>
    );
}

export default App;
