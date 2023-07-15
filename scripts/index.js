let todoList = [];

let localStorageList = localStorage.getItem("todo_list");
if (localStorageList === null || localStorageList === "") {
    let count = 1;
    fetch('https://jsonplaceholder.typicode.com/todos')
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                todoList.push({ taskName: item["title"], id: count });
                count++;
            });
            renderList();
        })
        .catch(error => {
            console.error('Error: ', error);
        });
} else {
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

function removeTaskFromListWithId(id) {
    todoList = todoList.filter(task => task.id !== id);
    renderList();
}

function renderList() {
    const taskListElement = document.getElementById("task_list");
    taskListElement.innerHTML = "";

    todoList.forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = task.taskName + '<img src="assets/delete.png" alt="Delete Task" onClick=removeTaskFromListWithId(' + task.id + ')>';
        taskListElement.appendChild(li);
    });
    storeTodoListOnLocalStorage();
}

document.getElementById("save_task_button").addEventListener("click", addTaskToList);