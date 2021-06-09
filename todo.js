class Todo {
  constructor(sKey,sType,{
    title = "Todo Application",
    data = [],
  } = {}) {
    
    this.nodes = {};
    this.title = title;
    this.data = data;
    this.filteredData = data;
    this.addTask = this.addTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.toggleStatus = this.toggleStatus.bind(this);
    this.filterData = this.filterData.bind(this);
    
  this.sKey=sKey;
  this.sType=sType;
  if(sType=='local'){
    // console.log('local')
  this.todos=JSON.parse(localStorage.getItem(this.sKey)) || [];
  }
  else if(sType=='session'){
  // console.log('session')
  this.todos=JSON.parse(sessionStorage.getItem(this.sKey)) || [];
  }
  else
  this.todos=JSON.parse(localStorage.getItem(this.sKey)) || [];
  
    this.filterTypes = [
      {
        name: "All",
      },
      {
        name: "Active",
      },
      {
        name: "Completed",
      }
    ];

    this.elementDefaults = {
      type: "div",
      markup: "",
      container: document.body,
      attributes: {},
      events: {}
    };
  }

  addToLocalStorage(todos,type) {
      console.log(type)
      if(type=='local'){
        localStorage.setItem(this.sKey, JSON.stringify(todos));  
      }else if(type=='session'){
       
        sessionStorage.setItem(this.sKey, JSON.stringify(todos));  
      }else
      localStorage.setItem(this.sKey, JSON.stringify(todos));     
  }

  elementCreator(options) {
    const config = { ...this.elementDefaults, ...options };
    const elementNode = document.createElement(config.type);

    Object.keys(config.attributes).forEach(a => {
      config.attributes[a] !== null &&
        elementNode.setAttribute(a, config.attributes[a]);
    });

    elementNode.innerHTML = config.markup;
    config.container.append(elementNode);

    Object.keys(config.events).forEach(e => {
      this.eventBinder(
        elementNode,
        e,
        config.events[e].action,
        config.events[e].api
      );
    });

    return elementNode;
  }

  

  eventBinder(el, event, action, api = false) {
    el.addEventListener(event, e => {
      api ? action(e) : action();
    });
  }

  emptyListUI(message = "Not found a task") {
    this.nodes.list.innerHTML = "";
    this.nodes.emptyList = this.elementCreator({
      markup: message,
      attributes: {
        class: "task-empty"
      },
      container: this.nodes.list
    });
  }

 
   
  addTask({
    id = new Date().getUTCMilliseconds(),
    name = `New task #${new Date().getUTCMilliseconds()}`,
    completed = false
  } = {}) {
    // console.log(this.sType)
    const inputValue = this.nodes.input.value.trim();
    const taskName = inputValue.length > 0 ? inputValue : name;
    const newTask = { id, name: taskName, completed };
    this.nodes.input.value = "";
    this.todos.push(newTask);
    this.addToLocalStorage(this.todos,this.sType)
    this.listUI()
    this.filterData();
  }

  toggleStatus(id) {
    this.todos.forEach( (item) =>{
      if (item.id == id) {
        console.log(id)
        item.completed = !item.completed;
      }
    });
    this.addToLocalStorage(this.todos,this.sType);
  }

 deleteTask(id) {
   this.todos = this.todos.filter( (item)=> {
      return item.id != id;
    });
    this.addToLocalStorage(this.todos,this.sType);
    this.listUI();
    this.filterData();
  }
 
  generalUI() {
    this.nodes.app = this.elementCreator({
      attributes: {
        class: "app"
      }
    });

    this.nodes.header = this.elementCreator({
      attributes: {
        class: "task-header"
      },
      container: this.nodes.app
    });

    this.nodes.title = this.elementCreator({
      type: "h1",
      markup: this.title,
      attributes: {
        class: "task-header-title"
      },
      container: this.nodes.header
    });

    this.nodes.list = this.elementCreator({
      attributes: {
        class: "task-list"
      },
      container: this.nodes.app
    });

    this.nodes.tools = this.elementCreator({
      attributes: {
        class: "task-tools"
      },
      container: this.nodes.header
    });

    this.nodes.form = this.elementCreator({
      type: "form",
      attributes: {
        class: "task-form"
      },
      events: {
        submit: { action: e => e.preventDefault(), api: true }
      },
      container: this.nodes.header
    });
    
    this.nodes.filters = this.elementCreator({
      attributes: {
        class: "task-filters"
      },
     
      // container: this.nodes.tools
    });
  }

  formUI() {
    this.nodes.input = this.elementCreator({
      type: "input",
      attributes: {
        class: "task-input",
        placeholder: "Add a new task...",
        autofocus: "true"
      },
      container: this.nodes.form
    });

    this.nodes.button = this.elementCreator({
      type: "button",
      markup: "Add Task",
      attributes: {
        class: "task-button",
      },
      events: {
        click: { action: this.addTask.bind(this), api: false }
      },
      container: this.nodes.form
    });
  }

  filterUI(filterTypes = this.filterTypes) {
    this.nodes.filters.innerHTML = "";
    filterTypes.forEach(type => {
      const button = this.elementCreator({
        type: "button",
        markup: type.name,
        events: {
          click: { action: this.filterData.bind(this,type.name), api: true }
        },
        container: this.nodes.filters
      });
    });
  }
 
  filterData(e) {
    // alert(e);
    if(e=='Active'){
      let activeItem=[];
      this.todos.filter((activeList)=>{
        if(!activeList.completed){
           activeItem.push(activeList);
        }
        this.listUI(activeItem)
      })
    }else if(e=='Completed'){
      let completedItems=[];
      this.todos.filter((activeList)=>{
        if(activeList.completed){
           completedItems.push(activeList);
        }
        this.listUI(completedItems)
      })
    }else if(e=='All'){
      this.listUI(this.todos)
    }
    
  }
 
  listUI(todos=this.todos) {
    this.nodes.list.innerHTML = "";
    if (todos.length === 0) {
      this.emptyListUI();
      return;
    }
    todos.forEach(task => {
      const item = this.elementCreator({
        attributes: {
          class: `task-item${task.completed ? " is-completed" : ""}`
        },
        container: this.nodes.list
      });

      const checkbox = this.elementCreator({
        type: "input",
        attributes: {
          class: "task-status",
          type: "checkbox",
          checked: task.completed ? task.completed : null,
          "data-id": task.id,
        },
        events: {
          change: { action: this.toggleStatus.bind(this,task.id) }
        },
        container: item
      });

      const name = this.elementCreator({
        type: "label",
        markup: task.name,
        attributes: {
          class: "task-name"
        },
        container: item
      });

      const button = this.elementCreator({
        type: "button",
        markup: "",
        attributes: {
          class: "task-delete",
          "data-id": task.id
        },
        events: {
          click: { action: this.deleteTask.bind(this,task.id), api: false}
        },
        container: item
      });
    });
  }

  init() {
    this.generalUI();
    this.formUI();
    this.listUI();
    this.filterUI();
  }
}

// const todoList = [
  
// ];

const TodoApp = new Todo('class1','local');

TodoApp.init();


  const TodoAp = new Todo('listS','session');

  TodoAp.init();

