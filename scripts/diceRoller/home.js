window.addEventListener('DOMContentLoaded', () => {
	//document.getElementById('inp').addEventListener('input', calc);
    //document.getElementById('showDebugChk').addEventListener('change', calc);
    //document.getElementById('useAverageChk').addEventListener('change', calc);
    document.getElementById('btn').addEventListener('click', calc);
    //calc();
});

const calc = () => {
    const showDebug = document.getElementById('showDebugChk').checked;
    const useAverage = document.getElementById('useAverageChk').checked;

    if(showDebug){
        document.getElementById('debug').style.display = 'block';
        const output = beginLex(document.getElementById('inp').value);
        console.log(output);
        printLexResult(output);

        const parseOutput = beginParse(document.getElementById('inp').value);
        console.log(parseOutput);
        printParseResult(parseOutput);

        const buildOutput = build(document.getElementById('inp').value, useAverage);
        console.log(buildOutput);
        printBuildResult(buildOutput);
    }
    else{
        document.getElementById('debug').style.display = 'none';
    }
    const buildOutput = build(document.getElementById('inp').value, useAverage);
    const result = buildOutput.result;
    const errors = buildOutput.errors;
    const rolls = buildOutput.rolls;
    if(errors.length > 0 || result.type !== 'NUM'){
        document.getElementById('result').innerText = 'Error. Turn on Debug to see more info';
    }
    else{
        document.getElementById('result').innerText = result.value;
    }
    const rollResults = document.getElementById('rolls');
    rollResults.innerHTML = '';
    for(let r of rolls){
        const rollLi = document.createElement('li');
        rollLi.innerText = 'd' + r.sides + ' = ' + r.result;
        if(r.notes){
            rollLi.innerText += ' (' + r.notes + ')';
        }
        if(r.discarded){
            rollLi.classList.add('discarded');
        }
        rollResults.appendChild(rollLi);
    }
}

const printLexResult = (lexResult) => {
    const outputDiv = document.getElementById('lexTest');
    outputDiv.innerHTML = '';

    const tokens = lexResult.tokens;
    const tokenTitle = document.createElement('h2');
    tokenTitle.innerText = 'Lex Tokens';
    outputDiv.appendChild(tokenTitle);
    tokens.forEach((token) => {
        const tokenP = document.createElement('p');
        tokenP.innerText = `Type: ${token.type}, Value: ${token.value}`;
        outputDiv.appendChild(tokenP);
    });

    const errors = lexResult.errors;
    if(errors.length > 0){
        const errorTitle = document.createElement('h2');
        errorTitle.innerText = 'Lex Errors';
        errorTitle.classList.add('error');
        outputDiv.appendChild(errorTitle);
        errors.forEach((err) => {
            const error = document.createElement('p');
            error.innerText = err.value;
            error.classList.add('error');
            outputDiv.appendChild(error);
        });
    }
};

const printParseResult = (parseResult) => {
    const outputDiv = document.getElementById('parseTest');
    outputDiv.innerHTML = '';

    const root = parseResult.root;
    const rootTitle = document.createElement('h2');
    rootTitle.innerText = 'Parser Root';
    const rootValue = document.createElement('pre');
    rootValue.innerText = JSON.stringify(root, null, 2);
    outputDiv.appendChild(rootTitle);
    outputDiv.appendChild(rootValue);

    const errors = parseResult.errors;
    if(errors.length > 0){
        const errorTitle = document.createElement('h2');
        errorTitle.innerText = 'Parser Errors';
        errorTitle.classList.add('error');
        outputDiv.appendChild(errorTitle);
        errors.forEach((err) => {
            const error = document.createElement('p');
            error.innerText = err.severety + ': ' + err.value;
            error.classList.add('error');
            outputDiv.appendChild(error);
        });
    }
}

const printBuildResult = (buildResult) => {
    const outputDiv = document.getElementById('buildTest');
    outputDiv.innerHTML = '';

    const result = buildResult.result;
    const resultTitle = document.createElement('h2');
    resultTitle.innerText = 'Build Result';
    const resultValue = document.createElement('pre');
    resultValue.innerText = JSON.stringify(result, null, 2);
    outputDiv.appendChild(resultTitle);
    outputDiv.appendChild(resultValue);

    const errors = buildResult.errors;
    if(errors.length > 0){
        const errorTitle = document.createElement('h2');
        errorTitle.innerText = 'Build Errors';
        errorTitle.classList.add('error');
        outputDiv.appendChild(errorTitle);
        errors.forEach((err) => {
            const error = document.createElement('p');
            error.innerText = err.severety + ': ' + err.value;
            error.classList.add('error');
            outputDiv.appendChild(error);
        });
    }

}