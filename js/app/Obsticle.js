import * as THREE from '../lib/three.js/three.module.js'

class Obsticle extends THREE.Group{
    constructor(texture=null, model=null, size=0.1, num_of_cubes=2, break_sound=null, break_volume=1, destroy_duration=10){
        super();

        this.size = size;
        this.num_of_cubes = num_of_cubes;
        this.destroy_duration = destroy_duration;
        this.break_sound = break_sound;
        this.break_volume = break_volume;

        this.destroying = false;
        this.destroy_start = null;

        this.min_speed = 0.001;
        this.max_speed = 0.002;
        this.min_rotate_speed = 0.03;
        this.max_rotate_speed = 0.06;

        for(var i=0; i<num_of_cubes; i++){
            for(var j=0; j<num_of_cubes; j++){
                for(var k=0; k<num_of_cubes; k++){

                    var mesh = null;

                    if(model){            
                        const bbox = new THREE.Box3();
                        bbox.setFromObject(model);
                        const s = new THREE.Vector3(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z);
                        const max = Math.max(s.x, s.y, s.z);
                        model.position.x = -bbox.min.x - s.x / 2;
                        model.position.y = -bbox.min.y - s.y / 2;
                        model.position.z = -bbox.min.z - s.z / 2;
                        const model_wrapped = new THREE.Group();
                        model_wrapped.scale.x *= size / num_of_cubes / max;
                        model_wrapped.scale.y *= size / num_of_cubes / max;
                        model_wrapped.scale.z *= size / num_of_cubes / max;
                        model_wrapped.add(model);
                        mesh = (model_wrapped.clone());
                        if(texture){
                            model.traverse((node) => {
                                if(node.isMesh){
                                    if(node.material){
                                        node.material.map = texture.clone();
                                    }
                                }
                            });
                        }
                    }
                    else{
                        var geometry = new THREE.BoxGeometry(size / num_of_cubes, size / num_of_cubes, size / num_of_cubes);
                        var material = new THREE.MeshBasicMaterial({map: texture});
                        mesh = new THREE.Mesh(geometry, material);
                    }

                    mesh.speed = Math.random() * (this.max_speed - this.min_speed) + this.min_speed;
                    mesh.rotate_speed = Math.random() * (this.max_rotate_speed - this.min_rotate_speed) + this.min_rotate_speed;
                    this.add(mesh);
                }
            }
        }
        this.set_positions();
    }

    set_positions(){
        for(var i=0; i<this.num_of_cubes; i++){
            for(var j=0; j<this.num_of_cubes; j++){
                for(var k=0; k<this.num_of_cubes; k++){
                    const mul = 0.4;
                    const cube = this.children[i * this.num_of_cubes * this.num_of_cubes + j * this.num_of_cubes + k];
                    cube.position.x = (i * this.size / this.num_of_cubes + this.size / this.num_of_cubes / 2 - this.size / 2) * mul;
                    cube.position.y = (j * this.size / this.num_of_cubes + this.size / this.num_of_cubes / 2 - this.size / 2) * mul;
                    cube.position.z = (k * this.size / this.num_of_cubes + this.size / this.num_of_cubes / 2 - this.size / 2) * mul;
                    cube.rotation.x = 0;
                    cube.rotation.y = 0;
                    cube.rotation.z = 0;
                }
            }
        }
    }

    destroy(time){
        this.destroying = true;
        this.destroy_start = time;
    }

    update(time_elapsed){

        if(this.destroying){
            if(time_elapsed - this.destroy_start > this.destroy_duration){
                this.destroying = false;
                this.set_positions();
            }
            else{
                for(var i=0; i<this.num_of_cubes; i++){
                    for(var j=0; j<this.num_of_cubes; j++){
                        for(var k=0; k<this.num_of_cubes; k++){
                            
                            const cube = this.children[i * this.num_of_cubes * this.num_of_cubes + j * this.num_of_cubes + k];

                            cube.position.x += (i % 2 === 0 ? -cube.speed : cube.speed);
                            cube.position.y += (j % 2 === 0 ? -cube.speed : cube.speed);
                            cube.position.z += (k % 2 === 0 ? -cube.speed : cube.speed);

                            cube.rotation.x += (i % 2 === 0 ? -cube.speed : cube.rotate_speed);
                            cube.rotation.y += (j % 2 === 0 ? -cube.speed : cube.rotate_speed);
                            cube.rotation.z += (k % 2 === 0 ? -cube.speed : cube.rotate_speed);
                        }
                    }
                }
            }
        }
    }
}

export {Obsticle};