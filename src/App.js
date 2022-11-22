import React from "react";
import { useQuery } from "@apollo/react-hooks";
import { gql, useMutation } from "@apollo/client";

const GET_TODOS = gql`
  query getToDo {
    todos {
      done
      id
      text
    }
  }
`;

const TOGGLE_TODOS = gql`
  mutation toggleToDo($id: uuid!, $done: Boolean) {
    update_todos(where: { id: { _eq: $id } }, _set: { done: $done }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const ADD_TODOS = gql`
  mutation addToDo($text: String!) {
    insert_todos(objects: { text: $text }) {
      returning {
        done
        id
        text
      }
    }
  }
`;
const DELETE_TODOS = gql`
  mutation deleteToDo($id: uuid!) {
    delete_todos(where: { id: { _eq: $id } }) {
      returning {
        done
        id
        text
      }
    }
  }
`;
function App() {
  const [todoText, setToDoText] = React.useState("");
  const { data, loading, error } = useQuery(GET_TODOS);
  const [toggleToDo] = useMutation(TOGGLE_TODOS);
  const [addToDo] = useMutation(ADD_TODOS, {
    onCompleted: () => setToDoText(""),
  });
  const [deleteToDo] = useMutation(DELETE_TODOS);
  async function handleToggleTodo({ id, done }) {
    const data = await toggleToDo({ variables: { id, done: !done } });
    console.log(data);
  }
  async function handleAddToDo(event) {
    event.preventDefault();
    if (!todoText.trim()) return;
    const data = await addToDo({
      variables: { text: todoText },
      refetchQueries: [{ query: GET_TODOS }],
    });
    console.log(data);
    // setToDoText("");
  }
  async function handleDeleteTodo({ id }) {
    const isConfirmed = window.confirm("Do you want to delete this todo?");
    if (isConfirmed) {
      const data = await deleteToDo({
        variables: { id },
        update: (cache) => {
          const prevData = cache.readQuery({ query: GET_TODOS });
          const newToDos = prevData.todos.filter((todo) => todo.id !== id);
          cache.writeQuery({ query: GET_TODOS, data: { todos: newToDos } });
        },
      });
      console.log(data);
    }
    // event.preventDefault();
  }
  if (loading) return <div>Loading todos...</div>;
  if (error) return <div>Error getting todos</div>;
  return (
    <div className="vh-100 code flex flex-column items-center bg-purple white pa3 fl-1">
      <h1 className="f2-l">GraphQL Checklist</h1>
      <form onSubmit={handleAddToDo} className="mb3">
        <input
          className="pa2 f4 b--dashed"
          type="text"
          placeholder="Write your todo"
          onChange={(event) => setToDoText(event.target.value)}
          value={todoText}
        />
        <button className="pa2 f4 bg-green" type="submit">
          Create Todo
        </button>
      </form>
      <div className="flex items-center justify-center flex-column">
        {data.todos.map((todo) => (
          <p onDoubleClick={() => handleToggleTodo(todo)} key={todo.id}>
            <span className={`pointer list pa1 f3 ${todo.done && "strike"}`}>
              {todo.text}
            </span>
            <button className="bg-transparent bn f4">
              <span
                onClick={() => handleDeleteTodo(todo)}
                className="red pointer"
              >
                &times;
              </span>
            </button>
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;
