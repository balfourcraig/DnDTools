function beginLex(line){	
	let currentChar = null;
	if(line != null && line.length > 0)
		currentChar = line[0];
	let column = 0;
	
	const lexErrors = [];
	
	const tokens = [];
	let t = getToken();
	while(t.type !== 'EOF'){
		tokens.push(t);
		t = getToken();
	}
	tokens.push(t);
	return {tokens, errors: lexErrors};
	
	function lexError(contents, severety = 'error'){
		return {type: 'lex', value: contents, severety, position: column};
	}

	function advance(){
		column += 1;
		if(column < line.length)
			currentChar = line[column];
		else
			currentChar = null;
	}
	
	function peek(){
		const peekpos = column + 1;
		if(peekpos < line.length)
			return line[peekpos];
		else
			return null;
	}

	function id(){
		let result = '';
		
		while (currentChar != null && isLetter(currentChar)){
			result += currentChar;
			advance();
		}
		if(result === ''){
			return null;
		}
		
		const keyword = getKeyword(result);
		if(keyword === null){
			return token('ID', result);
		}
		else{
			return token(keyword, null);
		}
	}
	
	function num(){
		let result = '';
		if(currentChar === '-'){
			result += currentChar;
			advance();
		}
		while (currentChar != null && isDigit(currentChar)){
			result += currentChar;
			advance();
		}
		if(currentChar === '.' || currentChar === 'E' || currentChar === 'e'){
			if(currentChar === '.'){
				result += '.';
				advance();
				while (currentChar != null && isDigit(currentChar)){
					result += currentChar;
					advance();
				}
			}
			if(currentChar === 'E' || currentChar === 'e'){
				result += 'E';
				advance();
				if(currentChar === '-'){
					result += '-';
					advance();
				}
				while (currentChar != null && isDigit(currentChar)){
					result += currentChar;
					advance();
				}
				if(currentChar === '.'){
					result += '.';
					advance();
					while (currentChar != null && isDigit(currentChar)){
						result += currentChar;
						advance();
					}
				}
			}
		}

		return token('NUM', result);
	}
	
	function skipWhitespace(){
		while(currentChar != null && currentChar == ' ')
			advance();
	}
	
	function getToken(){
		skipWhitespace();
		if(currentChar != null){
			const peeked = peek();
			
			if(isDigit(currentChar) || currentChar === '.'){
				return num();
			}

			const oneGram = getOneGram(currentChar);
			if(oneGram !== null){
				advance();
				return token(oneGram, null);
			}

			const asID = id();
			if(asID)
				return asID;
		}
		if(currentChar !== null)
			lexErrors.push(lexError('Unknown symbol ' + currentChar + ' parsing stopped here'));
		return token('EOF', null);
	}
}

function token(type, value){
	return {type: type, value: value};
}

function isDigit(c){
	return c >= '0' && c <= '9';
}

function isHexDigit(c){
	return c >= '0' && c <= '9' || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
}

function isLetter(c){
	return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

function isLetterOrDigit(c){
	return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
}

function getOneGram(gram){
	switch(gram.toUpperCase()){
		case '+':
			return 'ADD';
		case '-':
			return 'SUB';
		case '*':
			return 'MUL';
		case '/':
			return 'DIV';
		case '(':
			return 'LPAREN';
		case ')':
			return 'RPAREN';
	}
	return null;
}

function getKeyword(word){
	switch(word.toUpperCase()){
		case 'D':
			return 'DIE';
	}
	return null;
}