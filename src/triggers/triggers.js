import Phaser from "phaser";


function drawTiles(index, bridgeRect, foreground, rectTrigger) {
    rectTrigger.destroy()
    var x = bridgeRect.x
    var y = bridgeRect.y
    var row = bridgeRect.width + x
    var col = bridgeRect.height + y
    for (let i = x; i < row; i += 16) {
        for (let j = y; j < col; j += 16) {
            foreground.putTileAt(index, i / 16, j / 16)
        }
    }
}

function removeTiles(foreground, bridgeRects) {
    bridgeRects.forEach((bridgeRect) => {
        var x = bridgeRect.x
        var y = bridgeRect.y
        var row = bridgeRect.width + x
        var col = bridgeRect.height + y
        console.log(row)
        console.log(col)
        for (let i = x; i < row; i += 16) {
            for (let j = y; j < col; j += 16) {
                foreground.removeTileAt(i / 16, j / 16)
            }
        }
    })
}

export function resetPlayerWithTilesRemoved(hitAudio, coinGroup, coins, player, startpoint) {
    hitAudio.play()
    coinGroup.createCoins()
    coins.children.iterate((c) => { c.setTexture('coin') })
    player.body.x = startpoint.x
    player.body.y = startpoint.y
}

export function setUpBridgeTriggers(scene, bridgeTriggers, bridgeRects, foreground, bridgeTriggerGroup, bridgesGroup, player) {
    bridgeTriggerGroup.clear(true, true)
    bridgesGroup.clear(true, true)
    removeTiles(foreground, bridgeRects)
    for (let i = 0; i < bridgeTriggers.length; i ++) {
        // set up trigger
        let rectInfo = bridgeTriggers[i]
        let rect = scene.add.rectangle(rectInfo.x, rectInfo.y, rectInfo.width, rectInfo.height, '0xff1111')
        bridgeTriggerGroup.add(rect)
        scene.physics.world.enable(rect)
        rect.setOrigin(0)

        // actual bridge object
        let bridgeInfo = bridgeRects[i]
        let bRect = scene.add.rectangle(bridgeInfo.x, bridgeInfo.y, bridgeInfo.width, bridgeInfo.height)
        bridgeTriggerGroup.add(bRect)
        scene.physics.world.enable(bRect)
        bRect.setOrigin(0)
        bRect.body.setImmovable(true)
        scene.physics.add.collider(bRect, player, ()=>{})
        bridgesGroup.add(bRect)
        // trigger is triggered
        scene.physics.add.overlap(rect, scene.player, () => {
            drawTiles(7, bridgeRects[i], foreground, rect)
            scene.physics.world.disable(bRect)
        })
    }
}

function spawnEnemy(scene, rectTrigger, player, point_1, point_2, group) {
    console.log("trigger")
    rectTrigger.destroy()
    let x_1 = point_1.x, x_2 = point_2.x
    let y_1 = point_1.y, y_2 = point_2.y
    let path = new Phaser.Curves.Path(x_2, y_2).lineTo(x_1, y_1)
    var patrolFollower = scene.add.follower(path, x_1, y_2, 'square');
    patrolFollower.startFollow({
        repeat: -1,
        duration: 1200,
        yoyo: true
    });
    group.add(patrolFollower)
    scene.physics.world.enable(patrolFollower)
}

export function setUpEnemyTriggers(scene, triggers, wallPoints, player, group) {

    // group.children.iterate((e) => { e.destroy() })
    for (let i = 0; i < triggers.length; i ++) {
        let rectInfo = triggers[i]
        let rect = scene.add.rectangle(rectInfo.x, rectInfo.y, rectInfo.width, rectInfo.height)
        scene.physics.world.enable(rect)
        rect.setOrigin(0)
        scene.physics.add.overlap(rect, player, () => { spawnEnemy(scene, rect, player, wallPoints[2 * i], wallPoints[2 * i + 1], group) })
    }
}