var todoList = [];

function addTaskToList() {
    const taskInputField = document.getElementById("task_input_field")
    const taskName = taskInputField.value.trim();
    if (taskName !== "") {
        const id = todoList.length === 0 ? 1 : todoList[todoList.length - 1].id + 1;
        todoList.push({taskName, id});
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
        li.innerHTML = '${task.taskName} <img src="assets/delete.png" alt="Delete Task" onclick="removeTaskFromListWithId(${task.id})">';
        taskListElement.appendChild(li);
    });
}

document.getElementById("save_task_button").addEventListener("click", addTaskToList);
renderList();