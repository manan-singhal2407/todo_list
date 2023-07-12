let todoList = [];

fetch('https://jsonplaceholder.typicode.com/todos')
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            todoList.push({ taskName: item["title"], id: item["id"] });
        });
        renderList();
    })
    .catch(error => {
        console.error('Error: ', error);
    });

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
}

document.getElementById("save_task_button").addEventListener("click", addTaskToList);
renderList();