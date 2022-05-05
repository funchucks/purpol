function purpol(purpol_program){
	var inlines=purpol_program.split("\n");
	var outlines=[];
	var stack=[], ipstack=[], rstack=[], heap=[0];
	var push=function(a){stack.push(a);},
	 pop=function(a){if(stack.length>0){return stack.pop(a);}else{return -177;}};
	var curfunction, ip=0, curfname, lastfname;
	var a, b, t; //temp vars
	var functions=new Map();
	var funcret=function (){
		if(rstack.length>0){
			curfunction=rstack.pop();
			ip=ipstack.pop();
			return true;
		}
		return false;
	};
	var callfunc=function(func){
		rstack.push(curfunction);
		ipstack.push(ip);
		curfunction=func;
		ip=0;
	};
	var runfunc=function (fname){
		if(!functions.has(fname)) return;
		ip=0;
		curfunction=functions.get(fname);
		for(;;){
			if(ip<curfunction.length){
				ip+=1; curfunction[ip-1]();
			}else{
				if(!funcret()){
					return;
				}
			}
		}
	};
	var builtins=new Map([
		["." , function() {outlines.push(pop().toString());}],
		["+" , function() {stack.push(pop()+pop());}],
		["-" , function() {b=pop();a=pop();push(a-b);}],
		["*" , function() {b=pop();a=pop();push(a*b);}],
		["**" , function() {b=pop();a=pop();push(a**b);}],
		["/" , function() {b=pop();a=pop();push(a/b);}],
		["%" , function() {b=pop();a=pop();push(a%b);}],
		["neg" , function() {push(-pop());}],
		["inc" , function() {push(pop()+1);}],
		["dec" , function() {push(pop()-1);}],
		[">" , function() {b=pop();a=pop();push(a>b ? 1 : 0);}],
		[">=" , function() {b=pop();a=pop();push(a>=b ? 1 : 0);}],
		["==" , function() {b=pop();a=pop();push(a==b ? 1 : 0);}],
		["<=" , function() {b=pop();a=pop();push(a<=b ? 1 : 0);}],
		["<" , function() {b=pop();a=pop();push(a<b ? 1 : 0);}],
		["&&" , function() {b=pop()!=0;a=pop()!=0;push(a&&b ? 1 : 0);}],
		["||" , function() {b=pop()!=0;a=pop()!=0;push(a||b ? 1 : 0);}],
		["not" , function() {push(pop()==0 ? 1 : 0);}],
		["dup" , function() {a=pop();push(a);push(a);}],
		["over" , function() {b=pop();a=pop();push(a);push(b);push(a);}],
		["drop" , function() {pop();}],
		["swap" , function() {b=pop();a=pop();push(b);}],
		["pi" , function() {push(Math.PI);}],
		["e" , function() {push(Math.E);}],
		["sin" , function() {push(Math.sin(pop()));}],
		["cos" , function() {push(Math.cos(pop()));}],
		["tan" , function() {push(Math.tan(pop()));}],
		["sinh" , function() {push(Math.sinh(pop()));}],
		["cosh" , function() {push(Math.cosh(pop()));}],
		["tanh" , function() {push(Math.tanh(pop()));}],
		["floor" , function() {push(Math.floor(pop()));}],
		["ceiling" , function() {push(Math.ceiling(pop()));}],
		["round" , function() {push(Math.round(pop()));}],
		["trunc" , function() {push(Math.trunc(pop()));}],
		["sqrt" , function() {push(Math.sqrt(pop()));}],
		["exp" , function() {push(Math.exp(pop()));}],
		["retif" , function() {if(pop()!=0) funcret();}],
		["loopif" , function() {if(pop()!=0) ip=0;}],
		["loop" , function() {ip=0;}],
		["skipif" , function() {if(pop()!=0) ip+=1;}],
		["@" , function() //load
		 { a=pop(); if(a<0||a>heap.length)a=0; a=Math.trunc(a);
		 push(heap[a]);
		 }],
		["!" , function() //store
		 { a=pop(); b=pop(); if(a<0||a>heap.length)a=0; a=Math.trunc(a);
		 heap[a]=b;
		 }],
		["alloc", function()
		 {a=pop(); if(a<1)a=1; a=Math.trunc(a);
		 b=heap.length; push(b);
		 for(let i=0;i<a;i++)heap.push(0);
		 }],
	]);
	ok_name=function(t){return t && /^\S/.test(t);};
	for(let curline of inlines){
		curline=curline.replace(/#.*/,'');
		let tokens=curline.split(/\s+/);
		fname=tokens.shift();
		if(fname === "var"){
			for(let curtoken of tokens){
				if(ok_name(curtoken)){
					let heapend=heap.length; heap.push(0);
					builtins.set(curtoken, function(){push(heapend);} );
				}
			}
		}else if(ok_name(fname)){
			lastfname=fname;
			functions.set(fname,curfunction=[]);
			for(let curtoken of tokens){
				if(builtins.has(curtoken)){
					curfunction.push(builtins.get(curtoken));
				}else if(functions.has(curtoken)){
					let thisfunc=functions.get(curtoken);
					curfunction.push( function(){callfunc(thisfunc);} );
				}else if(/^\d+(.\d+)?([eE]\d+)?$/.test(curtoken)){
					let val=parseFloat(curtoken);
					curfunction.push( function(){push(val);} );
				}
			}
		}
	}
	runfunc(lastfname);
	return outlines.join("\n");
}
