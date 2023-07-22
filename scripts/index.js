const addTaskDatePicker = document.getElementById("add_task_date_picker");
const addTaskPriorityDropdown = document.getElementById("add_task_priority_dropdown");
const addTaskCategoryDropdown = document.getElementById("add_task_category_dropdown");

let todoList = [];
let tagsList = [];
let due_date = null;
let priority = "";
let category = "";
let addSubTaskId = -1;
let editId = -1;
let subTaskEditId = -1;

/* 
TodoList Table: {
    task_name: String,
    id: Int,
    tags: List<String>,
    category: String,
    reminder: List<Reminder>,
    due_date: Date,
    priority: String,
    created_at: DateTime,
    sub_task: List<Int/Id>,
    mark_done: Boolean,
    main_task_id: Int,
}

Reminder Table: {
    date: String,
    time: String
}
*/

function fetchTodoListFromLocalStorage(localStorageList) {
    todoList = JSON.parse(localStorageList);
    // todoList.splice(0, todoList.length);
    // storeTodoListOnLocalStorage();
    renderList();
}

function storeTodoListOnLocalStorage() {
    localStorage.setItem("todo_list", JSON.stringify(todoList));
}

function addTaskTagsToList() {
    const tagsInputField = document.getElementById("add_task_tags_input_field");
    const tagName = tagsInputField.value.trim();
    if (tagName !== "" && !tagsList.includes(tagName)) {
        tagsList.push(tagName);
        tagsInputField.value = "";
        renderTaskTagsList();
    }
}

function removeTagsFromList(tag) {
    tagsList = tagsList.filter(tags => tags !== tag);
    renderTaskTagsList();
}

function renderTaskTagsList() {
    const tagsListElement = document.getElementById("add_task_tags_list");
    tagsListElement.innerHTML = "";

    tagsList.forEach(tag => {
        const li = document.createElement("li");
        li.textContent = tag;
        const deleteTags = document.createElement('img');
        deleteTags.setAttribute('src', 'assets/ic_close.svg');
        deleteTags.setAttribute('alt', 'Delete');
        deleteTags.setAttribute('cursor', 'pointer');
        deleteTags.setAttribute('onClick', `removeTagsFromList('${tag}')`);
        li.appendChild(deleteTags);
        tagsListElement.appendChild(li);
    });
}

function addTaskToList() {
    const taskInputField = document.getElementById("add_task_input_field")
    const taskName = taskInputField.value.trim();
    if (taskName !== "") {
        todoList.push(
            {
                task_name: taskName,
                id: todoList.length === 0 ? 1 : todoList[todoList.length - 1].id + 1,
                tags: [...tagsList],
                category: category,
                priority: priority,
                mark_done: false,
                created_at: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
                reminder: [],
                sub_task: [],
                due_date: due_date,
                main_task_id: -1
            }
        );
        console.log(todoList[todoList.length-1]);
        taskInputField.value = "";
        tagsList.splice(0, tagsList.length);
        due_date = null;
        category = "";
        priority = "";
        addTaskDatePicker.value = '';
        addTaskPriorityDropdown.selectedIndex = 0;
        addTaskCategoryDropdown.selectedIndex = 0;
        renderTaskTagsList();
        renderList();
    }
}

function changeMarkTaskPosition(id) {
    const todoListItem = todoList.find((item) => item.id === id);
    todoListItem.mark_done = !todoListItem.mark_done;
    renderList();
}

