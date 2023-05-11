
import * as THREE from '../lib/three.js/three.module.js'
import {OrbitControls} from '../lib/three.js/OrbitControls.js'
import {TrackballControls} from '../lib/three.js/TrackballControls.js'
import Stats from '../lib/three.js/stats.module.js'

import {Star} from './Star.js'
import {Planet} from './Planet.js'
import {Ring} from './Ring.js'
import {Path} from './Path.js'
import {Obsticle} from './Obsticle.js'

import {OBJLoader} from '../lib/three.js/OBJLoader.js'
import {GLTFLoader} from '../lib/three.js/GLTFLoader.js'
import {STLLoader} from '../lib/three.js/STLLoader.js'
import {FBXLoader} from '../lib/three.js/FBXLoader.js'

class Scene extends React.Component{
    constructor(props){   
        super(props);
        
        this.css = {height: '100%', width: '100%', margin: 0, padding: 0, position: 'fixed', left: 0, top: 0, zIndex: 2115, overflow: 'hidden'};

    }
    
    componentDidMount(){
       
        this.is_perspective_camera = false;
        this.is_ortographic_camera = false;

        this.mobile_mode = false;

        this.current_part = null;

        this.current_scroll = 0;

        this.background_sound = null;
        this.loaded_clicked = false;

        this.testing = false;
        this.planet_to_go = null;

        this.muted = false;

        this.scroll_inited = false;

        this.backup_position = null;

        this.mouse_locked = false;
        this.mouse_enabled = false;

        this.option = 0;

        this.stop_audio = true;

        this.add_loaders();
        this.mouse_look = false;
        this.pos = 0;
        this.index = 0;

        this.scrolling = false;

        this.config = null;
        this.assets_to_load = true;
        this.planets_added = false;

        this.file_loader.load('./config/config.json', f => {
            this.config = JSON.parse(f);
        });

        this.assets = {};
        this.checkpoints = [];

        this.mouse_over_ui = false;
        this.back = false;
        
        this.mouse_vector = new THREE.Vector3();
        this.curr_mouse_vector = new THREE.Vector3();
        
        this.is_camera_moving = true;
        
        this.scroll_force_box = document.createElement('div');
        this.scroll_force_box.setAttribute('style', 'width: 100%; height: 100vh; margin: 0; padding: 0; position: absolute; left: 0; top: 0; z-index: -129323;');
        document.body.appendChild(this.scroll_force_box);
        
        this.time_elapsed = 0;
        
        this.current_planet = null;

        this.look_at_mouse_factor = new THREE.Vector2();
        
        this.wheel_locked = false;
        
        this.clock = new THREE.Clock();
        
        this.scene = new THREE.Scene();
        
        this.last_mouse_vector = new THREE.Vector3()

        this.add_perspective_camera();
        this.camera.position.set(0, -5, 0);
        this.camera.lookAt(new THREE.Vector3(1, -5, 0))
        this.look_at = new THREE.Vector3(1, -5, 0);
        this.last_look = new THREE.Vector3(1, -5, 0);
        
        this.camera_position_destination = new THREE.Vector3(0, 0, 0);
        this.camera_last_position = this.camera.position;
        this.time_multiplier = 1;
         
        this.add_renderer();
        
        this.mouse = new THREE.Vector2(1, 1);
        this.last_mouse = new THREE.Vector2(1, 1);

        this.raycaster = new THREE.Raycaster();
        
        this.add_lights();
        
        this.mount.appendChild(this.renderer.domElement);
        
        this.add_event_listeners();        

        // this.add_stats();

        this.GameLoop();
    }
    
    render(){
        return React.createElement('div', {ref: (ref) => {this.mount=ref}, style: this.css});
    }
    
    add_loaders(){
        this.texture_loader = new THREE.TextureLoader();
        this.file_loader = new THREE.FileLoader();
        this.obj_loader = new OBJLoader();
        this.gltf_loader = new GLTFLoader();
        this.stl_loader = new STLLoader();
        this.fbx_loader = new FBXLoader();
    }
    
    add_perspective_camera(x=1, y=1, z=1, fov=30){
        this.camera = new THREE.PerspectiveCamera(fov, this.mount.offsetWidth / this.mount.offsetHeight, 0.1, 10000);
        this.camera.position.x = x;
        this.camera.position.y = y;
        this.camera.position.z = z;
        this.camera.lookAt(0, 0, 0);
        this.is_perspective_camera = true
    }
    
    add_ortographic_camera(camera_width=1.5, max_camera_ratio=1.5){
        this.base_camera_width = camera_width;
        this.camera_width = camera_width;
        this.camera_height = camera_width;
        
        this.max_camera_ratio = max_camera_ratio;
        
        this.camera_ratio = ((this.mount.offsetWidth) / (this.mount.offsetHeight));
        
        if(this.camera_ratio < this.max_camera_ratio){this.camera_height /= this.camera_ratio}
        else{this.camera_width *= this.camera_ratio / this.camera_ratio; this.camera_height /= this.camera_ratio;}
        
        this.camera = new THREE.OrthographicCamera( this.camera_width / - 2, this.camera_width / 2, this.camera_height / 2, this.camera_height / - 2, -1000, 1000 );
        
        this.camera.position.x = this.camera_width;
        this.camera.position.y = this.camera_width;
        this.camera.position.z = this.camera_width;
        this.camera.lookAt(0, 0, 0);
        this.is_ortographic_camera = true;
    }
    
