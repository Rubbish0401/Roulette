import { ItemManager } from "./ItemManager.js";

//

document.addEventListener("DOMContentLoaded", root_event => {
	let structureLink = document.createElement("link");
	let faceLink = document.createElement("link");

	structureLink.rel = "stylesheet";
	faceLink.rel = "stylesheet";

	structureLink.href = "./styles/ListBuilder/ListBuilder-structure.css";
	faceLink.href = "./styles/ListBuilder/ListBuilder-face.css";

	document.head.append(structureLink, faceLink);
});

//

export class ListBuilder{
	#manager;
	#back;
	#items = [];
	#listener = {
		"global": [],
		"add": [],
		"remove": [],
		"change": [],
	};

	//
	constructor(manager){
		let self = this;

		if(manager instanceof ItemManager){
			this.#manager = manager;
			this.import();
		}else{
			this.#manager = new ItemManager();
		}

		manager.addEventListener("import", () => {
			self.import();
		});

		this.#back = document.createElement("div");
		this.#back.classList.add("list-body");
		this.#back.append(createAddingItem());
	}

	//
	get(){ return this.#back; }
	getLength(){ return this.#items.length }
	getItemName(pos){ return this.#manager.get(pos).name; }
	getItemWeight(pos){ return this.#manager.get(pos).weight; }

	//
	get length(){ return this.getLength(); }

	//
	setItemName(pos, name){
		let before = this.#manager.get(pos).name;

		this.#manager.setItemName(pos, name);

		let after = this.#manager.get(pos).name;
	}

	setItemWeight(pos, weight){
		let before = this.#manager.get(pos).weight;

		this.#manager.setItemWeight(pos, weight);

		let after = this.#manager.get(pos).weight;
	}

	//
	add(pos, item){
		this.#items.splice(pos, 0, item);
		this.#manager.addItem(pos, this.getItemName(pos), this.getItemWeight(pos));
	}

	remove(pos){
		if(0 <= pos && pos <= this.length){
			this.#manager.removeItem(pos);
			this.#items[pos].classList.add("out");
			this.#items.splice(pos, 1);
		}
	}

	//
	import(){
		if(this.#back instanceof Element){
			let len = this.#back.children.length;
			for(let i = 1; i < len; i++) this.#back.children[1].remove();
		}
		
		for(let i = 0; i < this.#manager.length; i++){
			let itemInfo = this.#manager.get(i);

			let item = createListItem(this, itemInfo.name, itemInfo.weight);
			let adder = createAddingItem();

			this.#back.append(item, adder);
			this.#items.push(item);
		}
	}
}

//

function createListItem(builder, name, weight){
	// Create Elements
	let item = document.createElement("div");

	let nameHolder = document.createElement("div");
	let weightHolder = document.createElement("div");

	let dispColour = document.createElement("span");
	let editName = document.createElement("input");
	let dispName = document.createElement("span");
	let editWeight = document.createElement("input");
	let dispWeight = document.createElement("span");

	let delBtn = document.createElement("img");

	// Classes or ID
	item.classList.add("list-item", "row", "close");

	nameHolder.classList.add("list-item", "name-holder", "show");
	weightHolder.classList.add("list-item", "weight-holder", "show");

	dispColour.classList.add("list-item", "colour");
	editName.classList.add("list-item", "name-edit");
	dispName.classList.add("list-item", "name-display");
	editWeight.classList.add("list-item", "weight-edit");
	dispWeight.classList.add("list-item", "weight-display");

	delBtn.classList.add("list-item", "del-btn");

	// Modify Parameters
	editName.type = "text";
	editName.placeholder = "Name";

	editWeight.type = "number";
	editWeight.min = 0;
	editWeight.value = 1;
	editWeight.placeholder = "Weight"

	if(typeof name == "string") editName.value = name;
	if(!isNaN(weight) && weight >= 0) editWeight.value = weight;

	dispName.innerText = editName.value;
	dispWeight.innerText = editWeight.value;

	delBtn.src = "./src/images/svg/delete_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";

	// Set Listeners
	item.addEventListener("transitionend", event => {
		if(event.propertyName == "transform" && item.classList.contains("out")){	
			item.nextElementSibling.remove();
			item.remove();
		}
	});

	dispName.addEventListener("click", event => {
		nameHolder.classList.remove("show");
		nameHolder.classList.add("edit");

		editName.focus();
	});

	dispWeight.addEventListener("click", event => {
		weightHolder.classList.remove("show");
		weightHolder.classList.add("edit")

		editWeight.focus();
	});

	editName.addEventListener("focusout", event => {
		nameHolder.classList.remove("edit");
		nameHolder.classList.add("show");

		editName.value = dispName.innerText;
	});

	editName.addEventListener("change", event => {
		let pos = ([...item.parentElement.children].indexOf(item) - 1) / 2;
		let newName = editName.value;

		dispName.innerText = newName;
		builder.setItemName(pos, newName);

		editName.dispatchEvent(new FocusEvent("focusout"));
		editName.blur();
	});

	editWeight.addEventListener("focusout", event => {
		weightHolder.classList.remove("edit");
		weightHolder.classList.add("show");

		editWeight.value = dispWeight.innerText;
	});

	editWeight.addEventListener("change", event => {
		let pos = ([...item.parentElement.children].indexOf(item) - 1) / 2;
		let newWeight = Number(editWeight.value);

		if(isNaN(newWeight) || newWeight < 0){
			newWeight = 0;
			editWeight.value = newWeight;
		}

		dispWeight.innerText = newWeight;
		builder.setItemWeight(pos, newWeight);

		editWeight.dispatchEvent(new FocusEvent("focusout"));
		editName.blur();
	});

	delBtn.addEventListener("click", event => {
		let pos = ([...item.parentElement.children].indexOf(item) - 1) / 2;
		builder.remove(pos);
	});

	// Append Elements
	item.append(dispColour, nameHolder, weightHolder, delBtn);
	nameHolder.append(editName, dispName);
	weightHolder.append(editWeight, dispWeight);

	// Others
	setTimeout(() => { item.classList.remove("close") }, 0)

	// Return
	return item;
}

function createAddingItem(buiilder){
	// Create Elements
	let item = document.createElement("div");
	let icon = document.createElement("img");

	// Classes or ID
	item.classList.add("item-adder", "row");
	icon.classList.add("item-adder", "icon");

	// Modify Parameters
	icon.src = "./src/images/svg/add_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";

	// Set Listeners
	item.addEventListener("click", event => {
		let pos = [...item.parentElement.children].indexOf(item);

		let newListItem = createListItem(builder);
		let newAddingItem = createAddingItem();

		item.after(newListItem);
		newListItem.after(newAddingItem);

		builder.add(pos / 2, newListItem);
	});

	// Append Elements
	item.append(icon);
	
	// Return
	return item;
}