import { v4 as uuidv4 } from 'uuid';

enum TokenType {

  INIT = 'INIT',

  EOF = 'EOF',
  ILLEGAL = 'ILLEGAL',

  UNION = 'UNION',
  INTERSECT = 'INTERSECT',
  NUMERIC = 'NUMERIC',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  LPAREN = 'LAPAREN',
  RPAREN = 'RAPAREN',
  NUMBER = 'NUMBER',
  NEW_LINE = 'NEW_LINE',

  PLUS = 'PLUS',
  MINUS = 'MINUS',

  LESS = 'LESS',
  GREATER = 'GREATER',

  EQUAL = 'EQUAL',
  LESS_EQUAL = 'LESS_EQUAL',
  GREATER_EQUAL = 'GREATER_EQUAL',

  IDENTIFIER = 'IDENTIFIER',
}

class Token {
    T: TokenType
    Data: string

    constructor(t: TokenType, data: string) {
        this.T = t;
        this.Data = data;
    }

}

const KEYWORDS = {
  [TokenType.EOF.toString()]: TokenType.EOF,
  [TokenType.ILLEGAL.toString()]: TokenType.ILLEGAL,

  [TokenType.UNION.toString()]: TokenType.UNION,
  [TokenType.INTERSECT.toString()]: TokenType.INTERSECT,
  [TokenType.NUMERIC.toString()]: TokenType.NUMERIC,

  'inf': TokenType.NUMBER,
}

class Lexer {
  Input: string
  Position: number
  ReadPosition: number

  C?: string

  constructor(input: string) {
    this.Input = input;
    this.Position = 0;
    this.ReadPosition = 0;
    this.C = undefined;

    this.ReadChar();
  }

  ReadChar() {
    if (this.ReadPosition >= this.Input.length) {
      this.C = undefined;
    } else {
      this.C = this.Input[this.ReadPosition];
    }
    this.Position = this.ReadPosition++;
  }
  
  PeekChar() {
    if (this.ReadPosition >= this.Input.length) {
      return null;
    } else {
      return this.Input[this.ReadPosition]
    }
  }

  SkipWhitespace() {
    while (this.C == ' ' || this.C == '\t' || this.C == '\r') {
      this.ReadChar()
    }
  }

  ReadIdentifier(): string {
    let str = '';

    while (this.C !== undefined && isLetter(this.C)) {
      str = str + this.C;
      this.ReadChar()
    }

    return str;
  }

  ReadNumber(): string {
    let str = '';
    while (this.C !== undefined && (isDigit(this.C) || this.C === '.') && parseFloat(str + this.C) != NaN) {
      str = str + this.C;
      this.ReadChar();
    }
    return str;
  }

  NextToken() {
    let t: Token | null = null;

    this.SkipWhitespace();

    switch (this.C) {
      case '\n':
        t = new Token(TokenType.NEW_LINE, this.C);
        break
      case '{':
        t = new Token(TokenType.LBRACE, this.C);
        break;
      case '}':
        t = new Token(TokenType.RBRACE, this.C);
        break;
      case '(':
        t = new Token(TokenType.LPAREN, this.C)
        break
      case ')':
        t = new Token(TokenType.RPAREN, this.C)
        break
      case '+':// TODO: This should be PLUS token
        t = new Token(TokenType.IDENTIFIER, this.C)
        break
      case '-':// TODO: This should be MINUS token
        t = new Token(TokenType.IDENTIFIER, this.C)
        break
      case '@':
        t = new Token(TokenType.IDENTIFIER, this.C)
        break
      case '<':
        let lPeekChar = this.PeekChar()
        if (lPeekChar !== null && lPeekChar === '=') {
          t = new Token(TokenType.LESS_EQUAL, '<=')
          this.ReadChar()
        } else {
          t = new Token(TokenType.LESS, '<')
        }
        break
      case '>':
        let rPeekChar = this.PeekChar()
        if (rPeekChar !== null && rPeekChar === '=') {
          t = new Token(TokenType.GREATER_EQUAL, '>=')
          this.ReadChar()
        } else {
          t = new Token(TokenType.GREATER, '>')
        }
        break
      case '=':
        let ePeekChar = this.PeekChar()
        if (ePeekChar !== null && ePeekChar === '=') {
          t = new Token(TokenType.EQUAL, '==')
          this.ReadChar()
        } else {
          // No Assign Token
          t = new Token(TokenType.ILLEGAL, this.C)
        }
        break
      case undefined:
        t = new Token(TokenType.EOF, '');
        break;
      default:
        if (this.C !== undefined && isLetter(this.C)) {
          const literal = this.ReadIdentifier();
          let tokenType = KEYWORDS[literal] || TokenType.IDENTIFIER
          t = new Token(tokenType, literal);
          return t;
        } else if (this.C !== undefined && isDigit(this.C)) {
          const n = this.ReadNumber();
          t = new Token(TokenType.NUMBER, n);
          return t;
        } else {
          t = new Token(TokenType.ILLEGAL, this.C);
        }
    }
    this.ReadChar();
    return t;
  }
}