    add_renderer(){
        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.enabled = true;
        this.renderer.setSize(this.mount.offsetWidth, this.mount.offsetHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
    }
    
    add_trackball_controls(){
        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.controls.rotateSpeed = 3.5;
        this.controls.panSpeed = 0.2;
        this.controls.dynamicDampingFactor = 0.1;
    }
    
    add_orbit_controls(){
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = true;
        this.controls.enableDamping = true;
        this.controls.enableRotate = true;
        this.controls.enableZoom = true;
    }    
    
    add_stats(){
        this.stats = new Stats();
        this.stats.showPanel(0);
        this.mount.appendChild(this.stats.dom);
        this.stats.dom.style.zIndex = 1292393932923923;
    }
    
    setup_testing(){
        this.testing = true;
        this.add_orbit_controls();
        if(this.ui) this.ui.setState({display: false});
        this.camera.position.x = 0;
        this.camera.position.y = 20;
        this.camera.position.z = 0;
        this.camera.lookAt(0, 0, 0);
        this.controls.target.set(0, 0, 0);
        this.add_axis(10)
    }

    add_models(){

        if(this.config.testing){
            this.setup_testing();
        }
        
        const box = new THREE.BoxGeometry(0.1, 0.1, 0.1); 

        const geometry = () => {
            // return new THREE.BoxGeometry(0.1, 0.1, 0.1);
            return new THREE.BufferGeometry()
        }

        this.mouse_helper = new THREE.Mesh(geometry(), new THREE.MeshBasicMaterial({color: 0x0000ff, transparent: true, opacity: 0.5}));
        this.mouse_inner_helper = new THREE.Mesh(geometry(), new THREE.MeshBasicMaterial({color: 0x00ffff, transparent: true, opacity: 0.5}));
        this.helper = new THREE.Mesh(geometry(), new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0.5}));
        this.inner_helper = new THREE.Mesh(geometry(), new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: 0.5}));

        this.helper2 = new THREE.Mesh(geometry(), new THREE.MeshBasicMaterial({color: 0xff00ff, transparent: true, opacity: 0.5}));
        this.scene.add(this.helper2);

        this.helper.add(this.inner_helper);
        this.scene.add(this.helper)
        
        this.mouse_helper.add(this.mouse_inner_helper);
        this.scene.add(this.mouse_helper)

        var follower_geometry = new THREE.SphereGeometry(this.config.follower.size / 2, 128, 128);
        var follower_material = new THREE.MeshBasicMaterial({color: Number.parseInt(this.config.follower.color, 16)});        

        this.follower = new THREE.Mesh(follower_geometry, follower_material);

        if(this.assets.follower_model){
                if(this.follower){
                    this.follower.removeFromParent();
                    this.follower = null;
                }
                const follower = this.assets.follower_model;
                var bbox = new THREE.Box3();
                bbox.setFromObject(follower);
                var size = new THREE.Vector3(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z);
                const max = Math.max(size.x, size.y, size.z);
                follower.scale.x *= this.config.follower.size / max;
                follower.scale.y *= this.config.follower.size / max;
                follower.scale.z *= this.config.follower.size / max;

                bbox = new THREE.Box3();
                bbox.setFromObject(follower);
                size = new THREE.Vector3(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z);

                follower.position.x += -bbox.min.x - size.x / 2;
                follower.position.y += -bbox.min.y - size.y / 2;
                follower.position.z += -bbox.min.z - size.z / 2;

                const follower_wrapped = new THREE.Group();
                follower_wrapped.rotation.x = this.config.follower.rotation_x * Math.PI / 180;
                follower_wrapped.rotation.y = this.config.follower.rotation_y * Math.PI / 180;
                follower_wrapped.rotation.z = this.config.follower.rotation_z * Math.PI / 180;
                follower_wrapped.add(follower)
                this.follower = follower_wrapped;
                this.follower.diameter = this.config.follower.size;
        }

        if(this.assets.follower){
            this.follower.traverse((node) => {
                if(node.isMesh){
                    node.material = new THREE.MeshBasicMaterial({map: this.assets.follower});
                }
            });
        }        

        this.follower.diameter = this.config.follower.size;
        if(!this.testing) this.scene.add(this.follower);

        this.planets = new THREE.Group();
        this.scene.add(this.planets);


        this.texture_loader.load('./img/skybox/texture.png', (skybox_texture) => {
            skybox_texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            
            const skybox_geometry = new THREE.SphereGeometry(this.config.sky.distance, 256);

            const skybox_material = new THREE.MeshBasicMaterial({map: skybox_texture, side: THREE.BackSide, color: Number.parseInt(this.config.sky.color, 16)});


            this.skybox = new THREE.Mesh(skybox_geometry, skybox_material);
            this.scene.add(this.skybox);
        });

        
        this.stars = new THREE.Group();
        this.scene.add(this.stars);
        
        const num_of_stars = this.config.sky.num_of_stars;
        const min_distance = this.config.sky.min_star_distance;
        const max_distance = this.config.sky.max_star_distance;
        
        for(var i=0; i< num_of_stars; i++){
            const star = new Star(this.config.sky.star_size, this.config.sky.star_blink_speed);
            star.position.x = Math.random() * max_distance - max_distance / 2;
            star.position.y = Math.random() * max_distance - max_distance / 2;
            star.position.z = Math.random() * max_distance - max_distance / 2;

            if(star.position.x === 0){star.position.x = 1}
            if(star.position.y === 0){star.position.y = 1}
            if(star.position.z === 0){star.position.z = 1}

            const distance = star.position.distanceTo(new THREE.Vector3());

            if(distance < min_distance){
                const mul = min_distance / distance;
                star.position.x *= mul;
                star.position.y *= mul;
                star.position.z *= mul;
            }
            this.stars.add(star)
        }
    }

    add_axis(length=1){
    
        const opacity = 1;
        
        const x_axis = new THREE.Mesh(new THREE.BoxGeometry(length, length * 0.005, length * 0.005), new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: opacity, side: THREE.DoubleSide}));
        const y_axis = new THREE.Mesh(new THREE.BoxGeometry(length * 0.005, length, length * 0.005), new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: opacity, side: THREE.DoubleSide}));
        const z_axis = new THREE.Mesh(new THREE.BoxGeometry(length * 0.005, length * 0.005, length), new THREE.MeshBasicMaterial({color: 0x0000ff, transparent: true, opacity: opacity, side: THREE.DoubleSide}));

        const x_axis_cone = new THREE.Mesh(new THREE.ConeGeometry(length * 0.02, length * 0.05, 32), new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: opacity, side: THREE.DoubleSide}));
        const y_axis_cone = new THREE.Mesh(new THREE.ConeGeometry(length * 0.02, length * 0.05, 32), new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: opacity, side: THREE.DoubleSide}));
        const z_axis_cone = new THREE.Mesh(new THREE.ConeGeometry(length * 0.02, length * 0.05, 32), new THREE.MeshBasicMaterial({color: 0x0000ff, transparent: true, opacity: opacity, side: THREE.DoubleSide}));

        const axis_group = new THREE.Group();

        x_axis_cone.position.x = length / 2;
        x_axis_cone.rotation.z = -Math.PI / 2;

        y_axis_cone.position.y = length / 2;

        z_axis_cone.position.z = length / 2;
        z_axis_cone.rotation.x = Math.PI / 2;

        axis_group.add(x_axis);
        axis_group.add(y_axis);
        axis_group.add(z_axis);

        axis_group.add(x_axis_cone);
        axis_group.add(y_axis_cone);
        axis_group.add(z_axis_cone);

        this.scene.add(axis_group);
        return axis_group;
    }
    
    GameLoop(){
        if(this.stats !== undefined){this.stats.begin()}
        requestAnimationFrame(() => this.GameLoop());
        this.render_scene();
        this.update();
        if(this.stats !== undefined){this.stats.end()}
    }
    
    move_v3_to_v3(from, to, amount){
        const v2_rel = new THREE.Vector3(to.x - from.x, to.y - from.y, to.z - from.z);
        const new_v = new THREE.Vector3(from.x + v2_rel.x * amount, from.y + v2_rel.y * amount, from.z + v2_rel.z * amount)
        return new_v;
    }

    camera_movement(){
        if(!this.is_camera_moving || this.testing) return;
        const speed = 0.1;
        var camera_position = new THREE.Vector3();
        const camera_destination = this.camera_position_destination;

        camera_position = this.move_v3_to_v3(this.camera.position, camera_destination, speed * this.time_multiplier);
        this.camera.position.x = camera_position.x;
        this.camera.position.y = camera_position.y;
        this.camera.position.z = camera_position.z;
        
        if(this.look_at !== null){
            this.curr_mouse_vector = this.move_v3_to_v3(this.curr_mouse_vector, this.mouse_vector, speed * this.time_multiplier)
            var look_at = new THREE.Vector3(this.last_look.x, this.last_look.y, this.last_look.z);

            
            look_at = this.move_v3_to_v3(look_at, this.look_at, speed * this.time_multiplier);
            this.last_look = new THREE.Vector3(look_at.x, look_at.y, look_at.z)

            const mouse_range = 0.03;


            if(this.camera.position.distanceTo(this.camera_position_destination) < 1 && !this.mouse_enabled){
                this.curr_mouse_vector.copy(look_at);
                this.mouse_enabled = true;
            }

            if(this.mouse_enabled && !this.mouse_locked){
                look_at.x = this.curr_mouse_vector.x;
                look_at.y = this.curr_mouse_vector.y;
                look_at.z = this.curr_mouse_vector.z;
            }

            this.camera.lookAt(look_at);

        }
    }
    
    set_object_material(object, material){
        var queue = [object];
        while(queue.length > 0){
            for(var i=0; i<queue[0].children.length; i++){
                queue.push(queue[0].children[i]);
            }
            if(queue[0].material !== undefined){
                queue[0].material = material;
            }
            queue.shift();
        }
    }
    
    load_asset(asset_name, asset_path){
        const ext = asset_path.split('.').at(-1).toLowerCase();
        if(ext === 'png' || ext === 'jpg' || ext === 'jpeg'){
            this.assets[asset_name] = null;
            this.texture_loader.load(asset_path, asset => {
                this.renderer.initTexture(asset);
                asset.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
                asset.minFilter = asset.magFilter = THREE.LinearFilter;
                this.assets[asset_name] = asset;
            });
        }
        else if(ext === 'glb' || ext === 'gltf'){
            this.assets[asset_name] = null;
            this.gltf_loader.load(asset_path, asset => {
                this.assets[asset_name] = asset.scene;
            });
        }
        else if(ext === 'obj'){
            this.assets[asset_name] = null;
            this.obj_loader.load(asset_path, asset => {
                this.assets[asset_name] = asset;
            });
        }
        else if(ext === 'stl'){
            this.assets[asset_name] = null;
            this.stl_loader.load(asset_path, asset => {
                const material = new THREE.MeshBasicMaterial();
                this.assets[asset_name] = new THREE.Mesh(asset, material);
            });
        }
        else if(ext === 'fbx'){
            this.assets[asset_name] = null;
            this.fbx_loader.load(asset_path, asset => {
            this.assets[asset_name] = asset;
            });
        }
    }


    add_planet(name, config){
        const texture = this.assets[config.name];
        const model = this.assets[config.name + '_model'];
        const planet = new Planet(config, texture, model);

        if(config.add_ring){
            const ring = new Ring(config.ring_diameter, config.ring_thickness, 0xffffff, this.assets[name + '_ring']);
            planet.add(ring);
        }
        this.planets.add(planet);
    }

    update(){
        const time_elapsed = this.clock.getElapsedTime();
        this.time_multiplier = (time_elapsed - this.time_elapsed) * 30
        this.time_elapsed = time_elapsed; 

        if(this.config === null) return;

        if(this.assets_to_load){
            if(this.ui){
                this.ui.setState({loading_image: this.config.loading_image})
            }
            if(this.config.follower.model){
                this.load_asset('follower_model', this.config.follower.model)
            }

            if(this.config.follower.texture){
                this.load_asset('follower', this.config.follower.texture)
            }

            for(const [index, config] of this.config.planets.entries()){
                config.index = index;
                config.y = 0;
                if(config.texture){
                    this.load_asset(config.name, config.texture);
                }
                if(config.model){
                    this.load_asset(config.name + '_model', config.model);
                }
                if(config.add_ring){
                    this.load_asset(config.name + '_ring', config.ring_texture);
                }
            }

            for(const [index, config] of this.config.obsticles.entries()){
                if(config.texture){
                    this.load_asset(index, config.texture);
                }
                if(config.model){
                    this.load_asset(index + '_model', config.model);
                } 
            }

            this.assets_to_load = false;
        }
        else if(this.assets_loaded){
            if(!this.planets_added){
                this.add_models();
                if(this.ui){
                    this.ui.setState({config: this.config});
                }
                this.option = 2;
                const positions = [];

                for(const config of this.config.planets){
                    this.add_planet(config.name, config);
                    positions.push(new THREE.Vector3(config.x, config.y, config.z));
                }

                this.path = new Path(this.config.path.width, positions, Number.parseInt(this.config.path.color, 16));
                this.scene.add(this.path);
                this.path.position.y -= 0.2;

                this.obsticles = new THREE.Group();
                this.scene.add(this.obsticles);
                for(const [index, config] of this.config.obsticles.entries()){
                    const obsticle = new Obsticle(this.assets[index], this.assets[index + '_model'], config.size, config.num_of_cubes, config.break_sound, config.break_volume);

                    var curr_pos = config.position - 1 / (this.planets.children.length);
                    if(curr_pos <= 0) curr_pos = 1 + curr_pos; 

                    const obstible_pos = this.path.curve.getPointAt(curr_pos);
                    obstible_pos.x += config.offset_x;
                    obstible_pos.y += config.offset_y;
                    obstible_pos.z += config.offset_z;
                    obsticle.position.copy(obstible_pos);
                    obsticle.rotation.x = config.rotation_x;
                    obsticle.rotation.y = config.rotation_y;
                    obsticle.rotation.z = config.rotation_z;
                    this.obsticles.add(obsticle);
                }

                this.planets_added = true;
                window.scrollTo(0, 1);
                if(this.ui && !this.testing){
                    this.ui.setState({loaded: true, planets: this.planets.children});
                    this.mouse_enabled = false;
                }
                this.background_sound = new Audio(this.config.background_sound.url);
                this.background_sound.loop = true; 
                if(this.ui){
                    this.ui.setState({option: 2});
                }  
                this.option = 2;     
            }
            else{
                this.update_loaded();
            }
        }
    }

    get assets_loaded(){
        var loaded = true;
        for(const [asset_name, asset] of Object.entries(this.assets)){
            if(asset === null){
                loaded = false;
            }
        }
        return loaded;
    }

    update_loaded(){ 
        const mobile_mode = this.mobile_mode;
        if(this.mount.offsetWidth / this.mount.offsetHeight < 1){
            if(this.ui && !this.ui.state.mobile_mode){this.ui.setState({mobile_mode: true})}
            this.mobile_mode = true;
        }
        else{
            if(this.ui && this.ui.state.mobile_mode){this.ui.setState({mobile_mode: false})}
            this.mobile_mode = false;
        }

        if(this.ui.state.mobile_mode !== this.mobile_mode) this.ui.setState({mobile_mode: this.mobile_mode})
        if(this.mobile_mode){
            this.camera.fov = 70;
        }
        else{
            this.camera.fov = 30;
        }

        if(this.mobile_mode !== mobile_mode || true){
            var mul = 3;
            if(this.current_planet !== null){
                if(this.option === 0 && this.current_planet.config.type !== 'spaceship'){
                    this.helper.lookAt(this.current_planet.position);
                    this.helper.position.copy(this.current_planet.position);
                    if(this.mobile_mode){
                        this.inner_helper.position.x = 0;
                        this.inner_helper.position.y = -this.current_planet.config.diameter;
                    }
                    else{
                        this.inner_helper.position.x = -this.current_planet.config.diameter / 2;
                        this.inner_helper.position.y = 0;
                    }
                    const world_pos = this.inner_helper.getWorldPosition(new THREE.Vector3());
                    this.look_at = new THREE.Vector3(world_pos.x, world_pos.y, world_pos.z);
        
                    const delta = new THREE.Vector3(this.current_planet.position.x - this.camera.position.x, this.current_planet.position.y - this.camera.position.y, this.current_planet.position.z - this.camera.position.z).normalize();
                    
                    this.camera_position_destination.x = this.current_planet.position.x - this.current_planet.config.diameter * mul * delta.x;
                    this.camera_position_destination.y = this.current_planet.position.y - this.current_planet.config.diameter * mul * delta.y;
                    this.camera_position_destination.z = this.current_planet.position.z - this.current_planet.config.diameter * mul * delta.z;
                }
                else{
                    if(this.current_planet.config.type === 'spaceship') mul *= 0.6;
                    this.camera_position_destination.x = this.current_planet.position.x;
                    this.camera_position_destination.y = this.current_planet.position.y
                    this.camera_position_destination.z = this.current_planet.position.z + (this.current_planet.config.diameter * mul);
                    this.look_at = new THREE.Vector3(this.current_planet.position.x - (this.mobile_mode ? 0 : this.current_planet.config.diameter * mul / 6), this.current_planet.position.y - (this.mobile_mode ? this.current_planet.config.diameter * mul / 2.5 : 0), this.current_planet.position.z);
                }
            }
        }

        if(this.current_planet === null){
            if(this.option === 2){
                this.camera.up = new THREE.Vector3(0, 0, 1);
            }
            else{
                this.camera.up = new THREE.Vector3(0, 1, 0);
            }
        }
        else{
            this.camera.up = new THREE.Vector3(0, 1, 0);
        }

        this.mouse_helper.position.copy(this.camera.position);
        this.mouse_helper.up = this.camera.up;
        this.mouse_helper.lookAt(this.last_look);

        const mouse_range = 0.1;

        this.mouse_inner_helper.position.x = -this.mouse.x * mouse_range;
        this.mouse_inner_helper.position.y = this.mouse.y * mouse_range;
        this.mouse_inner_helper.position.z = 2;

        this.mouse_vector = this.mouse_inner_helper.getWorldPosition(new THREE.Vector3());
        this.camera_movement();
 

        if(this.ui){
            this.muted = this.ui.state.muted;
        }

        if(this.background_sound){
            var volume = Math.min(Math.min(1, this.background_sound.volume + 0.005), this.config.background_sound.volume);
            if(this.muted){
                volume = 0;
            }
            else if(!this.stop_audio){
                volume = Math.max(0, this.background_sound.volume - 0.005);
            }
            this.background_sound.volume = volume;
        }

        if(this.music){
            var volume = this.music.volume;
            if(this.stop_audio){
                volume -= 0.005;
            }
            else{
                volume += 0.001;
            }
            volume = Math.min(Math.min(Math.max(volume, 0), 1), this.music_volume);
            this.music.volume = volume;
            if(this.muted){
                this.music.volume = 0;
            }
        }

        if(this.landing_sound){
            var volume = this.landing_sound.volume;
            if(this.stop_audio){
                volume -= 0.01;
            }
            else{
                volume += 0.01;
            }
            volume = Math.min(Math.min(Math.max(volume, 0), 1), this.config.landing_sound.volume);
            this.landing_sound.volume = volume;
            if(this.muted){
                this.landing_sound.volume = 0;
            }
        }

        if(this.back){
            this.stop_audio = true;
            this.current_planet = null;
        }

        if(this.ui){
            this.mouse_over_ui = this.ui.state.show ? this.ui.state.is_mouse_over : false;
             
             this.back = this.ui.state.back;
             if(this.back){
                 this.ui.setState({back: false});
                 this.back = true;
                 this.mouse_enabled = false;
             }
             
             if(this.current_planet === null && this.ui.state.show){
                 this.ui.setState({show: false, selected_option: 0});
             }
             else if(this.current_planet !== null && !this.ui.state.show){
                 this.ui.setState({show: true, inited: true, selected_option: 0});
             }

             if(this.ui.state.option !== this.option){
                 this.option = this.ui.state.option;
                 this.mouse_enabled = false;
             }
         }  

        if(this.option === 0){

            for(const obsticle of this.obsticles.children){
                const distance = this.camera.position.distanceTo(obsticle.position);
                if(distance < 0.75 && !obsticle.destroying){
                    obsticle.destroy(this.time_elapsed);
                    if(obsticle.break_sound && !this.muted){
                        const break_sound = new Audio(obsticle.break_sound);
                        break_sound.play();
                        if(obsticle.break_volume){
                            break_sound.volume = obsticle.break_volume;
                        }
                    }
                }
                obsticle.update(this.time_elapsed);
            }      

            const height = 2 * (this.planets.children.length + 1);

            this.mouse_locked = false;
            this.scroll_force_box.style.height = height * 100 + 'vh';
            if(this.current_planet === null){
                if(this.backup_position !== null){
                    this.current_scroll = this.backup_position * this.max_scroll;

                    this.backup_position = null;
                    window.scrollTo(0, this.current_scroll);
                }
                else if(!this.scroll_inited){
                    window.scrollTo(0, 1);
                    this.scroll_inited = true;
                    this.current_scroll = 1;
                }
                else{
                    this.current_scroll = window.pageYOffset;
                }
                this.max_scroll = document.body.scrollHeight * (height - 1) / height;        
                this.position = this.current_scroll / (this.max_scroll);

                if(this.current_scroll >= this.max_scroll - 1){
                    this.current_scroll = 1;
                    this.position = this.current_scroll / (this.max_scroll);
                    window.scrollTo(0, this.current_scroll);
                }
                else if(this.current_scroll === 0){
                    this.current_scroll = this.max_scroll - 2;
                    this.position = this.current_scroll / (this.max_scroll);
                    window.scrollTo(0, this.current_scroll);
                }

                this.is_camera_moving = true;

                var curr_pos = this.current_scroll / this.max_scroll - 1 / (this.planets.children.length);

                if(curr_pos <= 0) curr_pos = 1 + curr_pos; 



                const cam_pos = this.path.curve.getPointAt(curr_pos);
                const cam_look = this.path.curve.getPointAt((curr_pos + 0.3 / (this.planets.children.length + 1)) % 1);

                const helper_pos = this.path.curve.getPointAt((curr_pos + this.config.follower.z / (this.planets.children.length + 1)) % 1);
                const helper_look = this.path.curve.getPointAt((curr_pos + (0.3 + this.config.follower.z) / (this.planets.children.length + 1)) % 1);

                this.helper.position.copy(this.move_v3_to_v3(this.helper.position, helper_pos, 0.2 * this.time_multiplier));
                this.helper.lookAt(this.move_v3_to_v3(this.helper.position, helper_look, 0.2 * this.time_multiplier));

                if(!isNaN(cam_pos.x)){
                    this.camera_position_destination.copy(cam_pos);
                }
                if(!isNaN(cam_look.x)){
                    this.look_at.copy(cam_look);  
                }
            }
            else{
                window.scrollTo(0, this.current_scroll);
            }
        }    
        else if(this.option === 1){
            if(this.current_planet === null ) this.mouse_locked = true;
            else this.mouse_locked = false;
            if(this.max_scroll){
                this.backup_position = this.current_scroll / this.max_scroll;
            }
            this.scroll_force_box.style.height = '100vh';
            if(this.current_planet === null){
                this.look_at = new THREE.Vector3(this.config.listview.look_x, this.config.listview.look_y, this.config.listview.look_z);
                this.camera_position_destination = new THREE.Vector3(this.config.listview.x, this.config.listview.y, this.config.listview.z);
            }
        } 
        else if(this.option === 2){
            this.mouse_locked = false;
            if(this.max_scroll){
                this.backup_position = this.current_scroll / this.max_scroll;
            }
            this.scroll_force_box.style.height = '100vh';
            if(this.current_planet === null){
                this.look_at = new THREE.Vector3(this.config.overview.look_x, this.config.overview.look_y, this.config.overview.look_z);
                this.camera_position_destination = new THREE.Vector3(this.config.overview.x, this.config.overview.y, this.config.overview.z);
            }
        }

        if(this.current_planet !== null){
            if(this.current_planet.config.type !== 'spaceship'){
                this.helper2.position.copy(this.current_planet.position);
                this.helper2.rotation.copy(this.current_planet.rotation);
                this.helper2.add(this.follower)
            }
            this.follower.position.x = ((this.current_planet.config.add_ring ? this.current_planet.children[0].diameter / 2 + this.current_planet.children[0].thickness : this.current_planet.config.diameter / 2) + this.follower.diameter / 2) * 1.3;
            this.follower.position.y = 0;
            this.follower.position.z = 0;

            this.follower.rotation.x = this.config.follower.rotation_x / 180 * Math.PI;
            this.follower.rotation.y = this.config.follower.rotation_y / 180 * Math.PI - Math.PI;
            this.follower.rotation.z = this.config.follower.rotation_z / 180 * Math.PI;
        }
        else{
            if(!this.testing){this.helper.add(this.follower);}
            this.follower.position.x = this.config.follower.x;
            this.follower.position.y = this.config.follower.y;
            this.follower.position.z = this.config.follower.z;

            this.follower.rotation.x = this.config.follower.rotation_x / 180 * Math.PI;
            this.follower.rotation.y = this.config.follower.rotation_y / 180 * Math.PI;
            this.follower.rotation.z = this.config.follower.rotation_z / 180 * Math.PI;
        }

        const quaternion = this.camera.getWorldQuaternion(new THREE.Quaternion());
        const euler = new THREE.Euler();
        euler.setFromQuaternion(quaternion);
        
        if(this.skybox) this.skybox.rotation.z += 0.005;
        
        for(const planet of this.planets.children){
            if(this.current_planet === planet && planet.config.type === 'spaceship'){
                planet.lookAt(new THREE.Vector3(this.camera.position.x, this.camera.position.y - 1, this.camera.position.z));
                planet.rotation.y += planet.config.rotation_y / 360 * 2 * Math.PI;
                planet.rotation.x += planet.config.rotation / 360 * 2 * Math.PI;
                continue;
            }
            planet.rotation_y += 0.0075 * planet.config.rotation_speed * this.time_multiplier;
            if(planet.config.type === 'spaceship'){
                planet.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), 0.0075 * planet.config.rotation_speed * this.time_multiplier);
            }else{
                planet.rotation.y = planet.rotation_y;           
            }
        } 
        
        for(const star of this.stars.children){
            star.update(this.time_elapsed);
        }
        
        this.hover();
        this.resize();
        if(this.controls !== undefined){this.controls.update()}
        
        if(this.ui){
            if(this.ui.state.planet_to_go !== null){
                this.planet_to_go = this.ui.state.planet_to_go;
                this.ui.setState({planet_to_go: null});
            }
        }

        if(this.planet_to_go !== null){
            this.go_to_planet(this.planet_to_go);
            this.planet_to_go = null;
        }

    }
    
    render_scene(){
        this.renderer.render(this.scene, this.camera);
    }
    
    
    add_lights(){
        var lights_group = new THREE.Group();
        var power = 0.7;
        var color = 0xffffff;
        var distance = 1000;
        
        var lights_properties = [[0, 0, distance, power, true], [0, 0, -distance, power, true], [0, distance, 0, power, true], [0, -distance, 0, power, true], [distance, 0, 0, power, true], [-distance, 0, 0, power, true]];
        for(var i=0; i < lights_properties.length; i++){
            var light = new THREE.DirectionalLight(color, lights_properties[i][3], 500);
            
            var light_size = 100;
            
            light.shadow.camera.left = -light_size;
            light.shadow.camera.right = light_size;
            light.shadow.camera.top = light_size;
            light.shadow.camera.bottom = -light_size;
            light.shadow.mapSize.width = 1500;
            light.shadow.mapSize.height = 1500;

            light.position.set(lights_properties[i][0], lights_properties[i][1], lights_properties[i][2]);
            if(lights_properties[i][4]){light.castShadow = true;}
         
            lights_group.add(light);
        }
     
        lights_group.add(new THREE.AmbientLight(0xffffff, 1.));
        this.scene.add(lights_group);
        
        return lights_group;
    }
    
    add_event_listeners(){
        
        window.addEventListener('resize', () => {
            this.resize();
        });
        
        window.addEventListener('wheel', (event) => {
            this.on_wheel(event);
        });
        
        window.addEventListener('mousemove', (event) => {
            this.mouse_move(event);
        });

        window.addEventListener('mousedown', (event) => {
            // console.log('mouse down')
            this.mouse_down(event);
        });
        
        window.addEventListener('mouseup', (event) => {
            // console.log('mouse up')
        });

        window.addEventListener('touchstart', (event) => {
            // console.log('touch start')
        });

        window.addEventListener('touchend', (event) => {
            // console.log('touch end')
        });
        
        window.addEventListener("contextmenu", e => e.preventDefault());
    }
    
    mouse_move(event){
        this.last_mouse = {...this.mouse}
        
        this.mouse.x = ((event.clientX - this.mount.parentNode.offsetLeft) / this.mount.offsetWidth) * 2 - 1;
        this.mouse.y = - ((event.clientY - this.mount.parentNode.offsetTop) / this.mount.offsetHeight) * 2 + 1;
    }
    
    on_wheel(event){
    }
    
    resize(){
        if(this.ui){
            const width = document.documentElement.clientWidth;
            const height = document.documentElement.clientHeight;
            if(this.ui.state.viewport_size.x !== width || this.ui.state.viewport_size.y !== height){
                this.ui.setState({viewport_size: {x: width, y: height}})
            }
        }

        if(this.is_perspective_camera){
            var width = this.mount.offsetWidth;
            var height = this.mount.offsetHeight;
            this.renderer.setSize(width, height);
            this.camera.aspect = width/height;
            this.camera.updateProjectionMatrix();
        }
        else if(this.is_ortographic_camera){
            var width = this.mount.offsetWidth;
            var height = this.mount.offsetHeight;
            this.renderer.setSize(width, height);
            this.camera.aspect = width/height;
            this.camera.updateProjectionMatrix();
            
            this.camera_width = this.base_camera_width;
            this.camera_height = this.base_camera_width;
            
            this.camera_ratio = (this.mount.offsetWidth / this.mount.offsetHeight);
        
            if(this.camera_ratio < this.max_camera_ratio){this.camera_height /= this.camera_ratio}
            else{this.camera_width *= this.camera_ratio / this.max_camera_ratio; this.camera_height /= this.camera_ratio;}

            this.camera.left = -this.camera_width / 2;
            this.camera.right = this.camera_width / 2;
            this.camera.top = this.camera_height / 2;
            this.camera.bottom = -this.camera_height / 2;
        }
    }
    
    mouse_up(event){
        this.raycaster.setFromCamera(this.mouse, this.camera);
    }
    
    mouse_down(){
        
        if(this.ui){
            if(!this.ui.state.loaded_clicked){
                return;
            }
            else if(this.ui.state.loaded_clicked !== this.loaded_clicked){
                this.ui.setState({option: this.config.start_state, menu_opened: (this.config.start_state == 1 || this.config.start_state == 2)})
                this.mouse_enabled = false;
                this.loaded_clicked = true;
                this.camera.position.x = this.config.start_position.x;
                this.camera.position.y = this.config.start_position.y;
                this.camera.position.z = this.config.start_position.z;
                this.camera.lookAt(new THREE.Vector3(this.config.start_look_at.x, this.config.start_look_at.y, this.config.start_look_at.z));
                this.look_at = new THREE.Vector3(this.config.start_look_at.x, this.config.start_look_at.y, this.config.start_look_at.z);
                this.last_look = new THREE.Vector3(this.config.start_look_at.x, this.config.start_look_at.y, this.config.start_look_at.z);
                this.option = this.config.start_state;
                this.background_sound.play();
                
                return;
            }
        }

        if(this.testing) return;
        if(this.mouse_over_ui) return;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.planets.children);
        if(intersects.length > 0){
            if(this.current_planet !== null && this.current_planet.config.type === 'spaceship' && this.current_planet === intersects[0].object.spaceship){
                this.current_part = intersects[0].object;
            }
            
            const hovered = intersects[0].object;
            var planet = null;
            var curr = hovered;
            while(curr !== null){
                if(curr.is_planet){
                    planet = curr;
                    break;
                }
                curr = curr.parent;
            }
            if(this.current_planet === planet) return;
            if(planet !== null){
                this.mouse_enabled = false;
                this.go_to_planet(planet);
            }
        }
        else if(this.current_planet !== null && this.current_part !== null && this.current_planet.config.type === 'spaceship'){
            this.current_part = null;
        }
        else{
            if(this.current_planet !== null && this.current_planet.config.type === 'spaceship'){
                this.current_planet.up = new THREE.Vector3(0, 1, 0);
                this.current_planet.rotation.x = this.current_planet.config.rotation / 360 * 2 * Math.PI;
                this.current_planet.rotation.y = this.current_planet.config.rotation_y / 360 * 2 * Math.PI;
                this.current_planet.rotation.z = 0;
            }
            this.current_part = null;
            this.current_planet = null;
            if(this.music){
                this.stop_audio = true;
            }
        }
    }
    
    go_to_planet(hovered){
        this.current_planet = hovered; 

        if(this.music){
            var isPlaying = this.music.currentTime > 0 && !this.music.paused && !this.music.ended 
            && this.music.readyState > this.music.HAVE_CURRENT_DATA;
            if(isPlaying) this.music.pause()
        }
        if(this.landing_sound){
            var isPlaying = this.landing_sound.currentTime > 0 && !this.landing_sound.paused && !this.landing_sound.ended 
            && this.landing_sound.readyState > this.landing_sound.HAVE_CURRENT_DATA;
            if(isPlaying) this.landing_sound.pause()        
        }

        this.landing_sound = new Audio(this.config.landing_sound.url);
        this.landing_sound.volume = 0;
        this.landing_sound.play();

        this.music = new Audio(this.current_planet.config.music);
        this.music.volume = 0;
        this.music.loop = true;
        this.music_volume = this.current_planet.config.music_volume;
        this.stop_audio = false;
        this.music.play();

        if(this.ui){
            this.ui.setState({
                planet_name: this.current_planet.config.name,
                planet_details: this.current_planet.config.subtitle,
                options: this.current_planet.config.info,
                planet_config: this.current_planet.config
            });
        }
    }

    hover(){
        if(this.testing) return;
        if(!this.loaded_clicked) return;

        var curr_planet_name = null;
        var curr_planet_font_scale = 1;
        
        for(const planet of this.planets.children){
            const step = 0.1 * planet.config.hover_scale;
            planet.scale.x = Math.max(planet.scale.x - step, 1);
            planet.scale.y = Math.max(planet.scale.y - step, 1);
            planet.scale.z = Math.max(planet.scale.z - step, 1);

            if(planet.config.type === 'spaceship'){
                var i = 0;
                planet.traverse((node) => {
                    if(node.isMesh){
                        if(node._color !== undefined){
                            node.material.color.copy(node._color);
                        }
                    }
                });
                if(this.current_part){
                    this.current_part.material.color.setHex(parseInt(planet.config.select_color, 16));
                }
            }
        }

        if(this.mouse_over_ui) {document.body.style.cursor = 'default'; return;}

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.planets.children);
        if(intersects.length > 0){
            const hovered = intersects[0].object;
            var planet = null;
            var curr = hovered;
            while(curr !== null){
                if(curr.is_planet){
                    planet = curr;
                    break;
                }
                curr = curr.parent;
            }
            if(planet !== null){
                if(this.option == 2 && this.current_planet === null){
                    curr_planet_name = planet.config.name;
                    if(planet.config.hover_font_scale) curr_planet_font_scale = planet.config.hover_font_scale;
                    const step = 0.1 * planet.config.hover_scale;
                    const max_scale = planet.config.hover_scale;
                    planet.scale.x = Math.min(planet.scale.x + step * 2, max_scale);
                    planet.scale.y = Math.min(planet.scale.y + step * 2, max_scale);
                    planet.scale.z = Math.min(planet.scale.z + step * 2, max_scale);
                }
                else if(this.current_planet !== null){
                    if(planet.config.type === 'spaceship' && this.current_planet === planet){
                        if(hovered.isMesh && hovered !== this.current_part){                            
                            hovered.material.color.setHex(parseInt(planet.config.hover_color, 16));
                        }
                    }
                }
                document.body.style.cursor = 'pointer';
            }
        }
        else{
            document.body.style.cursor = 'default';
        }
        if(this.ui){

            if(this.current_part !== this.ui.state.current_part){
                if(this.current_part !== null && this.current_planet !== null){
                    this.ui.setState({
                        options: (this.current_planet.config.type === 'spaceship' ? (this.current_part.index <= this.current_planet.config.parts_info.length - 1 ? this.current_planet.config.parts_info[this.current_part.index].info : []) : this.current_planet.config.info),
                        selected_option: 0})
                }
                else if(this.current_planet !== null){
                    this.ui.setState({
                        options: this.current_planet.config.info,
                        selected_option: 0
                    })
                }
                this.ui.setState({current_part: this.current_part})
            }

            if(curr_planet_name !== this.ui.state.curr_planet_name){
                if(curr_planet_name !== null){
                    this.ui.setState({
                        curr_planet_font_scale: curr_planet_font_scale
                    });
                }
                this.ui.setState({
                    curr_planet_name: curr_planet_name,
                });
            }
        }
    }
}

export default Scene