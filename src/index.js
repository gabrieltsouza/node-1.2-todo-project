const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');
const { validate: isUuid, validate } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  var { username } = request.headers;
  var { username : username2 } = request.body;

  //const checkName = users.findIndex((user) => { return user.name === name })
  const checkUserName = users.findIndex((user) => { return user.username === (!username ? username2 : username) })
  
  //request.checkName = checkName;
  request.checkUserName = checkUserName;
  request.user = users[checkUserName];

  //console.info("checkName:"+checkName+"/  checkUsername:"+checkUserName);
  //if (checkName > -1) {return response.status(400).json({error:"Name already exists."})};
  //if (checkUserName > -1) {return response.status(400).json({error:"Username already exists."})};

  return next();
}
function notAllowExistsUserAccount(request, response, next) {
  const { checkUserName } = request;
  if (checkUserName > -1) {return response.status(400).json({error:"Name already exists."})};
  return next();
}
function allowExistsUserAccount(request, response, next) {
  const { checkUserName } = request;
  if (checkUserName < 0) {return response.status(400).json({error:"User not found."})};
  return next();
}
function checksExistsUserTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const checkToDo = user.todos.findIndex((todo) => { return todo.id === id })
  
  request.checkToDo = checkToDo;

  if (checkToDo < 0) {return response.status(404).json({error:"Todo not found."})};

  return next();
}


app.post('/users', checksExistsUserAccount, notAllowExistsUserAccount, (request, response) => {
  const { name, username } = request.body;
  const { checkName, checkUserName } = request;

  const user = {
    id : v4(),
    name : name,
    username : username,
    todos : []
  };

  users.push(user);

  //response.body = JSON.stringify(user);
  response.body = user;
  //console.info(validate(response.body.id));
  return response.status(201).json(user);
});
app.get('/allUsers', (request, response) => {
  return response.status(201).json(users);
});
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(201).json(user.todos);
});
app.post('/todos', checksExistsUserAccount, allowExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, done, deadline } = request.body;

  const todo = { 
    id: v4(), 
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  user.todos.push(todo);

  //response.body = user.todos;
  response.body = todo;
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, allowExistsUserAccount, checksExistsUserTodo, (request, response) => {
  const { user , checkToDo } = request;
  const { title, done, deadline } = request.body;

  user.todos[checkToDo].title = title;
  //user.todos[checkToDo].done = done;
  user.todos[checkToDo].deadline = deadline;

  return response.status(201).json(user.todos[checkToDo]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, allowExistsUserAccount, checksExistsUserTodo, (request, response) => {
  const { user , checkToDo } = request;
  const { title, done, deadline } = request.body;

  if (title) {user.todos[checkToDo].title = title;};
  if (done) {user.todos[checkToDo].done = done;}
  else {user.todos[checkToDo].done = true;};
  if (deadline) {user.todos[checkToDo].deadline = deadline;};

  return response.status(201).json(user.todos[checkToDo]);
});

app.delete('/todos/:id', checksExistsUserAccount, allowExistsUserAccount, checksExistsUserTodo, (request, response) => {
  const { user , checkToDo } = request;

  const oldTodoId = user.todos[checkToDo].id;
  user.todos.splice(checkToDo,1);

  return response.status(204).json(user.todos);
});

module.exports = app;