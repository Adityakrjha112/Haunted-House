import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'
import roofs from "../static/floor/roof1.jpg"

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * House
 */
// Temporary sphere
// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(1, 32, 32),
//     new THREE.MeshStandardMaterial({ roughness: 0.7 })
// )
// scene.add(sphere)

// floor

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })
)
floor.rotation.x = - Math.PI * 0.5
// floor.position.y = -1.03
scene.add(floor)


// house
const house = new THREE.Group()
scene.add(house)

// walls
const textureLoader = new THREE.TextureLoader()

// GLOSS textures are the inverse of a roughness map (bright = shiny),
// so the pixels need flipping before they can be used as roughnessMap,
// otherwise the rough stone reads as shiny plastic and the shiny grout reads as matte
const loadInvertedTexture = (path) => {
    const canvas = document.createElement('canvas')
    const texture = new THREE.CanvasTexture(canvas)

    const image = new Image()
    image.onload = () => {
        canvas.width = image.width
        canvas.height = image.height
        const context = canvas.getContext('2d')
        context.filter = 'invert(1)'
        context.drawImage(image, 0, 0)
        texture.needsUpdate = true
    }
    image.src = path

    return texture
}

const brickColorTexture = textureLoader.load('/wall/StoneBricksSplitface001_COL_1K.jpg')
brickColorTexture.colorSpace = THREE.SRGBColorSpace

const brickAOTexture = textureLoader.load('/wall/StoneBricksSplitface001_AO_1K.jpg')
const brickNormalTexture = textureLoader.load('/wall/StoneBricksSplitface001_NRM_1K.jpg')
const brickBumpTexture = textureLoader.load('/wall/StoneBricksSplitface001_BUMP_1K.jpg')
const brickRoughnessTexture = loadInvertedTexture('/wall/StoneBricksSplitface001_GLOSS_1K.jpg')

const wallGeometry = new THREE.BoxGeometry(4, 2.5, 4)
wallGeometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(wallGeometry.attributes.uv.array, 2)
)

const walls = new THREE.Mesh(
    wallGeometry,
    new THREE.MeshStandardMaterial({
        map: brickColorTexture,
        aoMap: brickAOTexture,
        normalMap: brickNormalTexture,
        roughnessMap: brickRoughnessTexture,
        bumpMap: brickBumpTexture,
        bumpScale: 0.03
    })
)
walls.position.y = 2.5 / 2
house.add(walls)

// roof
const roofColorTexture = textureLoader.load(roofs)
roofColorTexture.colorSpace = THREE.SRGBColorSpace
console.log(roofColorTexture)
// roofColorTexture.generateMipmaps = false
// roofColorTexture.minFilter = THREE.NearestFilter
// roofColorTexture.magFilter = THREE.NearestFilter
roofColorTexture.magFilter = THREE.NearestFilter

const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1, 4),
    new THREE.MeshStandardMaterial({ map: roofColorTexture, side: THREE.DoubleSide })
)
roof.position.y = 2.5 + 0.5
roof.rotation.y = Math.PI * 0.25
house.add(roof)

// Door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x00ffff0, side: THREE.DoubleSide })
)
door.position.y = 1.8 / 2
door.position.z = 2 + 0.01
house.add(door)

//bush
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x39673a })

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.4, 0.4, 0.4)
bush1.position.set(-1.3, 0.4, 2.3)
gui.add(bush1.position, 'x', -10, 10, 0.1)
gui.add(bush1.position, 'y', -10, 10, 0.1)
gui.add(bush1.position, 'z', -10, 10, 0.1)
house.add(bush1)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.5, 0.5, 0.5)
bush2.position.set(1.5, 0.5, 2.5)
gui.add(bush2.position, 'x', -10, 10, 0.1)
gui.add(bush2.position, 'y', -10, 10, 0.1)
gui.add(bush2.position, 'z', -10, 10, 0.1)
house.add(bush2)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.3, 0.3, 0.3)
bush3.position.set(0.9, 0.3, 2)
gui.add(bush3.position, 'x', -10, 10, 0.1)
gui.add(bush3.position, 'y', -10, 10, 0.1)
gui.add(bush3.position, 'z', -10, 10, 0.1)
house.add(bush3)




/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const timer = new Timer()

const tick = () => {
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()