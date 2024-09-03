function beginParse(line){
	let tokenIndex = 0;
	const lexResult = beginLex(line);
	const tokens = lexResult.tokens;
	const lexErrors = lexResult.errors;
	let currentToken = tokens.length > 0 ? tokens[tokenIndex] : null;
	const parseErrors = [];
	
    let counter = 0;

	const statements = [];
	statements.push(level_4());
	let statementCount = 1;
	

	return {root: statements[0], errors: parseErrors.concat(lexErrors)};
	
	function parseError(contents, severety = 'error'){
		return {type: 'parse', value: contents, severety, position: -1};
	}

	function eat(type){
		if(currentToken.type === type){
			tokenIndex++;
			currentToken = tokens[tokenIndex];
		}
		else{
			parseErrors.push(parseError('Expected ' + type + ' but saw ' + currentToken.type));
		}
	}

	function level_1(){
		const token = currentToken;
		if(token.type === 'ADD'){
			eat('ADD');
			return unaryOp(level_1(), token);
		}
		else if(token.type === 'SUB'){
			eat('SUB');
			return unaryOp(level_1(), token);
		}
		else if(token.type === 'DIE'){
			eat('DIE');
			return die(numLit({type:'NUM', value:'1'}), level_1());
		}
		else if(token.type === 'NUM'){
			eat('NUM');
			return numLit(token);
		}
        else if(token.type === 'DIE'){
			eat('DIE');
			return die(level_1());
		}
		else if(token.type === 'ID'){
			return functionOrVariable();
		}
		else if (token.type === 'LPAREN'){
			eat('LPAREN');
			const node = level_4();
			if(currentToken.type === 'RPAREN')
				eat('RPAREN');
			node.parens = true;
			return node;
		}
		if(token.type === 'EOF')
			parseErrors.push(parseError('Incomplete equation', 'warning'));
		else
			parseErrors.push(parseError('Unexpected token ' + token.type, 'warning'));
		return noOp();
	}

	function level_2(){
		let node = level_1();
        while (currentToken.type === 'DIE'){
            const token = currentToken;
			eat(token.type);
            node = die(node, level_1());
        }
        return node;
	}
	
    function level_3(){
        let node = level_2();
		while (currentToken.type === 'MUL' || currentToken.type === 'DIV'){
			const token = currentToken;
			eat(token.type);
			node = binOp(node, level_2(), token);
		}
		return node;
    }

	function level_4(){
		counter++;
		if(counter > 100){
			parseErrors.push(parseError('Infinite loop detected', 'error'));
			return noOp();
		}
		let node = level_3();
		while (currentToken.type === 'ADD' || currentToken.type === 'SUB'){
			const token = currentToken;
			eat(token.type);
			
			node = binOp(node, level_3(), token);
		}
		return node;
	}
    

	function functionOrVariable(){
		const token = currentToken;
		eat('ID');
		return variable(token);
	}
}