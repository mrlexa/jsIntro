import './style.css';
import { isNull } from 'util';

function TodoItem(text) {
  this.text = text;
  this.dateCreated = new Date();
  this.dateDone = null;
  let array = new Uint32Array(1);
  this.id = window.crypto.getRandomValues(array)[0];
}

TodoItem.prototype.setDone = function() {
  this.dateDone = new Date();
};

TodoItem.prototype.setNotDone = function() {
  this.dateDone = null;
};

TodoItem.prototype.isDone = function() {
  return !isNull(this.dateDone);
};

function TodoList() {
  this.items = [];
  this.sortOrderOpen = 0;
  this.sortOrderDone = 0;
  this.filter = '';
}

TodoList.prototype.createItem = function(text) {
  let item = new TodoItem(text);
  this.items.push(item);
  this.save();
  return item;
};

TodoList.prototype.save = function() {
  localStorage.setItem('myListItems', JSON.stringify(this.items));
};

TodoList.prototype.load = function() {
  // load from storage
  let myListItems = JSON.parse(localStorage.getItem('myListItems'));

  // load default
  // let myListItems = null;

  let item;
  if (!myListItems) {
    // load demo values
    item = this.createItem('item1-todo');
    item.dateCreated.setMinutes(item.dateCreated.getMinutes() - 5);
    item = this.createItem('item3-todo');
    item.dateCreated.setMinutes(item.dateCreated.getMinutes() - 10);
    item = this.createItem('item2-todo');
    item.dateCreated.setMinutes(item.dateCreated.getMinutes() - 7);
    item = this.createItem('item4-done');
    item.setDone();
    item = this.createItem('item5-done');
    item.setDone();
    item = this.createItem('item6-done');
    item.setDone();
  } else {
    myListItems.forEach(itm => {
      console.log(itm);
      item = this.createItem(itm.text);
      item.id = itm.id;
      item.dateCreated = new Date(itm.dateCreated);
      if (itm.dateDone) {
        item.dateDone = new Date(itm.dateDone);
      }
    });
  }
  this.save();
  this.redrawItems('listOpen');
  this.redrawItems('listDone');
};

TodoList.prototype._clear = function(listName) {
  let listElement = document.getElementById(listName);
  listElement.innerHTML = '';
};

TodoList.prototype.clear = function(listName) {
  this._clear(listName);
  if (listName === 'listOpen') {
    this.items = this.itemsDone();
  } else {
    this.items = this.itemsOpen();
  }
  this.save();
};

TodoList.prototype.itemsOpen = function() {
  return this.items.filter(itm => !itm.isDone());
};

TodoList.prototype.itemsDone = function() {
  return this.items.filter(itm => itm.isDone());
};

TodoList.prototype.itemRemove = function(id) {
  this.items = this.items.filter(itm => itm.id != id);
  this.save();
};

TodoList.prototype.itemById = function(id) {
  return this.items.find(itm => itm.id == id);
};

TodoList.prototype.setFilter = function(value) {
  this.filter = value;
};

TodoList.prototype.setSortOrder = function(listId, index) {
  if (listId === 'listOpen') {
    this.sortOrderOpen = index;
  } else {
    this.sortOrderDone = index;
  }
};

TodoList.prototype.redrawItems = function(listId) {
  this._clear(listId);
  let fItems;
  let sort;

  if (listId === 'listOpen') {
    fItems = this.itemsOpen();
    sort = this.sortOrderOpen;
  } else {
    fItems = this.itemsDone();
    sort = this.sortOrderDone;
  }

  fItems = fItems.filter(itm => itm.text.includes(this.filter));
  if (sort === 0) {
    fItems = fItems.sort((a, b) => (a.text > b.text ? 1 : -1));
  } else if (sort === 1) {
    fItems = fItems.sort((a, b) => (a.text < b.text ? 1 : -1));
  } else if (sort === 2) {
    if (listId === 'listOpen') {
      fItems = fItems.sort((a, b) => a.dateCreated - b.dateCreated);
    } else {
      fItems = fItems.sort((a, b) => a.dateDone - b.dateDone);
    }
  } else if (sort === 3) {
    if (listId === 'listOpen') {
      fItems = fItems.sort((a, b) => b.dateCreated - a.dateCreated);
    } else {
      fItems = fItems.sort((a, b) => b.dateDone - a.dateDone);
    }
  }

  fItems.forEach(itm => drawItem(itm, listId));
};

//--------------------

let todoList = new TodoList();

// load all on start
todoList.load();

