function unaryOp(left, token){
	return {name: 'UnaryOp', value: left, op: token.type};
}

function numLit(token){
	return {name: 'NumLit', value: parseFloat(token.value)};
}

function die(left,right){
	return {name: 'Die', left:left, right:right};
}

function noOp(){
	return {name: 'NoOp'};
}

function binOp(left, right, token){
	return {name: 'BinOp', left:left, right:right, op:token.type};
}

function compoundStatement(...statements){
	return {name: 'CompoundStatement', value: statements};
}

function variable(token){
	return {name: 'Variable', value: token.value};
}