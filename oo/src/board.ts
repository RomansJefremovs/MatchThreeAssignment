export type Generator<T>= { next:() => T } 

export type Position = {
    row: number,
    col: number
}

export type Match<T> = {
    matched: T,
    positions: Position[]
}

export type BoardEvent<T> = {
    kind: 'Match'|'Refill',
    match?: Match<T>
}

export type BoardListener<T> = (event:BoardEvent<T>)=>{};

type Tile<T> = {
    element: T|undefined,
    position: Position
}
export class Board<T> {
    public height:number
    public width:number
    public generator:Generator<T>
    public board: Tile<T>[] = []
    
    private listener:BoardListener<T>

    private InitBoard(){
        let tempRow: number = 0
        let tempCol: number = 0
        let piece:Tile<T>
         for (let i = 0; i < this.width * this.height; i++) {
                 piece = {element:this.generator.next(),position:{row:tempRow,col:tempCol}}
                 this.board.push(piece)
                 if (tempCol < this.width-1){
                     tempCol = tempCol + 1
                 }else if (tempCol === this.width -1){
                     tempRow = tempRow + 1
                     tempCol = 0
                 }
             }
         }
    constructor(generator:Generator<T>,width:number,height:number) {
        this.generator = generator
        this.height = height
        this.width = width
        this.InitBoard()
    }

    addListener(listener: BoardListener<T>) {
        this.listener = listener
    }

    piece(p: Position): T | undefined {
        if (p.row < 0 || p.col < 0 || p.row > this.height - 1 || p.col > this.width - 1){
            return undefined
        }else{
            let piece:Tile<T> = this.board.find(item => item.position.row === p.row && item.position.col === p.col)
            return piece.element
        }
    }

    private checkFromOrigin({element,position}:Tile<T>,direction:'right'|'left'|'up'|'down'){
        const matchedArray:Position[] = []
        const count = direction === 'right' ? this.width - position.col - 1
            : direction === 'left' ? position.col
                : direction === 'up' ? position.row
                    : direction === 'down' ? this.height - position.row - 1:undefined
        for (let i = 0; i < count; i++) {
            const tempPosition = direction === 'right' ? {row:position.row,col:position.col + i + 1}
                : direction === 'left' ? {row:position.row,col:i}
                    : direction === 'up' ? {row:i,col:position.col}
                        : direction === 'down' ? {row:position.row + i + 1,col:position.col} : undefined
            const tileTemp = this.piece(tempPosition)
            if (element === tileTemp){
                matchedArray.push(tempPosition)
            }else{
                matchedArray.push({row:404, col:404})
            }
        }
        for (let i = 0; i < matchedArray.length; i++) {
            if (matchedArray[i].row === 404 || matchedArray[i].col === 404){
                if (direction==="up"||"left"){
                    matchedArray.splice(0,i+1)
                }else{
                    matchedArray.splice(i)
                }
            }
        }
        return matchedArray
    }

    private checkVerticalMatch({element,position}:Tile<T>,OriginTile:Tile<T>):Match<T>|undefined{
        const matched:Match<T> = {matched:element,positions:[]}
        const up:T = this.piece({row:position.row + 1,col:position.col})
        const down:T = this.piece({row:position.row - 1,col:position.col})
        if (up === undefined){
            if (down === element){
                const downMatch = this.checkFromOrigin({element,position},"down")
                if (downMatch.length >= 2){
                    matched.positions.push(position)
                    for (let i = 0; i < downMatch.length; i++) {
                        matched.positions.push(downMatch[i])
                    }
                    return matched
                }else return undefined
            }else return undefined
        }else if (down === undefined){
            if (up === element){
                const upMatch = this.checkFromOrigin({element,position},"up")
                if (upMatch.length >=2){
                    matched.positions = upMatch
                    matched.positions.push(position)
                    return matched
                }else return undefined
            }else return undefined
        }else if (up === element){

        }
    }