type TNode = 'Expr' | 'UNION' | 'INTERSECT' | 'NUMERIC'


export interface AntHierarchyInput {
  id: string
  x?: number
  y?: number
  data?: {
    type: TNode,
    data: string
  }
  snippet?: string
  children: AntHierarchyInput[]
}

class Expr {
  Core: string

  constructor(expr: string) {
    this.Core = expr
  }

  toJSON(): AntHierarchyInput {
    return {
      id: uuidv4(),
      // data: 'Expr',
      // snippet: this.Core,
      data: {
        type: 'Expr',
        data: this.Core
      },
      children: [],
    }
  }
}

class NumericExpr {
  Left: number
  LSign: Token

  Identifier: Token

  Right: number
  RSign: Token


  constructor(left: number, lsign: Token, identifier: Token, rsign: Token, right: number) {
    this.Left = left;
    this.LSign = lsign;
    this.Identifier = identifier;
    this.Right = right;
    this.RSign = rsign;
  }

  toJSON(): AntHierarchyInput {
    return {
      id: uuidv4(),
      data: {
        type: 'NUMERIC',
        data: 'Numeric',
      },
      snippet: `${this.Left.toString()} ${this.LSign.Data} ${this.Identifier.Data} ${this.RSign.Data} ${this.Right.toString()}`,
      children: [],
    }
  }
}

type SearchExpr = IntersectExpr | UnionExpr | NumericExpr | Expr

type ExprTuple2 = SearchExpr[]

class IntersectExpr {
  Core: ExprTuple2

  constructor(e: ExprTuple2) {
    this.Core = e
  }

  toJSON(): AntHierarchyInput {
    return {
      id: uuidv4(),
      data: {
        type: 'INTERSECT',
        data: 'INTERSECT',
      },
      children: this.Core.map(x => x.toJSON())
    }
  }
}

class UnionExpr {
  Core: ExprTuple2

  constructor(e: ExprTuple2) {
    this.Core = e
  }

  toJSON(): AntHierarchyInput {
    return {
      id: uuidv4(),
      data: {
        type: 'UNION',
        data: 'UNION',
      },
      children: this.Core.map(x => x.toJSON())
    }
  }
}

class SearchResult {
  Core: IntersectExpr | UnionExpr

  constructor(e: IntersectExpr | UnionExpr) {
    this.Core = e
  }
}

enum PRECEDENCE {
  CALL
}


type PrefixFunction = (T: Token, p: PRECEDENCE) => void

class Parser {
  private L: Lexer
  CurrentToken: Token
  PeekToken: Token
  Errors: string[]
  PrefixFunctions: Map<TokenType, PrefixFunction>

  constructor(l: Lexer) {
    this.L = l;
    
    this.Errors = [];
    this.PrefixFunctions = new Map()
    this.CurrentToken = new Token(TokenType.INIT, '')
    this.PeekToken = new Token(TokenType.INIT, '')

    this.nextToken()
    this.nextToken()
  }

  currentTokenIs(t: TokenType) {
    return this.CurrentToken?.T === t
  }

  peekTokenIs(t: TokenType) {
    return this.PeekToken?.T === t
  }

  nextToken() {
    this.CurrentToken = this.PeekToken
    this.PeekToken = this.L.NextToken()

    if (this.CurrentToken.T === TokenType.EOF) {
      throw new Error("Didn't expect EOF token")
    }
  }

  parseIntersectExpr(): IntersectExpr {

    assertToken(TokenType.INTERSECT, this.CurrentToken?.T)

    this.nextToken()

    assertToken(TokenType.LBRACE, this.CurrentToken?.T)

    let Exprs: SearchExpr[] = []
    this.nextToken()

    assertToken(TokenType.NEW_LINE, this.CurrentToken?.T)

    this.nextToken()

    while (true) {

      if (this.CurrentToken.T === TokenType.RBRACE && this.PeekToken.T === TokenType.NEW_LINE) {
        this.nextToken()
        break
      }

      if (this.CurrentToken?.T === TokenType.NUMERIC) {
        Exprs.push(this.parseNumericExpr())
      } else if (this.CurrentToken?.T === TokenType.IDENTIFIER) {
        Exprs.push(this.parseExpr())
      } else if (this.CurrentToken?.T === TokenType.UNION) {
        Exprs.push(this.parseUnionExpr())
      } else if (this.CurrentToken.T === TokenType.INTERSECT) {
        Exprs.push(this.parseIntersectExpr())
      }

      this.nextToken()
    }

    return new IntersectExpr(Exprs)
  }


