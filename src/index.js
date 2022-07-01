import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import Board from "./Board";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Board />
    {/* <TodoCount todos={todos} />
      <TodoList todos={todos} />
      <AddTodo setTodos={setTodos} /> */}
  </React.StrictMode>
);
