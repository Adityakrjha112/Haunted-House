import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import { Sky } from 'three/addons/objects/Sky.js'
import GUI from 'lil-gui'
import roofColorTextures from '../static/roof/1K/Poliigon_WoodRoofShingle_7834_BaseColor.jpg'
import roofNormalTextures from '../static/roof/1K/Poliigon_WoodRoofShingle_7834_Normal.png'
import roofRoughnessTextures from '../static/roof/1K/Poliigon_WoodRoofShingle_7834_Roughness.jpg'

import roofAoTextures from '../static/roof/1K/Poliigon_WoodRoofShingle_7834_AmbientOcclusion.jpg'

/**
 * Base
 */
// Debug
const gui = new GUI()
gui.hide()

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

// Textures
const textureLoader = new THREE.TextureLoader()

// Floor textures
const floorAlphaTexture = textureLoader.load('./floor/alpha.jpg')
const floorColorTexture = textureLoader.load('./floors/coast_sand_rocks_02_diff_1k.jpg')
const floorARMTexture = textureLoader.load('./floors/coast_sand_rocks_02_arm_1k.jpg')
const floorNormalTexture = textureLoader.load('./floors/coast_sand_rocks_02_nor_gl_1k.jpg')
const floorDisplacementTexture = textureLoader.load('./floors/coast_sand_rocks_02_disp_1k.jpg')

floorColorTexture.colorSpace = THREE.SRGBColorSpace
floorARMTexture.colorSpace = THREE.SRGBColorSpace
// floorNormalTexture.colorSpace = THREE.SRGBColorSpace
// floorDisplacementTexture.colorSpace = THREE.SRGBColorSpace

floorColorTexture.repeat.set(8, 8)
floorARMTexture.repeat.set(8, 8)
floorNormalTexture.repeat.set(8, 8)
floorDisplacementTexture.repeat.set(8, 8)

floorColorTexture.wrapS = THREE.RepeatWrapping
floorARMTexture.wrapS = THREE.RepeatWrapping
floorNormalTexture.wrapS = THREE.RepeatWrapping
floorDisplacementTexture.wrapS = THREE.RepeatWrapping

floorColorTexture.wrapT = THREE.RepeatWrapping
floorARMTexture.wrapT = THREE.RepeatWrapping
floorNormalTexture.wrapT = THREE.RepeatWrapping
floorDisplacementTexture.wrapT = THREE.RepeatWrapping

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
        alphaMap: floorAlphaTexture,
        transparent: true,
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.3,
        displacementBias: -0.2
    })
)
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

gui.add(floor.material, 'displacementScale').min(0).max(1).step(0.001).name('floorDisplacementScale')
gui.add(floor.material, 'displacementBias').min(-1).max(1).step(0.001).name('floorDisplacementBias')

// house
const house = new THREE.Group()
scene.add(house)
house.position.x = 1

// walls

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


const roofTextureLoader = new THREE.TextureLoader()
const roofColorTexture = roofTextureLoader.load(roofColorTextures)
const roofNormalTexture = roofTextureLoader.load(roofNormalTextures)
const roofRoughnessTexture = roofTextureLoader.load(roofRoughnessTextures)
const roofAoTexture = roofTextureLoader.load(roofAoTextures)
roofColorTexture.colorSpace = THREE.SRGBColorSpace
roofNormalTexture.colorSpace = THREE.SRGBColorSpace
roofRoughnessTexture.colorSpace = THREE.SRGBColorSpace
roofAoTexture.colorSpace = THREE.SRGBColorSpace
roofColorTexture.magFilter = THREE.NearestFilter
roofNormalTexture.magFilter = THREE.NearestFilter
roofRoughnessTexture.magFilter = THREE.NearestFilter
roofAoTexture.magFilter = THREE.NearestFilter

const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1, 4),
    new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        aoMap: roofAoTexture,
        normalMap: roofNormalTexture,
        roughnessMap: roofRoughnessTexture,
        side: THREE.DoubleSide
    })
)
roof.position.y = 2.5 + 0.5
roof.rotation.y = Math.PI * 0.25
house.add(roof)

// Door textures
const doorColorTexture = textureLoader.load('/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('/door/height.jpg')
const doorNormalTexture = textureLoader.load('/door/normal.jpg')
const doorMetalnessTexture = textureLoader.load('/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/door/roughness.jpg')

doorColorTexture.colorSpace = THREE.SRGBColorSpace

// Door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.15,
        displacementBias: -0.04,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
    })
)
door.position.y = 1
door.position.z = 2 + 0.01
house.add(door)

// Door light
const doorLight = new THREE.PointLight('#ff7d46', 5)
doorLight.position.set(0, 2.2, 2.5)
house.add(doorLight)

// Bush textures
const bushColorTexture = textureLoader.load('./leaves_forest/leaves_forest_ground_diff_1k.jpg')
const bushARMTexture = textureLoader.load('./leaves_forest/leaves_forest_ground_arm_1k.jpg')
const bushNormalTexture = textureLoader.load('./leaves_forest/leaves_forest_ground_nor_gl_1k.jpg')

bushColorTexture.colorSpace = THREE.SRGBColorSpace

bushColorTexture.repeat.set(2, 1)
bushARMTexture.repeat.set(2, 1)
bushNormalTexture.repeat.set(2, 1)

