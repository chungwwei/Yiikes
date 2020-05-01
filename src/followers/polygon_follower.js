import Phaser from "phaser";

export function createSplineFollower(scene, coord, speed, textureString) {

        // extract points
        let points = []
        var startPointX
        var startPointY
        for (let i = 0; i < coord.length; i ++) {
            let p = coord[i];
            points.push(p.x)
            points.push(p.y)

            if (i === 0) {
                startPointX = p.x
                startPointY = p.y
            }
        }
        // create path
        let curve = new Phaser.Curves.Spline(points)
        var follower = scene.add.follower(curve, startPointX, startPointY, textureString)
        scene.physics.world.enable(follower)
        follower.startFollow(
            {
                duration: speed,
                repeat: -1,
                yoyo: true
            })   
            
        return follower
    }

export function createMutilpleSplineFollower(scene, coord, speed, textureString) {
        
        // extract points
        let points = []
        for (let i = 0; i < coord.length; i ++) {
            let p = coord[i];
            points.push(p.x)
            points.push(p.y)
        }
        var group = scene.add.group()
        var curve = new Phaser.Curves.Spline(points);
        for (var i = 0; i < coord.length; i++) {
            var follower = scene.add.follower(curve, coord[i].x, coord[i].y, textureString);
            group.add(follower)
            scene.physics.world.enable(follower)
            follower.body.setCircle(16)
            follower.startFollow({
                duration: speed,
                repeat: -1,
            });
        }
        return group
}

export function createCirclePathFollowers(scene, coord, speed, radius, textureString, yoyo) {
    var group = scene.add.group()
    for (var i = 0; i < coord.length; i++) {
        var follower = createOneCirclePathFollower(scene, coord[i].x, coord[i].y, speed, radius, textureString, yoyo)
        group.add(follower)
    }
    return group
}

export function createOneCirclePathFollower(scene, x, y, speed, radius, textureString, yoyo) {

    var circlePath = new Phaser.Curves.Path(x, y).circleTo(radius)
    var follower = scene.add.follower(circlePath, x, y, textureString);
    scene.physics.world.enable(follower)
    follower.body.setCircle(16)
    follower.startFollow({
        duration: speed,
        repeat: -1,
        yoyo: yoyo
    });
    return follower
}