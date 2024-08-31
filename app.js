let addTaskBtn = document.querySelector(".input-container");
let plusBtn = document.querySelector("#showBox");
let submitBtn = document.querySelector(".submit-btn");
let getTask = document.querySelector(".input-container input");
let taskList = document.querySelector(".taskList");
let editName = document.querySelector(".editName");
let editSub = document.querySelector(".editSub");
let getName = document.querySelector(".editName input");
let filterStatus = document.querySelector("#status");
let selected = document.querySelector(".select-status select");
let empState = document.querySelector(".empty-state");
let tasks = [];

addTaskBtn.style.display = "none";

window.onload = () => {
    getItemsFromLs();
    checkTaskList();
}

function getItemsFromLs() {
    tasks = []; // Clear the tasks array
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const task = JSON.parse(localStorage.getItem(key));
        tasks.push(task);
        if (task.status !== "deleted") {

            addTaskToList(task);
        }   

    }
}


function checkTaskList() {
    if (taskList.childElementCount === 0) {
        empState.style.display = "block";
    } else {
        empState.style.display = "none";
    }
}


filterStatus.addEventListener("change", () => {
    const status = filterStatus.value;
    console.log(`Selected status: ${status}`);

    taskList.innerHTML = ''; // Clear the list first
    console.log("Task list cleared");

    // Filter tasks based on the selected status
    const statusFilter = task => {
        if (status === "all") {
            return task.status !== "deleted"; // Show all tasks except deleted
        } else if (status === "deleted") {
            return task.status === "deleted"; // Only show deleted tasks
        } else {
            return task.status === status; // Show tasks matching the selected status
        }
    };
    const filteredTasks = tasks.filter(statusFilter);

    console.log(`Filtered tasks count: ${filteredTasks.length}`);

    if (filteredTasks.length === 0) {
        // Display the empty state message if no tasks match the filter
        console.log("No tasks match the filter. Displaying empty state message.");
        empState.style.display = "block";
    } else {
        // Hide the empty state message and add the filtered tasks to the list
        console.log("Tasks found. Hiding empty state message and adding tasks to the list.");
        empState.style.display = "none";
        filteredTasks.forEach(task => {
            console.log(`Adding task to list: ${task.name}`);
            addTaskToList(task);
        });
    }

    // Update the border style based on the selected status
    const borderStyle = {
        "active": "2px solid blue",
        "completed": "2px solid green",
        "deleted": "2px solid red"
    }[status] || "2px solid white";
    
    console.log(`Setting border style: ${borderStyle}`);
    selected.style.border = borderStyle;
});




plusBtn.addEventListener("click", () => {
    addTaskBtn.style.display = "flex";
    submitBtn.style.display = "block";
});

submitBtn.addEventListener("click", () => {
    const newTaskName = getTask.value.trim();
    if (newTaskName !== "" && !tasks.some(task => task.name === newTaskName)) {
        const newTask = new Task(newTaskName);
        tasks.push(newTask);
        console.log(newTask);
        localStorage.setItem(newTask.taskId, JSON.stringify(newTask));
        addTaskToList(newTask);
        getTask.value = "";
        addTaskBtn.style.display = "none";
        submitBtn.style.display = "none";
    } else if (newTaskName === "") {
        alert("Task name cannot be empty.");
    } else {
        alert("Task already exists!");
    }
});

