import * as React from "react";
import {RouteComponentProps, Link, Route} from "react-router-dom";
import {Context} from "../data";
import * as models from "../data/models";
import { compare_arrays } from "../utils";
import BoardComponent from "./board";

const FREQUENCY = 1000 * 5;

type home_actions = "new_board";

interface HomePageState {
    // new board form:
    new_board_name: string;
    subscription: number;
    // data:
    boards: models.Board[];

    pending_actions: Set<home_actions>;
}


class HomePage extends React.Component<RouteComponentProps, HomePageState> {
    static contextType = Context;
    context!: React.ContextType<typeof Context>;

    constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            new_board_name: "",
            subscription: null,
            boards: [],
            pending_actions: new Set<home_actions>()
        };
    }

    componentDidMount() {
        this.update_boards().then(this.subscribe.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    shouldComponentUpdate(nextProps: RouteComponentProps, nextState: HomePageState): boolean {
        if(nextState.new_board_name!==this.state.new_board_name) {
            return true;
        }
        if(!compare_arrays(this.state.boards, nextState.boards, this.compare_boards, this.sort_boards)) {
            return true;
        }
        return false;
    }

    compare_boards(a: models.Board, b: models.Board): boolean {
        return a.slug===b.slug && a.id===b.id && a.name === b.name;
    }

    sort_boards(a: models.Board, b: models.Board): number {
        // sort by last_modified
        if(a.last_modified<b.last_modified) {
            return -1;
        } else if(a.last_modified>b.last_modified) {
            return 1;
        }
        return 0;
    }

    subscribe() {
        // to-do: replace with web worker signaling platform???
        const timer = setInterval(this.update_boards.bind(this), FREQUENCY);
        this.setState({
            subscription: timer
        });
    }

    unsubscribe() {
        clearInterval(this.state.subscription);
    }

    async update_boards() {
        const boards = await this.context.get_all_boards();
        return new Promise(resolve=>this.setState({
            boards
        }, resolve));
    }

    async create_board() {
        const { new_board_name, pending_actions, boards } = this.state;
        if(!("new_board" in pending_actions)) {
            pending_actions.add("new_board");
            await new Promise(resolve=>this.setState({
                pending_actions: pending_actions
            }, resolve));
            const board = await this.context.create_board(new_board_name);
            boards.push(board);
            pending_actions.delete("new_board");
            this.setState({
                new_board_name: "",
                pending_actions: pending_actions,
                boards
            });
        }
    }

    render(){
        const {boards, new_board_name} = this.state;
        return <div>
            <h1>Boards:</h1>
            <ul>
                {boards.map(board=>{
                    const url = `/board/${board.slug}`;
                    return <li key={board.id}>
                        <Link to={url}>
                            {board.name}
                        </Link>
                    </li>
                })}
            </ul>
            <h1>New Board:</h1>
            <form onSubmit={e=>this.create_board()}>
                <input type="text" value={new_board_name} onChange={(e)=>this.setState({new_board_name:e.target.value})} />
                <input type="submit" value="Create Board" />
            </form>
        </div>;
    }
}

export default HomePage;