bushColorTexture.wrapS = THREE.RepeatWrapping
bushARMTexture.wrapS = THREE.RepeatWrapping
bushNormalTexture.wrapS = THREE.RepeatWrapping

// Bush
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({
    color: '#ccffcc',
    map: bushColorTexture,
    aoMap: bushARMTexture,
    roughnessMap: bushARMTexture,
    metalnessMap: bushARMTexture,
    normalMap: bushNormalTexture
})

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


// Graves textures
const graveColorTexture = textureLoader.load('./plastered_stone/plastered_stone_wall_diff_1k.jpg')
const graveARMTexture = textureLoader.load('./plastered_stone/plastered_stone_wall_arm_1k.jpg')
const graveNormalTexture = textureLoader.load('./plastered_stone/plastered_stone_wall_nor_gl_1k.jpg')

graveColorTexture.colorSpace = THREE.SRGBColorSpace

graveColorTexture.repeat.set(0.3, 0.4)
graveARMTexture.repeat.set(0.3, 0.4)
graveNormalTexture.repeat.set(0.3, 0.4)

const graves = new THREE.Group();

scene.add(graves)

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({
    map: graveColorTexture,
    aoMap: graveARMTexture,
    roughnessMap: graveARMTexture,
    metalnessMap: graveARMTexture,
    normalMap: graveNormalTexture
})

for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 4 + Math.random() * 4
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius

    // Mesh
    const grave = new THREE.Mesh(graveGeometry, graveMaterial)
    grave.position.x = x
    grave.position.z = z

    grave.rotation.x = (Math.random() - 0.5) * 0.4
    grave.rotation.y = (Math.random() - 0.5) * 0.4
    grave.rotation.z = (Math.random() - 0.5) * 0.4

    // Add to the graves group
    graves.add(grave)
}






/**
 * Lights
 */
// Ambient light
// const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
// scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#ffffff', 0.3)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

// Ghosts
const ghost1 = new THREE.PointLight('#8800ff', 6)
const ghost2 = new THREE.PointLight('#ff0088', 6)
const ghost3 = new THREE.PointLight('#00ffff', 6)
const ghost4 = new THREE.PointLight('#00ff66', 6)
const ghost5 = new THREE.PointLight('#ff8800', 6)
scene.add(ghost1, ghost2, ghost3, ghost4, ghost5)

/**
 * Sky
 */
const sky = new Sky()
sky.scale.set(100, 100, 100)
scene.add(sky)

sky.material.uniforms['turbidity'].value = 10
sky.material.uniforms['rayleigh'].value = 3
sky.material.uniforms['mieCoefficient'].value = 0.1
sky.material.uniforms['mieDirectionalG'].value = 0.95
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)

// Sky GUI
const skyFolder = gui.addFolder('Sky')
skyFolder.add(sky.material.uniforms['turbidity'], 'value', 0.0, 20.0, 0.1).name('turbidity')
skyFolder.add(sky.material.uniforms['rayleigh'], 'value', 0.0, 4.0, 0.001).name('rayleigh')
skyFolder.add(sky.material.uniforms['mieCoefficient'], 'value', 0.0, 0.1, 0.0001).name('mieCoefficient')
skyFolder.add(sky.material.uniforms['mieDirectionalG'], 'value', 0.0, 1.0, 0.001).name('mieDirectionalG')

const skyParameters = {
    elevation: -2.2,
    azimuth: 162.5
}

const updateSky = () => {
    const phi = THREE.MathUtils.degToRad(90 - skyParameters.elevation)
    const theta = THREE.MathUtils.degToRad(skyParameters.azimuth)

    sky.material.uniforms['sunPosition'].value.setFromSphericalCoords(1, phi, theta)
}

skyFolder.add(skyParameters, 'elevation', -10, 90, 0.1).name('elevation').onChange(updateSky)
skyFolder.add(skyParameters, 'azimuth', -180, 180, 0.1).name('azimuth').onChange(updateSky)

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

    // Ghosts
    const ghost1Angle = elapsedTime * 0.5
    ghost1.position.x = Math.cos(ghost1Angle) * 4
    ghost1.position.z = Math.sin(ghost1Angle) * 4
    ghost1.position.y = Math.sin(elapsedTime * 3)

    const ghost2Angle = - elapsedTime * 0.38
    ghost2.position.x = Math.cos(ghost2Angle) * 5
    ghost2.position.z = Math.sin(ghost2Angle) * 5
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

    const ghost3Angle = - elapsedTime * 0.18
    ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32))
    ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
    ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

    const ghost4Angle = elapsedTime * 0.32
    ghost4.position.x = Math.cos(ghost4Angle) * (5 + Math.sin(elapsedTime * 0.4))
    ghost4.position.z = Math.sin(ghost4Angle) * (5 + Math.cos(elapsedTime * 0.6))
    ghost4.position.y = Math.sin(elapsedTime * 3) + Math.sin(elapsedTime * 1.5)

    const ghost5Angle = - elapsedTime * 0.45
    ghost5.position.x = Math.cos(ghost5Angle) * (6 + Math.sin(elapsedTime * 0.7))
    ghost5.position.z = Math.sin(ghost5Angle) * (6 + Math.cos(elapsedTime * 0.8))
    ghost5.position.y = Math.sin(elapsedTime * 5) * 0.5 + 0.8

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()