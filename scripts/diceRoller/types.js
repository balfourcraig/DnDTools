function calcNum(value){
	return {type: 'NUM', value: typeof(value) === 'number' ? value : parseFloat(value)};
}

function calcError(){
	return {type: 'ERROR', value: null};
}

function calcVoid(){
	return {type: 'VOID'};
}
