const fs = require("fs");

function lexer(input) {
  const tokens = [];
  let cursor = 0;

  while (cursor < input.length) {
    let char = input[cursor];

    if (/\s/.test(char)) {
      cursor++;
      continue;
    }

    if (/[a-zA-Z]/.test(char)) {
      let word = "";
      while (/[a-zA-Z0-9]/.test(char)) {
        word += char;
        char = input[++cursor];
      }
      if (["bolo", "koro", "jodi", "naile"].includes(word)) {
        tokens.push({ type: "keyword", value: word });
      } else {
        tokens.push({ type: "identifier", value: word });
      }
      continue;
    }

    if (/[0-9]/.test(char)) {
      let num = "";
      while (/[0-9]/.test(char)) {
        num += char;
        char = input[++cursor];
      }
      tokens.push({ type: "number", value: parseInt(num) });
      continue;
    }

    if (/[\+\-\*\/=<>]/.test(char)) {
      tokens.push({ type: "operator", value: char });
      cursor++;
      continue;
    }

    if (/[{}]/.test(char)) {
      tokens.push({ type: "brace", value: char });
      cursor++;
      continue;
    }
  }

  return tokens;
}

function parser(tokens) {
  const ast = {
    type: "Program",
    body: [],
  };

  while (tokens.length > 0) {
    let token = tokens.shift();

    if (token.type === "keyword" && token.value === "bolo") {
      let declaration = {
        type: "Declaration",
        name: tokens.shift().value,
        value: null,
      };
      if (tokens[0].type === "operator" && tokens[0].value === "=") {
        tokens.shift();
        let expression = [];
        while (
          tokens.length > 0 &&
          tokens[0].type !== "keyword" &&
          tokens[0].type !== "brace"
        ) {
          expression.push(tokens.shift());
        }
        declaration.value = expression;
      }
      ast.body.push(declaration);
    }

    if (token.type === "keyword" && token.value === "koro") {
      ast.body.push({
        type: "Print",
        expression: tokens.shift().value,
      });
    }

    // Handle 'jodi' (if) and 'naile' (else)
    if (token.type === "keyword" && token.value === "jodi") {
      let condition = [];
      while (tokens.length > 0 && tokens[0].type !== "brace") {
        condition.push(tokens.shift());
      }

      tokens.shift(); // Skip the '{'
      let body = [];
      while (tokens.length > 0 && tokens[0].value !== "}") {
        body.push(tokens.shift());
      }
      tokens.shift(); // Skip the '}'

      let ifStatement = {
        type: "IfStatement",
        condition,
        body: parser(body), // Parse the block recursively
        elseBody: null,
      };

      if (tokens.length > 0 && tokens[0].value === "naile") {
        tokens.shift(); // Skip 'naile'
        tokens.shift(); // Skip the '{'
        let elseBody = [];
        while (tokens.length > 0 && tokens[0].value !== "}") {
          elseBody.push(tokens.shift());
        }
        tokens.shift(); // Skip the '}'
        ifStatement.elseBody = parser(elseBody); // Parse else block recursively
      }

      ast.body.push(ifStatement);
    }
  }

  return ast;
}

function codeGen(node) {
  switch (node.type) {
    case "Program":
      return node.body.map(codeGen).join("\n");

    case "Declaration":
      return `const ${node.name} = ${codeGenExpression(node.value)};`;

    case "Print":
      return `console.log(${node.expression});`;

    case "IfStatement":
      const condition = codeGenExpression(node.condition);
      const ifBody = node.body.body.map(codeGen).join("\n");
      const elseBody = node.elseBody
        ? `else {\n${node.elseBody.body.map(codeGen).join("\n")}\n}`
        : "";
      return `if (${condition}) {\n${ifBody}\n} ${elseBody}`;
  }
}

function codeGenExpression(tokens) {
  return tokens
    .map((token) => {
      if (token.type === "identifier" || token.type === "number") {
        return token.value;
      } else if (token.type === "operator") {
        return token.value;
      }
    })
    .join(" ");
}

function compiler(input) {
  const tokens = lexer(input);
  const ast = parser(tokens);
  const executableCode = codeGen(ast);
  return executableCode;
}

function runner(filePath) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    const compiledCode = compiler(data);
    // console.log("Generated Code: \n", compiledCode);
    eval(compiledCode); // Execute the compiled code
  });
}

runner("code.kotha");
