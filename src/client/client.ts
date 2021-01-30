import * as THREE from '/build/three.module.js'
import { OrbitControls } from '/jsm/controls/OrbitControls'
import { FBXLoader } from '/jsm/loaders/FBXLoader'
import Stats from '/jsm/libs/stats.module'
import { GUI } from '/jsm/libs/dat.gui.module'

const scene: THREE.Scene = new THREE.Scene()
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

var light = new THREE.PointLight();
light.position.set(50, 50, 50)
scene.add(light);

scene.background = new THREE.Color(0x999999);
// var light = new THREE.DirectionalLight(0xffffff);
// light.position.set(0.5, 1.0, 0.5).normalize();
// scene.add(light);


const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0.8, 1.4, 1.0)

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.screenSpacePanning = true
controls.target.set(0, 1, 0)

var mixer: THREE.AnimationMixer
let modelReady = false;
let animationActions: THREE.AnimationAction[] = new Array()
let activeAction: THREE.AnimationAction
let lastAction: THREE.AnimationAction
let ChoosenAnimationActions: THREE.AnimationAction[] = new Array();
const fbxLoader: FBXLoader = new FBXLoader();
fbxLoader.load(
    'models/vanguard_t_choonyung.fbx',
    (object) => {
        object.scale.set(.01, .01, .01)
        mixer = new THREE.AnimationMixer(object);
        let animationAction = mixer.clipAction((object as any).animations[0]);
        animationActions.push(animationAction)
        // animationsFolder.add(animations, "default");
        activeAction = animationActions[0]

        scene.add(object);

        //add an animation from another file
        fbxLoader.load('models/vanguard@petting.fbx',
            (object) => {
                console.log("loaded petting")

                let animationAction = mixer.clipAction((object as any).animations[0]);
                animationActions.push(animationAction)
                animationsFolder.add(animations, "petting")

                //add an animation from another file
                fbxLoader.load('models/vanguard@angry.fbx',
                    (object) => {
                        console.log("loaded angry")
                        let animationAction = mixer.clipAction((object as any).animations[0]);
                        animationActions.push(animationAction)
                        animationsFolder.add(animations, "angry")

                        //add an animation from another file
                        fbxLoader.load('models/vanguard@hiphop.fbx',
                            (object) => {
                                console.log("loaded hiphop");
                                (object as any).animations[0].tracks.shift()
                                //console.dir((object as any).animations[0])
                                let animationAction = mixer.clipAction((object as any).animations[0]);
                                animationActions.push(animationAction)
                                animationsFolder.add(animations, "hiphop")
                                //console.dir(animationAction)

                                modelReady = true
                            },
                            (xhr) => {
                                console.log((xhr.loaded / xhr.total * 100) + '% loaded')
                            },
                            (error) => {
                                console.log(error);
                            }
                        )
                    },
                    (xhr) => {
                        console.log((xhr.loaded / xhr.total * 100) + '% loaded')
                    },
                    (error) => {
                        console.log(error);
                    }
                )
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded')
            },
            (error) => {
                console.log(error);
            }
        )
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    },
    (error) => {
        console.log(error);
    }
)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

var animations = {
    play: function () {
        playAllAction(0);
    },
    reset: function () {
        resetAllAction()
    },
    petting: function () {
        addAction(animationActions[1])
    },
    angry: function () {
        addAction(animationActions[2])
    },
    hiphop: function () {
        addAction(animationActions[3])
    },
}

// addAction(action) => them mot action can thuc hien vao danh sach doi, phai co mot cai danh sach doi.=> mang action. finish

const addAction = (action: THREE.AnimationAction) => {
    ChoosenAnimationActions.push(action);
}
const resetAllAction = () => {
    ChoosenAnimationActions = [];
    mixer.stopAllAction();
}
const playAllAction = (i) => {
    console.log(ChoosenAnimationActions);
    if (typeof ChoosenAnimationActions[i] !== "undefined") {
        ChoosenAnimationActions[i].fadeIn(1);
        ChoosenAnimationActions[i].repetitions = 1;
        ChoosenAnimationActions[i].clampWhenFinished = true;
        ChoosenAnimationActions[i].play();
        console.log(i);
        mixer.addEventListener('finished', (e) => {
            if (i == ChoosenAnimationActions.length) {
                i = 1;
            }
            console.log(i);
            console.log("go here");
            console.log(ChoosenAnimationActions[i]);
            ChoosenAnimationActions[i].fadeOut(1);
            i++;
            if (i <= ChoosenAnimationActions.length) {
                playAllAction(i);
            } else {
            }
        })
    } else {

    }
}

const setAction = (toAction: THREE.AnimationAction) => {
    if (toAction != activeAction) {
        lastAction = activeAction
        activeAction = toAction
        //lastAction.stop()
        lastAction.fadeOut(1)
        activeAction.reset()
        activeAction.fadeIn(1)
        activeAction.setLoop(THREE.LoopOnce, 1);
        activeAction.play();
    }
}

const gui = new GUI()
const animationsFolder = gui.addFolder("Animations")
animationsFolder.add(animations, "play");
animationsFolder.add(animations, "reset");
animationsFolder.open()

const clock: THREE.Clock = new THREE.Clock()

var animate = function () {
    requestAnimationFrame(animate)

    controls.update()

    if (modelReady) mixer.update(clock.getDelta());

    render()

    stats.update()
};

function render() {
    renderer.render(scene, camera)
}
animate();