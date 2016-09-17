/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Generates table of contents for HTML element and inserts it into the element with id "tableOfContents"
 */

function explore(target, list) {
	if(!list) {
		var toc = document.getElementById('tableOfContents');
		list = document.createElement('ol');
		toc.appendChild(list);
	}
	if(!target) {
		target = document.body;
	}
	
	for(var i = 0; i < target.children.length; i++) {
		if(target.children[i].nodeName == "SECTION") {
			if(list.nodeName == "LI") {
				var newOl = document.createElement('ol');
				list.appendChild(newOl);
				list = newOl;
			}
			var newLi = document.createElement('li');
			var newA = document.createElement('a');
			list.appendChild(newLi);
			newLi.appendChild(newA);
			newA.setAttribute('href', '#'+target.children[i].getAttribute('id'));
			newA.innerHTML = target.children[i].children[0].innerHTML;
			explore(target.children[i], newLi);
		}
	}
}

explore();

var menu = document.getElementById('menu');
list = document.createElement('ol');
menu.appendChild(list);

explore(document.body, list);

 

 
 
 
 
 
 
 
 
 
 
 
 
 