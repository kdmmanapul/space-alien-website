/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

const c = React.createElement;

class UI extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            is_mouse_over: false,
            back: false,
            show: false,
            inited: false,
            menu_opened: false,
            option: 0,

            loaded:  false,
            loaded_clicked:  false,

            planet_name: '',
            planet_details: '',
            options: [''],
            selected_option: 0,
            muted: false,
            muted_icon: './img/icons/mute.svg',
            sound_icon: './img/icons/sound.svg',
            curr_planet_name: null,
            planet_to_go: null,
            display: true,
            planets: [],
            viewport_size: {x: document.documentElement.clientWidth, y: document.documentElement.clientHeight},
            config: null,
            ref: null,
            last_ref: null,
            curr_planet_font_scale: 1,
            planet_config: null,
            current_part: null,
            mobile_mode: false,
            loading_img: null,
            mobile_mode: false
            
        };
        this.last_planet_name = '';
    }
    
    render(){
        if(this.state.loading_img){
            const img = this.state.loading_img;
            const width = img.width;
            const height = img.height;
            const aspect_ratio = width / height;
            img.style.height = this.state.viewport_size.y * 0.3 / aspect_ratio;
            img.style.marginTop = 'calc(50vh - ' + this.state.viewport_size.y * 0.15 / aspect_ratio +'px)';
            img.style.display = 'block';
        }
        /*
        if(this.state.ref !== null){
            const style = window.getComputedStyle(this.state.ref, null);
            const transfromation = style.getPropertyValue("transform");
        }
        */
        const aspect_ratio = 123 / 97;

        const rv =  [
            c('div', {key: 'icons'}, [
                (() => {
                    if(this.state.config === null) return [];
                    const rv = [];
                    const icons = this.state.config.icons;
                    for(const [i, icon] of icons.entries()){
                        rv.push(c('img', {
                            key: 'icon' + i,
                            onMouseDown: e => {window.open(icon.url,'_blank');},
                            src: icon.icon,
                            style: {
                                width: 35,
                                position: 'fixed',
                                right: 10 + 45 * i,
                                bottom: 10,
                                zIndex: 20002000,
                                cursor: 'pointer',
                                display: (this.state.loaded_clicked && !(this.state.option === 1 || this.state.show)) ? 'block' : 'none',
                            }
                        }));
                    }
                    return rv;
                })()
            ]),
            c('div', {
                key: 'curr_planet_name',
                style: {
                    position: 'absolute',
                    left: 0,
                    margin: 0,
                    padding: 0,
                    top: 'calc(50vh - ' +  this.state.viewport_size.x / 6 * this.state.curr_planet_font_scale / 2 + 'px)',
                    width: '100%',
                    fontSize: this.state.viewport_size.x / 6 * this.state.curr_planet_font_scale,
                    textAlign: 'center',
                    color: 'white',
                    animationName: this.state.curr_planet_name === null ? 'fadeOut' : 'fadeIn',
                    animationDuration: '0.5s',
                    animationFillMode: 'forwards',
                    zIndex: 1002000,
                    pointerEvents: 'none',
                    textShadow: '0px 0px 20px #888888'
                }
            }, this.state.curr_planet_name === null ? this.last_planet_name : this.state.curr_planet_name),
            c('div', {
                key: 'list_view',
                style:{
                    width: '100%',
                    height: this.state.mobile_mode ? 'calc(100vh - 180px)' : 'calc(100vh - 40px)',
                    paddingTop: this.state.mobile_mode ? '180px' : '40px',
                    left: 0,
                    position: 'relative',
                    display: (this.state.option === 1 && !this.state.show ? 'block' : 'none'),
                    zIndex: 2333,
                    overflowX: 'hidden',
                    overflowY: 'scroll',
                },
                onMouseOver: (e) => {this.setState({is_mouse_over: true})},
                onMouseOut: (e) => {this.setState({is_mouse_over: false})},
                onTouchStart: (e) => {this.setState({is_mouse_over: true})},
            }, [
                c('div', {key: 'listview_elements'}, (() => {
                    const rv = [];
                    var i = 0;
                    for(const planet of this.state.planets){
                        const el = c('div', {
                            key: 'listview_element' + i++,
                            style: {
                                width: this.state.mobile_mode ? 'calc(100% - 40px - 40px - 40px)' : 'calc(100% - 280px - 40px)',
                                // fontSize: 25,
                                fontSize: Math.max(Math.min(25, this.state.viewport_size.x * 0.035), 10),
                                marginLeft: 40,
                                // height: 30,
                                minHeight: 30,
                                // maxHeight: 30,
                                color: 'white',
                                borderBottom: '2px solid white',
                                cursor: 'pointer',
                                textShadow: '0px 0px 5px #444444',
                                padding: 30,
                                paddingBottom: 30,
                                zIndex: 11020022,
                                position: 'relative',
                                backgroundColor: 'rgba(0.5, 0.5, 0.5, 0.6)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap'

                            },
                            onMouseDown: e => (this.setState({planet_to_go: planet}))
                        }, [
                            c('span', {
                                key: 'planet_name' + i,
                                style: {
                                    fontWeight: 600,
                                    display: 'inline',
                                    // whiteSpace: 'nowrap',
                                    zIndex: 11020024,
                                    // paddingRight: 5
                                }
                            },planet.config.name),
                            c('span', {
                                key: 'planet_subtitle' + i,
                                style: {
                                    fontWeight: 100,
                                    display: 'inline',
                                    // whiteSpace: 'nowrap',
                                    // float: 'right',
                                    zIndex: 11020024,
                                    // paddingLeft: 5
                                }
                            },planet.config.subtitle),
                        ]);
                        rv.push(el);
                    }
                    return rv;
                })())
            ]),
            c('img', {
                key: 'sound_switch',
                src: (this.state.muted ? this.state.muted_icon : this.state.sound_icon),
                style: {
                    width: 60,
                    bottom: 20,
                    left: 20,
                    position: 'fixed',
                    zIndex: 20002000,
                    filter: 'invert(100%) hue-rotate(180deg)',
                    cursor: 'pointer',
                    display: (this.state.option === 1 || this.state.show) ? 'none' : 'block'
                },
                onMouseDown: e => {this.setState({muted: !this.state.muted})},
                onMouseOver: (e) => {this.setState({is_mouse_over: true})},
                onMouseOut: (e) => {this.setState({is_mouse_over: false})},
                onTouchStart: (e) => {this.setState({is_mouse_over: true})},
            }),

            c('div', {
                key: 'loading_screen',
                style: {
                    width: '100%',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    backgroundColor: 'black',
                    zIndex: 881002022,
                    pointerEvents: this.state.loaded_clicked ? 'none' : 'auto',
                    animationName: this.state.loaded_clicked ? 'loadingScreenHide' : 'none',
                    animationDuration: '0.5s',
                    animationFillMode: 'forwards',
                }
            }, [
                c('img', {
                    key: 'loading_wheel',
                    src: this.state.loading_image ? this.state.loading_image : '',
                    style: {
                        filter: 'invert(100%)',
                        width: this.state.viewport_size.y * 0.3,
                        marginLeft:  (this.state.viewport_size.x - (this.state.viewport_size.y * 0.3)) / 2,
                        animationName: 'fadeLoading',
                        animationDuration: '1s',
                        animationIterationCount: this.state.loaded ? '1' : 'infinite',
                        animationFillMode: 'forwards',
                        animationTimingFunction: 'linear',
                        display: 'none',

                    },
                    onLoad: e => {
                        this.setState({loading_img: e.target})
                    },
                    ref: (ref) => {this.state.ref = ref;}
                }),
                c('div', {
                    key: 'loading_button',
                    style: {
                        fontSize: this.state.viewport_size.y * 0.04,
                        color: 'black',
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        width: this.state.viewport_size.y * 0.3,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        textAlign: 'center',
                        marginTop: 40,
                        // animationName: 'fadeLoading',
                        // animationDuration: '1s',
                        // animationIterationCount: this.state.loaded ? '1' : 'infinite',
                        // animationFillMode: 'forwards',
                        // animationTimingFunction: 'linear',
                        display: this.state.loaded ? 'none' : '',
                    },
                    onMouseDown: e => {this.setState({loaded_clicked: true})}
                }, 'LOADING')
                ,
                c('div', {
                    key: 'start_button',
                    style: {
                        fontSize: this.state.viewport_size.y * 0.05,
                        color: 'black',
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        width: this.state.viewport_size.y * 0.3,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        textAlign: 'center',
                        marginTop: 40,
                        cursor: 'pointer',
                        animationName: this.state.loaded ? 'fadeIn' : 'fadeOut',
                        animationDuration: this.state.loaded ? '1s' : '0s',
                        animationTimingFunction: this.state.loaded ? 'linear' : 'linear',
                        animationFillMode: 'forwards',
                        pointerEvents: this.state.loaded && !this.state.loaded_clicked ? 'auto' : 'none',
                    },
                    onMouseDown: e => {this.setState({loaded_clicked: true})}
                }, 'START')
            ]),

            c('div', {
                key: 'overview_button',
                style: {
                    width: 200,
                    right: 0,
                    top: 0,
                    position: 'fixed',
                    zIndex: 1902025,
                    color: 'white',
                    textAlign: 'right',
                    fontSize: 30,
                    cursor: 'pointer',
                    margin: 20
                },
                onMouseDown: e => {this.setState({option: 2, menu_opened: true})},
                onMouseOver: (e) => {this.setState({is_mouse_over: true})},
                onMouseOut: (e) => {this.setState({is_mouse_over: false})},
                onTouchStart: (e) => {this.setState({is_mouse_over: true})},
            }, 'OVERVIEW'),
            c('div', {
                key: 'listview_button',
                style: {
                    width: 200,
                    right: 0,
                    top: 50,
                    position: 'fixed',
                    zIndex: 1902025,
                    color: 'white',
                    textAlign: 'right',
                    fontSize: 30,
                    cursor: 'pointer',
                    margin: 20,
                    display: this.state.menu_opened ? 'block' : 'none'
                },
                onMouseDown: e => {this.setState({option: 1})},
                onMouseOver: (e) => {this.setState({is_mouse_over: true})},
                onMouseOut: (e) => {this.setState({is_mouse_over: false})},
                onTouchStart: (e) => {this.setState({is_mouse_over: true})},
            }, 'LISTVIEW'),
            c('div', {
                key: 'pathview_button',
                style: {
                    width: 200,
                    right: 0,
                    top: 100,
                    position: 'fixed',
                    zIndex: 1002025,
                    color: 'white',
                    textAlign: 'right',
                    fontSize: 30,
                    cursor: 'pointer',
                    margin: 20,
                    display: this.state.menu_opened ? 'block' : 'none'
                },
                onMouseDown: e => {this.setState({option: 0, menu_opened: false})},
                onMouseOver: (e) => {this.setState({is_mouse_over: true})},
                onMouseOut: (e) => {this.setState({is_mouse_over: false})},
                onTouchStart: (e) => {this.setState({is_mouse_over: true})},
            }, 'PATHVIEW'),
            // c('div', {
            //     key: 'mint_button',
            //     style: {
            //         width: 200,
            //         right: 0,
            //         top: 150,
            //         position: 'fixed',
            //         zIndex: 1002025,
            //         color: 'white',
            //         textAlign: 'right',
            //         fontSize: 30,
            //         cursor: 'pointer',
            //         margin: 20,
            //         display: this.state.menu_opened ? 'block' : 'none'
            //     },
            //     onMouseDown: e => {window.open('https://mint.thestupidnft.com')},
            //     onMouseOver: (e) => {this.setState({is_mouse_over: true})},
            //     onMouseOut: (e) => {this.setState({is_mouse_over: false})},
            //     onTouchStart: (e) => {this.setState({is_mouse_over: true})},
            // }, 'MINT'),
            c('div', {
                key: 'planet_info',
                style: {
                    backgroundColor: 'rgba(0, 0, 0, ' +  (this.state.config === null ? 0 : this.state.config.planet_info.opacity) + ')',
                    width: this.state.mobile_mode ? '100%' : '50%',
                    height: this.state.mobile_mode ? '60vh' : '100vh',
                    position: 'fixed',
                    top: this.state.mobile_mode ? '40vh' : 0,
                    left: 0,
                    zIndex: 20002001,
                    opacity: this.state.show ? 1 : 0,
                    animationName: this.state.show ? 'slideIn' : 'slideOut',
                    animationDuration: this.state.inited ? '1s' : '0s',
                    pointerEvents: this.state.show ? 'auto' : 'none',
                    overflow: this.state.mobile_mode ? 'visible' : 'hidden',
                    
                },
                onMouseOver: (e) => {this.setState({is_mouse_over: true})},
                onMouseOut: (e) => {this.setState({is_mouse_over: false})},
                onTouchStart: (e) => {this.setState({is_mouse_over: true})},
            }, this.state.show ? [
            
            c('div', {
                key: 'back_button_box',
                style:{
                    marginLeft: '-5%',
                    marginTop: ('-' + this.state.viewport_size.x * 0.05 + 'px'),
                    fontSize: 25,
                    color: 'black',
                    position: 'absolute',
                    backgroundColor: 'black',
                    borderRadius: '100%',
                    width: '30%',
                    height: 0,
                    paddingBottom: '30%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer'
                },
                onMouseDown: (e) => {this.setState({back: true})},
            }, c('div', {
                style: {
                    transform: 'translate(-50%, -50%)',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    color: 'white',
                }
            }, 'BACK')
            ),
            c('div', {
                style: {
                    height: '100%',
                    width: '100%',
                    overflowX: 'hidden',
                    overflowY: 'auto'
                }
            }, [
             c('div', {
                key: 'planet_info_name',
                style: {
                    marginTop: '10%',
                    textAlign: 'center',
                    fontSize: 60 * (this.state.planet_config ? (this.state.planet_config.title_font_scale ? this.state.planet_config.title_font_scale : 1) : 1),
                    width: '100%',
                    color: 'white',
                    textShadow: '0px 0px 6px #ffffff'
                }
            }, this.state.planet_name),
            
             c('div', {
                key: 'planet_info_details',
                style: {
                    marginTop: '10%',
                    textAlign: 'center',
                    fontSize: 30 * (this.state.planet_config ? (this.state.planet_config.subtitle_font_scale ? this.state.planet_config.subtitle_font_scale : 1) : 1),
                    width: '100%',
                    color: 'white',
                    textShadow: '0px 0px 6px #ffffff'
                }
            }, (this.state.planet_config !== null && this.state.current_part !== null && this.state.planet_config.type === 'spaceship') ? (this.state.planet_config.parts_info.length - 1 >= this.state.current_part.index ? this.state.planet_config.parts_info[this.state.current_part.index].part_name : '') : this.state.planet_details),
            
            c('div', {
            }, [
                c('div', {
                key: 'planet_info_info',
                style: {
                    marginTop: '10%',
                    textAlign: 'justify',
                    fontSize: 25,
                    width: 'calc(100% - 80px)',
                    color: 'white',
                    textShadow: '0px 0px 4px #ffffff',
                    padding: 40,
                    fontWeight: 100,
                    height: '45%', 
                    overflow: this.state.mobile_mode ? 'visible' : 'auto',
                    clear: 'both'
                },
                dangerouslySetInnerHTML: {__html: this.state.show ? this.state.options[this.state.selected_option] : ''}
            }
            ),
            c('div', {style: {width: '100%', clear: 'both', marginBottom: '4%', paddingTop: '4%'}},
            [...(() => {
                const options = [];
                var i = 0;
                var total = this.state.options.length;
                for(const option of this.state.options){
                    if(total <= 1) break;
                    const offset = total % 2 === 0 ? (i - total / 2) * 5 + '%' : (i - (total-1) / 2) * 5 - 1 +'%';
                    const el = ((i) => {
                    const el = c('div', {
                        key: i,
                        style: {
                            width: '2%',
                            height: 0,
                            paddingBottom: '2%',
                            border: '2px solid white',
                            borderRadius: '50%',
                            position: 'absolute',
                            left: 'calc(50% + ' + offset + ')',
                            cursor: 'pointer',
                            boxShadow: 'inset 0 0 3px white, 0 0 3px white',
                            backgroundColor: this.state.selected_option === i ? 'white' : 'transparent',
                        },
                        onMouseDown: (e) => {this.setState({selected_option: i})},
                        });
                        return el;
                    })(i)
                    options.push(el);
                    i++;
                }
                return options;                
            })()]
            )
        ])          
    ])
    ] : []
            )];

        this.last_planet_name = this.state.curr_planet_name;
        if(this.state.display) return rv;
        else return [];
    }
}

export default UI