function removeTaskFromListWithId(task) {
    if (task.main_task_id !== -1) {
        for (let i = 0; i < todoList.length; i++) {
            const todoItem = todoList[i];
            const subTaskIndex = todoItem.sub_task.indexOf(task.id);
            if (subTaskIndex !== -1) {
                todoItem.sub_task.splice(subTaskIndex, 1);
            }
        }
        todoList = todoList.filter(task => task.id !== id);
    } else {
        if (task.sub_task.length === 0) {
            todoList = todoList.filter(task => task.id !== id);
        } else {
            // todo show message that sub task exists
        }
    }
    renderList();
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

function itemLayout(li, task) {
    const checkboxInput = document.createElement('input');
    checkboxInput.setAttribute('type', 'checkbox');
    checkboxInput.classList.add("task_list_checkbox");
    checkboxInput.setAttribute('onClick', `changeMarkTaskPosition(${task.id})`);

    const mainContent = document.createElement('div');
    mainContent.classList.add("task_list_main_content");

    const mainContentName = document.createElement('p');
    mainContentName.classList.add("task_list_main_content_name");
    mainContentName.textContent = task.task_name;

    const mainContentTagsUl = document.createElement('ul');
    mainContentTagsUl.classList.add("task_list_main_content_tags_ul");
    task.tags.forEach(tag => {
        const mainContentTagsLi = document.createElement("li");
        mainContentTagsLi.classList.add("task_list_main_content_tags_li");
        mainContentTagsLi.textContent = tag;
        mainContentTagsUl.appendChild(mainContentTagsLi);
    });

    mainContent.appendChild(mainContentName);
    mainContent.appendChild(mainContentTagsUl);

    const rightContent = document.createElement('div');
    rightContent.classList.add("task_list_right_content");

    const rightContentActions = document.createElement('div');
    rightContentActions.classList.add("task_list_actions");

    const rightContentEdit = document.createElement('img');
    rightContentEdit.setAttribute('src', 'assets/edit.png');
    rightContentEdit.setAttribute('alt', 'Edit Task');
    rightContentEdit.setAttribute('onClick', `editTaskId(${task.id})`);

    const rightContentDelete = document.createElement('img');
    rightContentDelete.setAttribute('src', 'assets/delete.png');
    rightContentDelete.setAttribute('alt', 'Delete Task');
    rightContentDelete.setAttribute('onClick', `removeTaskFromListWithId(${task})`);

    rightContentActions.appendChild(rightContentEdit);
    rightContentActions.appendChild(rightContentDelete);

    if (task.main_task_id === -1) {
        const rightContentAddSubTask = document.createElement('img');
        rightContentAddSubTask.setAttribute('src', 'assets/ic_add.svg');
        rightContentAddSubTask.setAttribute('alt', 'Add Sub Task');
        // todo onClick
        rightContentAddSubTask.setAttribute('onClick', `editTaskId(${task.id})`);
        rightContentActions.appendChild(rightContentAddSubTask);
    }

    const rightContentDueDate = document.createElement('p');
    rightContentDueDate.classList.add("task_list_right_content_due_date");
    rightContentDueDate.textContent = task.due_date;

    const rightContentText = document.createElement('div');
    rightContentText.classList.add("task_list_actions");

    const rightContentCategory = document.createElement('p');
    rightContentCategory.classList.add("task_list_right_content_category");
    rightContentCategory.textContent = task.category;

    const rightContentPriority = document.createElement('p');
    rightContentPriority.classList.add("task_list_right_content_priority");
    rightContentPriority.textContent = task.priority;

    rightContentText.appendChild(rightContentCategory);
    rightContentText.appendChild(rightContentPriority);
    
    rightContent.appendChild(rightContentActions);
    rightContent.appendChild(rightContentDueDate);
    rightContent.appendChild(rightContentText);

    li.appendChild(checkboxInput);
    li.appendChild(mainContent);
    li.appendChild(rightContent);
}

function renderList() {
    const taskListElement = document.getElementById("task_list");
    taskListElement.innerHTML = "";

    const tasksToShow = todoList.filter(task => !task.mark_done && task.main_task_id === -1);
    tasksToShow.forEach(task => {
        const li = document.createElement("li");
        li.classList.add("task_list_ul_li");
        itemLayout(li, task);
        taskListElement.appendChild(li);
        
        task.sub_task.forEach(subTaskId => {
            const todoListItem = todoList.find((item) => item.id === subTaskId);
            if (!todoListItem.mark_done) {
                const sub_li = document.createElement("li");
                sub_li.classList.add("task_sub_list_li");
                itemLayout(sub_li, todoListItem);
                taskListElement.appendChild(sub_li);
            }
        });
    });
    storeTodoListOnLocalStorage();
}

const today = new Date().toISOString().split('T')[0];
addTaskDatePicker.min = today;
addTaskDatePicker.addEventListener("change", function () {
    due_date = this.value;
});
addTaskPriorityDropdown.addEventListener("change", function () {
    priority = this.value;
});
addTaskCategoryDropdown.addEventListener("change", function () {
    category = this.value;
});
document.getElementById("add_task_tags_save_button").addEventListener("click", addTaskTagsToList);
document.getElementById("add_task_save_button").addEventListener("click", addTaskToList);

let localStorageList = localStorage.getItem("todo_list");
if (localStorageList !== null || localStorageList === "") {
    fetchTodoListFromLocalStorage(localStorageList);
} else {
    renderList();
}