import Phaser from "phaser"
import { gameState } from ".";

export function setUpAudioKeys(scene, levelMusic, hitAudio, clickAudio, pickupAudio) {
    addKeyM(scene, levelMusic, hitAudio, clickAudio, pickupAudio)
    addKeyJ(scene, levelMusic, hitAudio, clickAudio, pickupAudio)
    addKeyK(scene, levelMusic, hitAudio, clickAudio, pickupAudio)
}

function addKeyM(scene, levelMusic, hitAudio, clickAudio, pickupAudio) {
    let mKey = scene.input.keyboard.addKey('M')
    mKey.addListener('down', () => {
        if (gameState.musicOn === 1) {
            gameState.lastMutedVolume = gameState.volume
            levelMusic.volume = 0
            hitAudio.volume = 0
            clickAudio.volume = 0
            pickupAudio.volume = 0
            gameState.musicOn = 0
        } else {
            levelMusic.volume = gameState.lastMutedVolume
            hitAudio.volume = gameState.lastMutedVolume
            clickAudio.volume = gameState.lastMutedVolume
            pickupAudio.volume = gameState.lastMutedVolume
            gameState.musicOn = 1
        }
    })

}

function addKeyJ(scene, levelMusic, hitAudio, clickAudio, pickupAudio) {
    let jKey = scene.input.keyboard.addKey('J')
    jKey.addListener('down', () => {
        gameState.volume = gameState.volume - 0.1
        if (gameState.volume <= 0) gameState.volume = 0
        levelMusic.volume = gameState.volume
        hitAudio.volume = gameState.volume
        clickAudio.volume = gameState.volume
        pickupAudio.volume = gameState.volume
    })
}

function addKeyK(scene, levelMusic, hitAudio, clickAudio, pickupAudio) {
    let kKey = scene.input.keyboard.addKey('K')
    kKey.addListener('down', () => {
        gameState.volume = gameState.volume + 0.1
        if (gameState.volume >= 1) gameState.volume = 1
        levelMusic.volume = gameState.volume
        hitAudio.volume = gameState.volume
        clickAudio.volume = gameState.volume
        pickupAudio.volume = gameState.volume
    })
}