function drawItem(item, itemListId) {
  let listElement = document.getElementById(itemListId);

  let div = document.createElement('div');
  div.setAttribute('class', 'row');
  div.id = 'itm' + item.id;
  div.addEventListener('mouseover', editMouseOverEvent);
  div.addEventListener('mouseout', editMouseOutEvent);

  let checkBox = document.createElement('input');
  checkBox.setAttribute('class', 'item');
  checkBox.id = 'chb' + item.id;
  checkBox.type = 'checkbox';
  checkBox.checked = item.isDone();
  checkBox.addEventListener('click', checkBoxEvent);
  div.appendChild(checkBox);

  let divText = document.createElement('div');
  divText.setAttribute('class', 'item');
  divText.id = 'txt' + item.id;
  divText.addEventListener('dblclick', editTextEvent);
  divText.addEventListener('focusout', editOutEvent);
  div.appendChild(divText);

  let value = document.createTextNode(item.text);
  divText.appendChild(value);

  let dtCText = document.createElement('div');
  dtCText.setAttribute('class', 'item');
  dtCText.id = 'dtc' + item.id;
  div.appendChild(dtCText);

  value = document.createTextNode(getTime(item.dateCreated));
  dtCText.appendChild(value);

  if (item.isDone()) {
    let dtDText = document.createElement('div');
    dtDText.setAttribute('class', 'item');
    dtDText.id = 'dtd' + item.id;
    div.appendChild(dtDText);

    value = document.createTextNode(getTime(item.dateDone));
    dtDText.appendChild(value);
  }

  let deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('class', 'item');
  deleteBtn.id = 'btn' + item.id;
  deleteBtn.innerHTML =
    '<img id=img' +
    item.id +
    ' src="https://img.icons8.com/metro/26/000000/delete.png">';
  deleteBtn.style.display = 'none';
  deleteBtn.addEventListener('click', deleteBtnEvent);
  div.appendChild(deleteBtn);

  listElement.appendChild(div);
}

function getTime(d) {
  let h = d.getHours();
  let m = d.getMinutes();
  if (h < 10) {
    h = '0' + h;
  }
  if (m < 10) {
    m = '0' + m;
  }
  return h + ':' + m;
}

function editTextEvent(e) {
  let editor = document.createElement('input');
  let parent = e.srcElement;
  editor.value = parent.innerHTML;
  editor.oldValue = editor.value;
  parent.innerHTML = '';
  parent.appendChild(editor);
  editor.addEventListener('keyup', saveValueEvent);
  editor.focus();
}

function checkBoxEvent(e) {
  let id = e.target.id.substring(3);
  if (e.target.checked) {
    todoList.itemById(id).setDone();
  } else {
    todoList.itemById(id).setNotDone();
  }
  todoList.save();
  todoList.redrawItems('listOpen');
  todoList.redrawItems('listDone');
}

function deleteBtnEvent(e) {
  let id = e.target.id.substring(3);
  let div = document.getElementById('itm' + id);
  div.parentNode.removeChild(div);
  todoList.itemRemove(id);
}

function editMouseOverEvent(e) {
  let id = e.target.id;
  if (id == '') {
    return;
  }
  id = 'btn' + id.substring(3);
  let btn = document.getElementById(id);
  if (btn == null) {
    console.log('id is fail - ', e.target);
  }
  btn.style.display = 'inline-block';
  e.stopPropagation();
}
function editMouseOutEvent(e) {
  let id = e.target.id;
  if (id == '') {
    return;
  }
  id = 'btn' + id.substring(3);
  let btn = document.getElementById(id);
  if (btn == null) {
    console.log('id is fail - ', e.target);
  }
  btn.style.display = 'none';
  e.stopPropagation();
}

function saveValueEvent(e) {
  let parent = e.srcElement.parentElement;
  if (event.keyCode === 13) {
    todoList.itemById(parent.id.substring(3)).text = e.srcElement.value;
    todoList.save();
    parent.innerHTML = e.srcElement.value;
  }
  if (event.keyCode === 27) {
    parent.innerHTML = e.srcElement.oldValue;
  }
}

function editOutEvent(e) {
  let parent = e.srcElement.parentElement;
  parent.innerHTML = e.srcElement.oldValue;
}

// setup listeners
let addButton = document.getElementById('addButton');
addButton.addEventListener('click', addNewItemEvent);

function addNewItemEvent(e) {
  let text = document.getElementById('addText'); // искать рядом, а не повсему документу
  let val = text.value.trim();
  if (val === '') {
    return;
  }

  todoList.createItem(val);
  todoList.redrawItems('listOpen');

  text.value = '';
}

let clearOpen = document.getElementById('clearOpen');
clearOpen.addEventListener('click', clearOpenEvent);

let clearDone = document.getElementById('clearDone');
clearDone.addEventListener('click', clearDoneEvent);

function clearOpenEvent(e) {
  todoList.clear('listOpen');
}

function clearDoneEvent(e) {
  todoList.clear('listDone');
}

let searchText = document.getElementById('searchText');
searchText.addEventListener('input', filterElementsEvent);

function filterElementsEvent(e) {
  todoList.setFilter(e.srcElement.value);
  todoList.redrawItems('listOpen');
  todoList.redrawItems('listDone');
}

let selectOpen = document.getElementById('selectOpen');
selectOpen.addEventListener('change', selectChangeEvent);
let selectDone = document.getElementById('selectDone');
selectDone.addEventListener('change', selectChangeEvent);

function selectChangeEvent(e) {
  let selectId = e.srcElement.id;
  let listId = selectId.replace('select', 'list');
  todoList.setSortOrder(listId, e.srcElement.selectedIndex);
  todoList.redrawItems(listId);
}