    private Match(piece:Tile<T>, origin1:Tile<T>,origin2:Tile<T>):Match<T>|undefined{
        const position:Position = piece.position

        const leftTile:T = this.piece({row:position.row,col:position.col - 1})
        const rightTile:T = this.piece({row:position.row,col:position.col + 1})
        const aboveTile:T = this.piece({row:position.row + 1,col:position.col})
        const underTile:T = this.piece({row:position.row - 1,col:position.col})
        const match:Match<T> = {matched:piece.element,positions:[piece.position]}
        const checkMatch = (direction:'right'|'left'|'up'|'down')=> {
        }
        if (leftTile === piece.element && rightTile === piece.element){
            checkMatch("left")
            checkMatch("right")
            checkMatch("up")
            checkMatch("down")
            console.log("1",match)
            return match
        }else if (leftTile === piece.element){
            checkMatch("left")
            checkMatch("right")
            checkMatch("up")
            checkMatch("down")

                    if(match.positions.length >= 3){
                        console.log("2",match)
                        return match
                    }else return undefined
        }else if(piece.element === rightTile){
            checkMatch("right")
            checkMatch("left")
            checkMatch("up")
            checkMatch("down")
            console.log(this.board)
                if(match.positions.length >= 3){
                    console.log("3",match)
                    return match
                }else return undefined
        }else if (piece.element === aboveTile && piece.element === underTile){
            checkMatch("up")
            checkMatch("down")
            checkMatch("left")
            checkMatch("right")
            console.log("4",match)
            return match
        }else if (piece.element === aboveTile){
            checkMatch("left")
            checkMatch("right")
            checkMatch("down")
            checkMatch("up")
            if(match.positions.length >= 3){
                console.log("5",match)
                return match
            }else return undefined
        }else if (piece.element === underTile){
            checkMatch("left")
            checkMatch("right")
            checkMatch("up")
            checkMatch("down")

            if(match.positions.length >= 3){
                console.log("6",match)
                return match
            }else {
                return undefined
            }
        }else if (
            leftTile !== piece.element &&
            rightTile !== piece.element &&
            piece.element !== aboveTile &&
            piece.element !== underTile
        ){

            return undefined
        }else {

            return undefined
        }
    }


    canMove(first: Position, second: Position): boolean {
        const firstPiece = this.piece(first)
        const secondPiece = this.piece(second)
        if ((first.row === second.row && first.col === second.col)||
            (first.row < 0 || first.col < 0 || first.row > this.height - 1 || first.col > this.width - 1 ||
                second.row < 0 || second.col < 0 || second.row > this.height - 1 || second.col > this.width - 1
            )){
            return false
        }else if (first.row === second.row || first.col === second.col){
            const firstIndex = this.board.findIndex(tile=>tile.position.col === first.col && tile.position.row === first.row)
            const secondIndex = this.board.findIndex(tile=>tile.position.col === second.col && tile.position.row === second.row)
            const primaryBoard = this.board
            // this.board[firstIndex].element = secondPiece
            // this.board[secondIndex].element = firstPiece
            const firstMatch = this.Match({element: secondPiece, position: first},this.board[firstIndex],this.board[secondIndex])
            const secondMatch = this.Match({element: firstPiece, position: second},this.board[firstIndex],this.board[secondIndex])
            // this.board = primaryBoard
            return firstMatch !== undefined ||
                 secondMatch !== undefined
        }else{
            return false
        }
    }

    // move(first: Position, second: Position) {
    //     const firstPiece = this.piece(first)
    //     const secondPiece = this.piece(second)
    //     const firstIndex = this.board.findIndex(tile=>tile.position.col === first.col && tile.position.row === first.row)
    //     const secondIndex = this.board.findIndex(tile=>tile.position.col === second.col && tile.position.row === second.row)
    //     const primaryBoard = this.board
    //     if (this.canMove(first,second)){
    //         this.board[firstIndex].element = secondPiece
    //         this.board[secondIndex].element = firstPiece
    //         const firstMatch = this.Match({element: secondPiece, position: first})
    //         const secondMatch = this.Match({element: firstPiece, position: second})
    //         let firstEvent: BoardEvent<T>
    //         let secondEvent: BoardEvent<T>
    //         if (firstMatch !== undefined){
    //             firstEvent = {kind:"Match",match:{matched:firstMatch,positions:firstMatch.positions}}
    //         }
    //     }else {
    //         this.board = primaryBoard
    //     }
    // }


}
