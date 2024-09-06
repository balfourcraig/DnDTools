function buildError(contents, severety = 'error'){
	return {type: 'build', value: contents, severety, position: -1};
}


function build(line, useAverage){
	const buildErrors = [];
	const rolls = [];

    useAverage = useAverage || false;

	const parseResult = beginParse(line);
	const root = parseResult.root;
	const parseErrors = parseResult.errors;

	let critical = false;
	if(parseErrors && parseErrors.length > 0){
		for(let i = 0; i < parseErrors.length; i++){
			if(parseErrors[i].severety === 'error'){
				critical = true;
				break;
			}
		}
		if(critical)
			return {result: calcError(), errors: parseErrors, rolls};
	}
	let result = visit(root);
	if(result === null){
		buildErrors.push(buildError('Could not calculate a meaningful result'));
	}
	if(buildErrors && buildErrors.length > 0){
		for(let i = 0; i < buildErrors.length; i++){
			if(buildErrors[i].severety === 'error'){
				critical = true;
				break;
			}
		}
		if(critical)
			result =  calcError();
	}

	const errors = buildErrors.concat(parseErrors);
	return {result, errors, rolls};
	
	function visit(node){
		switch(node.name){
			case 'NumLit':
				return visit_NumLit(node);
            case 'Die':
                return visit_Die(node);
			case 'BinOp':
				return visit_BinOp(node);
			case 'UnaryOp':
				return visit_Unary(node);
			case 'CompoundStatement':
				return visit_CompoundStatement(node);
			case 'NoOp':
				return calcVoid();
			case 'Variable':
				return visit_Variable(node);
			
		}
		buildErrors.push(buildError('Failed to build node ' + node.name));
		return calcError();
	}
	
	function visit_CompoundStatement(node){
		let result = calcVoid();
		let expressionCount = 0;
		for(let i = 0; i < node.value.length; i++){
			const s = visit(node.value[i]);
			if(s && s.name !== 'NoOp' && s.type !== 'VOID'){
				if(expressionCount === 0)
					result = s;
				expressionCount++;
			}
		}
		if(expressionCount > 1)
			buildErrors.push(buildError(`${expressionCount} expressions. Only showing expression 1`, 'warning'));
		return result;
	}

	function visit_NumLit(node){
		return calcNum(node.value);
	}
	
    function visit_Die(node){
		const lhs = visit(node.left);
		
		if(lhs === null){
			buildErrors.push(buildError('LHS was null'));
			return null;
		}
    
        const rhs = visit(node.right);
        if(rhs === null || rhs.type === 'VOID'){
            return lhs;
        }

		if(lhs.type !== 'NUM' || rhs.type !== 'NUM'){
			buildErrors.push(buildError('Die only works with numbers'));
			return null;
		}
		let result = 0;
        if(useAverage){
			result = ((rhs.value + 1) / 2) * lhs.value;
			if(~~rhs.value === rhs.value){
				for(let i = 0; i < lhs.value; i++){
					rolls.push({sides: rhs.value, result: (rhs.value + 1) / 2});
				}
			}
			else{
				rolls.push({sides: lhs.value * rhs.value, result: result});
			}
		}
		else{
			if(~~rhs.value === rhs.value){
				for(let i = 0; i < lhs.value; i++){
					const roll = Math.floor((Math.random() * rhs.value) + 1);
					result += roll;
					rolls.push({sides: rhs.value, result: roll});
				}
			}
			else{
				buildErrors.push(buildError('Die only works with integers'));
				return null;
			}
		}
		return calcNum(result);
    }

	function visit_Unary(node){
		if(node.op === 'ADD'){
			return visit(node.value);
		}
		else if(node.op === 'SUB'){
			const val = visit(node.value);
			if(val.type === 'NUM'){
				return calcNum(-1 * val.value);
			}
			else{
				buildErrors.push(buildError('Unary negative only works on numbers'));
			}
		}
	}

	function visit_BinOp(node){
		const lhs = visit(node.left);
		if(lhs === null){
			buildErrors.push(buildError('LHS was null'));
			return null;
		}
    
        const rhs = visit(node.right);
        if(rhs === null || rhs.type === 'VOID'){
            return lhs;
        }
        if(lhs.type === 'NUM' && rhs.type === 'NUM'){
            if(node.op === 'ADD')
                return calcNum(lhs.value + rhs.value);
            else if(node.op === 'SUB')
                return calcNum(lhs.value - rhs.value);
            else if(node.op === 'MUL')
                return calcNum(lhs.value * rhs.value);
            else if(node.op === 'DIV'){
                if(rhs.value)
                    return calcNum(lhs.value / rhs.value);
                else{
                    parseErrors.push(buildError('Divide by 0 is undefined', 'warning'));
                    return calcNum(NaN);
                }
            }
        }
		//const rhs = visit(node.right);
		if(rhs === null || rhs.type === 'VOID'){
			return lhs;
			//buildErrors.push('RHS was null');
			//return null;
		}
		buildErrors.push(buildError('Incompatible types ' + lhs.type + ' and ' + rhs.type + ' with operator ' + node.op));
		return null;
	}

	function visit_Variable(node){
		const varName = node.value.toUpperCase();
		

		let averageValue = 10.5;
		if(varName === 'ADV')
			averageValue = 13.825;
		else if(varName === 'DIS')
			averageValue = 7.175;


		if(varName === 'ADV' || varName === 'DIS'){
			const roll1 = {
				sides: 20,
				result: useAverage ? averageValue : Math.floor((Math.random() * 20) + 1)
			};
			const roll2 = {
				sides: 20,
				result: useAverage ? averageValue : Math.floor((Math.random() * 20) + 1)
			};
			rolls.push(roll1);
			rolls.push(roll2);
			if(varName === 'ADV'){
				if(roll1.result >= roll2.result){
					roll1.notes = 'Advantage - Used';
					roll2.notes = 'Advantage - Discarded';
					roll2.discarded = true;
					return calcNum(roll1.result);
				}
				else{
					roll1.notes = 'Advantage - Discarded';
					roll1.discarded = true;
					roll2.notes = 'Advantage - Used';
					return calcNum(roll2.result);
				}
			}
			else{
				if(roll1.result <= roll2.result){
					roll1.notes = 'Disadvantage - Used';
					roll2.notes = 'Disadvantage - Discarded';
					roll2.discarded = true;
					return calcNum(roll1.result);
				}
				else{
					roll1.notes = 'Disadvantage - Discarded';
					roll1.discarded = true;
					roll2.notes = 'Disadvantage - Used';
					return calcNum(roll2.result);
				}
			}
				

		}

		buildErrors.push(buildError('Unknown ID: ' + node.value));
		return calcVoid();
	}
}
