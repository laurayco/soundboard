import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import {Context} from "../data";
import { Board, SoundByte, ExternalWebSource } from "../data/models";
import { compare_arrays } from "../utils";

const FREQUENCY = 1000 * 3;

interface BoardComponentState {
    subscription: number;
    board: Board;
    soundbytes: SoundByte[];

    new_url: string;
    new_name: string;
}

interface BoardParams {
    slug: string
}

class BoardComponent extends React.Component<RouteComponentProps<BoardParams>, BoardComponentState> {
    static contextType = Context;
    context!: React.ContextType<typeof Context>;

    constructor(props: RouteComponentProps<BoardParams>) {
        super(props);
        this.state = {
            subscription: null,
            board: null,
            soundbytes: [],
            new_url: "",
            new_name: ""
        };
    }

    componentDidMount() {
        this.load_board().then(this.subscribe.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    shouldComponentUpdate(nextProps: RouteComponentProps<BoardParams>, nextState: BoardComponentState) {
        if(this.state.new_name!==nextState.new_name) {
            return true;
        }
        if(this.state.new_url!==nextState.new_url) {
            return true;
        }
        if(!compare_arrays(nextState.soundbytes,this.state.soundbytes, this.compare_soundbytes, this.sort_soundbytes)) {
            return true;
        }
        return false;
    }

    compare_soundbytes(a: SoundByte, b: SoundByte): boolean {
        return a.id===b.id && a.last_modified === b.last_modified;
    }

    sort_soundbytes(a: SoundByte, b: SoundByte): number {
        return a.id - b.id;
    }

    async load_board() {
        const slug = this.props.match.params.slug;
        const board = await this.context.get_board_by_slug(slug);
        if(board) {
            const soundbytes = await this.context.get_board_soundbytes(board.id);
            this.setState({
                board,
                soundbytes
            });
        } else {
            this.setState({
                board,
                soundbytes: []
            });
        }
    }

    subscribe() {
        const timer = setInterval(this.load_board.bind(this), FREQUENCY);
        this.setState({
            subscription: timer
        });
    }

    unsubscribe() {
        clearInterval(this.state.subscription);
    }

    async create_byte_from_url() {
        const url = this.state.new_url;
        const name = this.state.new_name;
        const soundbytes = this.state.soundbytes.slice();
        const sb = await this.context.create_soundbyte(name, {
            kind: "url",
            url
        } as ExternalWebSource,[
            this.state.board.id
        ], {
            
        });
        soundbytes.push(sb);
        this.setState({
            soundbytes
        });
    }

    render() {
        const {board, soundbytes} = this.state;
        const has_board = board!==null;
        return <div>
            <h1>{has_board? board.name : null}</h1>
            <h2>Sound Bytes:</h2>
            <ul>
                {soundbytes.map(sb=>{
                    if(sb.data.kind==="url") {
                        const source_info = sb.data as ExternalWebSource;
                        return <li key={sb.id}>
                            <span>{sb.name}</span>
                            <audio controls>
                                <source src={source_info.url} />
                            </audio>
                        </li>;
                    } else {
                        return <li key={sb.id}>{sb.name}</li>
                    }
                })}
            </ul>
            <h2>Add Sound Byte:</h2>
            <form onSubmit={this.create_byte_from_url.bind(this)}>
                <input type="text" value={this.state.new_name} onChange={e=>this.setState({new_name: e.target.value})} />
                <input type="text" value={this.state.new_url} onChange={e=>this.setState({new_url: e.target.value})} />
                <input type="submit" />
            </form>
        </div>
    }
}

export default BoardComponent;