  parseUnionExpr(): UnionExpr {

    assertToken(TokenType.UNION, this.CurrentToken?.T)

    this.nextToken()

    assertToken(TokenType.LBRACE, this.CurrentToken.T)

    let Exprs: SearchExpr[] = []
    this.nextToken()

    assertToken(TokenType.NEW_LINE, this.CurrentToken?.T)

    this.nextToken()

    while (true) {

      if (this.CurrentToken.T === TokenType.RBRACE && this.PeekToken.T === TokenType.NEW_LINE) {

        this.nextToken()
        break
      }

      if (this.CurrentToken?.T === TokenType.NUMERIC) {
        Exprs.push(this.parseNumericExpr())
      } else if (this.CurrentToken?.T === TokenType.IDENTIFIER) {
        Exprs.push(this.parseExpr())
      } else if (this.CurrentToken?.T === TokenType.UNION) {
        Exprs.push(this.parseUnionExpr())
      } else if (this.CurrentToken.T === TokenType.INTERSECT) {
        Exprs.push(this.parseIntersectExpr())
      }

      this.nextToken()
    }

    return new UnionExpr(Exprs)
  }

  parseExpr() {

    assertToken(TokenType.IDENTIFIER, this.CurrentToken.T)

    let str = '';

    while (this.CurrentToken.T !== TokenType.NEW_LINE) {
      str = str + this.CurrentToken.Data
      this.nextToken()
    }

    return new Expr(str)
  }

  parseNumericExpr() {
    assertToken(TokenType.NUMERIC, this.CurrentToken.T)

    this.nextToken()

    assertToken(TokenType.LBRACE, this.CurrentToken.T)

    this.nextToken()

    assertToken(TokenType.NUMBER, this.CurrentToken?.T)

    let left = this.CurrentToken?.Data;

    this.nextToken()

    let lsign = this.CurrentToken; // TODO: Check sign

    this.nextToken()
    
    assertToken(TokenType.IDENTIFIER, this.CurrentToken?.T)

    let identifier = this.CurrentToken;

    this.nextToken()

    while (this.CurrentToken.T === TokenType.IDENTIFIER) {
      identifier.Data = identifier.Data + this.CurrentToken.Data
      this.nextToken()
    }


    let rsign = this.CurrentToken;

    this.nextToken()


    assertToken(TokenType.NUMBER, this.CurrentToken?.T)

    let right = this.CurrentToken?.Data;

    this.nextToken()


    assertToken(TokenType.RBRACE, this.CurrentToken?.T)

    this.nextToken()// read off RBRACE

    // assertToken(TokenType.NEW_LINE, this.CurrentToken?.T)
    // 
    // this.nextToken() // read off new line

    return new NumericExpr(left !== 'inf' ? parseFloat(left) : Infinity, lsign, identifier, rsign, right !== 'inf' ? parseFloat(right) : Infinity)
  }
      

}


function Parse(data: string): SearchExpr {
  const l = new Lexer(data);

  let p = new Parser(l)
  
  if (p.CurrentToken?.T === TokenType.INTERSECT) {
    return p.parseIntersectExpr()
  } else if (p.CurrentToken?.T === TokenType.NUMERIC) {
    return p.parseNumericExpr()
  } else if (p.CurrentToken.T === TokenType.UNION) {
    return p.parseUnionExpr()
  } else {
    return p.parseExpr()
  }
}

export function ASTToJson(output: string) {
  return Parse(output).toJSON()
}


function isLetter(str: string): boolean {
  return str.length === 1 && (str.match(/[a-z]/i) !== null)
}

function isDigit(str: string): boolean {
  return str >='0' && str <= '9';
}


function assert(c: boolean, errorMsg: string) {
  if (!c) {
    throw new Error(errorMsg)
  }
}

function assertToken(expected: TokenType, actual: TokenType | undefined) {


  if (actual === undefined) {
    throw new Error("Token is undefined")
  }

  assert(expected === actual, `Expected ${expected}, Actual: ${actual}`)
}
