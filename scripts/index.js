import { ItemManager } from "./ItemManager.js";
import { ListBuilder } from "./ListBuilder.js";

document.addEventListener("DOMContentLoaded", function(root_event){
	//

	let cssPaths = [
		"./styles/Editor/editor-face.css",
		"./styles/Editor/editor-structure.css",
		"./styles/Result/result-face.css",
		"./styles/Result/result-structure.css",
	];
	
	document.head.append(...(function*(){
		for(let i = 0; i < cssPaths.length; i++){
			let link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = cssPaths[i];

			yield link;
		}
	})());

	//

	manager = new ItemManager();
	builder = new ListBuilder(manager);
	rouletteStyle = document.createElement("style");
	rouletteSpin = document.createElement("style");

	//

	let data = localStorage.getItem(KEY_DATA);
	
	manager.addEventListener("change", obj => { localStorage.setItem(KEY_DATA, manager.export()); });
	manager.addEventListener("change", obj => {
		rouletteStyle.innerHTML = "#roulette{\n" + 
		`background: conic-gradient(${[...(function*(){
			let L = manager.length;
			let W = manager.getWeightSum();
			for(let i = 0, start = 0; i < L; i++){
				let range = manager.get(i).weight;

				yield `hsl(${360 * i / L}, 100%, 80%) ${start / W}turn ${(start + range) / W}turn` + (i < L - 1 ? "," : "");

				start += range;
			}
		})()].join("\n")});\n` +
		`transform: rotate(${- manager.get(0).weight / manager.getWeightSum() / 2}turn); \n` + 
		"}";
	});

	manager.import(data);

	// Elements
	editorBtn = document.getElementById("btn-edit");
	importBtn = document.getElementById("btn-import");
	downloadBtn = document.getElementById("btn-download");
	selectBtn = document.getElementById("btn-select");
	clearBtn = document.getElementById("btn-clear");

	itemList = document.getElementById("item-list");

	doneBtn = document.getElementById("btn-done");

	roulette = document.getElementById("roulette");

	// Set Listeners
	editorBtn.addEventListener("click", event => { openEditor(); });
	importBtn.addEventListener("click", event => { openDataCSV(); });

	downloadBtn.addEventListener("click", event => {
		if(manager.length > 0) manager.download();
	});

	clearBtn.addEventListener("click", event => {
		manager.removeAll();

		let len = builder.length;
		for(let i = 0; i < len; i++){
			setTimeout(() => {
				builder.remove(len - i - 1);
			}, 50 * i);
		}
	});

	doneBtn.addEventListener("click", event => {
		if(!rouletteStop){
			let W = manager.getWeightSum();
			let random = Math.random() * W, pos = manager.getPositionByWeightPos(random);
			let start = manager.get(0).weight / W / 2;
			rouletteStop = (function(){ let a = 0; for(let i = 0; i < pos; i++) a += manager.get(i).weight; return (a + manager.get(pos).weight / 2) / W; })();

			rouletteSpin.innerHTML = [
				"@keyframes spin{",
				`0%{ transform: rotate(-${start}turn); }`,
				`100%{ transform: rotate(-${SPIN_COUNT + rouletteStop}turn) }`,
				"}",
			].join("\n");
			roulette.style.animationDuration = `${SPIN_COUNT / SPIN_SPEED}s`;
			roulette.classList.add("spin");
		}
	});

	roulette.addEventListener("animationend", event => {
		let pos = manager.getPositionByWeightPos(rouletteStop * manager.getWeightSum());
		setTimeout(() => { showResult(pos)}, 0);
	});

	// Append Elements
	itemList.append(builder.get());
	document.head.append(rouletteStyle, rouletteSpin)
});

window.addEventListener("load", function(root_event){
});

//
openDataCSV = function(){
	let input = document.createElement("input");
	input.type = "file";
	input.accept = ".csv, .txt";
	
	input.addEventListener("change", () => {
		let files = input.files;
		if(files.length >= 1){
			let file = files[0];
			let reader = new FileReader();

			reader.addEventListener("load", () => {
				let text = reader.result;
				manager.import(text);
			});
			reader.readAsText(file);
		}
	});

	input.click();
};

test = function(count){
	let result = [];
	for(let i = 0; i < manager.length; i++) result.push(0);

	for(let i = 0; i < count; i++){
		let random = Math.random() * manager.getWeightSum();
		let pos = manager.getPositionByWeightPos(random);
		result[pos]++;
	}

	console.log([...(function*(){ for(let pos = 0; pos < manager.length; pos++) yield `${manager.get(pos).name}: ${result[pos]}(${Math.floor(result[pos] / count * 10000) / 100}%)` })()].join("\n"));
}

//
openEditor = function(){
	// Create Elements
	let back = document.createElement("div");
	let editor = document.createElement("textarea");

	// Set Classes and ID
	back.classList.add("editor-back");
	editor.classList.add("editor-text");

	// Set Properties
	if(manager instanceof ItemManager) editor.value = manager.export();

	// Add Listeners
	back.addEventListener("click", event => {
		if(event.target == back) back.remove();
	});

	editor.addEventListener("keydown", event => {
		if(event.key == "Enter" && event.ctrlKey){
			manager.import(editor.value);
			back.remove();
		}
	});

	// Append
	back.append(editor);
	document.body.append(back);
}

showResult = function(pos){
	if(!resultDisplay){
		let result = manager.get(pos);

		// Create Elements
		resultDisplay = document.createElement("div");
		let pane = document.createElement("div");

		let text = document.createElement("div");
		let btn = document.createElement("div");

		// Set Classes and ID
		resultDisplay.classList.add("result-display", "result-back");
		pane.classList.add("result-display", "result-pane", "hidden");

		text.classList.add("result-display", "result-text");
		btn.classList.add("result-display", "result-btn");

		// Set Propreties
		text.innerText = result.name;
		btn.innerText = "Done";

		// Add Listeners
		resultDisplay.addEventListener("click", event => {
			if(event.target == resultDisplay) btn.dispatchEvent(new PointerEvent("click"));
		});

		pane.addEventListener("transitionend", event => {
			if(pane.classList.contains("hidden") && event.propertyName == "height"){
				resultDisplay.remove();
				resultDisplay = null;

				roulette.classList.remove("spin");
				rouletteStop = null;
			}
		});

		btn.addEventListener("click", event => {
			pane.classList.add("hidden");
		});

		// Append
		document.getElementById("display-inside").append(resultDisplay);
		resultDisplay.append(pane);
		pane.append(text, btn);

		// Others
		setTimeout(() => {
			pane.classList.remove("hidden");
		}, 500);
	}
}