function addTaskToList(task) {
    let taskElement = document.createElement("div");
    taskElement.className = "task";
    
    let taskText = document.createElement("div");
    taskText.className = "task-text";
    taskText.innerText = task.name;
   
    let taskActElement = document.createElement("div");
    taskActElement.className = "task-actions";
    taskActElement.dataset.taskId = task.taskId;

    // Create action elements
    let actionElement = createActionElement("fa-solid fa-pencil action-btn edit-btn", "edit-btn");
    let actionElement2 = createActionElement("fa-solid fa-trash action-btn delete-btn", "delete-btn");
    let actionElement3 = createActionElement("fa-solid fa-check action-btn comp-btn", "comp-btn");

    let infoIcons = {
        active: createInfoIcon("fa-solid fa-hourglass-start info-icon"),
        completed: createInfoIcon("fa-solid fa-check action-btn info-icon"),
        deleted: createInfoIcon("fa-solid fa-trash info-icon")
    };

    // Append elements to taskElement
    taskElement.appendChild(taskText);
    taskElement.appendChild(taskActElement);
    console.log(task.status);
    // Conditionally append action elements based on task status
    if (task.status === "active") {
        taskActElement.append(actionElement, actionElement2, actionElement3);
    } else if (task.status === "completed") {
        taskActElement.append(actionElement);
    } else if (task.status === "deleted") {
        taskActElement.append(actionElement2);
    }

    // Append the taskElement to taskList
    taskList.appendChild(taskElement);

    // Update icons based on task status
    updateTaskIcons(taskElement, task.status, infoIcons);
    
    // Event listeners for task actions
    taskElement.addEventListener('mouseover', () => {
        taskElement.classList.add('show-actions');
        Object.values(infoIcons).forEach(icon => icon.style.display = "none");
    });

    taskElement.addEventListener('mouseout', () => {
        taskElement.classList.remove('show-actions');
        Object.values(infoIcons).forEach(icon => icon.style.display = "block");
    });

    taskActElement.addEventListener("click", (e) => {
        e.stopPropagation();
        console.log(taskElement);
        handleTaskActions(e, task, taskElement);
    });
}

function updateTaskIcons(taskElement, status, icons) {
    Object.keys(icons).forEach(key => {
        if (status === key) {
            taskElement.querySelector(".task-text").appendChild(icons[key]);
            icons[key].style.display = "block";
        }
    });
}

function handleTaskActions(e, task, taskElement) {
    const action = e.target.id;
    const taskId = e.target.offsetParent.dataset.taskId;
    switch (action) {
        case "edit-btn":
            editTask("show", document.createElement("div"));
            editSub.addEventListener("click", () => {
                const name = getName.value;
                editTaskStorage(taskId, name, taskElement);
                editTask("hide", document.createElement("div"));
            });
            break;
        case "comp-btn":
            markComp(taskId);
            break;
        case "delete-btn":
            delTask(taskId, taskElement);
            break;
    }
}

function markComp(taskId) {
    updateTaskStatus(taskId, "completed");
    window.location.reload();
}

function delTask(taskId, taskElement) {
    updateTaskStatus(taskId, "deleted", taskElement);
    // window.location.reload();
}

function updateTaskStatus(taskId, status, taskElement) {
    let taskStore = JSON.parse(localStorage.getItem(taskId));
    
    taskStore.status = status;
    localStorage.setItem(taskId, JSON.stringify(taskStore));
    tasks.forEach(task => {
        if (task.taskId == taskId) {
            task.status = status;
        }
    })
}

function editTaskStorage(taskId, name, taskElement) {
    let taskStore = JSON.parse(localStorage.getItem(taskId));
    taskStore.name = name;
    localStorage.setItem(taskId, JSON.stringify(taskStore));
    taskElement.querySelector(".task-text").innerText = name;
    tasks.forEach(task => {
        if (task.taskId == taskId) {
            task.name = name;
        }
    })
}

function editTask(action, backdrop) {
    editName.classList.toggle(action, action === "show");
    editName.style.display = action === "show" ? "block" : "none";
    backdrop.style.display = action === "show" ? "block" : "none";
}

function getTaskList() {
    return Array.from({ length: localStorage.length }, (_, i) => {
        const key = localStorage.key(i);
        return JSON.parse(localStorage.getItem(key));
    });
}

function createInfoIcon(className) {
    let icon = document.createElement("i");
    icon.className = className;
    icon.style.display = "none";
    return icon;
}

function createActionElement(className, idName) {
    let el = document.createElement("i");
    el.className = className;
    el.id = idName;
    return el;
}

class Task {
    constructor(name) {
        this.name = name;
        this.status = "active";
        this.taskId = genTaskId();
    }
}

function genTaskId() {
    return Math.floor(Math.random() * 20000);
}

