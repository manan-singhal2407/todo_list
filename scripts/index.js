let todoList = [];
let editId = -1;

const datePicker = document.getElementById("datePicker");
const today = new Date().toISOString().split('T')[0];
datePicker.min = today;

let localStorageList = localStorage.getItem("todo_list");
if (localStorageList !== null || localStorageList === "") {
    fetchTodoListFromLocalStorage(localStorageList);
}

function fetchTodoListFromLocalStorage(localStorageList) {
    todoList = JSON.parse(localStorageList);
    renderList();
}

function storeTodoListOnLocalStorage() {
    localStorage.setItem("todo_list", JSON.stringify(todoList));
}

function addTaskToList() {
    const taskInputField = document.getElementById("task_input_field")
    const taskName = taskInputField.value.trim();
    if (taskName !== "") {
        const id = todoList.length === 0 ? 1 : todoList[todoList.length - 1].id + 1;
        todoList.push({ taskName: taskName, id: id });
        taskInputField.value = "";
        renderList();
    }
}

function editTaskId(id) {
    editId = id;
    renderList();
}

function updateTaskToList(id) {
    editId = -1;
    const editTaskInputField = document.getElementById("edit_task_input_field")
    const task = todoList.find(task => task.id === id);
    task.taskName = editTaskInputField.value.trim();
    renderList();
}

function removeTaskFromListWithId(id) {
    todoList = todoList.filter(task => task.id !== id);
    renderList();
}

function showDatePicker() {
    var picker = new Date().datepicker();
    picker.setDate(new Date());
    picker.open();
}

function renderList() {
    const taskListElement = document.getElementById("task_list");
    taskListElement.innerHTML = "";

    todoList.forEach(task => {
        const li = document.createElement("li");

        const actionsDiv = document.createElement('div');
        const deleteTask = document.createElement('img');
        deleteTask.setAttribute('src', 'assets/delete.png');
        deleteTask.setAttribute('alt', 'Delete Task');
        deleteTask.setAttribute('onClick', `removeTaskFromListWithId(${task.id})`);

        if (editId === task.id) {
            const input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('id', 'edit_task_input_field');
            input.setAttribute('placeholder', 'Enter task name');
            input.setAttribute('value', task.taskName);

            const updateTask = document.createElement('img');
            updateTask.setAttribute('src', 'assets/update.png');
            updateTask.setAttribute('alt', 'Update Task');
            updateTask.setAttribute('onClick', `updateTaskToList(${task.id})`);
            
            li.appendChild(input);
            actionsDiv.appendChild(updateTask);
        } else {
            const text = document.createElement('p');
            text.textContent = task.taskName;

            const editTask = document.createElement('img');
            editTask.setAttribute('src', 'assets/edit.png');
            editTask.setAttribute('alt', 'Edit Task');
            editTask.setAttribute('onClick', `editTaskId(${task.id})`);
            
            li.appendChild(text);
            actionsDiv.appendChild(editTask);
        }
        actionsDiv.appendChild(deleteTask);
        li.appendChild(actionsDiv);
        taskListElement.appendChild(li);
    });
    storeTodoListOnLocalStorage();
}

document.getElementById("save_task_button").addEventListener("click", addTaskToList);
renderList();