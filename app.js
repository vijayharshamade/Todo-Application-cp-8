/*
 *  Created a Table with name todo in the todoApplication.db file using the CLI.
 */

const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
  }

  data = await database.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}');`;
  await database.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;













// const express = require("express");
// const app = express(); //Creating an instance
// app.use(express.json()); // Making express know we are sending json data

// const path = require("path");
// const dbPath = path.join(__dirname, "todoApplication.db");

// const { open } = require("sqlite");
// const sqlite3 = require("sqlite3");

// let db = null;
// // Connecting the server and database
// const initializeDbAndServer = async () => {
//   try {
//     db = await open({
//       filename: dbPath,
//       driver: sqlite3.Database,
//     });
//     app.listen(3000, () => {
//       console.log("Server is up and running at http://localhost:3000");
//     });
//   } catch (e) {
//     console.log(`Db error ${e}`);
//     process.exit(1);
//   }
// };

// initializeDbAndServer();

// //Create a Table in SQL CLI//

// //API-1

// const hasPriorityAndStatusProperties = (requestQuery) => {
//   return (
//     requestQuery.priority !== undefined && requestQuery.status !== undefined
//   );
// };

// const hasPriorityProperty = (requestQuery) => {
//   return requestQuery.priority !== undefined;
// };

// const hasStatusProperty = (requestQuery) => {
//   return requestQuery.status !== undefined;
// };

// app.get("/todos/", async (request, response) => {
//   let data = null;
//   let getTodosQuery = "";
//   const { search_q = "", priority, status } = request.query;

//   switch (true) {
//     case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
//       getTodosQuery = `
//         SELECT
//             *
//         FROM
//             todo 
//         WHERE
//             todo LIKE '%${search_q}%'
//             AND status = '${status}'
//             AND priority = '${priority}';`;
//       break;
//     case hasPriorityProperty(request.query):
//       getTodosQuery = `
//         SELECT
//             *
//         FROM
//             todo 
//         WHERE
//             todo LIKE '%${search_q}%'
//             AND priority = '${priority}';`;
//       break;
//     case hasStatusProperty(request.query):
//       getTodosQuery = `
//         SELECT
//             *
//         FROM
//             todo 
//         WHERE
//             todo LIKE '%${search_q}%'
//             AND status = '${status}';`;
//       break;
//     default:
//       getTodosQuery = `
//         SELECT
//             *
//         FROM
//             todo 
//         WHERE
//             todo LIKE '%${search_q}%';`;
//   }

//   data = await db.all(getTodosQuery);
//   response.send(data);
// });

// //API-2
// app.get("/todos/:todoId/", async (request, response) => {
//   const { todoId } = request.params;
//   const getTodoQuery = `
//         SELECT * FROM todo WHERE id = ${todoId};
//     `;
//   const todoDetails = await db.get(getTodoQuery);
//   response.send(todoDetails);
// });

// app.post("/todos/", async (request, response) => {
//   const { id, todo, priority, status } = request.body;
//   const createTodoQuery = `
//         INSERT INTO todo (id,todo,priority,status) 
//         VALUES (${id},'${todo}','${priority}','${status}')
//     `;

//   await db.run(createTodoQuery);
//   response.send("Todo Successfully Added");
// });

// //API-4

// app.put("/todos/:todoId/", async (request, response) => {
//   const { todoId } = request.params;
//   const requestBody = request.body;
//   const updateKey = Object.keys(requestBody)[0];

//   let updateTodosQuery;
//   if (updateKey === "status") {
//     const { status } = requestBody;
//     updateTodosQuery = `
//         UPDATE todo SET status = '${status}'
//     `;
//     await db.run(updateTodosQuery);
//     response.send("Status Updated");
//   } else if (updateKey === "priority") {
//     const { priority } = requestBody;
//     updateTodosQuery = `
//         UPDATE todo SET priority = '${priority}'
//     `;
//     await db.run(updateTodosQuery);
//     response.send("Priority Updated");
//   } else {
//     const { todo } = requestBody;
//     updateTodosQuery = `
//         UPDATE todo SET todo = '${todo}'
//     `;
//     await db.run(updateTodosQuery);
//     response.send("Todo Updated");
//   }
// });

// //API-5

// app.delete("/todos/:todoId/", async (request, response) => {
//   const { todoId } = request.params;
//   const deleteQuery = `
//         DELETE FROM todo WHERE id = ${todoId};
//     `;

//   await db.run(deleteQuery);
//   response.send("Todo Deleted");
// });

// module.exports = app;
