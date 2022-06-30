import "./App.css";
import React from "react";

import Board from "./Board";

function App() {
  // const [todos, setTodos] = React.useState(["item 1", "item 2", "item 3"]);
  return (
    <div className="App">
      <Board />
      {/* <TodoCount todos={todos} />
      <TodoList todos={todos} />
      <AddTodo setTodos={setTodos} /> */}
    </div>
  );
}

// function AddTodo({ setTodos }) {
//   function handleSubmit(event) {
//     event.preventDefault();
//     const todo = event.target.elements.todo.value;
//     setTodos((prevTodos) => [...prevTodos, todo]);
//   }

//   return (
//     <form onSubmit={handleSubmit}>
//       <input type="text" id="todo" />
//       <button type="submit">Add Todo</button>
//     </form>
//   );
// }

// function TodoCount({ todos }) {
//   return <div>Total Todos: {todos.length}</div>;
// }

// function TodoList({ todos }) {
//   return (
//     <ul>
//       {todos.map((todo) => (
//         <li key={todo}>{todo}</li>
//       ))}
//     </ul>
//   );
// }

export default App;
