import Scene from './Scene.js'
import UI from './UI.js'

class App extends React.Component{
    constructor(props){
        super(props);
    }
    
    componentDidMount(){        
    }
        
    render(){
        return [
            React.createElement(Scene, {key: 'scene', ref: (ref) => {this.scene = ref}}), 
            React.createElement(UI, {key: 'ui', ref: (ref) => {this.ui = ref; this.scene.ui = ref;}})
        ];
    }
}

export default App