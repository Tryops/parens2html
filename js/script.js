let input = document.querySelector("#input");
let output = document.querySelector("#output");
let button = document.querySelector("button#eval");
let tabSpaces = 2;

document.querySelector("#info").addEventListener("click", (e) => {
	let desc = document.querySelector("#description");
	desc.hidden = !desc.hidden;
});

let select = document.querySelector("select");
select.addEventListener("change", (event) => {
	tabSpaces = select.value;
	evaluate();
});

input.addEventListener("click", (e) => input.classList.remove("error"));

const codebox = input;
codebox.addEventListener("keydown", (e) => {
	let { keyCode } = e;
	let { value, selectionStart, selectionEnd } = codebox;
	if (keyCode === 9) {  // TAB = 9
		e.preventDefault();
		codebox.value = value.slice(0, selectionStart) + repeatString(" ", tabSpaces) + value.slice(selectionEnd);
		codebox.setSelectionRange(selectionStart+2, selectionStart+2)
	}
});

document.querySelector("button#copy").addEventListener("click", function(event) {
	output.select();
	document.execCommand("copy");
}, false);

button.addEventListener("click", evaluate, false);

let biwa = new BiwaScheme.Interpreter((e) => {
	input.classList.add("error");
	alert(e);
	//location.reload();
});

let schemeCode = `
(define (tag-string tag attribs content)
	(string-append "<" (symbol->string tag) (attribs->string attribs) ">" content "</" (symbol->string tag) ">"))

(define (attribs->string attribs-vect)
		(define (attr->string attr) ; interne definition... ~private
		(cond ((symbol? attr) (string-append " " (symbol->string attr)))
			  ((string? attr) (string-append "'" attr "'"))
			  (else "")))
		
		(if (vector? attribs-vect) (apply string-append (map attr->string (vector->list attribs-vect)))
		""))

(define (generate markup)
		(cond 	((null? markup) "")
			((string? markup) markup)
			((string? (car markup)) (string-append (car markup) (generate (cdr markup))))
			((symbol? (car markup)) 
			  (if (and (not (null? (cdr markup))) (vector? (cadr markup))) 
				  (tag-string (car markup) (cadr markup) (generate (cddr markup)))
				  (tag-string (car markup) #() (generate (cdr markup)))))
			((list? (car markup)) 	(apply string-append (map generate markup)))
			(else "")))`;
biwa.evaluate(schemeCode, () => {});

function evaluate() {
	biwa.evaluate("(generate '" + input.value + ")", function(result) {
	  output.textContent = process(result);
	});
}

function repeatString(str, num) {
	return num <= 0 ? "" : str + repeatString(str, num-1);
}

function process(str) {
	if(str.includes("<html>") || str.includes("<head>") || str.includes("<body>")) {
		alert("Error: Can not process top level html-tags (unfortunately)");
	}
	var div = document.createElement('div');
	div.innerHTML = str.trim();
	return format(div, 0).innerHTML;
}

function format(node, level) {
	var indentBefore = new Array(level++ + 1).join(repeatString(" ", tabSpaces)),
		indentAfter  = new Array(level - 1).join(repeatString(" ", tabSpaces)),
		textNode;

	for (var i = 0; i < node.children.length; i++) {

		textNode = document.createTextNode('\n' + indentBefore);
		node.insertBefore(textNode, node.children[i]);
		format(node.children[i], level);
		if (node.lastElementChild == node.children[i]) {
			textNode = document.createTextNode('\n' + indentAfter);
			node.appendChild(textNode);
		}
	}

	return node;
}

