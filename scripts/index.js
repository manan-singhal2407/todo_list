const addTaskDatePicker = document.getElementById("add_task_date_picker");
const addTaskPriorityDropdown = document.getElementById("add_task_priority_dropdown");
const addTaskCategoryDropdown = document.getElementById("add_task_category_dropdown");
const searchInputField = document.getElementById("search_input_field");
const filterDatePickerFrom = document.getElementById("filter_date_picker_from");
const filterDatePickerTo = document.getElementById("filter_date_picker_to");
const sortingDropdown = document.getElementById("sorting_dropdown");
const filterCategoryDropdown = document.getElementById("filter_category_dropdown");

let activityList = [];
let todoList = [];
let tagsList = [];
let due_date = null;
let priority = "";
let category = "";

let editId = -1;
let addSubTaskId = -1;
let editOrSubTaskTagsList = [];
let editOrSubTaskDueDate = null;
let editOrSubTaskPriority = "";
let editOrSubTaskCategory = "";

let sorting = "";
let filterCategory = "";
let search = "";
let filterDateFrom = null;
let filterDateTo = null;

class LogType {
    static TASK_ADDED;
    static SUB_TASK_ADDED;
    static TASK_DELETED;
    static TASK_DELETED_FAILED;
    static TASK_UPDATED;
    static TASK_MARK_AS_DONE;
    static TASK_MARK_AS_DONE_FAILED;
    static TASK_MARK_AS_UNDONE;
    static SUB_TASK_DELETED;
    static SUB_TASK_UPDATED;
    static SUB_TASK_MARK_AS_DONE;
    static SUB_TASK_MARK_AS_UNDONE;
    static SUB_TASK_MARK_AS_UNDONE_FAILED;
}

// todo mark done code will be done from remove task -> same way

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

