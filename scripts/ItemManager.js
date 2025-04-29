//

var count = 0;

//

/*
	{
		name: {string},
		weight: {number} // non-negative
	}
*/

export class ItemManager{
	#name;
	#items = [];

	#listener = {
		"global": [],
		"import": [],
		"change": [],
	};

	constructor(csv_data){
		this.setName(`ItemList ${count}`);
		this.import(csv_data);

		count++;
	}

	//
	import(csv_data){
		if(typeof csv_data == "string" && csv_data.length > 0){
			let data = [];

			let lines = csv_data.split("\n");
			for(let i = 0; i < lines.length; i++){
				let line = lines[i];
				let parts = line.split(",");
				let item = createItem(parts[0], Number(parts[1]));

				data.push(item);
			}

			this.#items = data;

			for(let func of this.#listener.global) func(this);
			for(let func of this.#listener.import) func(this);
			for(let func of this.#listener.change) func({ type: "import" });
		}
	}

	export(){
		let csv_data;

		let lines = [];
		for(let i = 0; i < this.#items.length; i++){
			let item = this.#items[i];
			let line = `${item.name},${item.weight}`;
			lines.push(line);
		}

		csv_data = lines.join("\n");
		return csv_data;
	}

	download(){
		downloadItems(this);
	}

	//
	get(pos){
		let item = this.#items[pos];

		if(item != null) return createItem(item.name, item.weight);
		else return createItem(void 0, void 0);
	}
	getName(){ return this.#name }
	getLength(){ return this.#items.length }

	getItemNames(){
		let list = [];
		for(let i = 0; i < this.length; i++) list.push(this.get(i));

		return list;
	}

	getWeightSum(){
		let result = 0;
		for(let item of this.#items) result += item.weight;

		return result;
	}

	getPositionByWeightPos(weightPos){
		for(let pos = 0, start = 0; pos < this.length; pos++){
			let range = this.get(pos).weight;

			if(start <= weightPos && weightPos < start + range){
				return pos;
			}

			start += range;
		}

		return -1;
	}

	//
	get name(){ return this.getName() }
	get length(){ return this.getLength() }

	//
	setName(name){
		if(typeof name == "string") this.#name = name;
	}

	setItemName(pos, name){
		this.setItem(pos, name, void 0);
	}

	setItemWeight(pos, weight){
		this.setItem(pos, void 0, weight);
	}

	//
	setItem(pos, name, weight){
		if(!isNaN(pos) && 0 <= pos && pos < this.length){
			let before = this.get(pos);

			weight = Number(weight);

			if(typeof name == "string") this.#items[pos].name = String(name);
			if(!isNaN(weight)) this.#items[pos].weight = weight;

			let after = this.get(pos);
			for(let func of this.#listener.global) func();
			for(let func of this.#listener.change) func({ type: "set" });
		}
	}

	addItem(pos, name, weight){
		if(!isNaN(pos) && 0 <= pos){
			pos = Math.min(pos, this.length);

			if(typeof name == "undefined") name = "";
			if(typeof weight == "undefined") weight = 1;

			this.#items.splice(pos, 0, createItem(name, weight));

			for(let func of this.#listener.global) func();
			for(let func of this.#listener.change) func({ type: "add", position: pos });
		}
	}

	removeItem(pos){
		if(!isNaN(pos) && 0 <= pos && pos < this.length){
			this.#items.splice(pos, 1);

			for(let func of this.#listener.global) func();
			for(let func of this.#listener.change) func({ type: "remove", position: pos });
		}
	}

	removeAll(){
		this.#items.length = 0;

		for(let func of this.#listener.global) func();
		for(let func of this.#listener.change) func({ type: "remove_all" });
	}

	// Listener
	addEventListener(key, ...func){
		if(this.#listener.hasOwnProperty(key)){
			for(let f of func) if(typeof f == "function") this.#listener[key].push(f);
		}
	}
	
	removeAllEventListeners(){
		this.#listener = INITIAL_LISTENERS;
	}
}

//
function downloadItems(manager){
	if(manager instanceof ItemManager){
		let csv_data  = manager.export();
		let blob = new Blob([csv_data], {
			type: "text/plain"
		});

		let anchor = document.createElement("a");
		anchor.href = URL.createObjectURL(blob);
		anchor.download = `${manager.getName()}.csv`;
		anchor.click();	
	}
}

function createItem(name, weight){
	let item = Object.create(null);
	item.name = name;
	item.weight = (!isNaN(weight) && weight >= 0) ? weight : 1;

	return item;
}