Activity Log Table: {
    type: String,
    created_at: Int,
    id: Int,
    taskName: String,
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
        const id = todoList.length === 0 ? 1 : todoList[todoList.length - 1].id + 1;
        todoList.push({
            task_name: taskName,
            id: id,
            tags: [...tagsList],
            category: category,
            priority: priority,
            mark_done: false,
            created_at: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
            reminder: [],
            sub_task: [],
            due_date: due_date,
            main_task_id: -1
        });
        activityList.push({
            type: LogType.TASK_ADDED,
            created_at: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
            id: id,
            task_name: taskName,
            main_task_id: -1
        });
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

function removeTaskFromListWithId(id) {
    const task = todoList.find((item) => item.id === id);
    if (task.main_task_id !== -1) {
        const todoListItem = todoList.find((item) => item.id === task.main_task_id);
        todoListItem.sub_task.splice(todoListItem.sub_task.indexOf(id), 1);
        todoList = todoList.filter(task => task.id !== id);
        activityList.push({
            type: LogType.SUB_TASK_DELETED,
            created_at: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
            id: id,
            task_name: task.task_name,
            main_task_id: task.main_task_id
        });
    } else {
        if (task.sub_task.length === 0) {
            todoList = todoList.filter(task => task.id !== id);
            activityList.push({
                type: LogType.TASK_DELETED,
                created_at: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
                id: id,
                task_name: task.task_name,
                main_task_id: -1
            });
        } else {
            activityList.push({
                type: LogType.TASK_DELETED_FAILED,
                created_at: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
                id: id,
                task_name: task.task_name,
                main_task_id: -1
            });
            alert("You can't delete a task with active sub task");
        }
    }
    renderList();
}

function editTaskId(id) {
    editId = id;
    addSubTaskId = -1;
    renderList();
}

function addSubTaskToId(id) {
    addSubTaskId = id;
    editId = -1;
    renderList();
}

function updateTaskToList(id, isEditTask) {
    editId = -1;
    addSubTaskId = -1;
    const editOrNewSubTaskInputField = document.getElementById("edit_and_new_sub_task_input_field");
    const taskName = editOrNewSubTaskInputField.value.trim();
    if (taskName !== "") {
        const task = todoList.find(task => task.id === id);
        if (isEditTask) {
            task.task_name = taskName;
            task.tags = [...editOrSubTaskTagsList];
            task.category = editOrSubTaskCategory;
            task.priority = editOrSubTaskPriority;
            task.due_date = editOrSubTaskDueDate;
            if (task.main_task_id === -1) {
                activityList.push({
                    type: LogType.TASK_UPDATED,
                    created_at: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
                    id: id,
                    task_name: task.task_name,
                    main_task_id: -1
                });
            } else {
                activityList.push({
                    type: LogType.SUB_TASK_UPDATED,
                    created_at: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
                    id: id,
                    task_name: task.task_name,
                    main_task_id: task.main_task_id
                });
            }
        } else {
            const newTaskId = todoList.length === 0 ? 1 : todoList[todoList.length - 1].id + 1;
            todoList.push(
                {
                    task_name: taskName,
                    id: newTaskId,
                    tags: [...editOrSubTaskTagsList],
                    category: editOrSubTaskCategory,
                    priority: editOrSubTaskPriority,
                    mark_done: false,
                    created_at: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
                    reminder: [],
                    sub_task: [],
                    due_date: editOrSubTaskDueDate,
                    main_task_id: id
                }
            );
            activityList.push({
                type: LogType.SUB_TASK_ADDED,
                created_at: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
                id: newTaskId,
                task_name: taskName,
                main_task_id: id
            });
            task.sub_task.push(newTaskId);
        }
    }
    editOrNewSubTaskInputField.value = "";
    editOrSubTaskTagsList.splice(0, tagsList.length);
    editOrSubTaskDueDate = null;
    editOrSubTaskCategory = "";
    editOrSubTaskPriority = "";
    document.getElementById('edit_and_new_sub_task_date_picker').value = '';
    document.getElementById('edit_and_new_sub_task_priority_dropdown').selectedIndex = 0;
    document.getElementById('edit_and_new_sub_task_category_dropdown').selectedIndex = 0;
    renderList();
}

function changeMarkTaskPosition(id) {
    const todoListItem = todoList.find((item) => item.id === id);
    if (todoListItem.main_task_id === -1) {
        if (todoListItem.sub_task.length !== 0) {

        } else {

        }
    } else {

    }



    activityList.push({
        type: todoListItem.mark_done
            ? todoListItem.main_task_id === -1 ? LogType.TASK_MARK_AS_UNDONE : LogType.SUB_TASK_MARK_AS_UNDONE
            : todoListItem.main_task_id === -1 ? LogType.TASK_MARK_AS_DONE : LogType.SUB_TASK_MARK_AS_DONE,
        created_at: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
        id: id,
        task_name: todoListItem.task_name,
        main_task_id: todoListItem.main_task_id
    });
    todoListItem.mark_done = !todoListItem.mark_done;
    renderList();
}

function editOrAddSubTaskTagsToList() {
    const tagsInputField = document.getElementById("edit_and_new_sub_task_tags_input_field");
    const tagName = tagsInputField.value.trim();
    if (tagName !== "" && !editOrSubTaskTagsList.includes(tagName)) {
        editOrSubTaskTagsList.push(tagName);
        tagsInputField.value = "";
        renderEditOrAddSubTaskTagsList();
    }
}

function removeEditOrAddSubTaskTagsFromList(tag) {
    editOrSubTaskTagsList = editOrSubTaskTagsList.filter(tags => tags !== tag);
    renderEditOrAddSubTaskTagsList();
}

function renderEditOrAddSubTaskTagsList() {
    const editOrAddSubTaskTagsList = document.getElementById('edit_and_new_sub_task_tags_list');
    if (editOrAddSubTaskTagsList) {
        editOrAddSubTaskTagsList.innerHTML = "";
        editOrSubTaskTagsList.forEach(tag => {
            const li = document.createElement("li");
            li.textContent = tag;
            const deleteTags = document.createElement('img');
            deleteTags.setAttribute('src', 'assets/ic_close.svg');
            deleteTags.setAttribute('alt', 'Delete');
            deleteTags.setAttribute('cursor', 'pointer');
            deleteTags.setAttribute('onClick', `removeEditOrAddSubTaskTagsFromList('${tag}')`);
            li.appendChild(deleteTags);
            editOrAddSubTaskTagsList.appendChild(li);
        });
    }
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
    rightContentDelete.setAttribute('onClick', `removeTaskFromListWithId(${task.id})`);

    rightContentActions.appendChild(rightContentEdit);
    rightContentActions.appendChild(rightContentDelete);

    if (task.main_task_id === -1) {
        const rightContentAddSubTask = document.createElement('img');
        rightContentAddSubTask.setAttribute('src', 'assets/ic_add.svg');
        rightContentAddSubTask.setAttribute('alt', 'Add Sub Task');
        rightContentAddSubTask.setAttribute('onClick', `addSubTaskToId(${task.id})`);
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

function editOrAddSubTaskLayout(div, task, isEditTask) {
    div.classList.add("add_task_container");

    const editOrAddSubTaskInputName = document.createElement('input');
    editOrAddSubTaskInputName.setAttribute('id', 'edit_and_new_sub_task_input_field');
    editOrAddSubTaskInputName.setAttribute('type', 'text');
    editOrAddSubTaskInputName.setAttribute('placeholder', 'Enter task name');
    editOrAddSubTaskInputName.classList.add("add_task_input_container");

    const editOrAddSubTaskTagsList = document.createElement('ul');
    editOrAddSubTaskTagsList.setAttribute('id', 'edit_and_new_sub_task_tags_list');
    editOrAddSubTaskTagsList.classList.add("add_task_tags_ul");

    const editOrAddSubTaskFeatureContainer = document.createElement('div');
    editOrAddSubTaskFeatureContainer.classList.add("add_task_feature_container");

    const editOrAddSubTaskFeatureDatePicker = document.createElement('input');
    editOrAddSubTaskFeatureDatePicker.setAttribute('id', 'edit_and_new_sub_task_date_picker');
    editOrAddSubTaskFeatureDatePicker.setAttribute('type', 'date');
    editOrAddSubTaskFeatureDatePicker.setAttribute('max', '2050-12-31');
    editOrAddSubTaskFeatureDatePicker.setAttribute('min', '2023-6-21');
    const today = new Date().toISOString().split('T')[0];
    editOrAddSubTaskFeatureDatePicker.min = today;

    const editOrAddSubTaskFeaturePriority = document.createElement('select');
    editOrAddSubTaskFeaturePriority.setAttribute('id', 'edit_and_new_sub_task_priority_dropdown');

    const optionPriority = document.createElement('option');
    optionPriority.value = "";
    optionPriority.innerText = "Priority";

    const optionLow = document.createElement('option');
    optionLow.value = "Low";
    optionLow.innerText = "Low";

    const optionMedium = document.createElement('option');
    optionMedium.value = "Medium";
    optionMedium.innerText = "Medium";

    const optionHigh = document.createElement('option');
    optionHigh.value = "High";
    optionHigh.innerText = "High";

    editOrAddSubTaskFeaturePriority.appendChild(optionPriority);
    editOrAddSubTaskFeaturePriority.appendChild(optionLow);
    editOrAddSubTaskFeaturePriority.appendChild(optionMedium);
    editOrAddSubTaskFeaturePriority.appendChild(optionHigh);

    const editOrAddSubTaskFeatureReminder = document.createElement('div');

    const editOrAddSubTaskFeatureReminderImg = document.createElement('img');
    editOrAddSubTaskFeatureReminderImg.setAttribute('src', 'assets/reminder.svg');
    editOrAddSubTaskFeatureReminderImg.setAttribute('alt', 'Reminder');

    const editOrAddSubTaskFeatureReminderText = document.createElement('p');
    editOrAddSubTaskFeatureReminderText.textContent = "Reminders";

    editOrAddSubTaskFeatureReminder.appendChild(editOrAddSubTaskFeatureReminderImg);
    editOrAddSubTaskFeatureReminder.appendChild(editOrAddSubTaskFeatureReminderText);

    const editOrAddSubTaskCategoryPriority = document.createElement('select');
    editOrAddSubTaskCategoryPriority.setAttribute('id', 'edit_and_new_sub_task_category_dropdown');

    const optionCategory = document.createElement('option');
    optionCategory.value = "";
    optionCategory.innerText = "Category";

    const optionPersonal = document.createElement('option');
    optionPersonal.value = "Personal";
    optionPersonal.innerText = "Personal";

    const optionHome = document.createElement('option');
    optionHome.value = "Home";
    optionHome.innerText = "Home";

    const optionWork = document.createElement('option');
    optionWork.value = "Work";
    optionWork.innerText = "Work";

    const optionOther = document.createElement('option');
    optionOther.value = "Other";
    optionOther.innerText = "Other";

    editOrAddSubTaskCategoryPriority.appendChild(optionCategory);
    editOrAddSubTaskCategoryPriority.appendChild(optionPersonal);
    editOrAddSubTaskCategoryPriority.appendChild(optionHome);
    editOrAddSubTaskCategoryPriority.appendChild(optionWork);
    editOrAddSubTaskCategoryPriority.appendChild(optionOther);

    editOrAddSubTaskFeatureContainer.appendChild(editOrAddSubTaskFeatureDatePicker);
    editOrAddSubTaskFeatureContainer.appendChild(editOrAddSubTaskFeaturePriority);
    editOrAddSubTaskFeatureContainer.appendChild(editOrAddSubTaskFeatureReminder);
    editOrAddSubTaskFeatureContainer.appendChild(editOrAddSubTaskCategoryPriority);

    const editOrAddSubTaskTagsContainer = document.createElement('div');
    editOrAddSubTaskTagsContainer.classList.add("add_task_tags_container");

    const editOrAddSubTaskTagsInput = document.createElement('input');
    editOrAddSubTaskTagsInput.setAttribute('id', 'edit_and_new_sub_task_tags_input_field');
    editOrAddSubTaskTagsInput.setAttribute('placeholder', 'Add Tags');
    editOrAddSubTaskTagsInput.setAttribute('type', 'text');

    const editOrAddSubTaskTagsSaveButton = document.createElement('button');
    editOrAddSubTaskTagsSaveButton.setAttribute('id', 'edit_and_new_sub_task_tags_save_button');
    editOrAddSubTaskTagsSaveButton.textContent = "Add";

    editOrAddSubTaskTagsContainer.appendChild(editOrAddSubTaskTagsInput);
    editOrAddSubTaskTagsContainer.appendChild(editOrAddSubTaskTagsSaveButton);

    const editOrAddSubTaskSaveButton = document.createElement('button');
    editOrAddSubTaskSaveButton.setAttribute('id', 'edit_and_new_sub_task_save_button');
    editOrAddSubTaskSaveButton.textContent = "Save";
    if (isEditTask) {
        editOrAddSubTaskInputName.setAttribute('value', task.task_name);
        if (task.due_date !== null) {
            editOrAddSubTaskFeatureDatePicker.defaultValue = new Date(task.due_date).toISOString().split('T')[0];
        }
        optionPriority.selected = task.priority === "Priority";
        optionLow.selected = task.priority === "Low";
        optionMedium.selected = task.priority === "Medium";
        optionHigh.selected = task.priority === "High";
        optionCategory.selected = task.category === "Category";
        optionPersonal.selected = task.category === "Personal";
        optionHome.selected = task.category === "Home";
        optionWork.selected = task.category === "Work";
        optionOther.selected = task.category === "Other";
        editOrAddSubTaskSaveButton.textContent = "Update";
        editOrSubTaskTagsList = [...task.tags];
        editOrSubTaskDueDate = task.due_date;
        editOrSubTaskPriority = task.priority;
        editOrSubTaskCategory = task.category;

        const startTime = new Date().getTime() + 100;
        const callback = () => {
            renderEditOrAddSubTaskTagsList(task);
        };
        setTimeout(callback, startTime);
    }
    editOrAddSubTaskFeatureDatePicker.addEventListener("change", function () {
        editOrSubTaskDueDate = this.value;
    });
    editOrAddSubTaskFeaturePriority.addEventListener("change", function () {
        editOrSubTaskPriority = this.value;
    });
    editOrAddSubTaskCategoryPriority.addEventListener("change", function () {
        editOrSubTaskCategory = this.value;
    });
    editOrAddSubTaskTagsSaveButton.setAttribute('onClick', `editOrAddSubTaskTagsToList()`);
    editOrAddSubTaskSaveButton.setAttribute('onClick', `updateTaskToList(${task.id}, ${isEditTask})`);

    div.appendChild(editOrAddSubTaskInputName);
    div.appendChild(editOrAddSubTaskTagsList);
    div.appendChild(editOrAddSubTaskFeatureContainer);
    div.appendChild(editOrAddSubTaskTagsContainer);
    div.appendChild(editOrAddSubTaskSaveButton);
}

function checkIfSearchWordsInTask(searchWords, contentTask) {
    for (const word of searchWords) {
        if (!contentTask.includes(word)) {
            return false;
        }
    }
    return true;
}

function renderList() {
    const taskListElement = document.getElementById("task_list");
    taskListElement.innerHTML = "";

    var showSubTask = true;
    var showDoneTask = false;
    if (showDoneTask || sorting !== "" || search !== "" || filterDateFrom !== null || filterDateTo !== null) {
        showSubTask = false;
    }

    var tasksToShow = [...todoList];
    var removeTasks = [];
    if (search !== "") {
        const searchWords = search.toLowerCase().trim().split(" ");
        for (const task of tasksToShow) {
            var contentTask = task.task_name.toLowerCase() + " " + task.category.toLowerCase() + " " + task.priority.toLowerCase();
            task.tags.forEach(tag => {
                contentTask += " " + tag.toLowerCase();
            });
            if (!checkIfSearchWordsInTask(searchWords, contentTask)) {
                removeTasks.push(task);
            }
        }
    }
    tasksToShow = tasksToShow.filter(task => !removeTasks.includes(task));
    if (showSubTask) {
        tasksToShow = tasksToShow.filter(task => task.main_task_id === -1);
    }
    if (filterCategory !== "" && filterCategory !== null) {
        tasksToShow = tasksToShow.filter(task => task.category === filterCategory);
    }
    if (filterDateFrom !== null) {
        tasksToShow = tasksToShow.filter(task => task.due_date >= filterDateFrom);
    }
    if (filterDateTo !== null) {
        tasksToShow = tasksToShow.filter(task => task.due_date <= filterDateTo);
    }

    if (sorting === "PLH") {
        const priorityMap = {
            "Low": -1,
            "Medium": 0,
            "High": 1
        };
        tasksToShow = tasksToShow.sort((a, b) => {
            const priorityA = priorityMap[a.priority];
            const priorityB = priorityMap[b.priority];
            return priorityA - priorityB;
        });
        tasksToShow = tasksToShow.filter(task => task.priority !== "");
    } else if (sorting === "PHL") {
        const priorityMap = {
            "High": -1,
            "Medium": 0,
            "Low": 1
        };
        tasksToShow = tasksToShow.sort((a, b) => {
            const priorityA = priorityMap[a.priority];
            const priorityB = priorityMap[b.priority];
            return priorityA - priorityB;
        });
        tasksToShow = tasksToShow.filter(task => task.priority !== "");
    } else if (sorting === "DDD") {
        tasksToShow = tasksToShow.sort((a, b) => {
            const dateA = new Date(a.due_date);
            const dateB = new Date(b.due_date);
            return dateB - dateA;
        });
        tasksToShow = tasksToShow.filter(task => task.due_date !== null);
    } else if (sorting === "DDA") {
        tasksToShow = tasksToShow.sort((a, b) => {
            const dateA = new Date(a.due_date);
            const dateB = new Date(b.due_date);
            return dateA - dateB;
        });
        tasksToShow = tasksToShow.filter(task => task.due_date !== null);
    }

    tasksToShow.forEach(task => {
        if (editId === task.id) {
            const div = document.createElement("div");
            editOrAddSubTaskLayout(div, task, true);
            taskListElement.appendChild(div);
        } else {
            const li = document.createElement("li");
            li.classList.add("task_list_ul_li");
            itemLayout(li, task);
            taskListElement.appendChild(li);
        }

        if (addSubTaskId === task.id) {
            const div = document.createElement("div");
            editOrAddSubTaskLayout(div, task, false);
            taskListElement.appendChild(div);
        }

        if (showSubTask) {
            task.sub_task.forEach(subTaskId => {
                const todoListItem = todoList.find((item) => item.id === subTaskId);
                if (!todoListItem.mark_done) {
                    if (editId === todoListItem.id) {
                        const sub_div = document.createElement("div");
                        editOrAddSubTaskLayout(sub_div, todoListItem, true);
                        taskListElement.appendChild(sub_div);
                    } else {
                        const sub_li = document.createElement("li");
                        sub_li.classList.add("task_sub_list_li");
                        itemLayout(sub_li, todoListItem);
                        taskListElement.appendChild(sub_li);
                    }
                }
            });
        }
    });
    storeTodoListOnLocalStorage();
    renderActivityList();
}

function renderActivityList() {
    const activityListElement = document.getElementById("activity_list");
    activityListElement.innerHTML = "";

    // const tasksToShow = todoList.filter(task => !task.mark_done && task.main_task_id === -1);
    // tasksToShow.forEach(task => {
    //     if (editId === task.id) {
    //         const div = document.createElement("div");
    //         editOrAddSubTaskLayout(div, task, true);
    //         taskListElement.appendChild(div);
    //     } else {
    //         const li = document.createElement("li");
    //         li.classList.add("task_list_ul_li");
    //         itemLayout(li, task);
    //         taskListElement.appendChild(li);
    //     }

    //     if (addSubTaskId === task.id) {
    //         const div = document.createElement("div");
    //         editOrAddSubTaskLayout(div, task, false);
    //         taskListElement.appendChild(div);
    //     }

    //     task.sub_task.forEach(subTaskId => {
    //         const todoListItem = todoList.find((item) => item.id === subTaskId);
    //         if (!todoListItem.mark_done) {
    //             if (editId === todoListItem.id) {
    //                 const sub_div = document.createElement("div");
    //                 editOrAddSubTaskLayout(sub_div, todoListItem, true);
    //                 taskListElement.appendChild(sub_div);
    //             } else {
    //                 const sub_li = document.createElement("li");
    //                 sub_li.classList.add("task_sub_list_li");
    //                 itemLayout(sub_li, todoListItem);
    //                 taskListElement.appendChild(sub_li);
    //             }
    //         }
    //     });
    // });
    localStorage.setItem("activity_list", JSON.stringify(activityList));
}

function clearFilterOption() {
    sorting = "";
    filterCategory = "";
    search = "";
    filterDateFrom = null;
    filterDateTo = null;
    searchInputField.value = "";
    filterDatePickerFrom.value = null;
    filterDatePickerTo.value = null;
    sortingDropdown.selectedIndex = 0;
    filterCategoryDropdown.selectedIndex = 0;
    renderList();
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
searchInputField.addEventListener("input", function () {
    search = this.value;
    renderList();
});
filterDatePickerFrom.addEventListener("change", function () {
    filterDateFrom = this.value;
    if (filterDateTo === null) {
        filterDatePickerTo.min = new Date(this.value).toISOString().split('T')[0];
    }
    renderList();
});
filterDatePickerTo.addEventListener("change", function () {
    filterDateTo = this.value;
    if (filterDateFrom === null) {
        filterDatePickerFrom.max = new Date(this.value).toISOString().split('T')[0];
    }
    renderList();
});
sortingDropdown.addEventListener("change", function () {
    sorting = this.value;
    renderList();
});
filterCategoryDropdown.addEventListener("change", function () {
    filterCategory = this.value;
    renderList();
});
document.getElementById("add_task_tags_save_button").addEventListener("click", addTaskTagsToList);
document.getElementById("add_task_save_button").addEventListener("click", addTaskToList);
document.getElementById("search_clear_button").addEventListener("click", clearFilterOption);

if (localStorage.getItem("activity_list") !== null) {
    activityList = JSON.parse(localStorage.getItem("activity_list"));
}

let localStorageList = localStorage.getItem("todo_list");
if (localStorageList !== null || localStorageList === "") {
    fetchTodoListFromLocalStorage(localStorageList);
} else {
    renderList();
}